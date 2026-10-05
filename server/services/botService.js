// In-memory bot state (clean, no dummy data)
export const botState = {
  isActive: true,
  lastPollTime: new Date().toISOString(),
  rules: [],
  queue: [],
  logs: []
};

// Add a log entry
export function addBotLog(type, title, details) {
  botState.logs.unshift({
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    type,
    title,
    details
  });
  if (botState.logs.length > 100) {
    botState.logs.pop();
  }
}

// AI Content Generation helper
export function generateAiTweetContent({ topic, tone = 'viral', format = 'single' }) {
  const templates = {
    viral: [
      `Most founders overcomplicate ${topic}.\n\nHere is the exact playbook to master it in 3 steps:\n\n1. Start with the core problem\n2. Automate the feedback loop\n3. Iterate in public\n\nWhat's your #1 rule? 👇`,
      `Stop handling ${topic} manually in 2026.\n\nThe game has shifted towards agentic workflows and real-time APIs.\n\nHere is how to 10x your velocity: 🧵⚡`,
      `Unpopular opinion about ${topic}:\n\nYou don't need a huge team. You need tight feedback loops, clear docs, and reliable automation. 💡`
    ],
    professional: [
      `We're excited to announce major improvements regarding ${topic}.\n\nKey highlights:\n• Enhanced API reliability\n• Sub-second synchronization\n• Enterprise-grade security\n\nRead our full breakdown: https://x.com 📈`,
      `Effective management of ${topic} requires balancing scalability with developer ergonomics. Today we are releasing our latest benchmarks and best practices. 🔬`
    ],
    casual: [
      `Late night thought on ${topic}... The simpler you keep the architecture, the fewer 2 AM alerts you get. Who else agrees? ☕😅`,
      `Spending the weekend optimizing ${topic}. There is something deeply satisfying about watching latency drop. 🚀`
    ],
    witty: [
      `They said "${topic}" would take 3 months.\n\nBuilt it in a weekend with modern APIs and excessive coffee intake. ☕🤖`,
      `99 problems and ${topic} was all 99 of them until we automated the pipeline. 😂🚀`
    ]
  };

  const pool = templates[tone] || templates.viral;
  const selected = pool[Math.floor(Math.random() * pool.length)];

  return {
    topic,
    tone,
    format,
    generatedText: selected,
    hashtags: [`#${topic.replace(/\s+/g, '')}`, '#XBot', '#BuildInPublic'],
    characterCount: selected.length
  };
}
