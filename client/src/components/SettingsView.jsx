import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  Settings,
  Key,
  ShieldCheck,
  Save,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Copy,
  Check
} from 'lucide-react';

export function SettingsView() {
  const { showToast } = useApp();

  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const defaultCallback = typeof window !== 'undefined'
    ? `${window.location.origin}/api/twitter/auth/callback`
    : 'http://localhost:3001/api/twitter/auth/callback';
  const [redirectUri, setRedirectUri] = useState(defaultCallback);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedCallback, setCopiedCallback] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      const savedId = localStorage.getItem('xbot_client_id');
      const savedSecret = localStorage.getItem('xbot_client_secret');
      if (savedId) setClientId(savedId);
      if (savedSecret) setClientSecret(savedSecret);
    }
    api.getCredentialsStatus().then((s) => setStatus(s)).catch(() => {});
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const cleanId = clientId.trim();
      const cleanSecret = clientSecret.trim();

      if (typeof localStorage !== 'undefined') {
        if (cleanId) localStorage.setItem('xbot_client_id', cleanId);
        if (cleanSecret) localStorage.setItem('xbot_client_secret', cleanSecret);
      }

      const res = await api.saveCredentials({
        clientId: cleanId,
        clientSecret: cleanSecret,
        redirectUri: redirectUri.trim()
      });
      if (res.success) {
        showToast('API credentials saved successfully!', 'success');
        const s = await api.getCredentialsStatus();
        setStatus(s);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const copyCallback = () => {
    navigator.clipboard.writeText(redirectUri);
    setCopiedCallback(true);
    setTimeout(() => setCopiedCallback(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl glass-card border border-white/10 shadow-xl space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">X Developer Credentials & App Setup</h2>
            <p className="text-xs text-slate-400">
              Configure OAuth 2.0 PKCE credentials to connect real accounts to your SaaS bot.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Form */}
        <div className="p-6 rounded-2xl glass-card border border-white/10 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-sky-400" />
            <span>OAuth 2.0 Credentials</span>
          </h3>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Client ID
              </label>
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder={status?.hasClientId ? `Configured (${status.clientIdPreview})` : "Enter Twitter Developer Client ID"}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/60 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Client Secret (Optional for Public PKCE Clients)
              </label>
              <input
                type="password"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                placeholder={status?.hasClientSecret ? "••••••••••••••••" : "Enter Client Secret (if confidential)"}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/60 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                OAuth 2.0 Redirect URI / Callback URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={redirectUri}
                  onChange={(e) => setRedirectUri(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono text-[11px] focus:outline-none focus:border-sky-500/60"
                  required
                />
                <button
                  type="button"
                  onClick={copyCallback}
                  className="px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition"
                  title="Copy Callback URL"
                >
                  {copiedCallback ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Credentials'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Step-by-Step Setup Guide */}
        <div className="p-6 rounded-2xl glass-card border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-sky-400" />
              <span>How to setup X Developer Portal</span>
            </h3>
            <a
              href="https://developer.twitter.com/en/portal/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-sky-400 hover:underline flex items-center gap-1"
            >
              <span>Open Portal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-400 text-[10px] flex items-center justify-center font-bold">1</span>
                Create Project & App
              </div>
              <p className="text-slate-400 text-[11px]">
                Sign in to <span className="text-sky-300">developer.twitter.com</span> and create a new project/app.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-400 text-[10px] flex items-center justify-center font-bold">2</span>
                Enable User Authentication Settings
              </div>
              <p className="text-slate-400 text-[11px]">
                Click "Set up" under User authentication settings:
                <br />• <strong>App permissions:</strong> Read and Write
                <br />• <strong>Type of App:</strong> Web App, Automated App or Bot
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-400 text-[10px] flex items-center justify-center font-bold">3</span>
                Set Callback & Website URLs
              </div>
              <p className="text-slate-400 text-[11px]">
                • Callback URL: <code className="text-sky-400 font-mono">{defaultCallback}</code>
                <br />• Website URL: <code className="text-sky-400 font-mono">{typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'}</code>
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-400 text-[10px] flex items-center justify-center font-bold">4</span>
                Copy Client ID & Secret
              </div>
              <p className="text-slate-400 text-[11px]">
                Twitter portal me se generated <strong>Client ID</strong> aur <strong>Client Secret</strong> dono copy karke left side form me paste karein aur "Save Credentials" dabayein.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
