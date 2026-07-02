# Password-gated private projects (inline)

The public site (`index.html`) is fully public. Inside **Code Portfolio** there's
a locked glass panel: entering the password decrypts your **stealth projects**
in the browser and injects them inline. Nothing private is in the public page
until then.

## Files

- **`private-src/stealth-projects.html`** — plaintext stealth projects you edit.
  Git-ignored, never committed. Markup mirrors the public project cards.
- **`stealth.enc.js`** — AES-256-GCM ciphertext of the above. Committed & public
  (safe: useless without the password).
- **`index.html`** — public; contains the locked panel + the in-browser decrypt JS.
- **`scripts/encrypt-stealth.mjs`** — the encryptor (PBKDF2 + AES-GCM).

## To add or edit stealth projects

1. Edit **`private-src/stealth-projects.html`** (git-ignored — safe). Add `<li>`
   blocks separated by `<hr>`, same as the public cards.
2. Re-encrypt (run in your own terminal so the password isn't logged):
   ```
   STEALTH_PASSWORD='your-strong-password' npm run encrypt-stealth
   ```
3. Commit **only** the ciphertext + page:
   ```
   git add stealth.enc.js index.html
   git commit -m "update private projects"
   git push
   ```
4. Never `git add private-src/` — the .gitignore blocks it; keep it that way.

## Honest security model

- Stealth content is AES-256-GCM encrypted, key derived from your passphrase via
  PBKDF2 (250k iterations). The blob in the public repo is useless without the
  password. Use a **strong** passphrase (a weak one is brute-forcible offline).
- One shared password. To rotate: re-encrypt with a new one and re-share.
- ⚠️ **Embed sensitive media as base64 data URIs** inside
  `private-src/stealth-projects.html`, or it leaks: anything in `attachments/`
  or `dist/` is a public file at its own URL, gate or no gate.
- The public portfolio and its media are, as intended, fully public.

## To share

Send the URL **ayangelah.me** and the password over separate channels. Viewers
scroll to Code Portfolio and enter it in the "Private Projects" panel.
