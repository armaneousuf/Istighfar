# Istighfar - A Dhikr Counter App

## Overview

Istighfar is a mobile-first progressive web application (PWA) designed to help Muslims track and cultivate consistent spiritual devotion through the recitation of Istighfar (استغفار) and other Islamic supplications.

The app combines an elegant, dark-themed interface with features to make daily Islamic practice more engaging and rewarding. Whether you're seeking forgiveness, building consistency, or simply deepening your connection to Allah, Istighfar provides the tools to support your journey.

<img width="150" height="336" alt="Main counter screen" src="https://github.com/user-attachments/assets/f0322f49-f61b-4691-b671-300bee627152" />
<img width="150" height="336" alt="Streaks and badges screen" src="https://github.com/user-attachments/assets/1177975b-3e85-4071-8a55-38db006f5c4e" />
<img width="150" height="336" alt="Insights and analytics screen" src="https://github.com/user-attachments/assets/50ecb921-a7c1-4711-b0f3-60cce2deacf1" />
<img width="150" height="336" alt="Prayer times and settings screen" src="https://github.com/user-attachments/assets/a28dd4f0-1500-4a28-88f5-3e3e44dddfba" />

## Key Features

### Core Counter

- **Large, responsive counter** with a circular progress ring showing daily goal progress
- **Tap-based interaction** with protection against accidental taps
- **Haptic feedback & sound effects** for satisfying, tactile engagement
- **Real-time progress tracking** toward customizable daily goals (1–1,000,000 taps)

### Streaks & Motivation

- **Current & Best Streak tracking** — know how many consecutive days you've been active
- **Daily history heatmap** — visualize your activity over 26 weeks with color-coded intensity
- **Milestone badges** — unlock 13+ achievement badges as you progress (from "Seed of Devotion" to "Al-Musaafir — Millionist")
- **Rank system** — advance through 15 ranks as your lifetime total grows, from Novice Seeker to Al-Musaafir

### Insights & Analytics

- **Weekly bar chart** — see daily activity for the past 7 days
- **Quick stats** — today's progress, week & month totals, best day, and average daily count
- **Trend comparison** — track how this week compares to last week, and this month to last month
- **Personal rhythm** — shows how many active days you've had

### Prayer Times Integration

- **Automatic prayer time calculation** for your location (Fajr, Dhuhr, Asr, Maghrib, Isha, Sunrise, Sunset)
- **Karachi method & Hanafi Asr** calculation on-device for privacy
- **Countdown to next prayer** with live updates every second
- **Location tracking** — save your location for fast, repeated access

### Playground (Free Practice)

- **Round-based counter** independent of your main Istighfar practice
- **Preset targets** (33, 99, 100) or custom amounts for flexible practice sessions
- **Daily round tracking** — track how many complete rounds you finish

### Customization

- **6 Islamic duas** to choose from, including Istighfar, Subhanallah, and more
- **Transliteration display** for each selected dua
- **Sound toggle** — enjoy or disable audio feedback
- **Haptics toggle** — control tactile feedback (on supported devices)
- **Custom daily goals** — set any target between 1 and 1,000,000

### Privacy & Data

- **Anonymous Mode** — practice without saving any data to history
- **Focus Mode** — distraction-free full-screen counter for deep devotion
- **Local-first storage** — all data stays on your device using IndexedDB
- **Export/Import backups** — download your progress as JSON or restore from backup
- **Full reset option** — clear all data when starting fresh

## Tech Stack

- **Frontend**: Vanilla JavaScript with Tailwind CSS
- **Icons & UI**: Custom SVG icons, responsive design, glassmorphic UI
- **Charts**: Chart.js for weekly analytics
- **Prayer times**: Adhan.js library
- **Mobile**: Capacitor for Android & iOS app distribution
- **PWA Features**: Service Worker, Web App Manifest, offline support

## Development

1. Clone the repository:

```bash
git clone https://github.com/armaneousuf/Istighfar.git
cd Istighfar
```

2. Install dependencies:

```bash
npm install
```

3. Build CSS (if modifying Tailwind):

```bash
npm run build:css
```

4. Serve the app locally (use any local server, e.g., `python -m http.server`)

### How to Update the App Version

#### Automated (recommended)

Run the bump script to handle steps 1–4 below in one go:

```bash
node scripts/bump-version.js 3.x.x.x
```

#### Manual (if you prefer to do each step yourself)

1. **Android build config:** In `android/app/build.gradle`, increase `versionCode` by 1 and update `versionName` (e.g. `"3.4"`).
2. **App settings display:** In `www/index.html`, update the `App version` value in Settings to `3.4`.
3. **Package version:** In `package.json`, set `version` to `3.4.0` (release builds only).
4. **Last-updated date:** In `script.js`, find `const APP_LAST_UPDATED = "YYYY-MM-DD";` and change it to today's date.

## Sync Changes to Android

After adding changes in the project, always sync them to the Android project (run from root folder):

```bash
npx cap sync android
```

### Rebuild the APK

```bash
cd android
./gradlew assembleDebug
```

### Share the APK

Find it at this path:

`<your_project_clone_path>/android/app/build/outputs/apk/debug/`
