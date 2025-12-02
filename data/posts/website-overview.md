---
id: about-this-website
title: About This Website: Structure, Stack, and How It Works
author: Emin
tags:
  - portfolio
  - architecture
  - vanilla-js
  - css
  - ux
excerpt: A concise overview of how this site is structured, the tech choices behind it, and what makes it fast, accessible, and easy to maintain.
---

## Overview

This site is a lightweight single-page application focused on speed, clarity, and maintainability. It uses no heavy frameworks—just well-structured, modern vanilla JavaScript, semantic HTML, and clean CSS. Content like blog posts is stored as Markdown with simple YAML frontmatter, keeping the authoring workflow human-friendly and versionable.

## How It’s Structured

- App and routing
  - The `App` class handles client-side routing for `home`, `blog`, individual `blogPost`, and `contact` views.
  - Rendering is template-driven with small, readable functions—no component framework required.

- Configuration and utilities
  - `js/config.js` centralizes constants (routes, layout, blog settings).
  - `js/utils.js` provides helpers: DOM helpers, frontmatter parsing, Markdown-to-HTML, formatting, error handling.

- Blog content system
  - Posts live in `data/posts/` as Markdown files with frontmatter.
  - `data/posts/index.json` is the lightweight index the app fetches first.
  - On load, the app fetches each Markdown file in parallel, parses frontmatter, converts Markdown to HTML, aggregates tags, and sorts by date.

- Styling
  - `css/app.css` implements a responsive layout using CSS Grid/Flexbox and CSS custom properties for theming.
  - Glass-morphism accents, dark mode, and accessible contrast are built in.
  - Layout relies on CSS (not JS) for spacing and responsiveness.

- Icons
  - Icons are powered by Lucide to keep visuals consistent and dependency-light.

## What Makes It Good

- Simplicity and speed
  - No framework overhead; fast load and interaction times.
  - Parallel fetch of Markdown posts keeps the blog snappy.

- Maintainability
  - Clear separation: `App` (routing/render), `config` (settings), `utils` (helpers), `data` (content), `css` (styles).
  - Markdown + frontmatter keeps content creation simple and reviewable in Git.

- UX and accessibility
  - Semantic HTML, strong color contrast, and keyboard-friendly interactions.
  - Thoughtful motion and hover states, with respect for reduced-motion users.

- Theming and design
  - Dark mode support, CSS variables for quick theming tweaks, and scalable components.

## Adding New Content

1. Create a new Markdown file in `data/posts/` with frontmatter (id, title, date, author, tags, excerpt).
2. Add an entry to `data/posts/index.json` pointing to the Markdown file.
3. The app will fetch, parse, and render it automatically on the blog page.

That’s it—clean, fast, and easy to extend.



