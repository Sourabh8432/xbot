import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { config } from './config.js';
import twitterRoutes from './routes/twitterRoutes.js';
import botRoutes from './routes/botRoutes.js';

import { startAutonomousScheduler } from './services/autonomousScheduler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static generated infographic media
const mediaDir = path.join(__dirname, 'data/media');
if (!fs.existsSync(mediaDir)) {
  fs.mkdirSync(mediaDir, { recursive: true });
}
app.use('/api/media', express.static(mediaDir));
app.use('/media', express.static(mediaDir));

// API Routes (Mounted with and without /api prefix for flexible Vercel rewrite routing)
app.use('/api/twitter', twitterRoutes);
app.use('/twitter', twitterRoutes);
app.use('/api/bot', botRoutes);
app.use('/bot', botRoutes);

// Health check
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'XBot Autonomous SaaS Engine',
    version: '2.0.0'
  });
});

// Boot autonomous scheduler
startAutonomousScheduler();


// Serve frontend dist if exists (for standalone production preview)
const clientDist = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Start listening if not running inside a serverless environment (like Vercel)
if (!process.env.VERCEL) {
  const PORT = config.port;
  app.listen(PORT, () => {
    console.log(`🚀 XBot SaaS Server running on http://localhost:${PORT}`);
    console.log(`📡 Ready for X (Twitter) API v2 connections.`);
  });
}

export default app;
