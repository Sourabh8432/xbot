import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  MessageSquare,
  Repeat2,
  Heart,
  Bookmark,
  Eye,
  Send,
  Pin,
  Image as ImageIcon,
  Share2,
  Code2,
  Sparkles,
  ExternalLink,
  Filter,
  Search,
  CheckCircle2
} from 'lucide-react';

export function TweetFeed() {
  const { account, tweets, loadingTweets, fetchTweets, showToast } = useApp();
  const [filter, setFilter] = useState('all'); // all, media, high_reach, pinned
  const [searchQuery, setSearchQuery] = useState('');
  const [newTweetText, setNewTweetText] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [selectedJsonTweet, setSelectedJsonTweet] = useState(null);

  // Post new tweet
  const handlePublish = async (e) => {
    e.preventDefault();
    if (!newTweetText.trim()) return;

    try {
      setIsPublishing(true);
      const res = await api.postTweet(newTweetText.trim());
      showToast(res.message || 'Tweet published successfully!', 'success');
      setNewTweetText('');
      await fetchTweets();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  // Format numbers (e.g. 148500 -> 148.5K)
  const formatNum = (n) => {
    if (!n) return '0';
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  };

  // Highlight hashtags, mentions, links in text
  const renderFormattedText = (text) => {
    if (!text) return null;
    const parts = text.split(/(\s+)/);
    return parts.map((part, i) => {
      if (part.startsWith('#')) {
        return (
          <span key={i} className="text-sky-400 font-semibold hover:underline cursor-pointer">
            {part}
          </span>
        );
      }
      if (part.startsWith('@')) {
        return (
          <span key={i} className="text-sky-400 font-medium hover:underline cursor-pointer">
            {part}
          </span>
        );
      }
      if (part.startsWith('http://') || part.startsWith('https://')) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400 underline underline-offset-2 break-all inline-flex items-center gap-0.5"
          >
            {part.length > 30 ? `${part.substring(0, 27)}...` : part}
            <ExternalLink className="w-2.5 h-2.5 inline" />
          </a>
        );
      }
      return part;
    });
  };

  // Filter tweets
  const filteredTweets = tweets.filter((t) => {
    if (filter === 'media' && (!t.media || t.media.length === 0)) return false;
    if (filter === 'pinned' && !t.is_pinned && t.id !== account?.pinned_tweet_id) return false;
    if (filter === 'high_reach' && (t.public_metrics?.impression_count || 0) < 50000) return false;
    if (searchQuery.trim()) {
      return t.text.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Quick Tweet Composer */}
      <div className="rounded-2xl glass-card border border-white/10 p-4 sm:p-5 shadow-lg">
        <form onSubmit={handlePublish} className="space-y-3">
          <div className="flex gap-3">
            <img
              src={account?.profile_image_url || 'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png'}
              alt={account?.name}
              className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-sky-500/30"
            />
            <div className="flex-1 space-y-2">
              <textarea
                value={newTweetText}
                onChange={(e) => setNewTweetText(e.target.value)}
                placeholder="What's happening? Compose a post to publish via X API..."
                maxLength={280}
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/50 resize-none"
              />

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className={`font-mono ${280 - newTweetText.length < 20 ? 'text-amber-400' : 'text-slate-500'}`}>
                    {280 - newTweetText.length} left
                  </span>
                  <span className="hidden sm:inline text-slate-600">•</span>
                  <span className="hidden sm:inline text-slate-500 text-[11px]">
                    POST /2/tweets endpoint
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={isPublishing || !newTweetText.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white font-semibold text-xs transition-all shadow-md shadow-sky-500/20 active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isPublishing ? 'Publishing...' : 'Publish Post'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2 rounded-xl glass-card border border-white/5">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Posts' },
            { id: 'media', label: 'With Media' },
            { id: 'high_reach', label: 'High Impressions (>50k)' },
            { id: 'pinned', label: 'Pinned' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                filter === item.id
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tweet content..."
            className="w-full sm:w-56 bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/50"
          />
        </div>
      </div>

      {/* Tweet Items List */}
      <div className="space-y-3">
        {filteredTweets.length === 0 ? (
          <div className="p-12 text-center rounded-2xl glass-card border border-white/10 space-y-2">
            <MessageSquare className="w-10 h-10 text-slate-600 mx-auto" />
            <div className="text-sm font-semibold text-slate-300">No tweets found for this filter</div>
            <p className="text-xs text-slate-500">
              Try switching filters or publish a new post using the composer above.
            </p>
          </div>
        ) : (
          filteredTweets.map((tweet) => {
            const isPinned = tweet.is_pinned || tweet.id === account?.pinned_tweet_id;
            const pm = tweet.public_metrics || {};
            const created = new Date(tweet.created_at);

            return (
              <div
                key={tweet.id}
                className="p-5 rounded-2xl glass-card border border-white/10 hover:border-white/20 transition-all shadow-md space-y-3"
              >
                {/* Pinned pill if applicable */}
                {isPinned && (
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-400 pb-1 border-b border-white/5">
                    <Pin className="w-3.5 h-3.5" />
                    <span>Pinned by @{account?.username}</span>
                  </div>
                )}

                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={account?.profile_image_url}
                      alt={account?.name}
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-sky-500/20"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs sm:text-sm text-white">
                          {account?.name}
                        </span>
                        <span className="text-xs text-slate-400">
                          @{account?.username}
                        </span>
                        <span className="text-slate-600 text-xs">•</span>
                        <span className="text-xs text-slate-400 font-mono">
                          {created.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Via {tweet.source || 'Twitter API v2'} • Tweet ID: {tweet.id}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedJsonTweet(tweet)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-sky-400 transition"
                    title="Inspect Raw API JSON for this tweet"
                  >
                    <Code2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Tweet Body */}
                <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-line font-normal">
                  {renderFormattedText(tweet.text)}
                </div>

                {/* Attached Media */}
                {tweet.media && tweet.media.length > 0 && (
                  <div className="rounded-xl overflow-hidden border border-white/10 max-h-80 bg-black/40">
                    <img
                      src={tweet.media[0].url}
                      alt={tweet.media[0].alt_text || "Attached Tweet Media"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Full Twitter v2 Public Metrics Row */}
                <div className="pt-2 border-t border-white/5 grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs">
                  {/* Impressions */}
                  <div className="flex items-center gap-1.5 text-slate-400" title="Impressions / Reach">
                    <Eye className="w-3.5 h-3.5 text-sky-400" />
                    <span className="font-semibold text-slate-200">{formatNum(pm.impression_count)}</span>
                    <span className="text-[10px] text-slate-500 hidden sm:inline">views</span>
                  </div>

                  {/* Likes */}
                  <div className="flex items-center gap-1.5 text-slate-400" title="Likes">
                    <Heart className="w-3.5 h-3.5 text-rose-400" />
                    <span className="font-semibold text-slate-200">{formatNum(pm.like_count)}</span>
                    <span className="text-[10px] text-slate-500 hidden sm:inline">likes</span>
                  </div>

                  {/* Retweets */}
                  <div className="flex items-center gap-1.5 text-slate-400" title="Retweets / Reposts">
                    <Repeat2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-semibold text-slate-200">{formatNum(pm.retweet_count)}</span>
                    <span className="text-[10px] text-slate-500 hidden sm:inline">RTs</span>
                  </div>

                  {/* Replies */}
                  <div className="flex items-center gap-1.5 text-slate-400" title="Replies">
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="font-semibold text-slate-200">{formatNum(pm.reply_count)}</span>
                    <span className="text-[10px] text-slate-500 hidden sm:inline">replies</span>
                  </div>

                  {/* Bookmarks */}
                  <div className="flex items-center gap-1.5 text-slate-400" title="Bookmarks">
                    <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-semibold text-slate-200">{formatNum(pm.bookmark_count)}</span>
                    <span className="text-[10px] text-slate-500 hidden sm:inline">saves</span>
                  </div>

                  {/* Quotes */}
                  <div className="flex items-center gap-1.5 text-slate-400" title="Quote Tweets">
                    <Share2 className="w-3.5 h-3.5 text-purple-400" />
                    <span className="font-semibold text-slate-200">{formatNum(pm.quote_count)}</span>
                    <span className="text-[10px] text-slate-500 hidden sm:inline">quotes</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Tweet Raw JSON Modal */}
      {selectedJsonTweet && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#12161f] border border-white/15 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-sky-400" />
                <span className="font-bold text-sm text-white">
                  Twitter API v2 Tweet Object (#{selectedJsonTweet.id})
                </span>
              </div>
              <button
                onClick={() => setSelectedJsonTweet(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-white/5"
              >
                Close
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 font-mono text-xs text-sky-300 bg-black/60">
              <pre>{JSON.stringify(selectedJsonTweet, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
