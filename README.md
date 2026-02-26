# You Don't Know JS — Reader

Lightweight Vite + Vue 3 reader for the "You Don't Know JS" series using local Markdown sources.

## Features

- Reads the book source files from the `texts/` folder and renders them as HTML
- Vue 3 + TypeScript + Composition API
- Pinia for simple reading progress state
- Lazy-loaded per-chapter Markdown bundles for small builds
- Syntax highlighting for code blocks
- Fully responsive and accessible (WCAG-friendly)

## Quick Start

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Type-check only:

```bash
npx vue-tsc -b --noEmit
```

Build for production:

```bash
npm run build
npm run preview
```

## Deploy

This project is ready to deploy to Vercel or any static-hosting service that serves a SPA.

See `vercel.json` for a recommended Vercel rewrite configuration.

## Content and Licensing

The Markdown content under `texts/` belongs to Kyle Simpson and Contributors.

It is licensed under Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0): https://creativecommons.org/licenses/by-nc-nd/4.0/

Translation/adaptation in this repository is for educational purposes only.

Do not relicense, redistribute, or use the book content for commercial purposes except in accordance with this license.

The repository code itself may be unlicensed until a `LICENSE` file is added. If you are the repository owner and want the code to be open-source, you can add a `LICENSE` (for example `MIT` or `Apache-2.0`).

## Repository Layout

- `texts/` — source Markdown for each book (books organized in subfolders)
- `src/` — Vue app source (components, views, composables, store, router)
- `public/` — static assets
- `dist/` — production build output (gitignored)

## Contributing

If you want to contribute fixes to the app (UI, parsing, accessibility), fork and open a PR.

Do not modify or relicense the book content unless you have explicit permission from the copyright holder.

## Acknowledgements

Original books by Kyle Simpson and Contributors.

Inspired by the "You Don’t Know JS" series.

## Questions / Notes

Let me know if you want me to add a `LICENSE` file for the code (e.g., MIT, Apache-2.0, or another).

Additional README expansions (developer notes, CI instructions) can be added upon request.
