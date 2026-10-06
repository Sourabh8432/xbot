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
  Briefcase,
  TrendingUp,
  Flame,
  Image as ImageIcon,
  Eye,
  Download,
  Lightbulb
} from 'lucide-react';
import { getCardImageSrc } from './BotAutomation';

export function AiTweetGenerator() {

  const { showToast, fetchTweets } = useApp();

  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState('business_startups');
  const [generateImage, setGenerateImage] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isQueueing, setIsQueueing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [previewModal, setPreviewModal] = useState(false);

  const sampleIdeas = [
    { label: 'Airbnb Photo Hack', query: 'How Airbnb used manual photography in NYC to escape bankruptcy in 2009' },
    { label: 'Alex Hormozi Offer', query: 'Alex Hormozi 4 pillars of an irresistible Grand Slam offer and risk reversal' },
    { label: 'Stripe 7-Line Code', query: 'How Stripe simplified 3-week payment integration into 7 lines of code' },
    { label: 'Zerodha ₹0 Marketing', query: 'How Zerodha reached $3B valuation with zero paid ad budget' },
    { label: 'Gymshark D2C Playbook', query: 'Ben Francis sewing vests to $1.4B empire via organic influencer gifting' },
    { label: 'Apple iPod 5 Words', query: 'Steve Jobs 1,000 songs in your pocket transformation selling vs 5GB storage' }
  ];

  const handleGenerate = async (customTopic = topic) => {
    const finalTopic = customTopic || topic;
    try {
      setIsGenerating(true);
      const res = await api.generateAiTweet({
        topic: finalTopic.trim() || undefined,
        category,
        generateImage
      });

      if (res.success) {
        setResult(res.result);
        showToast('High-signal business tweet & infographic ready!', 'success');
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
      showToast('Tweet successfully published to X!', 'success');
      if (fetchTweets) await fetchTweets();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleQueuePost = async () => {
    if (!result?.generatedText) return;

    try {
      setIsQueueing(true);
      await api.addBotQueue({
        text: result.generatedText,
        topic: result.topic || 'Business Breakdown',
        category: result.category || 'Startup Strategy',
        media: result.media || null,
        scheduledFor: new Date(Date.now() + 3600000 * 3).toISOString()
      });
      showToast('Post queued in Autonomous Bot schedule (in 3 hours)!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsQueueing(false);
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
      {/* Studio Header Card */}
      <div className="p-6 rounded-3xl glass-card border border-white/10 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Viral Business & Startup Studio</h2>
            <p className="text-xs text-slate-400">
              Generates hook-driven founder case studies, offer teardowns, and matching visual infographics.
            </p>
          </div>
        </div>

        {/* 1-Click Inspiration Chips */}
        <div className="space-y-2 pt-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            Viral Startup & Offer Case Studies:
          </span>
          <div className="flex flex-wrap gap-2">
            {sampleIdeas.map((idea, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setTopic(idea.query);
                  handleGenerate(idea.query);
                }}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-sky-500/20 border border-white/10 hover:border-sky-500/30 text-slate-300 hover:text-sky-300 text-xs font-medium transition"
              >
                {idea.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input & Form */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Enter custom business case study, company, or offer idea (or leave blank to auto-pick)..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 text-xs"
            />
            <button
              onClick={() => handleGenerate()}
              disabled={isGenerating}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white font-bold text-xs shadow-lg shadow-purple-500/20 transition active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Generating...' : 'Generate Breakdown'}</span>
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={generateImage}
                onChange={(e) => setGenerateImage(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 bg-slate-900 border-white/20"
              />
              <span className="text-slate-300">Auto-create matching Visual Infographic Card</span>
            </label>
          </div>
        </div>
      </div>

      {/* Output Results Preview */}
      {result && (
        <div className="p-6 rounded-3xl glass-card border border-white/10 shadow-2xl space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 font-bold text-xs border border-purple-500/30">
                {result.category || 'Startup Breakdown'}
              </span>
              <span className="text-xs text-slate-400 font-bold">{result.topic}</span>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Engine: {result.source || 'Curated Bank'}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Tweet Copy & Actions */}
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tweet Content (X Optimized)</span>
                <p className="text-xs text-slate-100 whitespace-pre-wrap leading-relaxed font-sans">
                  {result.generatedText}
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-white/5 font-mono">
                  <span>Characters: {result.characterCount} / 280</span>
                  <span className="text-emerald-400">✓ Safe Length</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={handlePublishNow}
                  disabled={isPublishing}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:opacity-90 text-white font-bold text-xs shadow-md transition"
                >
                  <Send className={`w-3.5 h-3.5 ${isPublishing ? 'animate-spin' : ''}`} />
                  <span>{isPublishing ? 'Publishing...' : 'Publish to X Live'}</span>
                </button>

                <button
                  onClick={handleQueuePost}
                  disabled={isQueueing}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 font-bold text-xs transition"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{isQueueing ? 'Queueing...' : 'Add to Bot Queue'}</span>
                </button>

                <button
                  onClick={handleCopy}
                  className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs transition flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Right: Infographic Visual Preview */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                Attached Visual Infographic (High-Resolution Card)
              </span>

              {getCardImageSrc(result) ? (
                <div className="rounded-2xl overflow-hidden border border-white/10 bg-slate-950 shadow-xl group relative">
                  <img
                    src={getCardImageSrc(result)}
                    alt="Visual Infographic Card"
                    className="w-full h-auto object-cover cursor-pointer group-hover:scale-102 transition"
                    onClick={() => setPreviewModal(true)}
                  />
                  <div className="p-3 bg-slate-900/90 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">1200 x 675 Crisp Graphic</span>
                    <a
                      href={getCardImageSrc(result)}
                      download={result.media?.filename || 'infographic-card.png'}
                      className="text-sky-400 hover:underline flex items-center gap-1 text-[11px] font-semibold"
                    >
                      <Download className="w-3 h-3" /> Download Card
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-white/5 border border-white/5 text-center text-slate-500 text-xs">
                  No visual card generated for this tweet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen modal for preview */}
      {previewModal && getCardImageSrc(result) && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPreviewModal(false)}
        >
          <div className="max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
            <img src={getCardImageSrc(result)} alt="Expanded preview" className="w-full h-auto" />
          </div>
        </div>
      )}
    </div>
  );

}
