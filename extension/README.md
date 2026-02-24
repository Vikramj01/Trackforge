# Atlas Tracking Validator — Chrome Extension

Scans any live page for GTM, GA4, Meta Pixel, and Google Ads tags. Sends real results back to Atlas with one click.

## Install (Developer / Unpacked)

1. **Download / clone** this repository so you have the `extension/` folder locally.
2. Open **Chrome** → `chrome://extensions`
3. Enable **Developer mode** (toggle, top-right)
4. Click **"Load unpacked"** → select the `extension/` folder
5. The Atlas Validator icon appears in your toolbar

## Usage

1. Navigate to any client landing page or conversion page
2. Click the **Atlas Validator** icon in your toolbar
3. The popup shows a live tracking score, critical issues, and warnings
4. Click **"Fix All Issues in Atlas →"** — results open in Atlas automatically

## Browser compatibility

| Browser | Support |
|---------|---------|
| Chrome | ✅ Native (this extension) |
| Edge | ✅ Load same extension (Chromium) |
| Brave | ✅ Load same extension (Chromium) |
| Opera | ✅ Load same extension (Chromium) |
| Firefox | 🔜 Same code, publish to Mozilla Add-ons (minor manifest tweaks) |
| Safari | Use the **Bookmarklet** instead (zero install) |

## Production build

Change `ATLAS_URL` at the top of `popup.js` to your deployed Atlas domain before publishing.

## What it detects

- **Google Tag Manager** — container ID, presence
- **GA4** — measurement ID (G-XXXXXXX)
- **Meta Pixel** — pixel ID, fbq() initialization
- **Google Ads** — conversion ID (AW-XXXXXXXXX)
- **dataLayer events** — whether any events are being pushed
- **SPA detection** — Next.js, Nuxt, Vue, React heuristics
