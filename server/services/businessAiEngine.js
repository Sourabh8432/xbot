import { GoogleGenAI } from '@google/genai';
import { db } from './db.js';

// Curated Deep Business Intelligence Knowledge Bank (Real audited viral startup case studies & offer breakdowns)
export const BUSINESS_CASE_STUDIES = [
  {
    company: 'Airbnb',
    founder: 'Brian Chesky & Joe Gebbia',
    metric: '2x Revenue in 7 Days',
    category: 'Startup Breakdown',
    hook: 'In 2009, Airbnb was making $200/week and 3 weeks away from dying.',
    story: 'Brian Chesky noticed listings had awful photos taken on flip phones.\n\nSo they flew to New York, rented a camera, and knocked on hosts’ doors to shoot professional photos themselves for free.\n\nWithin 7 days, weekly revenue doubled to $400, then $800, then $2,000.\n\nPaul Graham told them: "Do things that don’t scale until you understand what moves the needle."',
    closer: 'Friction kills conversions. Solve the unscalable part first.',
    visualData: {
      tag: 'GROWTH BLUEPRINT',
      title: 'Airbnb: The $5k Camera That Saved Them',
      stat: '2x Revenue in 7 Days',
      highlight: 'Manual NYC Photography Hack',
      keyLesson: 'Do unscalable things first to understand what actually moves metrics.'
    }
  },
  {
    company: 'Stripe',
    founder: 'Patrick & John Collison',
    metric: '3 Weeks → 7 Lines of Code',
    category: 'Product-Led Growth',
    hook: 'In 2011, accepting credit cards online took 9 forms, 3 weeks, and bank approval.',
    story: 'Stripe replaced the entire nightmare with 7 lines of JavaScript.\n\nWhen founders asked: "Can I try the beta?", Patrick Collison didn’t send an email link.\n\nHe opened their laptop and said:\n"Give me your computer. I’ll paste the code right now." (The Collison Installation).\n\nIf you want early traction, eliminate every second between signup and value.',
    closer: 'Speed to first value is your #1 growth lever.',
    visualData: {
      tag: 'PRODUCT-LED GROWTH',
      title: 'Stripe: The 7-Line Code Disruption',
      stat: '3 Weeks → 7 Lines of Code',
      highlight: 'The Hands-On "Collison Installation"',
      keyLesson: 'Remove every millisecond of friction between sign-up and value.'
    }
  },
  {
    company: 'Grand Slam Offer',
    founder: 'Alex Hormozi Framework',
    metric: 'Value = (Dream × Likelihood) ÷ (Time × Effort)',
    category: 'Offer Psychology',
    hook: 'If your sales calls are struggling, your product isn\'t the problem. Your offer is lazy.',
    story: 'Weak offers sell ingredients:\n"We provide 4 coaching calls and a PDF."\n\nGrand Slam offers sell guaranteed destination:\n"We add $30k in qualified pipeline in 60 days, or you don’t pay a dollar."\n\nPeople don’t pay for hours or features. They pay for certainty of outcome and risk removal.',
    closer: 'Make your guarantee so bold they feel stupid saying no.',
    visualData: {
      tag: 'OFFER BLUEPRINT',
      title: 'The Irresistible Offer Equation',
      stat: 'Value = (Dream × Certainty) ÷ (Time × Effort)',
      highlight: 'Alex Hormozi Value Formula',
      keyLesson: 'Minimize effort & time delay while multiplying certainty to charge premium pricing.'
    }
  },
  {
    company: 'Zerodha',
    founder: 'Nithin & Nikhil Kamath',
    metric: '₹0 Ad Spend → $3B Valuation',
    category: 'Bootstrapped Scale',
    hook: 'Zerodha built a $3B trading giant with ₹0 spent on paid advertising.',
    story: 'Every traditional broker was charging 0.5% commission on trade volume.\n\nZerodha launched a flat ₹20 fee per trade, no matter the size.\n\nBig traders saved lakhs of rupees on day 1. Instead of billboards, Zerodha built Varsity (free financial modules).\n\nTransparent pricing converted every active user into an organic sales rep.',
    closer: 'Fair pricing and free education is an unbeatable moat.',
    visualData: {
      tag: 'BOOTSTRAPPED SCALE',
      title: 'Zerodha: $0 Marketing to $3B Leader',
      stat: '₹0 Spent on Paid Ads',
      highlight: 'Flat ₹20 Pricing Moat',
      keyLesson: 'Radical fee transparency turns early customers into your best marketing army.'
    }
  },
  {
    company: 'Gymshark',
    founder: 'Ben Francis',
    metric: '$0 to $1.4B via Community',
    category: 'D2C Playbook',
    hook: 'Ben Francis was sewing gym vests by hand in his garage and delivering pizzas at night.',
    story: 'Instead of running Facebook ads, he tracked down 10 rising fitness YouTubers.\n\nHe mailed them free tracksuits with a simple note:\n"No contract. If you like the gear, wear it."\n\nWhen Gymshark booked their first expo booth in Birmingham, the crowd mobbed them so hard the fire department halted the event.',
    closer: 'Community and genuine relationships beat transactional ad spend every time.',
    visualData: {
      tag: 'D2C PLAYBOOK',
      title: 'Gymshark: Pizza Delivery to $1.4B Empire',
      stat: '$0 to $1.4B via Organic Creators',
      highlight: 'Zero-Strings-Attached Gifting',
      keyLesson: 'Build genuine creator relationships before you pitch commercial sponsorships.'
    }
  },
  {
    company: 'Apple',
    founder: 'Steve Jobs',
    metric: '1,000 Songs in Your Pocket',
    category: 'Positioning & Marketing',
    hook: 'In 2001, every MP3 player on the market was advertised as "5GB Hard Drive Storage".',
    story: 'Steve Jobs walked onto the stage, held up the iPod, and said 5 words:\n\n"1,000 songs in your pocket."\n\nNobody buys gigabytes, tech specs, or database queries.\n\nThey buy what the product allows them to feel and do in real life.',
    closer: 'Sell the transformation, never the ingredients.',
    visualData: {
      tag: 'POSITIONING',
      title: 'Apple iPod: 5GB vs 1,000 Songs in Pocket',
      stat: '5 Words That Defined Modern Tech',
      highlight: 'Transformation vs Feature Selling',
      keyLesson: 'Translate raw technical specs into instant emotional mental imagery.'
    }
  },
  {
    company: 'Figma',
    founder: 'Dylan Field',
    metric: 'Multiplayer Web Canvas',
    category: 'Distribution Moat',
    hook: 'In 2016, design software was bulky, desktop-only, and required emailing .sketch files.',
    story: 'Figma put the design canvas inside a browser URL.\n\nA designer could drop a link into Slack, and product managers, engineers, and clients could view and collaborate with live multiplayer cursors.\n\nThey didn’t just build a design tool. They turned design into a multiplayer collaboration network.',
    closer: 'When your product naturally spreads during normal usage, distribution is free.',
    visualData: {
      tag: 'DISTRIBUTION MOAT',
      title: 'Figma: From Desktop Silos to Browser Canvas',
      stat: 'Multiplayer URL Collaboration',
      highlight: 'Built-in Collaborative Growth Loop',
      keyLesson: 'When using your product requires inviting others, customer acquisition is organic.'
    }
  },
  {
    company: 'Alex Hormozi Pricing',
    founder: 'Acquisition.com',
    metric: 'The Premium Pricing Paradox',
    category: 'Offer Psychology',
    hook: 'The biggest mistake early founders make is underpricing their core offer.',
    story: 'When you charge $50/mo, three things happen:\n1. Buyers assume low quality\n2. They don\'t respect the advice\n3. You can\'t afford world-class delivery\n\nWhen you double your price and attach a bulletproof guarantee, perceived value spikes.\n\nPrice is an emotional anchor. Don\'t compete in a race to the bottom.',
    closer: 'Higher prices fund better delivery, which creates happier clients.',
    visualData: {
      tag: 'PRICING PSYCHOLOGY',
      title: 'The Premium Pricing Paradox',
      stat: 'Higher Price = Higher Client Results',
      highlight: 'Price Anchoring & Bold Guarantees',
      keyLesson: 'Premium pricing funds superior delivery, which generates unbeatable case studies.'
    }
  },
  {
    company: 'Notion',
    founder: 'Ivan Zhao',
    metric: '1 Week of Runway (2015) → $10B',
    category: 'Startup Breakdown',
    hook: 'In 2015, Notion had 1 week of cash left and was about to go under.',
    story: 'Ivan Zhao fired the team, sublet their San Francisco office, and moved to Kyoto with his co-founder.\n\nThey rebuilt the app around one concept: LEGO blocks for knowledge workers.\n\nThey let users build and sell their own templates, creating an entire creator economy that promoted Notion for free.',
    closer: 'Turn your software into a platform where other people can build businesses.',
    visualData: {
      tag: 'COMMUNITY FLYWHEEL',
      title: 'Notion: Near Death to $10B Creator Engine',
      stat: '1 Week of Runway Remaining (2015)',
      highlight: 'The Template Creator Economy',
      keyLesson: 'Turn your software into a platform where power users can build careers.'
    }
  },
  {
    company: 'Basecamp',
    founder: 'Jason Fried & DHH',
    metric: '20+ Years of High Margin Profit',
    category: 'Bootstrapped Scale',
    hook: 'Basecamp raised $0 in venture capital and has been wildly profitable for 20 straight years.',
    story: 'While competitors raised $200M rounds and hired 800 people, Basecamp kept their team under 60.\n\nThey charged a flat $99/month regardless of how many users a company added.\n\nNo per-seat tax. No enterprise sales reps. Just software that works cleanly and pays the bills.',
    closer: 'Growth for the sake of growth is the ideology of a cancer cell.',
    visualData: {
      tag: 'BOOTSTRAPPED SCALE',
      title: 'Basecamp: The Anti-VC Profit Machine',
      stat: '20+ Years of Continuous Profits',
      highlight: 'Flat Pricing & Tiny Team Discipline',
      keyLesson: 'A profitable small business beats an unprofitable unicorn every single day.'
    }
  },
  {
    company: 'Loom',
    founder: 'Joe Thomas',
    metric: '1 Video Link vs 10 Cold Emails',
    category: 'Product-Led Growth',
    hook: 'In 2016, Loom had 2 weeks of runway and were rejected by every single VC.',
    story: 'Out of desperation, they posted a 1-click Chrome extension on Product Hunt that let people record their screen instantly.\n\nEvery time someone sent a Loom video, the recipient had to visit Loom to watch it.\n\nThe product carried its own marketing with every video sent.\nAtlan purchased it for $975M.',
    closer: 'Viral loops work best when sending the output is the core utility.',
    visualData: {
      tag: 'VIRAL PRODUCT LOOPS',
      title: 'Loom: 2 Weeks Runway to $975M Exit',
      stat: '975M Acquisition by Atlan',
      highlight: 'The Output-Carried Referral Loop',
      keyLesson: 'Build your product so that normal usage exposes the tool to new prospects.'
    }
  },
  {
    company: 'Craigslist',
    founder: 'Craig Newmark',
    metric: '$600M+ Profit with 50 Employees',
    category: 'Business Moats',
    hook: 'Craigslist hasn’t updated its website design since 1995.',
    story: 'It runs on plain HTML, has zero algorithmic feeds, and spends $0 on marketing.\n\nYet it generates over $600M in annual profit with around 50 employees.\n\nCraig Newmark understood network density: People don’t want a fancy UI. They want buyers and sellers in their city.',
    closer: 'Utility and liquidity beat aesthetics every single time.',
    visualData: {
      tag: 'NETWORK EFFECTS',
      title: 'Craigslist: 1995 HTML to $600M Profit',
      stat: '$12M+ Revenue per Employee',
      highlight: 'Pure Local Network Density',
      keyLesson: 'Liquidity and marketplace trust matter 100x more than sleek redesigns.'
    }
  }
];

/**
 * Generate a high-retention, deeply humanized business tweet
 * Using Gemini 3.8 Flash (if key present) or Curated Deep Knowledge Bank
 */
export async function generateBusinessTweet({
  category = 'all',
  customTopic = null,
  geminiApiKey = null
} = {}) {
  const apiKey = geminiApiKey || db.getSettings().geminiApiKey || process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are a real startup founder, seed investor, and high-signal X (Twitter) writer.
Write an authentic, humanized, viral breakdown tweet about business, startups, or offer psychology.

AUDITED 2026 X WRITING RULES (STRICT):
1. ZERO AI CLICHÉS: Never use "dive in", "unleash", "game-changer", "tapestry", "fast-paced world", "buckle up", "masterclass", "revolutionizing".
2. HOOK: Line 1 must be an authentic contrast, counter-intuitive insight, or surprising fact with specific numbers.
3. STANZA FLOW: 1-2 sentence paragraphs separated by clean line breaks. Very easy to read on mobile.
4. SPECIFICITY: Include real years (e.g. 2011), founder names (Patrick Collison, Brian Chesky, Alex Hormozi), real dollar numbers, or code lines.
5. CLOSER: End with a sharp 1-sentence truth or actionable founder takeaway. DO NOT repeat "Bookmark this" or generic CTA.
6. LENGTH: Under 270 characters (single tweet) or concise punchy breakdown under 280 characters. Max 0 or 1 natural hashtag.
7. Return STRICT JSON:
{
  "tweetText": "Full text of the tweet with clean line breaks",
  "category": "Startup Breakdown / Offer Psychology / Growth Blueprint",
  "companyOrTopic": "Name of company or subject",
  "visualCard": {
    "tag": "GROWTH BLUEPRINT / OFFER TEARDOWN / UNIT ECONOMICS",
    "title": "Minimal Catchy Title (3-6 words)",
    "stat": "Key Metric (e.g. 3 Weeks to 7 Lines of Code)",
    "highlight": "The Unconventional Move",
    "keyLesson": "1-sentence core lesson for founders"
  }
}

${customTopic ? `Focus specifically on: ${customTopic}` : `Pick a fascinating real startup growth move or irresistible offer teardown.`}`;

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
          category: parsed.category || 'Startup Breakdown',
          companyOrTopic: parsed.companyOrTopic || 'Business Strategy',
          visualCard: parsed.visualCard
        };
      }
    } catch (err) {
      console.warn('Gemini call fell back to curated knowledge bank:', err.message);
    }
  }

  // Curated Fallback with Dynamic Natural Variation
  const pool = BUSINESS_CASE_STUDIES;
  const picked = pool[Math.floor(Math.random() * pool.length)];

  // Natural humanized formatting
  const formattedText = `${picked.hook}\n\n${picked.story}\n\n${picked.closer}`;

  return {
    source: 'curated_intelligence_bank',
    tweetText: formattedText,
    category: picked.category,
    companyOrTopic: picked.company,
    visualCard: picked.visualData
  };
}
