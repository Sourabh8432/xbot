import express from 'express';
import {
  getTwitterAuthUrl,
  exchangeCodeForTokens,
  refreshAccessToken,
  fetchLiveUserProfile,
  fetchLiveUserTweets,
  fetchLiveUserMentions,
  postLiveTweet
} from '../services/twitterApi.js';
import { addBotLog } from '../services/botService.js';
import { runtimeConfig } from '../config.js';
import { encryptPayload, decryptPayload } from '../services/security.js';

const router = express.Router();

// Fallback in-memory session (for local development)
let memorySession = {
  isLive: false,
  accessToken: null,
  refreshToken: null,
  user: null,
  rateLimit: null
};

// Helper to extract token & session from request (Header > Cookie > Memory)
function getRequestSession(req) {
  // 1. Authorization header (Bearer token)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const rawToken = authHeader.substring(7).trim();
    // Check if it's an encrypted session payload
    const decrypted = decryptPayload(rawToken);
    if (decrypted && decrypted.accessToken) {
      return decrypted;
    }
    // Otherwise direct access token
    return { accessToken: rawToken, isLive: true };
  }

  // 2. Cookie header (xbot_session)
  if (req.headers.cookie) {
    const match = req.headers.cookie.match(/xbot_session=([^;]+)/);
    if (match && match[1]) {
      const decrypted = decryptPayload(match[1]);
      if (decrypted && decrypted.accessToken) {
        return decrypted;
      }
    }
  }

  // 3. In-memory session fallback
  if (memorySession.accessToken) {
    return memorySession;
  }

  return null;
}

// Return the currently active account details
router.get('/account', async (req, res) => {
  try {
    const session = getRequestSession(req);

    if (session && session.accessToken) {
      try {
        let accessToken = session.accessToken;
        let liveProfile;

        try {
          liveProfile = await fetchLiveUserProfile(accessToken);
        } catch (fetchErr) {
          // If token expired (401) and we have a refresh_token, attempt refresh
          if (fetchErr.response?.status === 401 && session.refreshToken) {
            console.log('🔄 Access token expired. Refreshing using refresh_token...');
            const refreshed = await refreshAccessToken(session.refreshToken);
            accessToken = refreshed.access_token;
            liveProfile = await fetchLiveUserProfile(accessToken);
          } else {
            throw fetchErr;
          }
        }

        return res.json({
          success: true,
          isLive: true,
          account: liveProfile.user,
          includes: liveProfile.includes,
          rateLimit: liveProfile.rateLimit
        });
      } catch (liveErr) {
        console.error('Error fetching live X profile:', liveErr.response?.data || liveErr.message);
        if (session.user) {
          return res.json({
            success: true,
            isLive: true,
            cached: true,
            account: session.user,
            rateLimit: session.rateLimit
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
    const session = getRequestSession(req);

    if (session && session.accessToken) {
      try {
        // Need user ID. If not in session, fetch user profile first
        let userId = session.user?.id;
        if (!userId) {
          const profile = await fetchLiveUserProfile(session.accessToken);
          userId = profile.user.id;
        }

        const tweetsData = await fetchLiveUserTweets(userId, session.accessToken);
        return res.json({
          success: true,
          isLive: true,
          tweets: tweetsData.tweets,
          includes: tweetsData.includes,
          meta: tweetsData.meta,
          rateLimit: tweetsData.rateLimit
        });
      } catch (err) {
        console.error('Error fetching live tweets:', err.response?.data || err.message);
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
    const session = getRequestSession(req);

    if (session && session.accessToken) {
      try {
        let userId = session.user?.id;
        if (!userId) {
          const profile = await fetchLiveUserProfile(session.accessToken);
          userId = profile.user.id;
        }

        const mentionsData = await fetchLiveUserMentions(userId, session.accessToken);
        return res.json({ success: true, isLive: true, mentions: mentionsData });
      } catch (err) {
        console.error('Error fetching live mentions:', err.response?.data || err.message);
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
router.get('/raw-profile', async (req, res) => {
  const session = getRequestSession(req);
  if (session && session.accessToken) {
    try {
      const liveProfile = await fetchLiveUserProfile(session.accessToken);
      return res.json({ success: true, isLive: true, raw: liveProfile.raw });
    } catch (err) {
      // Fallback
    }
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
    const originHost = req.headers['x-forwarded-host'] || req.headers.host;
    const authData = getTwitterAuthUrl(clientId, redirectUri, originHost);
    res.json({ success: true, ...authData });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// OAuth Callback endpoint (Stateless & Vercel Serverless Ready)
router.get('/auth/callback', async (req, res) => {
  const { code, state, error, error_description } = req.query;

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

    // Fetch user details immediately from X API v2
    const userProfile = await fetchLiveUserProfile(tokenData.access_token);

    // Build encrypted session token for cross-lambda & cross-device persistence
    const sessionData = {
      isLive: true,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      user: userProfile.user,
      rateLimit: userProfile.rateLimit,
      timestamp: Date.now()
    };
    const sessionToken = encryptPayload(sessionData);

    // Update memory fallback
    memorySession = sessionData;

    addBotLog('SUCCESS', 'X Account Connected', `Connected live account @${userProfile.user.username} via OAuth 2.0 PKCE`);

    // Set secure HTTP-only cookie + pass in URL query for client localStorage
    res.cookie('xbot_session', sessionToken, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    return res.redirect(getRedirectUrl(`/?auth_success=true&session=${encodeURIComponent(sessionToken)}`));
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
    const token = accessToken.trim();
    const userProfile = await fetchLiveUserProfile(token);

    const sessionData = {
      isLive: true,
      accessToken: token,
      user: userProfile.user,
      rateLimit: userProfile.rateLimit,
      timestamp: Date.now()
    };
    const sessionToken = encryptPayload(sessionData);

    memorySession = sessionData;

    addBotLog('SUCCESS', 'Live Account Connected', `Connected live account @${userProfile.user.username} via Direct Token`);

    res.cookie('xbot_session', sessionToken, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      message: 'Account successfully connected!',
      sessionToken,
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
  const originHost = req.headers['x-forwarded-host'] || req.headers.host;
  const computedRedirectUri = originHost
    ? `https://${originHost}/api/twitter/auth/callback`
    : runtimeConfig.redirectUri;

  res.json({
    hasClientId: !!runtimeConfig.clientId,
    clientIdPreview: runtimeConfig.clientId ? `${runtimeConfig.clientId.substring(0, 6)}...` : null,
    hasClientSecret: !!runtimeConfig.clientSecret,
    redirectUri: runtimeConfig.redirectUri || computedRedirectUri,
    detectedOriginUri: computedRedirectUri
  });
});

// Disconnect account
router.post('/disconnect', (req, res) => {
  memorySession = {
    isLive: false,
    accessToken: null,
    refreshToken: null,
    user: null,
    rateLimit: null
  };

  res.clearCookie('xbot_session', { path: '/' });
  addBotLog('INFO', 'Account Disconnected', 'Disconnected X account from dashboard.');

  res.json({ success: true, message: 'Account disconnected successfully.' });
});

// Post a tweet to X
router.post('/tweet', async (req, res) => {
  const { text } = req.body;
  if (!text || text.trim().length === 0) {
    return res.status(400).json({ success: false, error: 'Tweet text cannot be empty' });
  }

  const session = getRequestSession(req);
  if (!session || !session.accessToken) {
    return res.status(400).json({
      success: false,
      error: 'No X account connected. Please connect your X account first to publish tweets.'
    });
  }

  try {
    const result = await postLiveTweet(session.accessToken, text);
    addBotLog('SUCCESS', 'Tweet Published to X', `Tweet ID: ${result.data?.id}`);
    return res.json({ success: true, isLive: true, result });
  } catch (err) {
    console.error('Error posting tweet:', err.response?.data || err.message);
    const msg = err.response?.data?.detail || err.message;
    res.status(500).json({ success: false, error: msg });
  }
});

export default router;
