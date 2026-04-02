# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Website for **Circolo Scacchi Santa Sabina**, a chess club in Genova (Italy). Built with **Astro 6** (static site, SSG), deployed on Vercel at `santasabinascacchi.vercel.app`. All content is in Italian.

## Deployment

Hosted on **Vercel**, connected to the GitHub repo `danypk91/ssscacchi`. Pushes to `main` trigger automatic deploys. Remote uses SSH alias `github-danypk91` (see `~/.ssh/config`).

## Commands

```bash
npm run dev       # Dev server at localhost:4321
npm run build     # Production build to ./dist/
npm run preview   # Preview production build locally
```

Requires Node >= 22.12.0.

## Architecture

- **Astro 6 static site** — no UI framework, pure `.astro` components with scoped `<style>` blocks.
- **Layout**: `src/layouts/BaseLayout.astro` wraps all pages (Header + Footer + `<slot />`).
- **Components**: `src/components/Header.astro` (sticky nav with mobile hamburger), `src/components/Footer.astro`.
- **Pages**: `src/pages/` — file-based routing. Dynamic routes use `[slug].astro` with `getStaticPaths()`.
- **Content Collections** (`src/content.config.ts`): two collections — `notizie` and `tornei` — loaded via `glob()` from Markdown files in `src/content/notizie/` and `src/content/tornei/`. Schemas validated with Zod.
- **Styling**: Global CSS in `src/styles/global.css` defines CSS custom properties (dark wood-themed palette, typography). Pages add scoped styles. Fonts: Inter (body) + Playfair Display (headings) via Google Fonts.
- No build-time tests or linting configured.

## Content

To add a news item or tournament, create a `.md` file in the appropriate `src/content/` subdirectory with the required frontmatter fields (see `src/content.config.ts` for schemas). Upcoming events on the homepage are hardcoded in `src/pages/index.astro`.
