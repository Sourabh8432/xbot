const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  // Account & Twitter endpoints
  getAccount: () => request('/twitter/account'),
  getTweets: () => request('/twitter/tweets'),
  getMentions: () => request('/twitter/mentions'),
  getRawProfile: () => request('/twitter/raw-profile'),
  getAuthUrl: (clientId, redirectUri) => {
    const params = new URLSearchParams();
    if (clientId) params.set('clientId', clientId);
    if (redirectUri) params.set('redirectUri', redirectUri);
    return request(`/twitter/auth/url?${params.toString()}`);
  },
  connectDirectToken: (accessToken) => request('/twitter/connect-token', {
    method: 'POST',
    body: JSON.stringify({ accessToken })
  }),
  saveCredentials: (creds) => request('/twitter/save-credentials', {
    method: 'POST',
    body: JSON.stringify(creds)
  }),
  getCredentialsStatus: () => request('/twitter/credentials-status'),
  getAccountsList: () => request('/twitter/accounts'),
  switchAccount: (index, mode) => request('/twitter/accounts/switch', {
    method: 'POST',
    body: JSON.stringify({ index, mode })
  }),
  disconnectAccount: () => request('/twitter/disconnect', {
    method: 'POST'
  }),
  postTweet: (text) => request('/twitter/tweet', {
    method: 'POST',
    body: JSON.stringify({ text })
  }),

  // Bot Automation endpoints
  getBotStatus: () => request('/bot/status'),
  toggleBot: () => request('/bot/toggle', { method: 'POST' }),
  getBotRules: () => request('/bot/rules'),
  addBotRule: (rule) => request('/bot/rules', {
    method: 'POST',
    body: JSON.stringify(rule)
  }),
  toggleBotRule: (id) => request(`/bot/rules/${id}/toggle`, {
    method: 'PATCH'
  }),
  deleteBotRule: (id) => request(`/bot/rules/${id}`, {
    method: 'DELETE'
  }),
  getBotQueue: () => request('/bot/queue'),
  addBotQueue: (item) => request('/bot/queue', {
    method: 'POST',
    body: JSON.stringify(item)
  }),
  deleteBotQueue: (id) => request(`/bot/queue/${id}`, {
    method: 'DELETE'
  }),
  getBotLogs: () => request('/bot/logs'),
  clearBotLogs: () => request('/bot/logs/clear', { method: 'POST' }),
  generateAiTweet: (payload) => request('/bot/generate-ai', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
};
