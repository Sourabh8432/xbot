import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  MessageSquareText,
  Bot,
  Sparkles,
  Code2,
  Settings,
  Shield,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export function Sidebar() {
  const { activeTab, setActiveTab, botStatus, rateLimit } = useApp();

  const navItems = [
    {
      id: 'overview',
      label: 'Overview & Profile',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'tweets',
      label: 'Tweets & Content',
      icon: MessageSquareText,
      badge: 'v2'
    },
    {
      id: 'bot',
      label: 'Autonomous Bot',
      icon: Bot,
      badge: botStatus?.isActive ? '24/7 Live' : 'Paused',
      badgeColor: botStatus?.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
    },
    {
      id: 'ai',
      label: 'Viral Business Studio',
      icon: Sparkles,
      badge: 'Gemini 3.8'
    },
    {
      id: 'inspector',
      label: 'Raw API Inspector',
      icon: Code2,
      badge: 'JSON'
    },
    {
      id: 'settings',
      label: 'API Keys & Setup',
      icon: Settings,
      badge: null
    }
  ];

  return (
    <aside className="w-64 border-r border-white/10 glass-panel flex flex-col justify-between shrink-0 hidden lg:flex min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-6">
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Navigation
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                        item.badgeColor || 'bg-white/10 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* API Rate Limit Quick Widget */}
        <div className="p-3.5 rounded-xl glass-card border border-white/10 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-sky-400" />
              API Rate Quota
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-400 font-mono">
              v2/users
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Remaining:</span>
              <span className="font-mono font-semibold text-emerald-400">
                {rateLimit?.remaining || 71} / {rateLimit?.limit || 75}
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-400 h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.round(((rateLimit?.remaining || 71) / (rateLimit?.limit || 75)) * 100))}%`
                }}
              ></div>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 leading-tight">
            Resets automatically every 15-minute window according to Twitter v2 policy.
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-white/10 text-[11px] text-slate-500 space-y-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-slate-400">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            OAuth 2.0 PKCE
          </span>
          <span className="text-emerald-400 font-mono">Secured</span>
        </div>
        <div>
          Official X API v2 specification compliant.
        </div>
      </div>
    </aside>
  );
}
