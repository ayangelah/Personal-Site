// Encrypts the plaintext stealth projects into a public ciphertext file.
//
//   STEALTH_PASSWORD='your-password' npm run encrypt-stealth
//
// Reads:  private-src/stealth-projects.html   (plaintext, git-ignored)
// Writes: stealth.enc.js                       (AES-GCM ciphertext, safe to commit)
//
// The browser decrypts this in index.html with the Web Crypto API. Uses
// PBKDF2 (SHA-256) key derivation + AES-256-GCM (authenticated) encryption.

import { webcrypto as crypto } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve, extname } from 'node:path';

const password = process.env.STEALTH_PASSWORD;
if (!password) {
  console.error("Set STEALTH_PASSWORD, e.g. STEALTH_PASSWORD='...' npm run encrypt-stealth");
  process.exit(1);
}

const SRC = 'private-src/stealth-projects.html';
const OUT = 'stealth.enc.js';
const ITERATIONS = 250000;

// Inline any local <img src="..."> as a base64 data URI so the media is
// encrypted with the page. Files under attachments/ or linked by http are
// left alone (those are public); local paths are resolved next to SRC.
const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp' };
const srcDir = dirname(SRC);
let plaintext = readFileSync(SRC, 'utf8').replace(/src="([^"]+)"/g, (match, ref) => {
  if (/^(https?:|data:|\.\/attachments\/)/.test(ref)) return match;
  const filePath = resolve(srcDir, ref);
  if (!existsSync(filePath)) {
    console.warn(`WARN: image not found, left as a plain reference: ${ref}`);
    return match;
  }
  const b64 = readFileSync(filePath).toString('base64');
  const type = MIME[extname(filePath).toLowerCase()] || 'application/octet-stream';
  console.log(`embedded ${ref} (${(b64.length / 1024).toFixed(0)} KB base64)`);
  return `src="data:${type};base64,${b64}"`;
});
const encoder = new TextEncoder();

const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));

const keyMaterial = await crypto.subtle.importKey(
  'raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']
);
const key = await crypto.subtle.deriveKey(
  { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
  keyMaterial, { name: 'AES-GCM', length: 256 }, false, ['encrypt']
);
const ciphertext = await crypto.subtle.encrypt(
  { name: 'AES-GCM', iv }, key, encoder.encode(plaintext)
);

const b64 = (buf) => Buffer.from(buf).toString('base64');
const blob = {
  salt: b64(salt),
  iv: b64(iv),
  ct: b64(new Uint8Array(ciphertext)),
  iter: ITERATIONS,
};

writeFileSync(OUT, 'window.STEALTH_BLOB=' + JSON.stringify(blob) + ';\n');
console.log(`Encrypted ${plaintext.length} chars from ${SRC} -> ${OUT}`);
