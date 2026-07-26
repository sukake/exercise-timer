# Distributing Exercise Timer

> **The honest truth about "one file that installs everywhere":** it doesn't
> exist. Apple blocks tap-to-install `.ipa` files, and desktop OSes each want
> their own installer format. The closest thing to "share once, installs on
> every device" is a **PWA served from a single URL** — that's the recommended
> path below. For true native single-file installs, Android is the only
> platform that allows it (`.apk`).

## Install matrix

| Target | Single shareable artifact? | How |
|---|---|---|
| **Any device (PWA)** | ✅ One **URL** | Host `dist/`, users tap **Install** / **Add to Home Screen** |
| **Android** | ✅ One **`.apk`** file | `eas build -p android --profile preview` |
| **iOS** | ❌ (Apple restriction) | **TestFlight** link via `eas build -p ios`, or a dev build |
| **Desktop** | ✅ via PWA install | Chrome/Edge "Install" from the hosted URL |

---

## 1. PWA — the universal path (recommended)

Build the installable web bundle:

```bash
npm run build:web     # -> dist/ (manifest, service worker, icons all included)
```

Then host `dist/` anywhere static:

- **Drag-and-drop:** drop the `dist/` folder onto [app.netlify.com/drop](https://app.netlify.com/drop) → get a URL.
- **Vercel:** `npx vercel deploy dist --prod`
- **GitHub Pages / any static host / S3 / nginx** — just serve the folder.
- **Local preview:** `npm run serve:web`

Share the resulting URL. On first visit users can install it:

- **iOS (Safari):** Share → **Add to Home Screen**.
- **Android (Chrome):** the **Install app** prompt / ⋮ menu → Install.
- **Desktop (Chrome/Edge):** the **install icon** in the address bar.

Once installed it launches full-screen (no browser chrome) and **works offline**
(the service worker caches the app shell).

> **Subpath hosting:** if you serve it under a subpath (e.g.
> `example.com/timer/`) rather than a domain root, set
> `"experiments": { "baseUrl": "/timer" }` in `app.json` before building so the
> JS bundle path resolves.

---

## 2. Android — a real single `.apk`

Cloud build (no Android Studio needed):

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview   # profile below produces an .apk
```

Add this to `eas.json` (create it if absent):

```json
{
  "build": {
    "preview": {
      "android": { "buildType": "apk" }
    }
  }
}
```

EAS returns a download link to a single `.apk`. Share that file — the recipient
enables "Install unknown apps" and taps it to install. (A Play Store release
uses `.aab` instead: `--profile production`.)

Local alternative for development: `npx expo run:android` (requires Android SDK).

---

## 3. iOS — TestFlight (no tap-to-install file)

```bash
eas build -p ios --profile preview
eas submit -p ios          # upload to App Store Connect / TestFlight
```

Invite testers with a TestFlight link. This is Apple's supported way to share
a build; there is no equivalent of a directly-installable `.apk`.

---

## 4. Desktop native (optional)

The PWA already installs on desktop via Chrome/Edge. If you specifically want a
downloadable desktop installer (`.dmg` / `.exe` / `.AppImage`), wrap the web
build with **[Tauri](https://tauri.app/)** — it packages `dist/` into a small
native app per OS. This is the only path that yields per-OS desktop installers,
and each OS still needs its own file.
