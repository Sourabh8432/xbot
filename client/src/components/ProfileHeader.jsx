import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar,
  MapPin,
  Link as LinkIcon,
  CheckCircle,
  Copy,
  Check,
  Shield,
  ExternalLink,
  Lock,
  Globe,
  Award,
  Pin,
  KeyRound
} from 'lucide-react';

export function ProfileHeader() {
  const { account, isLive, setActiveTab, handleDisconnect } = useApp();
  const [copiedId, setCopiedId] = useState(false);

  if (!account) return null;

  const copyId = () => {
    if (account.id) {
      navigator.clipboard.writeText(account.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  // Format creation date
  const createdDate = account.created_at ? new Date(account.created_at) : null;
  const formattedCreatedDate = createdDate
    ? createdDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Unknown';

  const accountAgeYears = createdDate
    ? ((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)).toFixed(1)
    : null;

  // Verification badge renderer
  const renderVerificationBadge = () => {
    if (!account.verified) return null;

    if (account.verified_type === 'business') {
      return (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30"
          title="Verified Business Account (Gold Checkmark)"
        >
          <Award className="w-3.5 h-3.5 fill-amber-400 text-amber-900" />
          <span>Verified Business</span>
        </span>
      );
    }

    if (account.verified_type === 'government') {
      return (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-500/20 text-slate-300 border border-slate-500/30"
          title="Government / Official Account (Grey Checkmark)"
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Government</span>
        </span>
      );
    }

    // Default: Blue checkmark
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30"
        title="Verified Subscriber (Blue Checkmark)"
      >
        <CheckCircle className="w-3.5 h-3.5 fill-sky-500 text-slate-900" />
        <span>Verified</span>
      </span>
    );
  };

  return (
    <div className="rounded-2xl glass-card overflow-hidden border border-white/10 shadow-xl">
      {/* Banner */}
      <div className="h-40 sm:h-52 w-full relative bg-gradient-to-r from-slate-900 via-indigo-950 to-sky-950 overflow-hidden">
        {account.banner_url ? (
          <img
            src={account.banner_url}
            alt="Profile Banner"
            className="w-full h-full object-cover opacity-85"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-sky-900/30 to-purple-900/40 backdrop-blur-3xl flex items-center justify-center">
            <span className="text-white/20 font-mono text-2xl font-bold tracking-widest uppercase">
              @{account.username}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#161b22] via-transparent to-black/20"></div>

        {/* Top banner controls */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <a
            href={`https://x.com/${account.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white text-xs font-semibold backdrop-blur-md border border-white/10 transition"
          >
            <span>View on X</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          {isLive && (
            <button
              onClick={handleDisconnect}
              className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold backdrop-blur-md border border-rose-500/30 transition"
            >
              Disconnect
            </button>
          )}
        </div>
      </div>

      {/* Main Profile Info Section */}
      <div className="px-6 pb-6 pt-0 relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between -mt-16 sm:-mt-20 gap-4 mb-4">
          {/* Avatar */}
          <div className="relative group">
            <img
              src={account.profile_image_url || 'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png'}
              alt={account.name}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-[#161b22] object-cover bg-slate-800 shadow-2xl ring-2 ring-sky-500/30"
            />
            {account.protected && (
              <div
                className="absolute bottom-1 right-1 p-1.5 rounded-full bg-amber-500 text-slate-950 ring-2 ring-[#161b22]"
                title="Protected Tweets"
              >
                <Lock className="w-3.5 h-3.5" />
              </div>
            )}
          </div>

          {/* Quick buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('inspector')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold transition"
            >
              <span>Inspect API JSON</span>
            </button>
            <button
              onClick={() => setActiveTab('bot')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 border border-sky-500/30 text-xs font-semibold transition"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Configure Bot Rules</span>
            </button>
          </div>
        </div>

        {/* Identity & Badges */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {account.name}
            </h1>
            {renderVerificationBadge()}
            {account.protected && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <Lock className="w-3 h-3" /> Private
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">@{account.username}</span>
            <span className="text-slate-600">•</span>
            <button
              onClick={copyId}
              className="flex items-center gap-1 hover:text-sky-400 transition font-mono"
              title="Click to copy Twitter User ID"
            >
              <span>ID: {account.id}</span>
              {copiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-500" />}
            </button>
          </div>

          {/* Bio / Description */}
          {account.description && (
            <p className="text-sm text-slate-200 leading-relaxed max-w-3xl whitespace-pre-line font-normal">
              {account.description}
            </p>
          )}

          {/* Metadata Row: Location, URL, Joined Date, Age */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 text-xs text-slate-400">
            {account.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                <span>{account.location}</span>
              </div>
            )}

            {account.url && (
              <div className="flex items-center gap-1.5">
                <LinkIcon className="w-4 h-4 text-sky-400 shrink-0" />
                <a
                  href={account.url.startsWith('http') ? account.url : `https://${account.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:underline font-medium truncate max-w-[200px]"
                >
                  {account.entities?.url?.urls?.[0]?.display_url || account.url}
                </a>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
              <span>Joined {formattedCreatedDate} {accountAgeYears && `(${accountAgeYears} yrs)`}</span>
            </div>

            {account.pinned_tweet_id && (
              <div className="flex items-center gap-1.5 text-amber-400/90 font-medium">
                <Pin className="w-3.5 h-3.5 shrink-0" />
                <span>Pinned Tweet: #{account.pinned_tweet_id.substring(0, 10)}...</span>
              </div>
            )}
          </div>

          {/* API Scopes & Access Badges */}
          <div className="pt-2 border-t border-white/5 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mr-1">
              <KeyRound className="w-3 h-3 text-sky-400" />
              Active OAuth Scopes:
            </span>
            {(account.scopes_granted || ['users.read', 'tweet.read', 'tweet.write', 'offline.access']).map((scope) => (
              <span
                key={scope}
                className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/10"
              >
                {scope}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
