import React from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ProfileHeader } from './components/ProfileHeader';
import { MetricsGrid } from './components/MetricsGrid';
import { TweetFeed } from './components/TweetFeed';
import { BotAutomation } from './components/BotAutomation';
import { AiTweetGenerator } from './components/AiTweetGenerator';
import { ApiInspector } from './components/ApiInspector';
import { SettingsView } from './components/SettingsView';
import { AccountModal } from './components/AccountModal';
import {
  CheckCircle2,
  AlertCircle,
  Info,
  Sparkles,
  Bot,
  MessageSquare,
  Twitter,
  Settings,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Cpu
} from 'lucide-react';

export function DashboardContent() {
  const { activeTab, account, loadingAccount, toast, setActiveTab, setIsConnectModalOpen } = useApp();

  if (loadingAccount && !account) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-sky-500/20 border-t-sky-500 animate-spin"></div>
        <div className="text-sm font-semibold text-slate-300">
          Loading XBot Dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {account ? (
                <>
                  {/* Profile Details Card */}
                  <ProfileHeader />

                  {/* All Public Metrics & Ratios */}
                  <MetricsGrid />

                  {/* Two Column Layout: Quick Actions & Recent Content */}
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Left (2 cols): Tweets Feed */}
                    <div className="xl:col-span-2 space-y-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-base font-bold text-white flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-sky-400" />
                          <span>Recent Activity & Posts</span>
                        </h2>
                        <button
                          onClick={() => setActiveTab('tweets')}
                          className="text-xs text-sky-400 hover:underline font-semibold"
                        >
                          View All Posts →
                        </button>
                      </div>
                      <TweetFeed />
                    </div>

                    {/* Right (1 col): Bot Quick Status & AI Shortcut */}
                    <div className="space-y-6">
                      {/* AI Generator Shortcut */}
                      <div className="p-5 rounded-2xl glass-card border border-white/10 space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-white">AI Content Assistant</h3>
                            <p className="text-[11px] text-slate-400">Draft high-conversion tweets</p>
                          </div>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Draft high-impact posts and publish or schedule them directly into your bot queue.
                        </p>
                        <button
                          onClick={() => setActiveTab('ai')}
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white font-semibold text-xs shadow-md transition"
                        >
                          Open AI Studio
                        </button>
                      </div>

                      {/* Bot Automation Rules Preview */}
                      <div className="p-5 rounded-2xl glass-card border border-white/10 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
                              <Bot className="w-4 h-4" />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-white">Bot Triggers</h3>
                              <p className="text-[11px] text-slate-400">Auto-reply & keyword rules</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setActiveTab('bot')}
                            className="text-xs text-sky-400 hover:underline font-semibold"
                          >
                            Manage →
                          </button>
                        </div>
                        <p className="text-xs text-slate-400">
                          Configure keyword rules to automatically respond to mentions and interactions.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* Clean Empty State: No Account Connected */
                <div className="py-12 px-6 rounded-3xl glass-card border border-white/10 shadow-2xl text-center max-w-3xl mx-auto space-y-6">
                  <div className="w-16 h-16 rounded-2xl bg-sky-500/20 border border-sky-500/30 text-sky-400 flex items-center justify-center mx-auto shadow-xl shadow-sky-500/20">
                    <Twitter className="w-8 h-8 fill-current" />
                  </div>

                  <div className="space-y-2">
                    <h1 className="text-2xl font-black text-white tracking-tight">
                      No X (Twitter) Account Connected
                    </h1>
                    <p className="text-sm text-slate-400 max-w-lg mx-auto">
                      Connect your account to sync full profile intelligence, track impressions and follower ratios, and activate the autonomous bot engine.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => setIsConnectModalOpen(true)}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-sky-500/20 transition-all active:scale-95"
                    >
                      <Twitter className="w-4 h-4 fill-current" />
                      <span>Connect X Account Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setActiveTab('settings')}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-semibold text-xs transition"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Configure API Keys</span>
                    </button>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/10 text-left">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
                      <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Profile & Metrics</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Extract username, ID, verification checkmarks, bio, age, follower counts, and ratios via API v2.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                        <TrendingUp className="w-4 h-4" />
                        <span>Timeline & Metrics</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Monitor post impressions, bookmarks, retweets, replies, and inspect raw API JSON responses.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
                      <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
                        <Cpu className="w-4 h-4" />
                        <span>Autonomous Bot</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Automate replies on keyword mentions, queue scheduled tweets, and generate posts with AI.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TWEETS & CONTENT */}
          {activeTab === 'tweets' && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div>
                <h1 className="text-xl font-bold text-white">Tweets & Content Performance</h1>
                <p className="text-xs text-slate-400">
                  Analyze impressions, retweets, bookmarks, and post directly to X.
                </p>
              </div>
              <TweetFeed />
            </div>
          )}

          {/* TAB 3: BOT AUTOMATION */}
          {activeTab === 'bot' && (
            <div className="max-w-5xl mx-auto space-y-6">
              <BotAutomation />
            </div>
          )}

          {/* TAB 4: AI STUDIO */}
          {activeTab === 'ai' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <AiTweetGenerator />
            </div>
          )}

          {/* TAB 5: RAW API INSPECTOR */}
          {activeTab === 'inspector' && (
            <div className="max-w-5xl mx-auto space-y-6">
              <ApiInspector />
            </div>
          )}

          {/* TAB 6: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-5xl mx-auto space-y-6">
              <SettingsView />
            </div>
          )}
        </main>
      </div>

      {/* Account Modal */}
      <AccountModal />

      {/* Toast Notification Popup */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl glass-card shadow-2xl border ${
            toast.type === 'success'
              ? 'border-emerald-500/40 text-emerald-300 bg-emerald-950/80'
              : toast.type === 'error'
              ? 'border-rose-500/40 text-rose-300 bg-rose-950/80'
              : 'border-sky-500/40 text-sky-300 bg-sky-950/80'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-sky-400 shrink-0" />
            )}
            <span className="text-xs font-semibold">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return <DashboardContent />;
}
