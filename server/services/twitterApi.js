import crypto from 'crypto';
import axios from 'axios';
import { runtimeConfig } from '../config.js';

// In-memory store for PKCE verifiers keyed by state
const pkceSessionStore = new Map();

// Helper to base64url encode
function base64URLEncode(str) {
  return str.toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

// Generate code verifier and code challenge (S256)
export function generatePKCE() {
  const codeVerifier = base64URLEncode(crypto.randomBytes(32));
  const sha256 = crypto.createHash('sha256').update(codeVerifier).digest();
  const codeChallenge = base64URLEncode(sha256);
  return { codeVerifier, codeChallenge };
}

// Generate OAuth 2.0 PKCE Auth URL
export function getTwitterAuthUrl(customClientId, customRedirectUri) {
  const clientId = customClientId || runtimeConfig.clientId;
  const redirectUri = customRedirectUri || runtimeConfig.redirectUri;

  if (!clientId) {
    throw new Error('Twitter Client ID is not configured. Please set it in Settings or .env');
  }

  const state = crypto.randomBytes(16).toString('hex');
  const { codeVerifier, codeChallenge } = generatePKCE();

  pkceSessionStore.set(state, {
    codeVerifier,
    createdAt: Date.now(),
    clientId,
    redirectUri
  });

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
  const session = pkceSessionStore.get(state);
  if (!session) {
    throw new Error('Invalid or expired state parameter during OAuth flow');
  }

  const { codeVerifier, clientId, redirectUri } = session;
  pkceSessionStore.delete(state);

  const clientSecret = runtimeConfig.clientSecret;

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

  // If confidential client with clientSecret, provide Basic Auth
  if (clientSecret) {
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    headers['Authorization'] = `Basic ${credentials}`;
  }

  const response = await axios.post('https://api.twitter.com/2/oauth2/token', bodyParams.toString(), {
    headers
  });

  return response.data; // { token_type, expires_in, access_token, scope, refresh_token }
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
    limit: response.headers['x-rate-limit-limit'] || 75,
    remaining: response.headers['x-rate-limit-remaining'] || 74,
    reset: response.headers['x-rate-limit-reset'] || Math.floor(Date.now() / 1000) + 900
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

  const expansions = 'attachments.media_keys,referenced_tweets.id';
  const mediaFields = 'duration_ms,height,media_key,preview_image_url,type,url,width,public_metrics,alt_text';

  const url = `https://api.twitter.com/2/users/${userId}/tweets?max_results=${maxResults}&tweet.fields=${tweetFields}&expansions=${expansions}&media.fields=${mediaFields}`;

  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  const rateLimitInfo = {
    limit: response.headers['x-rate-limit-limit'] || 1500,
    remaining: response.headers['x-rate-limit-remaining'] || 1490,
    reset: response.headers['x-rate-limit-reset'] || Math.floor(Date.now() / 1000) + 900
  };

  return {
    raw: response.data,
    tweets: response.data.data || [],
    includes: response.data.includes || {},
    meta: response.data.meta || {},
    rateLimit: rateLimitInfo
  };
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

// Publish tweet (/2/tweets)
export async function postLiveTweet(accessToken, text, replyToId = null) {
  const payload = { text };
  if (replyToId) {
    payload.reply = { in_reply_to_tweet_id: replyToId };
  }

  const response = await axios.post('https://api.twitter.com/2/tweets', payload, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  return response.data;
}
