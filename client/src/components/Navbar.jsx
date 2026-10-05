import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Twitter,
  Radio,
  RefreshCw,
  LogOut,
  ChevronDown
} from 'lucide-react';

export function Navbar() {
  const {
    account,
    isLive,
    loadingAccount,
    fetchAccount,
    fetchTweets,
    handleDisconnect,
    setIsConnectModalOpen,
    botStatus,
    toggleBot,
    connectWithTwitter
  } = useApp();

  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);

  return (
    <header className="h-16 border-b border-white/10 glass-panel sticky top-0 z-40 px-4 lg:px-8 flex items-center justify-between">
      {/* Brand / Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white font-bold">
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base lg:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              XBot SaaS Studio
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
              API v2.0
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            Autonomous X Bot & Account Intelligence
          </p>
        </div>
      </div>

      {/* Center / Right Actions */}
      <div className="flex items-center gap-3">
        {/* Bot Status Toggle Button */}
        <button
          onClick={toggleBot}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
            botStatus?.isActive
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
          }`}
          title="Toggle Bot automation engine"
        >
          <span className={`w-2 h-2 rounded-full ${botStatus?.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
          <span className="hidden sm:inline">Bot Engine:</span>
          <span>{botStatus?.isActive ? 'ACTIVE' : 'PAUSED'}</span>
        </button>

        {/* Connection Status Indicator */}
        <div className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
          account
            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/50'
            : 'bg-slate-900/60 text-slate-400 border-slate-700/50'
        }`}>
          <Radio className={`w-3.5 h-3.5 ${account ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
          <span>{account ? 'Account Connected' : 'Not Connected'}</span>
        </div>

        {/* Refresh button */}
        {account && (
          <button
            onClick={() => {
              fetchAccount();
              fetchTweets();
            }}
            disabled={loadingAccount}
            title="Refresh account data from X API"
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loadingAccount ? 'animate-spin text-sky-400' : ''}`} />
          </button>
        )}

        {/* Connected Account Badge / Disconnect */}
        {account ? (
          <div className="relative">
            <button
              onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition"
            >
              {account.profile_image_url ? (
                <img
                  src={account.profile_image_url}
                  alt={account.name}
                  className="w-6 h-6 rounded-full object-cover ring-1 ring-sky-500/40"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs">
                  @
                </div>
              )}
              <span className="text-xs font-semibold text-slate-200 max-w-[110px] truncate hidden sm:inline">
                @{account.username}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {accountDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-xl glass-card border border-white/15 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150"
                onClick={() => setAccountDropdownOpen(false)}
              >
                <div className="px-3 py-2 border-b border-white/10 text-xs">
                  <div className="font-bold text-white truncate">{account.name}</div>
                  <div className="text-slate-400 text-[11px] truncate">@{account.username}</div>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="w-full flex items-center gap-2 px-3 py-2 mt-1 rounded-lg text-left text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Disconnect Account</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={connectWithTwitter}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-sky-500/20 transition-all active:scale-95"
          >
            <Twitter className="w-3.5 h-3.5 fill-current" />
            <span>Connect with X</span>
          </button>
        )}
      </div>
    </header>
  );
}
