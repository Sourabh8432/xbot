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
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Terminal
} from 'lucide-react';

export function BotAutomation() {
  const { botStatus, toggleBot, showToast } = useApp();

  const [rules, setRules] = useState([]);
  const [queue, setQueue] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeSubTab, setActiveSubTab] = useState('rules'); // rules, queue, logs

  // New Rule Modal Form State
  const [isAddRuleOpen, setIsAddRuleOpen] = useState(false);
  const [ruleName, setRuleName] = useState('');
  const [ruleTrigger, setRuleTrigger] = useState('');
  const [ruleTemplate, setRuleTemplate] = useState('');
  const [ruleCooldown, setRuleCooldown] = useState(10);

  // New Scheduled Tweet Form State
  const [isAddQueueOpen, setIsAddQueueOpen] = useState(false);
  const [queueText, setQueueText] = useState('');
  const [queueDate, setQueueDate] = useState('');

  // Fetch all bot data
  const refreshBotData = async () => {
    try {
      const [rRes, qRes, lRes] = await Promise.all([
        api.getBotRules(),
        api.getBotQueue(),
        api.getBotLogs()
      ]);
      if (rRes.success) setRules(rRes.rules);
      if (qRes.success) setQueue(qRes.queue);
      if (lRes.success) setLogs(lRes.logs);
    } catch (err) {
      console.error('Error refreshing bot data:', err);
    }
  };

  useEffect(() => {
    refreshBotData();
    const interval = setInterval(refreshBotData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Handle Add Rule
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
        showToast('Auto-reply rule created successfully!', 'success');
        setRuleName('');
        setRuleTrigger('');
        setRuleTemplate('');
        setIsAddRuleOpen(false);
        refreshBotData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Toggle Rule
  const handleToggleRule = async (id) => {
    try {
      await api.toggleBotRule(id);
      refreshBotData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Delete Rule
  const handleDeleteRule = async (id) => {
    try {
      await api.deleteBotRule(id);
      showToast('Rule removed', 'info');
      refreshBotData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handle Add to Queue
  const handleAddToQueue = async (e) => {
    e.preventDefault();
    if (!queueText.trim()) return;

    try {
      const scheduledIso = queueDate ? new Date(queueDate).toISOString() : new Date(Date.now() + 3600000 * 2).toISOString();
      const res = await api.addBotQueue({
        text: queueText.trim(),
        scheduledFor: scheduledIso
      });
      if (res.success) {
        showToast('Tweet queued for publication!', 'success');
        setQueueText('');
        setIsAddQueueOpen(false);
        refreshBotData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Delete Queue Item
  const handleDeleteQueue = async (id) => {
    try {
      await api.deleteBotQueue(id);
      showToast('Scheduled tweet cancelled', 'info');
      refreshBotData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-5">
      {/* Bot Control Banner */}
      <div className="p-6 rounded-2xl glass-card border border-white/10 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-sky-950/30 via-indigo-950/20 to-transparent">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            botStatus?.isActive
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-lg shadow-emerald-500/20'
              : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
          }`}>
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">
                X Autonomous Bot Engine
              </h2>
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                botStatus?.isActive
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {botStatus?.isActive ? 'Running' : 'Paused'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Listens to mentions via X API v2, matches keyword rules, and executes queued auto-replies.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={toggleBot}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg ${
              botStatus?.isActive
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/20'
            }`}
          >
            {botStatus?.isActive ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause Bot Engine</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Activate Bot Engine</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sub Tabs: Rules / Queue / Logs */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          {[
            { id: 'rules', label: 'Auto-Reply Rules', count: rules.length },
            { id: 'queue', label: 'Tweet Queue & Schedule', count: queue.length },
            { id: 'logs', label: 'Execution Logs', count: logs.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activeSubTab === tab.id
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 font-mono">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {activeSubTab === 'rules' && (
          <button
            onClick={() => setIsAddRuleOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs transition shadow-md shadow-sky-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Rule</span>
          </button>
        )}

        {activeSubTab === 'queue' && (
          <button
            onClick={() => setIsAddQueueOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs transition shadow-md shadow-sky-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule Post</span>
          </button>
        )}
      </div>

      {/* SUBTAB 1: Auto-Reply Rules */}
      {activeSubTab === 'rules' && (
        <div className="space-y-3">
          {rules.length === 0 ? (
            <div className="p-8 text-center rounded-2xl glass-card border border-white/10 text-slate-400 text-xs">
              No auto-reply rules configured yet. Click "Create Rule" above to add your first trigger!
            </div>
          ) : (
            rules.map((rule) => (
              <div
                key={rule.id}
                className="p-4 sm:p-5 rounded-2xl glass-card border border-white/10 hover:border-white/20 transition space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleRule(rule.id)}
                      className={`p-1 rounded-lg transition ${
                        rule.enabled ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-600 hover:text-slate-500'
                      }`}
                      title={rule.enabled ? 'Click to disable' : 'Click to enable'}
                    >
                      {rule.enabled ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{rule.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase ${
                          rule.enabled ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {rule.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>Trigger keyword:</span>
                        <code className="text-sky-400 font-mono bg-sky-500/10 px-1.5 py-0.5 rounded text-[11px]">
                          "{rule.triggerKeyword}"
                        </code>
                        <span className="text-slate-600">•</span>
                        <span>Cooldown: {rule.cooldownMinutes}m</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 hidden sm:inline">
                      Triggered: <span className="font-mono font-bold text-sky-400">{rule.timesTriggered}</span> times
                    </span>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      title="Delete rule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-300 font-mono">
                  <span className="text-slate-500 mr-2">Reply Template:</span>
                  <span>{rule.replyTemplate}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* SUBTAB 2: Queue & Schedule */}
      {activeSubTab === 'queue' && (
        <div className="space-y-3">
          {queue.length === 0 ? (
            <div className="p-8 text-center rounded-2xl glass-card border border-white/10 text-slate-400 text-xs">
              Tweet queue is empty. Click "Schedule Post" to queue upcoming tweets.
            </div>
          ) : (
            queue.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 rounded-2xl glass-card border border-white/10 hover:border-white/20 transition flex items-start justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold uppercase text-[10px]">
                      {item.status}
                    </span>
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      Scheduled for: {new Date(item.scheduledFor).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-200">{item.text}</p>
                </div>

                <button
                  onClick={() => handleDeleteQueue(item.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                  title="Cancel scheduled tweet"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* SUBTAB 3: Logs */}
      {activeSubTab === 'logs' && (
        <div className="space-y-2">
          {logs.length === 0 ? (
            <div className="p-8 text-center rounded-2xl glass-card border border-white/10 text-slate-400 text-xs">
              No bot activity logged yet.
            </div>
          ) : (
            logs.map((log) => {
              const isSuccess = log.type === 'SUCCESS';
              const isWarn = log.type === 'WARN';
              return (
                <div
                  key={log.id}
                  className="p-3 sm:p-4 rounded-xl glass-card border border-white/5 flex items-start gap-3 text-xs"
                >
                  <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                    isSuccess ? 'bg-emerald-500/20 text-emerald-400' : isWarn ? 'bg-amber-500/20 text-amber-400' : 'bg-sky-500/20 text-sky-400'
                  }`}>
                    {isSuccess ? <CheckCircle2 className="w-3.5 h-3.5" /> : isWarn ? <AlertTriangle className="w-3.5 h-3.5" /> : <Info className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{log.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-slate-400">{log.details}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Modal: Create Auto-Reply Rule */}
      {isAddRuleOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#12161f] border border-white/15 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Bot className="w-5 h-5 text-sky-400" />
              <span>Create New Auto-Reply Rule</span>
            </h3>

            <form onSubmit={handleCreateRule} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Rule Name
                </label>
                <input
                  type="text"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  placeholder="e.g. Free Trial & Docs Auto-Reply"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/60"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Trigger Keyword (matched in mentions)
                </label>
                <input
                  type="text"
                  value={ruleTrigger}
                  onChange={(e) => setRuleTrigger(e.target.value)}
                  placeholder="e.g. docs, trial, help, link"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/60"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Reply Template
                </label>
                <textarea
                  value={ruleTemplate}
                  onChange={(e) => setRuleTemplate(e.target.value)}
                  placeholder="Hey @{username}! Check out our docs here: https://example.com/docs 🚀"
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/60 resize-none"
                  required
                />
                <span className="text-[10px] text-slate-500">
                  Supported dynamic variable: <code className="text-sky-400">&#123;username&#125;</code>
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Cooldown (minutes)
                </label>
                <input
                  type="number"
                  value={ruleCooldown}
                  onChange={(e) => setRuleCooldown(e.target.value)}
                  min="1"
                  max="1440"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500/60"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddRuleOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs shadow-lg shadow-sky-500/20"
                >
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Schedule Tweet */}
      {isAddQueueOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#12161f] border border-white/15 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sky-400" />
              <span>Schedule Tweet for X API</span>
            </h3>

            <form onSubmit={handleAddToQueue} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tweet Content
                </label>
                <textarea
                  value={queueText}
                  onChange={(e) => setQueueText(e.target.value)}
                  placeholder="Draft your post..."
                  rows={4}
                  maxLength={280}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/60 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Scheduled Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={queueDate}
                  onChange={(e) => setQueueDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500/60"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddQueueOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs shadow-lg shadow-sky-500/20"
                >
                  Add to Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
