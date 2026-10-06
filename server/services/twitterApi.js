import crypto from 'crypto';
import axios from 'axios';
import { runtimeConfig } from '../config.js';
import { encryptPayload, decryptPayload, base64urlEncode } from './security.js';

// Generate code verifier and code challenge (S256)
export function generatePKCE() {
  const codeVerifier = base64urlEncode(crypto.randomBytes(32));
  const sha256 = crypto.createHash('sha256').update(codeVerifier).digest();
  const codeChallenge = base64urlEncode(sha256);
  return { codeVerifier, codeChallenge };
}

// Generate OAuth 2.0 PKCE Auth URL with stateless encrypted state
export function getTwitterAuthUrl(customClientId, customRedirectUri, originHost = null, customClientSecret = null) {
  const clientId = customClientId || runtimeConfig.clientId || process.env.TWITTER_CLIENT_ID;
  const clientSecret = customClientSecret || runtimeConfig.clientSecret || process.env.TWITTER_CLIENT_SECRET || '';
  
  // Dynamic redirect URI resolver
  let redirectUri = customRedirectUri;
  if (!redirectUri) {
    if (originHost) {
      redirectUri = `https://${originHost}/api/twitter/auth/callback`;
    } else {
      redirectUri = runtimeConfig.redirectUri;
    }
  }

  if (!clientId) {
    throw new Error('Twitter Client ID is not configured. Please enter your Client ID in Settings or Connect dialog.');
  }

  const { codeVerifier, codeChallenge } = generatePKCE();

  // Pack state with AES-256-GCM encryption (Valid across all serverless workers)
  const statePayload = {
    codeVerifier,
    clientId,
    clientSecret,
    redirectUri,
    timestamp: Date.now()
  };
  const state = encryptPayload(statePayload);

  const scopes = [
    'tweet.read',
    'tweet.write',
    'users.read',
    'offline.access',
    'like.read',
    'like.write',
    'bookmark.read'
  ].join(' ');

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scopes,
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256'
  });

  return {
    url: `https://twitter.com/i/oauth2/authorize?${params.toString()}`,
    state
  };
}

// Exchange authorization code for access & refresh tokens
export async function exchangeCodeForTokens(code, state) {
  // Decrypt state payload (valid within 15 minutes)
  const session = decryptPayload(state, 15 * 60 * 1000);
  if (!session) {
    throw new Error('OAuth state verification failed. The session may have expired (15 min limit). Please try connecting again.');
  }

  const { codeVerifier, clientId, redirectUri, clientSecret: sessionSecret } = session;
  const clientSecret = sessionSecret || runtimeConfig.clientSecret || process.env.TWITTER_CLIENT_SECRET || '';

  const bodyParams = new URLSearchParams({
    code: code,
    grant_type: 'authorization_code',
    client_id: clientId,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier
  });

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded'
  };

  // If confidential client with clientSecret, provide Basic Auth header (RFC 6749 / Twitter API v2 requirement)
  if (clientSecret) {
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    headers['Authorization'] = `Basic ${credentials}`;
  }

  try {
    const response = await axios.post('https://api.twitter.com/2/oauth2/token', bodyParams.toString(), {
      headers
    });

    return {
      ...response.data,
      clientId,
      clientSecret
    };
  } catch (axiosErr) {
    const errData = axiosErr.response?.data;
    console.error('Twitter Token Exchange Error:', errData || axiosErr.message);

    if (errData && (errData.error_description === 'Missing valid authorization header' || errData.error === 'invalid_request')) {
      if (!clientSecret) {
        throw new Error(
          'Missing Client Secret: Your Twitter App is set as a "Web App" (Confidential Client). Please provide your Client Secret in the connect screen, or switch your App Type in Twitter Developer Portal to "Native App".'
        );
      }
    }

    const msg = errData?.error_description || errData?.error || axiosErr.message;
    throw new Error(`Twitter OAuth Token Exchange Failed: ${msg}`);
  }
}

// Refresh access token via offline.access refresh_token
export async function refreshAccessToken(refreshToken, clientId = runtimeConfig.clientId, clientSecret = runtimeConfig.clientSecret) {
  if (!refreshToken) throw new Error('No refresh token provided');

  const resolvedClientId = clientId || runtimeConfig.clientId || process.env.TWITTER_CLIENT_ID;
  const resolvedClientSecret = clientSecret || runtimeConfig.clientSecret || process.env.TWITTER_CLIENT_SECRET || '';

  const bodyParams = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: resolvedClientId
  });

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded'
  };

  if (resolvedClientSecret) {
    const credentials = Buffer.from(`${resolvedClientId}:${resolvedClientSecret}`).toString('base64');
    headers['Authorization'] = `Basic ${credentials}`;
  }

  const response = await axios.post('https://api.twitter.com/2/oauth2/token', bodyParams.toString(), {
    headers
  });

  return response.data;
}

// Fetch user profile (/2/users/me) with ALL available fields & expansions
export async function fetchLiveUserProfile(accessToken) {
  const fields = [
    'created_at',
    'description',
    'entities',
    'id',
    'location',
    'name',
    'pinned_tweet_id',
    'profile_image_url',
    'protected',
    'public_metrics',
    'url',
    'username',
    'verified',
    'verified_type',
    'withheld'
  ].join(',');

  const tweetFields = [
    'attachments',
    'author_id',
    'context_annotations',
    'conversation_id',
    'created_at',
    'entities',
    'geo',
    'id',
    'in_reply_to_user_id',
    'lang',
    'public_metrics',
    'referenced_tweets',
    'reply_settings',
    'source',
    'text',
    'withheld'
  ].join(',');

  const url = `https://api.twitter.com/2/users/me?user.fields=${fields}&expansions=pinned_tweet_id&tweet.fields=${tweetFields}`;

  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  const rateLimitInfo = {
    limit: Number(response.headers['x-rate-limit-limit']) || 75,
    remaining: Number(response.headers['x-rate-limit-remaining']) || 74,
    reset: Number(response.headers['x-rate-limit-reset']) || Math.floor(Date.now() / 1000) + 900
  };

  return {
    raw: response.data,
    user: response.data.data,
    includes: response.data.includes || {},
    rateLimit: rateLimitInfo
  };
}

// Fetch tweets for a user (/2/users/:id/tweets)
export async function fetchLiveUserTweets(userId, accessToken, maxResults = 20) {
  // First try: Standard query with media attachments
  try {
    const tweetFields = 'attachments,author_id,conversation_id,created_at,entities,id,in_reply_to_user_id,lang,public_metrics,referenced_tweets,reply_settings,source,text';
    const expansions = 'attachments.media_keys,referenced_tweets.id';
    const mediaFields = 'duration_ms,height,media_key,preview_image_url,type,url,width,alt_text';

    const url = `https://api.twitter.com/2/users/${userId}/tweets?max_results=${maxResults}&tweet.fields=${tweetFields}&expansions=${expansions}&media.fields=${mediaFields}`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const rateLimitInfo = {
      limit: Number(response.headers['x-rate-limit-limit']) || 1500,
      remaining: Number(response.headers['x-rate-limit-remaining']) || 1490,
      reset: Number(response.headers['x-rate-limit-reset']) || Math.floor(Date.now() / 1000) + 900
    };

    return {
      raw: response.data,
      tweets: response.data.data || [],
      includes: response.data.includes || {},
      meta: response.data.meta || {},
      rateLimit: rateLimitInfo
    };
  } catch (err1) {
    console.warn('Standard tweet fetch failed, falling back to minimal fields:', err1.response?.data || err1.message);

    // Second try: Minimal fields (guaranteed compatible with standard tier)
    try {
      const urlSimple = `https://api.twitter.com/2/users/${userId}/tweets?max_results=${maxResults}&tweet.fields=created_at,public_metrics,text,source`;
      const response = await axios.get(urlSimple, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      return {
        raw: response.data,
        tweets: response.data.data || [],
        includes: {},
        meta: response.data.meta || {},
        rateLimit: null
      };
    } catch (err2) {
      console.error('All tweet fetch attempts failed:', err2.response?.data || err2.message);
      throw err2;
    }
  }
}

// Fetch mentions for a user (/2/users/:id/mentions)
export async function fetchLiveUserMentions(userId, accessToken) {
  const url = `https://api.twitter.com/2/users/${userId}/mentions?max_results=10&tweet.fields=created_at,author_id,public_metrics&expansions=author_id&user.fields=name,username,profile_image_url`;

  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  return response.data;
}

// Upload media (image/png) to Twitter
export async function uploadTwitterMedia(accessToken, imageBuffer, mimeType = 'image/png') {
  try {
    const formData = new FormData();
    const blob = new Blob([imageBuffer], { type: mimeType });
    formData.append('media', blob, 'card.png');

    const response = await axios.post('https://upload.twitter.com/1.1/media/upload.json', formData, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    return response.data?.media_id_string || response.data?.media_id || null;
  } catch (err) {
    console.warn('Twitter media upload attempt:', err.response?.data || err.message);
    return null;
  }
}

// Publish tweet (/2/tweets) with optional media attachments
export async function postLiveTweet(accessToken, text, replyToId = null, mediaIds = []) {
  const payload = { text };
  if (replyToId) {
    payload.reply = { in_reply_to_tweet_id: replyToId };
  }
  if (mediaIds && mediaIds.length > 0) {
    payload.media = { media_ids: mediaIds };
  }

  const response = await axios.post('https://api.twitter.com/2/tweets', payload, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  return response.data;
}

