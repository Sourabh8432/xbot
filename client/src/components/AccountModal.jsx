import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  X,
  Twitter,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export function AccountModal() {
  const {
    isConnectModalOpen,
    setIsConnectModalOpen,
    showToast,
    fetchAccount,
    fetchTweets
  } = useApp();

  const [activeTab, setActiveTab] = useState('oauth'); // oauth, direct
  const [directToken, setDirectToken] = useState('');
  const [loading, setLoading] = useState(false);

  // Custom Client ID for OAuth if user hasn't set .env
  const [oauthClientId, setOauthClientId] = useState('');

  if (!isConnectModalOpen) return null;

  // Handle OAuth Redirect
  const handleOAuthConnect = async () => {
    try {
      setLoading(true);
      const res = await api.getAuthUrl(oauthClientId || undefined);
      if (res.success && res.url) {
        window.location.href = res.url;
      }
    } catch (err) {
      showToast(err.message, 'error');
      setLoading(false);
    }
  };

  // Handle Direct Token Submit
  const handleDirectConnect = async (e) => {
    e.preventDefault();
    if (!directToken.trim()) {
      showToast('Please enter an Access Token', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await api.connectDirectToken(directToken.trim());
      if (res.success) {
        showToast('🎉 Connected live X account successfully!', 'success');
        await fetchAccount();
        await fetchTweets();
        setIsConnectModalOpen(false);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-[#12161f] border border-white/15 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <Twitter className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Connect Your X (Twitter) Account</h2>
              <p className="text-xs text-slate-400">
                Link any X account via OAuth 2.0 PKCE or Direct API Access Token
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsConnectModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-white/10 px-5 pt-3 gap-2">
          {[
            { id: 'oauth', label: 'OAuth 2.0 PKCE (Official)', icon: Twitter },
            { id: 'direct', label: 'Direct User Access Token', icon: KeyRound }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition -mb-px ${
                  activeTab === tab.id
                    ? 'border-sky-400 text-sky-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body content */}
        <div className="p-6">
          {/* TAB 1: OAuth 2.0 */}
          {activeTab === 'oauth' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-xs text-slate-300 space-y-2">
                <div className="font-bold text-sky-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Official OAuth 2.0 PKCE Flow
                </div>
                <p>
                  Connect securely via Twitter's official consent screen. Requires your Twitter Developer App Client ID.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  OAuth 2.0 Client ID (Optional if set in Settings / .env)
                </label>
                <input
                  type="text"
                  value={oauthClientId}
                  onChange={(e) => setOauthClientId(e.target.value)}
                  placeholder="Paste Twitter Developer Client ID..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/60 font-mono"
                />
                <span className="text-[11px] text-slate-500 block mt-1">
                  Callback URL in Twitter Developer Portal must be: <code className="text-sky-400 font-mono">{typeof window !== 'undefined' ? `${window.location.origin}/api/twitter/auth/callback` : 'http://localhost:3001/api/twitter/auth/callback'}</code>
                </span>
              </div>

              <button
                onClick={handleOAuthConnect}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 transition"
              >
                <Twitter className="w-4 h-4 fill-current" />
                <span>{loading ? 'Redirecting to X...' : 'Authorize with X (Twitter)'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* TAB 2: Direct Token */}
          {activeTab === 'direct' && (
            <form onSubmit={handleDirectConnect} className="space-y-4">
              <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-slate-300 space-y-2">
                <div className="font-bold text-purple-400 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4" />
                  Instant Live Token Access
                </div>
                <p>
                  Paste your User Access Token or Bearer Token generated in the Twitter Developer Portal. The dashboard will immediately query <code className="text-purple-300">/2/users/me</code> and display all profile metrics.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Twitter Access Token / Bearer Token
                </label>
                <input
                  type="password"
                  value={directToken}
                  onChange={(e) => setDirectToken(e.target.value)}
                  placeholder="Paste token (e.g. AAAAAAAAAAAAAAAAAAAAA...)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/60 font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || !directToken.trim()}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{loading ? 'Verifying with X API...' : 'Validate & Connect Account'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
