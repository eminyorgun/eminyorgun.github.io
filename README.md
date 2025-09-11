# Personal Website

Personal portfolio and blog built with vanilla JavaScript, HTML, and CSS. It’s a single‑page app using hash‑based routing (`#/home`, `#/blog`, `#/blog/{id}`, `#/contact`).

## Features

- **Responsive layout**: Mobile‑first, modern styling
- **Dark/Light theme**: Auto theme based on time of day + manual toggle with persistence
- **Client‑side routing**: Home, Blog, Blog Post, Contact
- **Blog system**:
  - Markdown posts in `data/posts/*.md` with frontmatter
  - Index in `data/posts/index.json`
  - Search, tag filtering, pagination, and “Latest posts” on Home
  - Syntax highlighting via PrismJS (light/dark themes switch with site theme)
- **Contact form**: Client‑side validation and simulated submission (no backend)
- **Icons**: [Lucide] icons via `vendor/lucide.js` using `data-lucide` attributes

## Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: CSS (CSS variables, Flexbox, Grid) in `css/app.css`
- **Syntax highlighting**: PrismJS via CDN
- **Icons**: Lucide via local `vendor/lucide.js`
- **Build tooling**: None required (static site)

## Project Structure

```
personal-website/
├── index.html
├── css/
│   └── app.css
├── js/
│   ├── app.js         # Main application (routing, rendering, state)
│   ├── config.js      # Centralized configuration/constants
│   └── utils.js       # Utilities (frontmatter parsing, markdown, helpers)
├── data/
│   └── posts/
│       ├── index.json # List of posts and metadata
│       └── *.md       # Markdown posts with frontmatter
├── assets/
│   ├── favicon.ico
│   └── me.jpeg
├── vendor/
│   └── lucide.js      # Lucide icon library (local)
├── .nojekyll          # For GitHub Pages (disable Jekyll)
├── package.json
└── README.md
```

## Routing

- `#/home` — Home
- `#/blog` — Blog listing (search, tag filter, pagination)
- `#/blog/{id}` — Blog post detail (renders markdown → HTML)
- `#/contact` — Contact form (client‑side only, simulated submit)

## Blog Content

- Add a markdown file under `data/posts/` (e.g., `my-post.md`). Start with frontmatter:

```md
---
id: my-post
title: My Post Title
date: 2025-09-01
author: Emin Yorgun
tags: [JavaScript, Portfolio]
excerpt: Optional short summary
cover: Optional path/to/image
coverAlt: Optional accessible alt text
---

Your markdown content here...
```

- Add/verify an entry in `data/posts/index.json` pointing to the file. Frontmatter values override `index.json` when both are present.

## Configuration

- `js/config.js` contains:
  - **Theme**: keys and night hours for auto dark mode
  - **Layout**: constants used by the UI
  - **Routes**: route names used by the router
  - **Blog**: posts per page, excerpt length, latest posts count
  - **Contact/Social links**: update `CONFIG.CONTACT_INFO` and `CONFIG.SOCIAL_LINKS` as needed

## Development

### Prerequisites

- Any modern browser
- Optional: a simple HTTP server for local development

### Run locally

Option 1 — open the file directly:
- Open `index.html` in your browser

Option 2 — use a local server (recommended):
```bash
# Python 3
python -m http.server 8000

# Node (if installed)
npx http-server . -p 8000
```
The site will be available at `http://localhost:8000`.

### NPM scripts (optional)

```bash
npm run dev   # Starts a simple Python HTTP server on port 8000
npm start     # Prints instructions (no build required)
npm run build # Placeholder (no bundling/minification by default)
```

## Production

This is a static site. Deploy by uploading the repository contents to any static host (e.g., GitHub Pages, Netlify, Vercel, S3). If you use Cloudflare Web Analytics, replace the token in `index.html` (`data-cf-beacon`).

## Notes

- PrismJS styles are loaded from CDN and switch based on the active theme.
- In development, `index.html` clears service workers and caches to avoid stale assets.
- Icons are instantiated via `window.lucide.createIcons()` and `data-lucide` attributes.

## License

MIT
