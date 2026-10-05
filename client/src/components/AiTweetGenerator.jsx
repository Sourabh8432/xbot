import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  Sparkles,
  Send,
  Calendar,
  Copy,
  Check,
  RefreshCw,
  Hash,
  Lightbulb,
  Flame,
  Briefcase,
  Smile,
  Zap
} from 'lucide-react';

export function AiTweetGenerator() {
  const { showToast, fetchTweets } = useApp();

  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('viral'); // viral, professional, casual, witty
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [copied, setCopied] = useState(false);

  const samplePrompts = [
    'Launching a new AI micro-SaaS in public',
    'Why developer ergonomics matter more than raw speed',
    '3 lessons scaling from 0 to 10k users on Twitter',
    'Node.js vs Go for real-time WebSockets API bots'
  ];

  const handleGenerate = async (selectedTopic = topic) => {
    const finalTopic = selectedTopic || topic;
    if (!finalTopic.trim()) {
      showToast('Please enter a topic or select an idea prompt', 'error');
      return;
    }

    try {
      setIsGenerating(true);
      const res = await api.generateAiTweet({ topic: finalTopic, tone });
      if (res.success) {
        setResult(res.result);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublishNow = async () => {
    if (!result?.generatedText) return;

    try {
      setIsPublishing(true);
      await api.postTweet(result.generatedText);
      showToast('AI-generated tweet successfully published to X!', 'success');
      await fetchTweets();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleQueuePost = async () => {
    if (!result?.generatedText) return;

    try {
      await api.addBotQueue({
        text: result.generatedText,
        scheduledFor: new Date(Date.now() + 3600000 * 2).toISOString()
      });
      showToast('Tweet added to Bot schedule (in 2 hours)!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCopy = () => {
    if (result?.generatedText) {
      navigator.clipboard.writeText(result.generatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl glass-card border border-white/10 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">AI Content & Tweet Studio</h2>
            <p className="text-xs text-slate-400">
              Generate viral posts, product hooks, and thread starters tailored for X algorithms.
            </p>
          </div>
        </div>

        {/* Preset Topic Ideas */}
        <div>
          <span className="text-xs font-semibold text-slate-400 block mb-2 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            Instant Prompt Ideas:
          </span>
          <div className="flex flex-wrap gap-2">
            {samplePrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => {
                  setTopic(p);
                  handleGenerate(p);
                }}
                className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 transition text-left"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Input & Options */}
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              What topic or message would you like to tweet about?
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Announcing our new SaaS pricing update, or Tips for API rate limit optimization..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/60"
            />
          </div>

          {/* Tone Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Select Tone / Style:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'viral', label: 'Viral & Punchy', icon: Flame, color: 'text-rose-400' },
                { id: 'professional', label: 'Professional / Tech', icon: Briefcase, color: 'text-sky-400' },
                { id: 'casual', label: 'Casual & Relatable', icon: Smile, color: 'text-emerald-400' },
                { id: 'witty', label: 'Witty & Humorous', icon: Zap, color: 'text-amber-400' }
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTone(t.id)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition ${
                      tone === t.id
                        ? 'bg-sky-500/20 text-white border-sky-500/50 shadow-sm'
                        : 'bg-white/5 text-slate-400 hover:text-slate-200 border-white/5'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${t.color}`} />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => handleGenerate()}
            disabled={isGenerating || !topic.trim()}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:opacity-95 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 transition"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Crafting High-Signal Tweet...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Tweet with AI</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Result Preview Card */}
      {result && (
        <div className="p-6 rounded-2xl glass-card border border-sky-500/30 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Generated Tweet Preview
            </span>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span>{result.characterCount} / 280 chars</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 font-semibold uppercase">{result.tone}</span>
            </div>
          </div>

          {/* Tweet Text */}
          <div className="p-4 rounded-xl bg-black/60 border border-white/10 text-sm text-slate-100 font-normal leading-relaxed whitespace-pre-line">
            {result.generatedText}
          </div>

          {/* Hashtag suggestions */}
          {result.hashtags && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Hash className="w-3 h-3 text-sky-400" />
                Suggested tags:
              </span>
              {result.hashtags.map((tag, i) => (
                <span
                  key={i}
                  className="text-xs font-mono text-sky-400/90 bg-sky-500/10 px-2 py-0.5 rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-white/5">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleQueuePost}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Queue in Bot</span>
              </button>

              <button
                onClick={handlePublishNow}
                disabled={isPublishing}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-sky-500/20 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isPublishing ? 'Publishing...' : 'Publish Immediately to X'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
