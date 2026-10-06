import { db } from './db.js';

// In-memory bot state compatibility layer redirecting to db
export const botState = {
  get isActive() {
    return db.getSettings().autoPilotEnabled;
  },
  set isActive(val) {
    db.updateSettings({ autoPilotEnabled: !!val });
  },
  get lastPollTime() {
    return new Date().toISOString();
  },
  get rules() {
    return db.getRules();
  },
  set rules(val) {
    db.setRules(val);
  },
  get queue() {
    return db.getQueue();
  },
  set queue(val) {
    db.setQueue(val);
  },
  get logs() {
    return db.getLogs();
  }
};

// Add a log entry (persists to DB)
export function addBotLog(type, title, details) {
  db.addLog(type, title, details);
}

// AI Content Generation helper fallback
export function generateAiTweetContent({ topic = 'startup growth', tone = 'viral' } = {}) {
  return {
    topic,
    tone,
    generatedText: `Most founders overcomplicate ${topic}.\n\nFocus on 1 core offer, 1 acquisition channel, and relentless retention.\n\nSimplicity scales, complexity stalls. 💡`,
    characterCount: 130
  };
}
