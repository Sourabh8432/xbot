import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resvg } from '@resvg/resvg-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MEDIA_DIR = path.join(__dirname, '../data/media');

if (!fs.existsSync(MEDIA_DIR)) {
  fs.mkdirSync(MEDIA_DIR, { recursive: true });
}

/**
 * Escape text for safe XML/SVG insertion
 */
function escapeXml(unsafe = '') {
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generate a modern, dark-mode sleek Business Breakdown Infographic Card (SVG)
 */
export function generateCardSvg({
  tag = 'BUSINESS CASE STUDY',
  title = 'How They Built a $100M Empire',
  stat = '$0 to $100M in 3 Years',
  highlight = 'Zero-Cost Organic Community Engine',
  keyLesson = 'Remove friction and prioritize customer retention above all else.'
} = {}) {
  const safeTag = escapeXml(tag.toUpperCase());
  const safeTitle = escapeXml(title);
  const safeStat = escapeXml(stat);
  const safeHighlight = escapeXml(highlight);
  const safeLesson = escapeXml(keyLesson);

  return `
<svg width="1200" height="675" viewBox="0 0 1200 675" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="675" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#090D16" />
      <stop offset="50%" stop-color="#0F172A" />
      <stop offset="100%" stop-color="#030712" />
    </linearGradient>

    <!-- Card Accent Glow -->
    <radialGradient id="glow" cx="600" cy="100" r="500" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#38BDF8" stop-opacity="0.18" />
      <stop offset="100%" stop-color="#6366F1" stop-opacity="0" />
    </radialGradient>

    <!-- Stat Pill Gradient -->
    <linearGradient id="pillGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0284C7" />
      <stop offset="100%" stop-color="#4F46E5" />
    </linearGradient>

    <!-- Text Highlight Gradient -->
    <linearGradient id="textGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#38BDF8" />
      <stop offset="50%" stop-color="#818CF8" />
      <stop offset="100%" stop-color="#C084FC" />
    </linearGradient>
  </defs>

  <!-- Background Canvas -->
  <rect width="1200" height="675" fill="url(#bg)" />
  <rect width="1200" height="675" fill="url(#glow)" />

  <!-- Outer Glass Border -->
  <rect x="36" y="36" width="1128" height="603" rx="32" fill="#0F172A" fill-opacity="0.6" stroke="#334155" stroke-width="2" />

  <!-- Grid Decoration Lines -->
  <line x1="80" y1="130" x2="1120" y2="130" stroke="#1E293B" stroke-width="1.5" stroke-dasharray="6 6" />
  <line x1="80" y1="520" x2="1120" y2="520" stroke="#1E293B" stroke-width="1.5" stroke-dasharray="6 6" />

  <!-- Top Pill / Category Tag -->
  <rect x="80" y="72" width="260" height="36" rx="18" fill="#1E293B" stroke="#38BDF8" stroke-width="1.5" stroke-opacity="0.6" />
  <circle cx="102" cy="90" r="5" fill="#38BDF8" />
  <text x="118" y="95" fill="#38BDF8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="13" font-weight="800" letter-spacing="1.5">${safeTag}</text>

  <!-- Branding Badge Top Right -->
  <text x="1120" y="95" text-anchor="end" fill="#94A3B8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="13" font-weight="700" letter-spacing="1">X AUTONOMOUS ENGINE ⚡</text>

  <!-- Title -->
  <text x="80" y="210" fill="#F8FAFC" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="44" font-weight="900" letter-spacing="-0.5">
    ${safeTitle}
  </text>

  <!-- Highlight Stat Card -->
  <rect x="80" y="260" width="1040" height="110" rx="20" fill="#1E293B" fill-opacity="0.8" stroke="#475569" stroke-width="1.5" />
  <text x="116" y="302" fill="#94A3B8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="14" font-weight="700" letter-spacing="1.2">KEY IMPACT METRIC</text>
  <text x="116" y="348" fill="url(#textGrad)" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="36" font-weight="900">
    ${safeStat}
  </text>

  <!-- Core Strategy Highlight Box -->
  <rect x="80" y="390" width="1040" height="96" rx="16" fill="#0284C7" fill-opacity="0.1" stroke="#38BDF8" stroke-width="1.5" stroke-opacity="0.3" />
  <text x="116" y="425" fill="#38BDF8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="13" font-weight="800" letter-spacing="1">THE UNCONVENTIONAL STRATEGY</text>
  <text x="116" y="462" fill="#E2E8F0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="22" font-weight="700">
    ${safeHighlight}
  </text>

  <!-- Bottom Takeaway / Founder Lesson -->
  <text x="80" y="565" fill="#64748B" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="12" font-weight="800" letter-spacing="1.5">KEY TAKEAWAY FOR FOUNDERS:</text>
  <text x="80" y="600" fill="#F1F5F9" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="20" font-weight="600">
    "${safeLesson}"
  </text>
</svg>
`;
}

/**
 * Render visual card to PNG file and return local path + embedded data URL + public URL
 */
export async function createAndSaveCardImage(visualData) {
  const svgString = generateCardSvg(visualData);
  const svgDataUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
  const filename = `card-${Date.now()}-${Math.floor(Math.random() * 1000)}.png`;
  const localPath = path.join(MEDIA_DIR, filename);

  try {
    const resvg = new Resvg(svgString, {
      fitTo: { mode: 'width', value: 1200 }
    });
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    try {
      fs.writeFileSync(localPath, pngBuffer);
    } catch (writeErr) {
      console.warn('Note: Local media directory not writable:', writeErr.message);
    }

    const pngBase64 = `data:image/png;base64,${pngBuffer.toString('base64')}`;

    return {
      success: true,
      filename,
      localPath,
      publicUrl: pngBase64, // Instant direct display without 404
      dataUrl: pngBase64,
      svgDataUri,
      staticUrl: `/api/media/${filename}`,
      svg: svgString,
      buffer: pngBuffer
    };
  } catch (err) {
    console.warn('Resvg PNG rendering failed, falling back to SVG Data URI:', err.message);
    return {
      success: true,
      filename: `${filename.replace('.png', '.svg')}`,
      localPath,
      publicUrl: svgDataUri,
      dataUrl: svgDataUri,
      svgDataUri,
      staticUrl: `/api/media/${filename}`,
      svg: svgString,
      buffer: Buffer.from(svgString)
    };
  }
}

