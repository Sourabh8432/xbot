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
 * Generate a modern, minimal, LIGHT-MODE sleek Business Infographic Card (SVG)
 * Editorial, high-end Swiss typography aesthetic (Stripe / Apple / Linear style)
 */
export function generateCardSvg({
  tag = 'BUSINESS BREAKDOWN',
  title = 'How They Scaled a $100M Machine',
  stat = '$0 to $100M in 3 Years',
  highlight = 'Zero-Cost Organic Distribution Flywheel',
  keyLesson = 'Remove every point of friction before you spend money on marketing.'
} = {}) {
  const safeTag = escapeXml(tag.toUpperCase());
  const safeTitle = escapeXml(title);
  const safeStat = escapeXml(stat);
  const safeHighlight = escapeXml(highlight);
  const safeLesson = escapeXml(keyLesson);

  return `
<svg width="1200" height="675" viewBox="0 0 1200 675" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Subtle Ambient Backdrop Shadow -->
    <filter id="cardShadow" x="24" y="24" width="1152" height="627" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feDropShadow dx="0" dy="12" stdDeviation="20" flood-color="#0F172A" flood-opacity="0.06" />
    </filter>
  </defs>

  <!-- Crisp Minimal Canvas Background (Warm Soft Neutral) -->
  <rect width="1200" height="675" fill="#F8FAFC" />

  <!-- Main Card Container (Pure Minimal White with Subtle Border) -->
  <rect x="36" y="36" width="1128" height="603" rx="28" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" filter="url(#cardShadow)" />

  <!-- Subtle Minimal Dividers -->
  <line x1="76" y1="126" x2="1124" y2="126" stroke="#F1F5F9" stroke-width="1.5" />
  <line x1="76" y1="520" x2="1124" y2="520" stroke="#F1F5F9" stroke-width="1.5" />

  <!-- Top Pill / Category Tag (Minimalist Slate Pill) -->
  <rect x="76" y="68" width="250" height="36" rx="18" fill="#F1F5F9" stroke="#E2E8F0" stroke-width="1" />
  <circle cx="96" cy="86" r="4.5" fill="#0F172A" />
  <text x="110" y="91" fill="#1E293B" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="12" font-weight="800" letter-spacing="1.2">${safeTag}</text>

  <!-- Top Right Minimal Branding Tag -->
  <text x="1124" y="91" text-anchor="end" fill="#94A3B8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="12" font-weight="700" letter-spacing="1.5">FOUNDER BLUEPRINT ✦</text>

  <!-- Title (Pitch Black, Ultra-Bold Swiss Typography) -->
  <text x="76" y="196" fill="#0F172A" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="42" font-weight="900" letter-spacing="-0.8">
    ${safeTitle}
  </text>

  <!-- Stat Highlight Box (Minimal Crisp Light Card) -->
  <rect x="76" y="244" width="1048" height="114" rx="18" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.5" />
  <text x="108" y="284" fill="#64748B" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="12" font-weight="800" letter-spacing="1.5">KEY GROWTH BENCHMARK</text>
  <text x="108" y="334" fill="#0F172A" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="34" font-weight="900" letter-spacing="-0.5">
    ${safeStat}
  </text>

  <!-- Core Strategy Box (Subtle Refined Focus Box) -->
  <rect x="76" y="380" width="1048" height="106" rx="18" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="1" />
  <text x="108" y="416" fill="#475569" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="12" font-weight="800" letter-spacing="1.2">THE UNCONVENTIONAL STRATEGY</text>
  <text x="108" y="456" fill="#0F172A" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="22" font-weight="700">
    ${safeHighlight}
  </text>

  <!-- Bottom Takeaway / Founder Lesson (Clean Editorial Quote) -->
  <text x="76" y="560" fill="#94A3B8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="11" font-weight="800" letter-spacing="1.5">CORE LESSON FOR FOUNDERS:</text>
  <text x="76" y="596" fill="#1E293B" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="20" font-weight="600">
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

