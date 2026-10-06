import fs from 'fs';
import path from 'path';
import { db } from './db.js';
import { generateBusinessTweet } from './businessAiEngine.js';
import { createAndSaveCardImage } from './visualCardGenerator.js';
import { postLiveTweet, uploadTwitterMedia, refreshAccessToken } from './twitterApi.js';

let schedulerInterval = null;
let isProcessing = false;

/**
 * Calculate next scheduled posting timestamps based on windows + human jitter
 */
function getNextPostingTimes(count = 3) {
  const settings = db.getSettings();
  const windows = settings.activePostingWindows || [
    { hour: 9, minute: 15 },
    { hour: 14, minute: 30 },
    { hour: 20, minute: 45 }
  ];
  const jitterRange = settings.humanJitterMinutes || 20;

  const times = [];
  const now = new Date();
  let dayOffset = 0;

  while (times.length < count) {
    for (const win of windows) {
      const candidate = new Date(now);
      candidate.setDate(candidate.getDate() + dayOffset);
      candidate.setHours(win.hour, win.minute, 0, 0);

      // Add random human jitter (-jitterRange to +jitterRange minutes)
      const jitterMs = (Math.floor(Math.random() * (jitterRange * 2 + 1)) - jitterRange) * 60 * 1000;
      candidate.setTime(candidate.getTime() + jitterMs);

      // Only add future times with at least 15 min buffer from now
      if (candidate.getTime() > now.getTime() + 15 * 60 * 1000) {
        times.push(candidate.toISOString());
        if (times.length >= count) break;
      }
    }
    dayOffset++;
  }

  return times;
}

/**
 * Replenish queue if count is low
 */
export async function replenishQueueIfNeeded() {
  const settings = db.getSettings();
  if (!settings.autoPilotEnabled) return;

  const currentQueue = db.getQueue().filter(q => q.status === 'scheduled');
  const targetBuffer = 6; // Keep at least 6 upcoming tweets (2-3 days ahead)

  if (currentQueue.length >= targetBuffer) return;

  const needed = targetBuffer - currentQueue.length;
  console.log(`🤖 Autonomous Bot: Replenishing queue (${needed} new tweets needed)...`);
  db.addLog('INFO', 'Auto-Pilot Planning', `Generating ${needed} high-signal business tweets & infographics to replenish queue.`);

  const nextTimes = getNextPostingTimes(needed);

  for (let i = 0; i < needed; i++) {
    try {
      const generated = await generateBusinessTweet({
        category: settings.niche,
        geminiApiKey: settings.geminiApiKey
      });

      let mediaInfo = null;
      if (settings.includeImages && generated.visualCard) {
        const cardRes = await createAndSaveCardImage(generated.visualCard);
        if (cardRes.success) {
          mediaInfo = {
            filename: cardRes.filename,
            localPath: cardRes.localPath,
            publicUrl: cardRes.publicUrl || cardRes.dataUrl || cardRes.svgDataUri,
            dataUrl: cardRes.dataUrl,
            svgDataUri: cardRes.svgDataUri
          };
        }
      }


      const scheduledItem = {
        id: `auto-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        text: generated.tweetText,
        category: generated.category,
        topic: generated.companyOrTopic,
        source: generated.source,
        visualCard: generated.visualCard,
        media: mediaInfo,
        scheduledFor: nextTimes[i] || new Date(Date.now() + (i + 1) * 4 * 3600 * 1000).toISOString(),
        status: 'scheduled',
        createdAt: new Date().toISOString()
      };

      db.addToQueue(scheduledItem);
    } catch (genErr) {
      console.error('Error generating scheduled tweet:', genErr);
    }
  }

  db.addLog('SUCCESS', 'Queue Replenished', `Autonomous queue buffer now has ${db.getQueue().filter(q => q.status === 'scheduled').length} curated posts ready.`);
}

/**
 * Execute due scheduled tweets
 */
export async function processDueTweets() {
  if (isProcessing) return;
  isProcessing = true;

  try {
    const queue = db.getQueue();
    const now = new Date();
    const dueItems = queue.filter(q => q.status === 'scheduled' && new Date(q.scheduledFor) <= now);

    if (dueItems.length === 0) {
      isProcessing = false;
      return;
    }

    const item = dueItems[0]; // Process one at a time for safety
    const session = db.getSession();

    console.log(`🚀 Executing due tweet: "${item.topic || item.text.substring(0, 30)}..."`);

    let publishedTweet = null;
    let isLiveSuccess = false;

    if (session && session.isLive && session.accessToken) {
      let accessToken = session.accessToken;
      let mediaIds = [];

      // Check if image needs uploading
      if (item.media?.localPath && fs.existsSync(item.media.localPath)) {
        try {
          const imgBuffer = fs.readFileSync(item.media.localPath);
          const uploadedId = await uploadTwitterMedia(accessToken, imgBuffer);
          if (uploadedId) {
            mediaIds.push(uploadedId);
            db.addLog('INFO', 'Media Uploaded', `Attached visual infographic (ID: ${uploadedId})`);
          }
        } catch (mediaErr) {
          console.warn('Failed to upload image to Twitter, proceeding with text:', mediaErr.message);
        }
      }

      // Try posting to Twitter API v2
      try {
        const twitterRes = await postLiveTweet(accessToken, item.text, null, mediaIds);
        publishedTweet = {
          id: twitterRes.data?.id || `tw_${Date.now()}`,
          text: twitterRes.data?.text || item.text,
          mediaUrl: item.media?.publicUrl || null,
          publishedAt: new Date().toISOString(),
          isLive: true,
          topic: item.topic,
          category: item.category
        };
        isLiveSuccess = true;
        db.addLog('SUCCESS', 'Tweet Published to X', `Live tweet published: @${session.user?.username || 'user'} - "${item.topic || item.text.substring(0, 30)}"`);
      } catch (postErr) {
        // If 401 Unauthorized, attempt token refresh and retry
        if (postErr.response?.status === 401 && session.refreshToken) {
          console.log('🔄 Token expired during scheduled post. Attempting refresh...');
          try {
            const refreshed = await refreshAccessToken(session.refreshToken, session.clientId, session.clientSecret);
            accessToken = refreshed.access_token;
            db.updateSession({ accessToken, refreshToken: refreshed.refresh_token });

            const retryRes = await postLiveTweet(accessToken, item.text, null, mediaIds);
            publishedTweet = {
              id: retryRes.data?.id || `tw_${Date.now()}`,
              text: retryRes.data?.text || item.text,
              mediaUrl: item.media?.publicUrl || null,
              publishedAt: new Date().toISOString(),
              isLive: true,
              topic: item.topic,
              category: item.category
            };
            isLiveSuccess = true;
            db.addLog('SUCCESS', 'Tweet Published after Token Refresh', `Successfully posted live tweet after auto-refresh.`);
          } catch (refreshErr) {
            console.error('Token refresh failed during autonomous post:', refreshErr.message);
            db.addLog('ERROR', 'Auto-Publish Failed', `Token expired and could not refresh: ${refreshErr.message}`);
          }
        } else {
          console.error('Failed to post live tweet:', postErr.response?.data || postErr.message);
          db.addLog('ERROR', 'Twitter API Error', `Post failed: ${postErr.response?.data?.detail || postErr.message}`);
        }
      }
    } else {
      // Sandbox / Simulated mode
      publishedTweet = {
        id: `sim_${Date.now()}`,
        text: item.text,
        mediaUrl: item.media?.publicUrl || null,
        publishedAt: new Date().toISOString(),
        isLive: false,
        topic: item.topic,
        category: item.category
      };
      isLiveSuccess = true;
      db.addLog('INFO', 'Sandbox Tweet Dispatched', `[Sandbox Mode] Simulated publishing: "${item.topic || item.text.substring(0, 30)}"`);
    }

    if (isLiveSuccess && publishedTweet) {
      db.addPublished(publishedTweet);
      db.removeFromQueue(item.id);
    }
  } catch (err) {
    console.error('Error in processDueTweets:', err);
  } finally {
    isProcessing = false;
  }
}

/**
 * Main Autonomous Scheduler Cycle (Runs every 60 seconds)
 */
export async function runSchedulerCycle() {
  try {
    // 1. Process any due tweets
    await processDueTweets();

    // 2. Replenish queue if low
    await replenishQueueIfNeeded();
  } catch (cycleErr) {
    console.error('Error in autonomous scheduler cycle:', cycleErr);
  }
}

/**
 * Start the 24/7 background scheduler loop in Node
 */
export function startAutonomousScheduler() {
  if (schedulerInterval) return;
  console.log('⚡ Starting 24/7 Autonomous Bot Scheduler...');

  // Run initial cycle immediately
  setTimeout(() => {
    runSchedulerCycle();
  }, 2000);

  // Repeat every 60 seconds
  schedulerInterval = setInterval(() => {
    runSchedulerCycle();
  }, 60 * 1000);
}

export function stopAutonomousScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('⏸️ Autonomous Bot Scheduler Stopped.');
  }
}
