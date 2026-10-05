import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  twitterClientId: process.env.TWITTER_CLIENT_ID || '',
  twitterClientSecret: process.env.TWITTER_CLIENT_SECRET || '',
  twitterRedirectUri: process.env.TWITTER_REDIRECT_URI || 'http://localhost:3001/api/twitter/auth/callback',
  twitterBearerToken: process.env.TWITTER_BEARER_TOKEN || '',
  isProduction: process.env.NODE_ENV === 'production',
};

// In-memory runtime override if user updates API credentials via UI
export const runtimeConfig = {
  clientId: config.twitterClientId,
  clientSecret: config.twitterClientSecret,
  redirectUri: config.twitterRedirectUri,
  bearerToken: config.twitterBearerToken,
};
