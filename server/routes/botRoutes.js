import express from 'express';
import fs from 'fs';
import { db } from '../services/db.js';
import { generateBusinessTweet } from '../services/businessAiEngine.js';
import { createAndSaveCardImage } from '../services/visualCardGenerator.js';
import { runSchedulerCycle, replenishQueueIfNeeded } from '../services/autonomousScheduler.js';
import { postLiveTweet, uploadTwitterMedia, refreshAccessToken } from '../services/twitterApi.js';

const router = express.Router();

// Get overall bot status & telemetry
router.get('/status', (req, res) => {
  const settings = db.getSettings();
  const queue = db.getQueue();
  const published = db.getPublished();
  const logs = db.getLogs();
  const rules = db.getRules();
  const session = db.getSession();

  res.json({
    success: true,
    isActive: settings.autoPilotEnabled,
    autoPilotEnabled: settings.autoPilotEnabled,
    settings,
    isAccountConnected: !!(session && session.isLive && session.accessToken),
    connectedUsername: session?.user?.username || null,
    queueCount: queue.length,
    scheduledCount: queue.filter(q => q.status === 'scheduled').length,
    publishedCount: published.length,
    rulesCount: rules.length,
    activeRulesCount: rules.filter(r => r.enabled).length,
    logsCount: logs.length,
    lastPollTime: new Date().toISOString()
  });
});

// Toggle Bot Auto-Pilot on/off
router.post('/toggle', (req, res) => {
  const current = db.getSettings();
  const updated = db.updateSettings({ autoPilotEnabled: !current.autoPilotEnabled });
  db.addLog(
    updated.autoPilotEnabled ? 'SUCCESS' : 'WARN',
    updated.autoPilotEnabled ? 'Autonomous Auto-Pilot Activated' : 'Autonomous Engine Paused',
    `Auto-Pilot was ${updated.autoPilotEnabled ? 'enabled' : 'paused'} by user.`
  );
  res.json({ success: true, autoPilotEnabled: updated.autoPilotEnabled, isActive: updated.autoPilotEnabled });
});

// Get Bot Settings
router.get('/settings', (req, res) => {
  res.json({ success: true, settings: db.getSettings() });
});

// Update Bot Settings
router.post('/settings', (req, res) => {
  const updated = db.updateSettings(req.body);
  db.addLog('INFO', 'Bot Settings Updated', `Updated settings (Niche: ${updated.niche}, Frequency: ${updated.tweetsPerDay}/day, Images: ${updated.includeImages ? 'ON' : 'OFF'})`);
  res.json({ success: true, settings: updated });
});

// Get Queue
router.get('/queue', (req, res) => {
  res.json({ success: true, queue: db.getQueue() });
});

// Add custom tweet to queue
router.post('/queue', (req, res) => {
  const { text, scheduledFor, topic, category } = req.body;
  if (!text) {
    return res.status(400).json({ success: false, error: 'Tweet text is required' });
  }

  const item = {
    id: `custom-${Date.now()}`,
    text,
    topic: topic || 'Custom Post',
    category: category || 'Custom Breakdown',
    scheduledFor: scheduledFor || new Date(Date.now() + 3600000 * 2).toISOString(),
    status: 'scheduled',
    createdAt: new Date().toISOString()
  };

  db.addToQueue(item);
  db.addLog('INFO', 'Tweet Scheduled Manually', `Queued post for ${new Date(item.scheduledFor).toLocaleString()}`);

  res.json({ success: true, item });
});

// Delete from queue
router.delete('/queue/:id', (req, res) => {
  db.removeFromQueue(req.params.id);
  db.addLog('INFO', 'Scheduled Post Cancelled', `Removed item ${req.params.id} from queue`);
  res.json({ success: true, message: 'Item removed from queue' });
});

// Get Published History
router.get('/published', (req, res) => {
  res.json({ success: true, published: db.getPublished() });
});

// Immediately Publish a queued tweet right now
router.post('/publish-now/:id', async (req, res) => {
  const queue = db.getQueue();
  const item = queue.find(q => q.id === req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, error: 'Queued item not found' });
  }

  const session = db.getSession();
  let publishedTweet = null;

  try {
    if (session && session.isLive && session.accessToken) {
      let accessToken = session.accessToken;
      let mediaIds = [];

      if (item.media?.localPath && fs.existsSync(item.media.localPath)) {
        try {
          const imgBuffer = fs.readFileSync(item.media.localPath);
          const uploadedId = await uploadTwitterMedia(accessToken, imgBuffer);
          if (uploadedId) mediaIds.push(uploadedId);
        } catch (mediaErr) {
          console.warn('Image upload failed, proceeding with text:', mediaErr.message);
        }
      }

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
      } catch (postErr) {
        if (postErr.response?.status === 401 && session.refreshToken) {
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
        } else {
          throw postErr;
        }
      }
    } else {
      // Sandbox mode
      publishedTweet = {
        id: `sim_${Date.now()}`,
        text: item.text,
        mediaUrl: item.media?.publicUrl || null,
        publishedAt: new Date().toISOString(),
        isLive: false,
        topic: item.topic,
        category: item.category
      };
    }

    db.addPublished(publishedTweet);
    db.removeFromQueue(item.id);
    db.addLog('SUCCESS', '1-Click Tweet Published', `Published: "${item.topic || item.text.substring(0, 30)}"`);

    res.json({ success: true, publishedTweet });
  } catch (err) {
    console.error('Error publishing queued tweet immediately:', err.response?.data || err.message);
    const msg = err.response?.data?.detail || err.message;
    res.status(500).json({ success: false, error: msg });
  }
});

// Force replenish queue buffer immediately
router.post('/replenish', async (req, res) => {
  try {
    await replenishQueueIfNeeded();
    res.json({ success: true, queue: db.getQueue(), message: 'Queue replenished successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// AI Tweet Generator endpoint (Handles both business breakdown and custom topic)
router.post('/generate-ai', async (req, res) => {
  try {
    const { topic, category, generateImage = true } = req.body;
    const settings = db.getSettings();

    const generated = await generateBusinessTweet({
      category: category || settings.niche,
      customTopic: topic,
      geminiApiKey: settings.geminiApiKey
    });

    let media = null;
    if (generateImage && generated.visualCard) {
      const cardRes = await createAndSaveCardImage(generated.visualCard);
      if (cardRes.success) {
        media = {
          filename: cardRes.filename,
          localPath: cardRes.localPath,
          publicUrl: cardRes.publicUrl
        };
      }
    }

    res.json({
      success: true,
      result: {
        topic: generated.companyOrTopic,
        category: generated.category,
        source: generated.source,
        generatedText: generated.tweetText,
        visualCard: generated.visualCard,
        media,
        characterCount: generated.tweetText.length
      }
    });
  } catch (err) {
    console.error('Error generating AI tweet:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Auto-Reply Rules
router.get('/rules', (req, res) => {
  res.json({ success: true, rules: db.getRules() });
});

router.post('/rules', (req, res) => {
  const { name, triggerKeyword, matchType = 'contains', replyTemplate, cooldownMinutes = 10 } = req.body;
  if (!name || !triggerKeyword || !replyTemplate) {
    return res.status(400).json({ success: false, error: 'Name, trigger keyword, and reply template are required.' });
  }

  const rules = db.getRules();
  const newRule = {
    id: `rule-${Date.now()}`,
    name,
    triggerKeyword: triggerKeyword.toLowerCase().trim(),
    matchType,
    replyTemplate,
    enabled: true,
    cooldownMinutes: Number(cooldownMinutes) || 10,
    timesTriggered: 0
  };

  rules.unshift(newRule);
  db.setRules(rules);
  db.addLog('INFO', 'New Bot Rule Created', `Created auto-reply trigger for "${newRule.triggerKeyword}"`);

  res.json({ success: true, rule: newRule });
});

router.patch('/rules/:id/toggle', (req, res) => {
  const rules = db.getRules();
  const rule = rules.find(r => r.id === req.params.id);
  if (!rule) {
    return res.status(404).json({ success: false, error: 'Rule not found' });
  }

  rule.enabled = !rule.enabled;
  db.setRules(rules);
  db.addLog('INFO', `Rule ${rule.enabled ? 'Enabled' : 'Disabled'}`, `Rule "${rule.name}" is now ${rule.enabled ? 'active' : 'inactive'}`);

  res.json({ success: true, rule });
});

router.delete('/rules/:id', (req, res) => {
  const rules = db.getRules();
  const idx = rules.findIndex(r => r.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Rule not found' });
  }

  const deleted = rules.splice(idx, 1)[0];
  db.setRules(rules);
  db.addLog('INFO', 'Rule Deleted', `Removed auto-reply rule "${deleted.name}"`);

  res.json({ success: true, message: 'Rule deleted successfully' });
});

// Logs
router.get('/logs', (req, res) => {
  res.json({ success: true, logs: db.getLogs() });
});

router.post('/logs/clear', (req, res) => {
  db.clearLogs();
  res.json({ success: true, message: 'Logs cleared' });
});

// Periodic Bot Cron Job (Heartbeat check)
router.all('/cron', async (req, res) => {
  try {
    await runSchedulerCycle();
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      queueCount: db.getQueue().length,
      publishedCount: db.getPublished().length
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
