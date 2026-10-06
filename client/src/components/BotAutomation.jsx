import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  Bot,
  Plus,
  Play,
  Pause,
  Trash2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  Send,
  Sparkles,
  RefreshCw,
  Sliders,
  Image as ImageIcon,
  Shield,
  Layers,
  Flame,
  Briefcase,
  TrendingUp,
  Check,
  Eye,
  ExternalLink
} from 'lucide-react';

export function BotAutomation() {
  const { botStatus, toggleBot, showToast, account } = useApp();

  const [settings, setSettings] = useState({
    autoPilotEnabled: true,
    niche: 'business_startups',
    tweetsPerDay: 3,
    includeImages: true,
    tone: 'viral_storytelling',
    humanJitterMinutes: 20,
    geminiApiKey: ''
  });
  const [queue, setQueue] = useState([]);
  const [published, setPublished] = useState([]);
  const [rules, setRules] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeSubTab, setActiveSubTab] = useState('queue'); // queue, strategy, published, rules, logs
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isReplenishing, setIsReplenishing] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [publishingId, setPublishingId] = useState(null);

  // New Scheduled Tweet Modal Form State
  const [isAddQueueOpen, setIsAddQueueOpen] = useState(false);
  const [queueText, setQueueText] = useState('');
  const [queueTopic, setQueueTopic] = useState('');
  const [queueCategory, setQueueCategory] = useState('Startup Breakdown');
  const [queueDate, setQueueDate] = useState('');

  // New Rule Modal Form State
  const [isAddRuleOpen, setIsAddRuleOpen] = useState(false);
  const [ruleName, setRuleName] = useState('');
  const [ruleTrigger, setRuleTrigger] = useState('');
  const [ruleTemplate, setRuleTemplate] = useState('');
  const [ruleCooldown, setRuleCooldown] = useState(10);

  // Preview Image Modal
  const [previewImage, setPreviewImage] = useState(null);

  const refreshAllData = async () => {
    try {
      setIsRefreshing(true);
      const [settingsRes, queueRes, pubRes, rulesRes, logsRes] = await Promise.all([
        api.getBotSettings().catch(() => ({})),
        api.getBotQueue().catch(() => ({ success: false, queue: [] })),
        api.getPublishedHistory().catch(() => ({ success: false, published: [] })),
        api.getBotRules().catch(() => ({ success: false, rules: [] })),
        api.getBotLogs().catch(() => ({ success: false, logs: [] }))
      ]);

      if (settingsRes.settings) setSettings(settingsRes.settings);
      if (queueRes.queue) setQueue(queueRes.queue);
      if (pubRes.published) setPublished(pubRes.published);
      if (rulesRes.rules) setRules(rulesRes.rules);
      if (logsRes.logs) setLogs(logsRes.logs);
    } catch (err) {
      console.error('Error refreshing bot data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshAllData();
    const interval = setInterval(refreshAllData, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setIsSavingSettings(true);
      const res = await api.saveBotSettings(settings);
      if (res.success) {
        showToast('Autonomous strategy settings saved!', 'success');
        refreshAllData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleReplenish = async () => {
    try {
      setIsReplenishing(true);
      showToast('Generating fresh business tweets and infographics...', 'info');
      const res = await api.replenishQueue();
      if (res.success) {
        showToast('Queue successfully replenished with fresh posts!', 'success');
        refreshAllData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsReplenishing(false);
    }
  };

  const handlePublishNow = async (id) => {
    try {
      setPublishingId(id);
      const res = await api.publishQueuedNow(id);
      if (res.success) {
        showToast('Tweet successfully published to X!', 'success');
        refreshAllData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setPublishingId(null);
    }
  };

  const handleDeleteQueue = async (id) => {
    try {
      await api.deleteBotQueue(id);
      showToast('Scheduled tweet removed from queue', 'info');
      refreshAllData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleAddCustomQueue = async (e) => {
    e.preventDefault();
    if (!queueText.trim()) return;

    try {
      const scheduledIso = queueDate ? new Date(queueDate).toISOString() : new Date(Date.now() + 3600000 * 2).toISOString();
      const res = await api.addBotQueue({
        text: queueText.trim(),
        topic: queueTopic.trim() || 'Custom Post',
        category: queueCategory,
        scheduledFor: scheduledIso
      });
      if (res.success) {
        showToast('Custom post scheduled into autonomous queue!', 'success');
        setQueueText('');
        setQueueTopic('');
        setIsAddQueueOpen(false);
        refreshAllData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateRule = async (e) => {
    e.preventDefault();
    if (!ruleName || !ruleTrigger || !ruleTemplate) {
      showToast('Please fill all required rule fields', 'error');
      return;
    }

    try {
      const res = await api.addBotRule({
        name: ruleName,
        triggerKeyword: ruleTrigger,
        replyTemplate: ruleTemplate,
        cooldownMinutes: ruleCooldown
      });
      if (res.success) {
        showToast('Auto-reply trigger created!', 'success');
        setRuleName('');
        setRuleTrigger('');
        setRuleTemplate('');
        setIsAddRuleOpen(false);
        refreshAllData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleRule = async (id) => {
    try {
      await api.toggleBotRule(id);
      refreshAllData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteRule = async (id) => {
    try {
      await api.deleteBotRule(id);
      showToast('Rule removed', 'info');
      refreshAllData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const scheduledCount = queue.filter(q => q.status === 'scheduled').length;

  return (
    <div className="space-y-6">
      {/* Hero Master Panel */}
      <div className="p-6 rounded-3xl glass-card border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xl ${
                settings.autoPilotEnabled
                  ? 'bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 shadow-sky-500/25 ring-2 ring-sky-400/30'
                  : 'bg-slate-800 text-slate-400 ring-1 ring-white/10'
              }`}>
                <Bot className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-white tracking-tight">
                    X Autonomous Engine (Business & Startups)
                  </h1>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    settings.autoPilotEnabled
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {settings.autoPilotEnabled ? '24/7 Auto-Pilot Active' : 'Engine Paused'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Researches, writes human-level viral breakdowns, creates infographics & publishes automatically without spamming.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button
              onClick={handleReplenish}
              disabled={isReplenishing}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 font-bold text-xs transition"
            >
              <Sparkles className={`w-4 h-4 ${isReplenishing ? 'animate-spin' : ''}`} />
              <span>{isReplenishing ? 'Replenishing...' : 'Replenish Buffer (3-5 Posts)'}</span>
            </button>

            <button
              onClick={async () => {
                await toggleBot();
                refreshAllData();
              }}
              className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all active:scale-95 ${
                settings.autoPilotEnabled
                  ? 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white shadow-rose-500/20'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-500/20'
              }`}
            >
              {settings.autoPilotEnabled ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause Auto-Pilot</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Activate 24/7 Auto-Pilot</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Telemetry Quick Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-white/10">
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Queue Buffer</span>
            <div className="text-lg font-black text-white flex items-center gap-2">
              <span>{scheduledCount} Posts Ready</span>
              {scheduledCount >= 4 ? (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400">Optimal</span>
              ) : (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400">Low Buffer</span>
              )}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Posting Frequency</span>
            <div className="text-lg font-black text-sky-400">
              {settings.tweetsPerDay} Posts / Day
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Human Jitter Offset</span>
            <div className="text-lg font-black text-purple-400">
              ±{settings.humanJitterMinutes} Mins Random
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Infographics</span>
            <div className="text-lg font-black text-emerald-400">
              {settings.includeImages ? 'Auto-Attached' : 'Text Only'}
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex border-b border-white/10 gap-2 overflow-x-auto pb-1">
        {[
          { id: 'queue', label: `Scheduled Queue (${scheduledCount})`, icon: Calendar },
          { id: 'strategy', label: 'Niche & Strategy Config', icon: Sliders },
          { id: 'published', label: `Published History (${published.length})`, icon: CheckCircle2 },
          { id: 'rules', label: `Auto-Replies (${rules.length})`, icon: Bot },
          { id: 'logs', label: `Engine Logs (${logs.length})`, icon: Shield }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: SCHEDULED QUEUE */}
      {activeSubTab === 'queue' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-400" />
                <span>Autonomous Post Queue</span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Posts lined up by the AI engine. Auto-publishes with human-like jitter so your account stays 100% compliant.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddQueueOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs transition"
              >
                <Plus className="w-3.5 h-3.5 text-sky-400" />
                <span>Custom Tweet</span>
              </button>
              <button
                onClick={refreshAllData}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {queue.length === 0 ? (
            <div className="p-12 rounded-2xl glass-card border border-white/10 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 mx-auto">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Queue is currently empty</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Click 'Replenish Buffer' to let the AI engine research and queue 5 fresh startup breakdowns and offer teardowns.
                </p>
              </div>
              <button
                onClick={handleReplenish}
                disabled={isReplenishing}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:opacity-90 text-white font-bold text-xs shadow-md transition"
              >
                {isReplenishing ? 'Generating...' : 'Auto-Generate Queue Now'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {queue.map(item => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl glass-card border border-white/10 hover:border-white/20 transition flex flex-col justify-between space-y-4 shadow-lg"
                >
                  <div className="space-y-3">
                    {/* Header tags */}
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 font-bold border border-sky-500/20">
                        {item.category || 'Startup Breakdown'}
                      </span>
                      <span className="text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {new Date(item.scheduledFor).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    {/* Topic Highlight */}
                    {item.topic && (
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                        <span>{item.topic}</span>
                      </h4>
                    )}

                    {/* Tweet Text */}
                    <p className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed font-sans bg-black/20 p-3 rounded-xl border border-white/5">
                      {item.text}
                    </p>

                    {/* Infographic Preview Thumbnail */}
                    {item.media?.publicUrl && (
                      <div className="relative rounded-xl overflow-hidden border border-white/10 bg-slate-900 group">
                        <img
                          src={item.media.publicUrl}
                          alt="Generated Visual Infographic"
                          className="w-full h-36 object-cover cursor-pointer group-hover:scale-105 transition duration-300"
                          onClick={() => setPreviewImage(item.media.publicUrl)}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center pointer-events-none">
                          <span className="text-[11px] font-bold text-white flex items-center gap-1 bg-black/60 px-3 py-1 rounded-full">
                            <Eye className="w-3.5 h-3.5" /> Click to Expand
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <span className="text-[10px] text-slate-500 font-mono">
                      Source: {item.source || 'Curated Bank'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePublishNow(item.id)}
                        disabled={publishingId === item.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-md transition"
                      >
                        <Send className={`w-3 h-3 ${publishingId === item.id ? 'animate-spin' : ''}`} />
                        <span>{publishingId === item.id ? 'Publishing...' : 'Publish Now'}</span>
                      </button>
                      <button
                        onClick={() => handleDeleteQueue(item.id)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: STRATEGY & NICHE CONFIGURATION */}
      {activeSubTab === 'strategy' && (
        <div className="p-6 rounded-2xl glass-card border border-white/10 space-y-6">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-400" />
              <span>Niche Focus & Anti-Spam Safety Settings</span>
            </h2>
            <p className="text-xs text-slate-400">
              Configure what the autonomous engine writes about and how frequently it publishes.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Niche Selector */}
              <div className="space-y-2">
                <label className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-sky-400" />
                  Primary Business Niche
                </label>
                <select
                  value={settings.niche}
                  onChange={(e) => setSettings({ ...settings, niche: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="business_startups">Startup Breakdowns ($0 to $100M+ Scale Stories)</option>
                  <option value="offers_growth">Irresistible Offers & Psychology (Alex Hormozi Style)</option>
                  <option value="growth_playbooks">Growth Loops & Zero-Cost Distribution Hacks</option>
                  <option value="all">Balanced Mix (Startups + Offers + Playbooks)</option>
                </select>
                <p className="text-[11px] text-slate-500">
                  Focuses on real stories (Airbnb, Stripe, Zerodha, Gymshark) and high-converting offer breakdowns.
                </p>
              </div>

              {/* Tweets per Day */}
              <div className="space-y-2">
                <label className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-purple-400" />
                  Daily Tweet Frequency (Recommended: 2 to 3)
                </label>
                <select
                  value={settings.tweetsPerDay}
                  onChange={(e) => setSettings({ ...settings, tweetsPerDay: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white focus:outline-none focus:border-sky-500"
                >
                  <option value={1}>1 Tweet / Day (Conservative & Safe)</option>
                  <option value={2}>2 Tweets / Day (Morning & Evening Deep Dives)</option>
                  <option value={3}>3 Tweets / Day (⭐ Optimal for X Algorithm Growth)</option>
                  <option value={4}>4 Tweets / Day (Aggressive Growth)</option>
                </select>
                <p className="text-[11px] text-emerald-400/80">
                  💡 Modern X algorithm heavily rewards 2-3 high-retention, bookmarkable posts rather than spamming 10+ tweets.
                </p>
              </div>

              {/* Human Jitter Window */}
              <div className="space-y-2">
                <label className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  Anti-Bot Detection (Human Jitter Offset)
                </label>
                <select
                  value={settings.humanJitterMinutes}
                  onChange={(e) => setSettings({ ...settings, humanJitterMinutes: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white focus:outline-none focus:border-sky-500"
                >
                  <option value={10}>±10 Minutes Random Jitter</option>
                  <option value={20}>±20 Minutes Random Jitter (Recommended)</option>
                  <option value={30}>±30 Minutes Random Jitter (Ultra-Organic)</option>
                </select>
                <p className="text-[11px] text-slate-500">
                  Adds natural randomness so tweets are never published at exact fixed seconds, preventing bot flags.
                </p>
              </div>

              {/* Include Infographic Visuals */}
              <div className="space-y-2">
                <label className="text-slate-300 font-bold flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                  Visual Infographic Cards
                </label>
                <div className="flex items-center gap-3 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.includeImages}
                      onChange={(e) => setSettings({ ...settings, includeImages: e.target.checked })}
                      className="w-4 h-4 rounded text-sky-500 focus:ring-0 bg-slate-800 border-white/20"
                    />
                    <span className="text-slate-300">
                      Auto-generate sleek dark-mode visual cards & attach to tweets (Increases bookmarks by 3.2x)
                    </span>
                  </label>
                </div>
              </div>

              {/* Gemini API Key */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  Google Gemini API Key (Optional — Curated Bank Active by Default)
                </label>
                <input
                  type="password"
                  placeholder="AIzaSy... (Leave empty to use built-in 50+ startup knowledge bank)"
                  value={settings.geminiApiKey}
                  onChange={(e) => setSettings({ ...settings, geminiApiKey: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white focus:outline-none focus:border-sky-500 font-mono text-xs"
                />
                <p className="text-[11px] text-slate-500">
                  Using Gemini 3.8 Flash for ultra-fast, human-like research. If empty, the bot seamlessly uses the built-in deep business intelligence bank!
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-white/10">
              <button
                type="submit"
                disabled={isSavingSettings}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:opacity-90 text-white font-bold text-xs shadow-lg transition"
              >
                <Check className="w-4 h-4" />
                <span>{isSavingSettings ? 'Saving...' : 'Save Strategy Settings'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: PUBLISHED HISTORY */}
      {activeSubTab === 'published' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Published Tweet History</span>
            </h2>
            <span className="text-xs text-slate-400">Total: {published.length}</span>
          </div>

          {published.length === 0 ? (
            <div className="p-8 rounded-2xl glass-card border border-white/10 text-center text-slate-400 text-xs">
              No tweets published by the autonomous engine yet. Check the queue tab to trigger your first post!
            </div>
          ) : (
            <div className="space-y-3">
              {published.map((pub, idx) => (
                <div key={idx} className="p-4 rounded-xl glass-card border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      {pub.isLive ? 'Published to X Live' : 'Sandbox Simulated'}
                    </span>
                    <span className="text-slate-500 font-mono">
                      {new Date(pub.publishedAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 whitespace-pre-wrap">{pub.text}</p>
                  {pub.mediaUrl && (
                    <div className="w-32 h-20 rounded-lg overflow-hidden border border-white/10">
                      <img src={pub.mediaUrl} alt="Visual card" className="w-full h-full object-cover cursor-pointer" onClick={() => setPreviewImage(pub.mediaUrl)} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: AUTO-REPLY RULES */}
      {activeSubTab === 'rules' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Keyword Auto-Reply Rules</h2>
              <p className="text-[11px] text-slate-400">Automatically reply when users mention specific trigger words.</p>
            </div>
            <button
              onClick={() => setIsAddRuleOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Trigger Rule</span>
            </button>
          </div>

          {rules.length === 0 ? (
            <div className="p-8 rounded-2xl glass-card border border-white/10 text-center text-slate-400 text-xs">
              No auto-reply rules configured yet. Click 'New Trigger Rule' to add one.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rules.map(rule => (
                <div key={rule.id} className="p-4 rounded-2xl glass-card border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white">{rule.name}</h4>
                    <button
                      onClick={() => handleToggleRule(rule.id)}
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        rule.enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {rule.enabled ? 'Active' : 'Disabled'}
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono bg-black/20 p-2 rounded-lg">
                    Trigger: "{rule.triggerKeyword}" ({rule.matchType})
                  </div>
                  <p className="text-xs text-slate-300 italic">"{rule.replyTemplate}"</p>
                  <div className="flex justify-end pt-2 border-t border-white/10">
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="text-[11px] text-rose-400 hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: ENGINE LOGS */}
      {activeSubTab === 'logs' && (
        <div className="p-6 rounded-2xl glass-card border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-sky-400" />
              <span>24/7 Engine Execution Logs</span>
            </h2>
            <button
              onClick={async () => {
                await api.clearBotLogs();
                refreshAllData();
              }}
              className="text-xs text-slate-400 hover:text-rose-400 transition"
            >
              Clear Logs
            </button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-2 font-mono text-xs">
            {logs.map(log => (
              <div key={log.id} className="p-2.5 rounded-xl bg-black/30 border border-white/5 space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className={`font-bold ${
                    log.type === 'SUCCESS' ? 'text-emerald-400' : log.type === 'ERROR' ? 'text-rose-400' : 'text-sky-400'
                  }`}>
                    [{log.type}] {log.title}
                  </span>
                  <span className="text-slate-500">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-slate-300 text-[11px]">{log.details}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Modal for Infographic Preview */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
            <img src={previewImage} alt="Expanded Preview" className="w-full h-auto object-contain" />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 bg-black/70 hover:bg-black text-white px-3 py-1.5 rounded-full text-xs font-bold"
            >
              Close ✕
            </button>
          </div>
        </div>
      )}

      {/* Add Custom Tweet Modal */}
      {isAddQueueOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-3xl glass-card border border-white/10 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Schedule Custom Post</h3>
            <form onSubmit={handleAddCustomQueue} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Topic / Company</label>
                <input
                  type="text"
                  placeholder="e.g. Airbnb Pricing Strategy"
                  value={queueTopic}
                  onChange={(e) => setQueueTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white"
                />
              </div>
              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Tweet Content</label>
                <textarea
                  rows={4}
                  placeholder="Write tweet or breakdown..."
                  value={queueText}
                  onChange={(e) => setQueueText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white"
                />
              </div>
              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Schedule Time (Optional)</label>
                <input
                  type="datetime-local"
                  value={queueDate}
                  onChange={(e) => setQueueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddQueueOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold"
                >
                  Schedule Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Trigger Rule Modal */}
      {isAddRuleOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-3xl glass-card border border-white/10 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Create Auto-Reply Trigger Rule</h3>
            <form onSubmit={handleCreateRule} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Rule Name</label>
                <input
                  type="text"
                  placeholder="e.g. Startup Guide Request"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white"
                />
              </div>
              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Trigger Keyword</label>
                <input
                  type="text"
                  placeholder="e.g. playbook, guide, breakdown"
                  value={ruleTrigger}
                  onChange={(e) => setRuleTrigger(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white"
                />
              </div>
              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Reply Template</label>
                <textarea
                  rows={3}
                  placeholder="Hey @{username}, here is the link to our breakdown..."
                  value={ruleTemplate}
                  onChange={(e) => setRuleTemplate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddRuleOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold"
                >
                  Create Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
