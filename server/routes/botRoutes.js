import express from 'express';
import { botState, addBotLog, generateAiTweetContent } from '../services/botService.js';

const router = express.Router();

// Get overall bot status
router.get('/status', (req, res) => {
  res.json({
    isActive: botState.isActive,
    lastPollTime: botState.lastPollTime,
    rulesCount: botState.rules.length,
    activeRulesCount: botState.rules.filter(r => r.enabled).length,
    queueCount: botState.queue.length,
    logsCount: botState.logs.length
  });
});

// Toggle Bot on/off
router.post('/toggle', (req, res) => {
  botState.isActive = !botState.isActive;
  addBotLog(
    botState.isActive ? 'SUCCESS' : 'WARN',
    botState.isActive ? 'Bot Service Started' : 'Bot Service Paused',
    `Automation engine was ${botState.isActive ? 'activated' : 'paused'} by user.`
  );
  res.json({ success: true, isActive: botState.isActive });
});

// Get rules
router.get('/rules', (req, res) => {
  res.json({ success: true, rules: botState.rules });
});

// Add rule
router.post('/rules', (req, res) => {
  const { name, triggerKeyword, matchType = 'contains', replyTemplate, cooldownMinutes = 10 } = req.body;
  if (!name || !triggerKeyword || !replyTemplate) {
    return res.status(400).json({ success: false, error: 'Name, trigger keyword, and reply template are required.' });
  }

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

  botState.rules.unshift(newRule);
  addBotLog('INFO', 'New Bot Rule Created', `Created auto-reply trigger for "${newRule.triggerKeyword}"`);

  res.json({ success: true, rule: newRule });
});

// Toggle rule
router.patch('/rules/:id/toggle', (req, res) => {
  const rule = botState.rules.find(r => r.id === req.params.id);
  if (!rule) {
    return res.status(404).json({ success: false, error: 'Rule not found' });
  }

  rule.enabled = !rule.enabled;
  addBotLog('INFO', `Rule ${rule.enabled ? 'Enabled' : 'Disabled'}`, `Rule "${rule.name}" is now ${rule.enabled ? 'active' : 'inactive'}`);

  res.json({ success: true, rule });
});

// Delete rule
router.delete('/rules/:id', (req, res) => {
  const index = botState.rules.findIndex(r => r.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Rule not found' });
  }

  const deleted = botState.rules.splice(index, 1)[0];
  addBotLog('INFO', 'Rule Deleted', `Removed auto-reply rule "${deleted.name}"`);

  res.json({ success: true, message: 'Rule deleted successfully' });
});

// Get queue
router.get('/queue', (req, res) => {
  res.json({ success: true, queue: botState.queue });
});

// Add to queue
router.post('/queue', (req, res) => {
  const { text, scheduledFor } = req.body;
  if (!text) {
    return res.status(400).json({ success: false, error: 'Tweet text is required' });
  }

  const item = {
    id: `sched-${Date.now()}`,
    text,
    scheduledFor: scheduledFor || new Date(Date.now() + 3600000).toISOString(),
    status: 'scheduled',
    createdAt: new Date().toISOString()
  };

  botState.queue.push(item);
  addBotLog('INFO', 'Tweet Scheduled', `Queued post for ${new Date(item.scheduledFor).toLocaleString()}`);

  res.json({ success: true, item });
});

// Delete from queue
router.delete('/queue/:id', (req, res) => {
  const index = botState.queue.findIndex(q => q.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Queue item not found' });
  }

  botState.queue.splice(index, 1);
  addBotLog('INFO', 'Scheduled Tweet Cancelled', `Removed item from scheduling queue`);

  res.json({ success: true, message: 'Item removed from queue' });
});

// Get logs
router.get('/logs', (req, res) => {
  res.json({ success: true, logs: botState.logs });
});

// Clear logs
router.post('/logs/clear', (req, res) => {
  botState.logs = [];
  res.json({ success: true, message: 'Logs cleared' });
});

// AI Tweet Generator endpoint
router.post('/generate-ai', (req, res) => {
  const { topic, tone, format } = req.body;
  if (!topic) {
    return res.status(400).json({ success: false, error: 'Topic is required' });
  }

  const generated = generateAiTweetContent({ topic, tone, format });
  res.json({ success: true, result: generated });
});

// Periodic Bot Cron Job (Called by Vercel Cron or client heartbeat)
router.all('/cron', async (req, res) => {
  try {
    botState.lastPollTime = new Date().toISOString();

    if (!botState.isActive) {
      return res.json({ success: true, message: 'Bot engine is currently paused.', processed: 0 });
    }

    const now = new Date();
    let processed = 0;

    // Check due items in queue
    const remainingQueue = [];
    for (const item of botState.queue) {
      if (new Date(item.scheduledFor) <= now && item.status === 'scheduled') {
        processed++;
        addBotLog('INFO', 'Scheduled Tweet Dispatched', `Executed queued post: "${item.text.substring(0, 40)}..."`);
      } else {
        remainingQueue.push(item);
      }
    }
    botState.queue = remainingQueue;

    addBotLog('INFO', 'Bot Cron Sync Completed', `Heartbeat check executed at ${now.toLocaleTimeString()}`);

    res.json({
      success: true,
      timestamp: now.toISOString(),
      processed,
      activeRules: botState.rules.filter(r => r.enabled).length
    });
  } catch (err) {
    console.error('Bot Cron Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
