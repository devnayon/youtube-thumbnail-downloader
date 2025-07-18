# 🎬 YouTube Thumbnail Downloader (Liquid Glass UI)

A modern and elegant tool to extract and download high-quality YouTube video thumbnails using a clean **Apple-style Liquid Glass (Glassmorphism)** interface.

---

## ✨ Features

- ✅ Paste a YouTube video URL and extract all available thumbnails
- ✅ Preview thumbnails in all resolutions:
  - `default.jpg`
  - `mqdefault.jpg` (Medium Quality)
  - `hqdefault.jpg` (High Quality)
  - `sddefault.jpg` (Standard Definition)
  - `maxresdefault.jpg` (HD / 4K)
- ✅ Download individual thumbnails
- ✅ Download all as a `.zip` file
- ✅ Beautiful Apple-inspired Liquid Glass UI with blur, glow, and smooth animations
- ✅ Responsive design (mobile-friendly)
- ✅ Optional: Video metadata display (title, channel, views, etc.)
- ✅ Coming Soon:
  - 🎨 Built-in Thumbnail Editor
  - 🌐 Multi-language Support
  - 🌙 Dark Mode Toggle

---

## 🧱 Tech Stack

- `HTML5` + `CSS3` (Glassmorphism design)
- `JavaScript` (Vanilla or React.js)
- [`JSZip`](https://stuk.github.io/jszip/) — for packaging multiple images
- [`YouTube Data API v3`](https://developers.google.com/youtube/v3) *(optional for metadata)*

---

## 🔗 How Thumbnail Links Work

Each YouTube video has multiple thumbnail sizes publicly available using its `VIDEO_ID`:

