# 🚀 XBot SaaS Studio - Autonomous Bot & Account Intelligence Dashboard

A modern, full-stack **SaaS Dashboard & Autonomous Bot Suite for X (formerly Twitter)**. Connect any X account via **OAuth 2.0 PKCE** or **User Access Token** to extract, visualize, and analyze all profile details, engagement KPIs, tweet metrics, and automate interactions with an intelligent bot engine.

---

## ✨ Features Overview

### 1. 🔍 Comprehensive Account Intelligence (X API v2)
- **Profile Identity:** Display Name, `@username`, User ID (1-click copy), Profile Avatar (HD), Banner, Bio/Description (with clickable hashtags & URLs), Location, Website, Account Creation Date, and calculated Account Age.
- **Verification Badges:** Dynamic verification indicator supporting Blue Checkmark (Premium/Subscribers), Gold Checkmark (Verified Businesses), and Grey Checkmark (Government/Officials).
- **Security & Privacy Status:** Protected account indicators, withheld content status, and active OAuth 2.0 scopes (`users.read`, `tweet.read`, `tweet.write`, `offline.access`, etc.).
- **Pinned Tweet Spotlight:** Automatically retrieves and spotlights pinned tweets.

### 2. 📊 SaaS Metrics & KPI Center
- **Followers & Following Count** with live ratio calculation (e.g. `206.1x influence multiplier`).
- **Total Lifetime Tweets** published on the account.
- **Listed Count:** Number of curated public Twitter lists the account belongs to.
- **Real-Time Engagement Rate:** Calculated interactions (Likes + Retweets + Replies + Quotes) over Impressions.
- **API Rate Limit Tracker:** Live visual gauge monitoring `x-rate-limit-remaining` and reset countdowns.

### 3. 📝 Live Tweet Composer & Content Feed
- **Live Publishing:** Compose and publish tweets directly to X via `POST /2/tweets`.
- **Full Public Metrics:** Detailed breakdown per tweet:
  - 👁️ **Impressions** (Views)
  - ❤️ **Likes**
  - 🔁 **Retweets** (Reposts)
  - 💬 **Replies**
  - 🔖 **Bookmarks** (Saves)
  - 🗨️ **Quote Tweets**
- **Media Support:** Displays attached images, photos, and cards.
- **Raw API JSON Inspector:** Inspect individual tweet objects as returned by X API v2.

### 4. 🤖 Autonomous Bot Automation
- **Master Bot Toggle:** Start or Pause the automation engine with one click.
- **Auto-Reply Rules:** Define trigger keywords (e.g., `help`, `demo`, `pricing`), match types, cooldown timers, and reply templates with dynamic `{username}` variables.
- **Scheduled Post Queue:** Plan and schedule future tweets with automated execution.
- **Real-Time Execution Logs:** Monitor incoming mentions, auto-replies dispatched, and sync cycles.

### 5. ⚡ AI Tweet Studio
- Generate high-engagement tweets, hooks, and thread starters.
- Style presets: **Viral & Punchy**, **Professional / Tech**, **Casual & Relatable**, and **Witty / Humorous**.
- 1-click **Publish to X**, **Queue in Bot**, or **Copy to Clipboard**.

### 6. 🔎 Raw API Inspector & Data Dictionary
- Full raw JSON dump straight from the Twitter API v2.
- Complete documentation table defining every user and tweet field specification.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ (tested on Node.js v24)
- **npm** v9+

### 2. Installation
All packages in the project, server, and client can be installed with:
```bash
npm run install:all
```

### 3. Start Development Server
Run both the Backend API and Vite Frontend together:
```bash
npm run dev
```

- **Frontend App:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:3001](http://localhost:3001)

---

## 🔑 How to Connect ANY X (Twitter) Account

Click **"Connect X Account"** in the top navigation bar. You have 3 methods:

### Method A: Official OAuth 2.0 PKCE (Recommended)
1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard) and create a project/app.
2. In **User Authentication Settings**:
   - App permissions: **Read and Write**
   - Type of App: **Web App, Automated App or Bot**
   - Callback URI: `http://localhost:3001/api/twitter/auth/callback`
   - Website URL: `http://localhost:5173`
3. Enter your **Client ID** in the SaaS Dashboard Settings or in `server/.env`.
4. Click **"Authorize with X"** — you will be redirected to Twitter's login & authorize screen!

### Method B: Direct Access Token
If you already have a User Access Token or Bearer Token generated in the developer portal:
1. Paste it into the **Direct Access Token** tab in the Connect modal.
2. Click **"Validate & Connect"** — the dashboard immediately validates with `/2/users/me` and pulls all data!

### Method C: Instant Sandbox Demo Mode
If you don't have Twitter API keys yet:
- Choose from pre-configured rich profiles (`@astra_ai_hq`, `@kabir_builds`) to explore every metric, run the bot rules, test scheduling, and view the API inspector right away!

---

## 🛠️ Project Structure

```
d:\Thessk\XBot\
├── server/
│   ├── config.js              # Environment & runtime credentials
│   ├── server.js              # Express API server + static dist host
│   ├── services/
│   │   ├── twitterApi.js      # OAuth 2.0 PKCE, /2/users/me, /2/tweets, rate limits
│   │   ├── mockData.js        # Comprehensive mock data adhering to v2 spec
│   │   └── botService.js      # Auto-reply rules, tweet queue, logs & AI generation
│   └── routes/
│       ├── twitterRoutes.js   # Account, tweets, auth callbacks, post tweet
│       └── botRoutes.js       # Rules, queue, logs, AI endpoints
├── client/
│   ├── src/
│   │   ├── App.jsx            # Main SaaS app layout & views
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Top bar with account switcher & bot switch
│   │   │   ├── Sidebar.jsx         # Navigation & API rate limit widget
│   │   │   ├── ProfileHeader.jsx   # X Account Profile card with all details
│   │   │   ├── MetricsGrid.jsx     # Followers, following, ratios, impressions
│   │   │   ├── TweetFeed.jsx       # Tweet feed, composer & tweet metrics
│   │   │   ├── BotAutomation.jsx   # Auto-reply rules, queue & activity logs
│   │   │   ├── AiTweetGenerator.jsx# AI content generation studio
│   │   │   ├── ApiInspector.jsx    # Raw JSON inspector & field dictionary
│   │   │   ├── AccountModal.jsx    # Multi-method X account connector
│   │   │   └── SettingsView.jsx    # Developer credentials & guide
│   │   ├── context/
│   │   │   └── AppContext.jsx      # Global state & API actions
│   │   └── services/
│   │       └── api.js              # API client methods
│   └── index.html
├── package.json               # Root launcher with concurrently
└── README.md
```

---

## 📜 Twitter API v2 Fields Extracted

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `id` | string | Unique Twitter user ID |
| `name` | string | Profile display name |
| `username` | string | `@handle` screen name |
| `created_at` | ISO 8601 | Account creation timestamp & age |
| `description` | string | Full bio text |
| `profile_image_url`| string | High-res profile avatar URL |
| `location` | string | Profile location |
| `pinned_tweet_id` | string | Pinned tweet ID |
| `verified` | boolean | Verification status |
| `verified_type` | string | `blue`, `business`, or `government` |
| `public_metrics.followers_count` | integer | Total followers |
| `public_metrics.following_count` | integer | Total following |
| `public_metrics.tweet_count` | integer | Lifetime tweets |
| `public_metrics.listed_count` | integer | Public lists member of |
| `entities.url` | array | Expanded URLs and vanity links |
| `public_metrics.impression_count` | integer | Tweet views |
| `public_metrics.bookmark_count` | integer | Tweet saves / bookmarks |
