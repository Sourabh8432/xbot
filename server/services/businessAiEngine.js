import { GoogleGenAI } from '@google/genai';
import { db } from './db.js';

// Curated Deep Business Intelligence Knowledge Bank (Real startup case studies, offer teardowns & growth playbooks)
export const BUSINESS_CASE_STUDIES = [
  {
    company: 'Airbnb',
    founder: 'Brian Chesky & Joe Gebbia',
    metric: '$100B+ Valuation',
    category: 'Startup Breakdown',
    hook: 'In 2009, Airbnb was making just $200/week and facing bankruptcy.',
    story: 'Brian Chesky realized listings had terrible photos taken on flip phones.\n\nThey flew to New York, rented a $5,000 camera, and knocked on hosts’ doors to take HD photos themselves.\n\nRevenue doubled in 7 days.\n\nLesson: Do things that don\'t scale before you build things that do.',
    visualData: {
      tag: 'GROWTH TEARDOWN',
      title: 'How Airbnb Escaped Bankruptcy',
      stat: '2x Revenue in 7 Days',
      highlight: 'Manual NYC Photo Hack (2009)',
      keyLesson: 'Do unscalable things first to understand what actually moves metrics.'
    }
  },
  {
    company: 'Stripe',
    founder: 'Patrick & John Collison',
    metric: '$70B+ Valuation',
    category: 'Startup Breakdown',
    hook: 'In 2011, accepting payments online took 9 forms, 3 weeks, and a bank approval.',
    story: 'Stripe condensed all of it into 7 lines of JavaScript.\n\nInstead of saying "Check out our beta", Patrick Collison would grab the founder’s laptop and say:\n\n"Give me your computer, I’ll install it right now." (The Collison Installation).\n\nFriction is the #1 killer of SaaS conversion.',
    visualData: {
      tag: 'PRODUCT-LED GROWTH',
      title: 'Stripe: The 7-Line Code Disruption',
      stat: '3 Weeks → 7 Lines of Code',
      highlight: 'The "Collison Installation" Strategy',
      keyLesson: 'Remove every millisecond of friction between sign-up and value.'
    }
  },
  {
    company: 'Grand Slam Offer',
    founder: 'Alex Hormozi Framework',
    metric: '$100M Leads Framework',
    category: 'Offer Breakdown',
    hook: 'Why 90% of business offers get ignored (and how to fix yours in 5 minutes):',
    story: 'People don\'t buy what you sell. They buy certainty of outcome.\n\nThe 4 pillars of an irresistible offer:\n1. Dream Outcome (Clear destination)\n2. Perceived Likelihood of Success (Proof)\n3. Time Delay (Get results faster)\n4. Effort & Sacrifice (Do the heavy lifting for them)\n\nMake your guarantee so strong they feel silly saying no.',
    visualData: {
      tag: 'OFFER BLUEPRINT',
      title: 'The Irresistible Offer Equation',
      stat: 'Value = (Dream × Likelihood) ÷ (Time × Effort)',
      highlight: 'Alex Hormozi Value Formula',
      keyLesson: 'Lower effort & time delay while multiplying certainty to charge 5x more.'
    }
  },
  {
    company: 'Zerodha',
    founder: 'Nithin & Nikhil Kamath',
    metric: '$3B+ Bootstrapped Profit Powerhouse',
    category: 'Startup Breakdown',
    hook: 'Zerodha built a $3B business with ₹0 marketing budget.',
    story: 'Every broker was charging 0.5% commission on stock volume.\n\nZerodha launched a flat ₹20 fee per trade regardless of size. Big traders flocked overnight.\n\nInstead of ads, they built Varsity (free financial education) and let word-of-mouth do the rest.\n\nTransparent pricing is the greatest moat.',
    visualData: {
      tag: 'BOOTSTRAPPED SCALE',
      title: 'Zerodha: $0 Ad Spend to $3B Market Leader',
      stat: '₹0 Spent on Paid Ads',
      highlight: 'Flat ₹20 Pricing Disruption',
      keyLesson: 'Radical fee transparency converts customers into your best sales reps.'
    }
  },
  {
    company: 'Gymshark',
    founder: 'Ben Francis',
    metric: '$1.4B+ D2C Giant',
    category: 'Startup Breakdown',
    hook: 'Ben Francis was sewing gym vests in his parents’ garage and delivering pizzas at night.',
    story: 'He sent free gear to fitness YouTubers with zero strings attached — just asking: "If you like it, wear it."\n\nWhen they booked their first fitness expo booth in Birmingham, the crowd swarmed them so hard the entire hall halted.\n\nCommunity > Paid Facebook ads every single day.',
    visualData: {
      tag: 'D2C PLAYBOOK',
      title: 'Gymshark: Pizza Delivery to $1.4B Empire',
      stat: '$0 to $1.4B via Organic Influencers',
      highlight: 'Zero-strings-attached Gifting Hack',
      keyLesson: 'Build genuine creator relationships before you pitch transactional deals.'
    }
  },
  {
    company: 'Figma',
    founder: 'Dylan Field',
    metric: '$20B Product Standard',
    category: 'Startup Breakdown',
    hook: 'In 2016, design software was bulky, desktop-only, and required emailing .PSD files back and forth.',
    story: 'Figma put the entire canvas in a browser URL.\n\nDesigners could drop a link into Slack, and developers, product managers, and clients could collaborate live with multiplayer cursors.\n\nThey didn\'t just build a better tool; they turned design into a multiplayer social network.',
    visualData: {
      tag: 'DISTRIBUTION MOAT',
      title: 'Figma: From Desktop Silos to Multiplayer Web',
      stat: 'Multiplayer Browser Canvas',
      highlight: 'The 1-Click URL Collaboration Loop',
      keyLesson: 'When your product naturally spreads during normal usage, distribution is free.'
    }
  },
  {
    company: 'Apple',
    founder: 'Steve Jobs',
    metric: 'The iPod Launch Strategy',
    category: 'Offer Breakdown',
    hook: 'In 2001, every MP3 player was marketed as "5GB Hard Drive Storage".',
    story: 'Steve Jobs held up the iPod and said 5 words:\n\n"1,000 songs in your pocket."\n\nCustomers don\'t care about your technical specs, your gigabytes, or your database stack.\n\nThey care about what your product makes possible in their daily life.\n\nSell the transformation, not the ingredients.',
    visualData: {
      tag: 'MARKETING PSYCHOLOGY',
      title: 'Apple iPod: 5GB vs 1,000 Songs in Pocket',
      stat: '5 Words That Changed Consumer Tech',
      highlight: 'Feature Selling vs Transformation Selling',
      keyLesson: 'Translate technical features into immediate emotional imagery.'
    }
  },
  {
    company: 'Notion',
    founder: 'Ivan Zhao',
    metric: '$10B Productivity Leader',
    category: 'Startup Breakdown',
    hook: 'In 2015, Notion almost ran out of money and was 1 week away from shutting down.',
    story: 'Ivan Zhao fired their team, moved to Kyoto with his co-founder, and rebuilt the app from scratch around one philosophy:\n\nLEGO blocks for workspace.\n\nThey allowed users to build and sell their own templates. A secondary economy of Notion creators formed, marketing the app for free.\n\nEmpower your users to make money with your tool, and they will never leave.',
    visualData: {
      tag: 'COMMUNITY FLYWHEEL',
      title: 'Notion: Near Death to $10B Creator Flywheel',
      stat: '1 Week of Runway Remaining (2015)',
      highlight: 'The Template Marketplace Ecosystem',
      keyLesson: 'Turn your software into a platform where power users can build careers.'
    }
  },
  {
    company: 'Alex Hormozi Pricing',
    founder: 'Acquisition.com',
    metric: 'Grand Slam Pricing Rules',
    category: 'Offer Breakdown',
    hook: 'Why doubling your prices often makes your product sell FASTER:',
    story: 'When you underprice, three things happen:\n1. Clients assume low quality\n2. They don\'t respect the advice\n3. You can\'t afford world-class delivery\n\nWhen you 2x the price and attach an unconditional, bold guarantee, perceived value spikes.\n\nPrice is an emotional anchor. Don\'t compete to the bottom.',
    visualData: {
      tag: 'PRICING PSYCHOLOGY',
      title: 'The Premium Pricing Paradox',
      stat: 'Higher Price = Higher Commitment & Results',
      highlight: 'Price Anchoring & Guarantee Stacking',
      keyLesson: 'Higher prices fund better delivery, which creates happier case studies.'
    }
  },
  {
    company: 'Duolingo',
    founder: 'Luis von Ahn',
    metric: 'Gamification Engine',
    category: 'Startup Breakdown',
    hook: 'Duolingo doesn\'t compete with Rosetta Stone. It competes with TikTok and Instagram.',
    story: 'Luis von Ahn realized language learning has a 90% drop-off rate.\n\nSo they turned learning into a mobile game: Streaks, leaderboards, unhinged mascot notifications, and loss aversion (you lose your streak if you miss a day).\n\nRetention is the mother of all growth loops.',
    visualData: {
      tag: 'RETENTION ARCHITECTURE',
      title: 'Duolingo: The Unstoppable Streak Loop',
      stat: 'Top App Store Grossing Edu App',
      highlight: 'Loss Aversion & Mascot Gamification',
      keyLesson: 'Compete for consumer attention using game mechanics, not dry lectures.'
    }
  }
];

// Human-Style Business Viral Prompts & Templates for Dynamic Variation
const HOOK_ANGLES = [
  'Breakdown of a multi-million dollar startup',
  'The psychological offer tweak that 10x\'d revenue',
  'What separates top 1% founders from the rest',
  'The unsexy marketing strategy that built an empire',
  'Why classic business advice fails early-stage startups'
];

/**
 * Generate a top-tier business tweet using Gemini 3.8 Flash (if API key available)
 * or Deep Business Intelligence Engine (guaranteed fallback).
 */
export async function generateBusinessTweet({
  category = 'all', // all, startup_breakdown, offer_blueprint, growth_hack, contrarian
  customTopic = null,
  geminiApiKey = null
} = {}) {
  const apiKey = geminiApiKey || db.getSettings().geminiApiKey || process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are a world-class startup founder, business investor, and high-impact X (Twitter) ghostwriter.
Your specialty: Writing viral, human, high-retention business tweets and breakdowns about:
- Startups that scaled from $0 to $100M+ through clever hacks or product moats (Airbnb, Stripe, Zerodha, Figma, Gymshark, etc.)
- Irresistible Offers, Grand Slam pricing, and psychology (Alex Hormozi style, risk reversal, guarantees, pricing power)
- Actionable frameworks founders can use today.

CRITICAL TONE & STYLE RULES (NO AI-SLOP):
- NEVER use generic AI buzzwords: "In today's fast-paced world", "Game changer", "Unleash", "Dive into", "Revolutionizing", "Tapestry".
- Write like a real founder talking over coffee: Punchy, authentic, whitespace-formatted, concise sentences.
- Hook on line 1 that stops the scroll.
- Concrete numbers, real founder names, specific dollar amounts or metrics.
- Keep the tweet strictly under 270 characters (single punchy tweet) OR a structured mini-breakdown under 280 characters.
- Add NO MORE than 1 natural hashtag (or zero hashtags).
- Return a STRICT JSON object in this exact format:
{
  "tweetText": "Full text of the tweet with clean line breaks",
  "category": "Startup Breakdown / Offer Blueprint / Growth Playbook",
  "companyOrTopic": "Name of company or concept",
  "visualCard": {
    "tag": "GROWTH TEARDOWN / OFFER BLUEPRINT / UNIT ECONOMICS",
    "title": "Short Catchy Card Title",
    "stat": "Key Metric or Stat (e.g. $0 to $100M in 3 Years)",
    "highlight": "The Core Strategy or Move",
    "keyLesson": "1-sentence actionable takeaway for founders"
  }
}

${customTopic ? `Focus specifically on this topic: ${customTopic}` : `Pick a fascinating real startup breakdown or irresistible offer case study.`}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const parsed = JSON.parse(response.text.trim());
      if (parsed.tweetText && parsed.visualCard) {
        return {
          source: 'gemini-3.8-flash',
          tweetText: parsed.tweetText.trim(),
          category: parsed.category || 'Business Breakdown',
          companyOrTopic: parsed.companyOrTopic || 'Startup Strategy',
          visualCard: parsed.visualCard
        };
      }
    } catch (err) {
      console.warn('Gemini API call failed, seamlessly falling back to curated intelligence bank:', err.message);
    }
  }

  // Curated Fallback with Dynamic Human Variation
  const pool = BUSINESS_CASE_STUDIES;
  const picked = pool[Math.floor(Math.random() * pool.length)];

  // Create human-like variation on hook & structure
  const formattedText = `${picked.hook}\n\n${picked.story}\n\nBookmark this for your next business review. 📌`;

  return {
    source: 'curated_intelligence_bank',
    tweetText: formattedText,
    category: picked.category,
    companyOrTopic: picked.company,
    visualCard: picked.visualData
  };
}
