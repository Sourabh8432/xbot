import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  Code2,
  Copy,
  Check,
  RefreshCw,
  FileJson,
  Layers,
  Info,
  CheckCircle2
} from 'lucide-react';

export function ApiInspector() {
  const { account, isLive, showToast } = useApp();
  const [rawData, setRawData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('raw'); // raw, dictionary

  const fetchRaw = async () => {
    try {
      setLoading(true);
      const res = await api.getRawProfile();
      if (res.success) {
        setRawData(res.raw);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRaw();
  }, [account]);

  const handleCopy = () => {
    if (rawData) {
      navigator.clipboard.writeText(JSON.stringify(rawData, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showToast('Raw API payload copied to clipboard!', 'success');
    }
  };

  const fieldsDictionary = [
    { name: 'id', type: 'string', desc: 'The unique, immutable identifier of this user across Twitter/X.' },
    { name: 'name', type: 'string', desc: 'The display name shown on the user profile.' },
    { name: 'username', type: 'string', desc: 'The unique handle/screen name (without @).' },
    { name: 'created_at', type: 'ISO 8601 string', desc: 'The UTC timestamp when the X account was registered.' },
    { name: 'description', type: 'string', desc: 'The full user bio text, including emojis and links.' },
    { name: 'location', type: 'string', desc: 'The self-reported location from the profile settings.' },
    { name: 'pinned_tweet_id', type: 'string', desc: 'ID of the tweet pinned to the top of the user profile.' },
    { name: 'profile_image_url', type: 'string URL', desc: 'HTTPS URL for profile avatar image (supports _normal, _400x400).' },
    { name: 'protected', type: 'boolean', desc: 'True if tweets are private/protected; false if public.' },
    { name: 'verified', type: 'boolean', desc: 'Indicates if the user has an active X verified subscription or badge.' },
    { name: 'verified_type', type: 'string', desc: '"blue" (personal/premium), "business" (gold square), or "government" (grey circle).' },
    { name: 'public_metrics.followers_count', type: 'integer', desc: 'Exact count of users following this account.' },
    { name: 'public_metrics.following_count', type: 'integer', desc: 'Exact count of accounts this user is following.' },
    { name: 'public_metrics.tweet_count', type: 'integer', desc: 'Total number of lifetime tweets, replies, and retweets posted.' },
    { name: 'public_metrics.listed_count', type: 'integer', desc: 'Number of public lists that include this account.' },
    { name: 'entities.url.urls', type: 'array of objects', desc: 'Expanded URL objects with display_url and expanded_url.' },
    { name: 'entities.description.hashtags', type: 'array of objects', desc: 'All hashtags parsed within the user description bio.' },
    { name: 'withheld', type: 'object | null', desc: 'Country codes if account is restricted or withheld under local law.' }
  ];

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl glass-card border border-white/10 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">X API v2 Raw Inspector</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase">
                {isLive ? 'Live Response' : 'Mock v2 Spec'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Inspect the exact raw JSON object returned by Twitter API v2 with all fields and expansions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchRaw}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky-400' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold shadow-md shadow-sky-500/20 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('raw')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === 'raw'
              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileJson className="w-3.5 h-3.5" />
          <span>Raw JSON Tree</span>
        </button>
        <button
          onClick={() => setActiveTab('dictionary')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === 'dictionary'
              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>X API Field Dictionary ({fieldsDictionary.length} Fields)</span>
        </button>
      </div>

      {/* Tab 1: Raw JSON Viewer */}
      {activeTab === 'raw' && (
        <div className="rounded-2xl glass-card border border-white/10 overflow-hidden shadow-2xl">
          <div className="px-4 py-3 bg-black/60 border-b border-white/10 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>GET https://api.twitter.com/2/users/me?user.fields=...</span>
            <span className="text-emerald-400 font-semibold">Status: 200 OK</span>
          </div>
          <div className="p-5 font-mono text-xs text-sky-300 bg-black/80 overflow-x-auto max-h-[600px] leading-relaxed">
            {loading ? (
              <div className="py-12 text-center text-slate-500">Loading payload...</div>
            ) : (
              <pre>{JSON.stringify(rawData, null, 2)}</pre>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Field Dictionary */}
      {activeTab === 'dictionary' && (
        <div className="rounded-2xl glass-card border border-white/10 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 border-b border-white/10 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="p-3.5">API Field Name</th>
                  <th className="p-3.5">Data Type</th>
                  <th className="p-3.5">Specification & Meaning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {fieldsDictionary.map((f, i) => (
                  <tr key={i} className="hover:bg-white/5 transition">
                    <td className="p-3.5 font-mono text-sky-400 font-semibold">{f.name}</td>
                    <td className="p-3.5 font-mono text-[11px] text-purple-400">{f.type}</td>
                    <td className="p-3.5 text-slate-300">{f.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
