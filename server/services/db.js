import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const defaultState = {
  settings: {
    autoPilotEnabled: true,
    niche: 'business_startups', // business_startups, offers_growth, founder_case_studies
    tweetsPerDay: 3, // Recommended: 2-3 high-signal tweets per day
    includeImages: true,
    tone: 'viral_storytelling',
    humanJitterMinutes: 20, // ±20 minutes jitter
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    activePostingWindows: [
      { name: 'Morning Insight', hour: 9, minute: 15 },
      { name: 'Afternoon Breakdown', hour: 14, minute: 30 },
      { name: 'Evening Offer/Case Study', hour: 20, minute: 45 }
    ]
  },
  session: {
    isLive: false,
    accessToken: null,
    refreshToken: null,
    clientId: null,
    clientSecret: null,
    user: null,
    rateLimit: null,
    updatedAt: null
  },
  queue: [],
  published: [],
  rules: [],
  logs: []
};

let cache = null;
let saveTimer = null;

function loadDb() {
  if (cache) return cache;
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      cache = { ...defaultState, ...JSON.parse(raw) };
      // Deep merge settings
      cache.settings = { ...defaultState.settings, ...(cache.settings || {}) };
    } else {
      cache = JSON.parse(JSON.stringify(defaultState));
      saveDbImmediate();
    }
  } catch (err) {
    console.error('Failed to load store.json, using fallback:', err);
    cache = JSON.parse(JSON.stringify(defaultState));
  }
  return cache;
}

function saveDbImmediate() {
  if (!cache) return;
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(cache, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Error saving store.json:', err);
  }
}

export function saveDb() {
  saveDbImmediate();
}


export const db = {
  get: () => loadDb(),
  getSettings: () => loadDb().settings,
  updateSettings: (newSettings) => {
    const data = loadDb();
    data.settings = { ...data.settings, ...newSettings };
    saveDb();
    return data.settings;
  },
  getSession: () => loadDb().session,
  updateSession: (sessionData) => {
    const data = loadDb();
    data.session = {
      ...data.session,
      ...sessionData,
      updatedAt: new Date().toISOString()
    };
    saveDb();
    return data.session;
  },
  getQueue: () => loadDb().queue,
  setQueue: (newQueue) => {
    const data = loadDb();
    data.queue = newQueue;
    saveDb();
  },
  addToQueue: (item) => {
    const data = loadDb();
    data.queue.push(item);
    saveDb();
  },
  removeFromQueue: (id) => {
    const data = loadDb();
    const idx = data.queue.findIndex(q => q.id === id);
    if (idx !== -1) {
      data.queue.splice(idx, 1);
      saveDb();
    }
  },
  getPublished: () => loadDb().published,
  addPublished: (item) => {
    const data = loadDb();
    data.published.unshift(item);
    if (data.published.length > 200) data.published.pop();
    saveDb();
  },
  getRules: () => loadDb().rules,
  setRules: (rules) => {
    const data = loadDb();
    data.rules = rules;
    saveDb();
  },
  getLogs: () => loadDb().logs,
  addLog: (type, title, details) => {
    const data = loadDb();
    data.logs.unshift({
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      type,
      title,
      details
    });
    if (data.logs.length > 150) data.logs.pop();
    saveDb();
  },
  clearLogs: () => {
    const data = loadDb();
    data.logs = [];
    saveDb();
  }
};
