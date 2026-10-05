import express from 'express';
import {
  getTwitterAuthUrl,
  exchangeCodeForTokens,
  fetchLiveUserProfile,
  fetchLiveUserTweets,
  fetchLiveUserMentions,
  postLiveTweet
} from '../services/twitterApi.js';
import { addBotLog } from '../services/botService.js';
import { runtimeConfig } from '../config.js';

const router = express.Router();

// Current active session state (purely live data, no dummy accounts)
let activeAccountState = {
  isLive: false,
  liveToken: null,
  liveUser: null,
  liveTweets: [],
  liveMentions: [],
  liveRaw: null,
  liveRateLimit: null
};

// Return the currently active account details
router.get('/account', async (req, res) => {
  try {
    if (activeAccountState.isLive && activeAccountState.liveToken) {
      try {
        const liveProfile = await fetchLiveUserProfile(activeAccountState.liveToken);
        activeAccountState.liveUser = liveProfile.user;
        activeAccountState.liveRaw = liveProfile.raw;
        activeAccountState.liveRateLimit = liveProfile.rateLimit;

        return res.json({
          success: true,
          isLive: true,
          account: liveProfile.user,
          includes: liveProfile.includes,
          rateLimit: liveProfile.rateLimit
        });
      } catch (liveErr) {
        console.error('Error fetching live X profile:', liveErr.message);
        if (activeAccountState.liveUser) {
          return res.json({
            success: true,
            isLive: true,
            cached: true,
            account: activeAccountState.liveUser,
            rateLimit: activeAccountState.liveRateLimit
          });
        }
      }
    }

    // No account connected
    return res.json({
      success: true,
      isLive: false,
      account: null,
      rateLimit: null
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Return tweets for the active account
router.get('/tweets', async (req, res) => {
  try {
    if (activeAccountState.isLive && activeAccountState.liveToken && activeAccountState.liveUser) {
      try {
        const tweetsData = await fetchLiveUserTweets(activeAccountState.liveUser.id, activeAccountState.liveToken);
        activeAccountState.liveTweets = tweetsData.tweets;
        return res.json({
          success: true,
          isLive: true,
          tweets: tweetsData.tweets,
          includes: tweetsData.includes,
          meta: tweetsData.meta,
          rateLimit: tweetsData.rateLimit
        });
      } catch (err) {
        console.error('Error fetching live tweets:', err.message);
        if (activeAccountState.liveTweets.length > 0) {
          return res.json({ success: true, isLive: true, cached: true, tweets: activeAccountState.liveTweets });
        }
      }
    }

    return res.json({
      success: true,
      isLive: false,
      tweets: []
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Return mentions
router.get('/mentions', async (req, res) => {
  try {
    if (activeAccountState.isLive && activeAccountState.liveToken && activeAccountState.liveUser) {
      try {
        const mentionsData = await fetchLiveUserMentions(activeAccountState.liveUser.id, activeAccountState.liveToken);
        return res.json({ success: true, isLive: true, mentions: mentionsData });
      } catch (err) {
        console.error('Error fetching live mentions:', err.message);
      }
    }

    return res.json({
      success: true,
      isLive: false,
      mentions: []
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Return full raw JSON response for developer inspection
router.get('/raw-profile', (req, res) => {
  if (activeAccountState.isLive && activeAccountState.liveRaw) {
    return res.json({ success: true, isLive: true, raw: activeAccountState.liveRaw });
  }
  return res.json({
    success: true,
    isLive: false,
    raw: null
  });
});

// Generate OAuth 2.0 PKCE Auth URL
router.get('/auth/url', (req, res) => {
  try {
    const { clientId, redirectUri } = req.query;
    const authData = getTwitterAuthUrl(clientId, redirectUri);
    res.json({ success: true, ...authData });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// OAuth Callback endpoint
router.get('/auth/callback', async (req, res) => {
  const { code, state, error, error_description } = req.query;

  // Use relative redirect on same domain or custom CLIENT_URL if provided
  const getRedirectUrl = (pathWithQuery) => {
    const base = process.env.CLIENT_URL ? process.env.CLIENT_URL.replace(/\/$/, '') : '';
    return `${base}${pathWithQuery}`;
  };

  if (error) {
    return res.redirect(getRedirectUrl(`/?auth_error=${encodeURIComponent(error_description || error)}`));
  }

  if (!code || !state) {
    return res.redirect(getRedirectUrl('/?auth_error=Missing_code_or_state'));
  }

  try {
    const tokenData = await exchangeCodeForTokens(code, state);
    activeAccountState.isLive = true;
    activeAccountState.liveToken = tokenData.access_token;

    // Fetch user details immediately from X API v2
    const userProfile = await fetchLiveUserProfile(tokenData.access_token);
    activeAccountState.liveUser = userProfile.user;
    activeAccountState.liveRaw = userProfile.raw;
    activeAccountState.liveRateLimit = userProfile.rateLimit;

    addBotLog('SUCCESS', 'X Account Connected', `Connected live account @${userProfile.user.username} via OAuth 2.0 PKCE`);

    return res.redirect(getRedirectUrl('/?auth_success=true'));
  } catch (err) {
    console.error('OAuth Callback Error:', err.response?.data || err.message);
    const msg = err.response?.data?.error_description || err.message;
    return res.redirect(getRedirectUrl(`/?auth_error=${encodeURIComponent(msg)}`));
  }
});

// Connect account via direct Access Token / Bearer Token
router.post('/connect-token', async (req, res) => {
  const { accessToken } = req.body;
  if (!accessToken) {
    return res.status(400).json({ success: false, error: 'Access token is required' });
  }

  try {
    const userProfile = await fetchLiveUserProfile(accessToken.trim());
    activeAccountState.isLive = true;
    activeAccountState.liveToken = accessToken.trim();
    activeAccountState.liveUser = userProfile.user;
    activeAccountState.liveRaw = userProfile.raw;
    activeAccountState.liveRateLimit = userProfile.rateLimit;

    addBotLog('SUCCESS', 'Live Account Connected', `Connected live account @${userProfile.user.username} via Direct Token`);

    res.json({
      success: true,
      message: 'Account successfully connected!',
      account: userProfile.user,
      rateLimit: userProfile.rateLimit
    });
  } catch (err) {
    console.error('Direct token error:', err.response?.data || err.message);
    const msg = err.response?.data?.detail || err.response?.data?.error || err.message;
    res.status(400).json({ success: false, error: `Failed to connect with token: ${msg}` });
  }
});

// Save runtime API Keys in settings
router.post('/save-credentials', (req, res) => {
  const { clientId, clientSecret, redirectUri } = req.body;
  if (clientId) runtimeConfig.clientId = clientId;
  if (clientSecret) runtimeConfig.clientSecret = clientSecret;
  if (redirectUri) runtimeConfig.redirectUri = redirectUri;

  res.json({
    success: true,
    message: 'API credentials saved successfully!',
    currentConfig: {
      hasClientId: !!runtimeConfig.clientId,
      hasClientSecret: !!runtimeConfig.clientSecret,
      redirectUri: runtimeConfig.redirectUri
    }
  });
});

// Get current credentials status
router.get('/credentials-status', (req, res) => {
  res.json({
    hasClientId: !!runtimeConfig.clientId,
    clientIdPreview: runtimeConfig.clientId ? `${runtimeConfig.clientId.substring(0, 6)}...` : null,
    hasClientSecret: !!runtimeConfig.clientSecret,
    redirectUri: runtimeConfig.redirectUri
  });
});

// Get connection status
router.get('/accounts', (req, res) => {
  res.json({
    isLive: activeAccountState.isLive,
    liveUser: activeAccountState.liveUser
  });
});

// Disconnect account
router.post('/disconnect', (req, res) => {
  activeAccountState.isLive = false;
  activeAccountState.liveToken = null;
  activeAccountState.liveUser = null;
  activeAccountState.liveTweets = [];
  activeAccountState.liveRaw = null;
  activeAccountState.liveRateLimit = null;

  addBotLog('INFO', 'Account Disconnected', 'Disconnected X account from dashboard.');

  res.json({ success: true, message: 'Account disconnected successfully.' });
});

// Post a tweet to X
router.post('/tweet', async (req, res) => {
  const { text } = req.body;
  if (!text || text.trim().length === 0) {
    return res.status(400).json({ success: false, error: 'Tweet text cannot be empty' });
  }

  if (!activeAccountState.isLive || !activeAccountState.liveToken) {
    return res.status(400).json({
      success: false,
      error: 'No X account connected. Please connect your X account first to publish tweets.'
    });
  }

  try {
    const result = await postLiveTweet(activeAccountState.liveToken, text);
    addBotLog('SUCCESS', 'Tweet Published to X', `Tweet ID: ${result.data?.id}`);
    return res.json({ success: true, isLive: true, result });
  } catch (err) {
    console.error('Error posting tweet:', err.response?.data || err.message);
    const msg = err.response?.data?.detail || err.message;
    res.status(500).json({ success: false, error: msg });
  }
});

export default router;
