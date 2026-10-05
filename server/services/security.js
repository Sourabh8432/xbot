import crypto from 'crypto';

const SECRET_KEY = crypto.createHash('sha256')
  .update(process.env.SESSION_SECRET || 'xbot-production-secret-key-salt-2026-v2')
  .digest(); // 32 bytes for aes-256

// Helper for base64url
export function base64urlEncode(buffer) {
  return buffer.toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export function base64urlDecode(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64');
}

// Encrypt payload (AES-256-GCM) with authentication tag
export function encryptPayload(data) {
  const iv = crypto.randomBytes(12); // 12-byte IV for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', SECRET_KEY, iv);
  
  const text = JSON.stringify(data);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Combine IV (12 bytes) + AuthTag (16 bytes) + Encrypted Payload
  const combined = Buffer.concat([iv, authTag, encrypted]);
  return base64urlEncode(combined);
}

// Decrypt payload
export function decryptPayload(token, maxAgeMs = null) {
  try {
    const combined = base64urlDecode(token);
    if (combined.length < 28) return null; // 12 iv + 16 tag

    const iv = combined.subarray(0, 12);
    const authTag = combined.subarray(12, 28);
    const encrypted = combined.subarray(28);

    const decipher = crypto.createDecipheriv('aes-256-gcm', SECRET_KEY, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    const data = JSON.parse(decrypted.toString('utf8'));

    // Check expiration if timestamp is embedded
    if (maxAgeMs && data.timestamp) {
      if (Date.now() - data.timestamp > maxAgeMs) {
        throw new Error('Token has expired');
      }
    }

    return data;
  } catch (err) {
    console.error('Decryption failed:', err.message);
    return null;
  }
}
