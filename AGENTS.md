# Repository Guidelines

## Project Structure & Module Organization

This repository is a Nuxt 4 application for MySchoolDates. Source UI lives in `app/`: pages in `app/pages`, shared Vue components in `app/components`, layouts in `app/layouts`, composables in `app/composables`, and TypeScript helpers in `app/utils`. Structured school calendar data lives under `content/`, with district records in `content/districts/*.json` and state records in `content/states/*.json`. Static assets are in `public/`, including icons, logos, `robots.txt`, and the web manifest. Planning and product notes live in `docs/`; keep implementation-facing notes there rather than in source files.

## Build, Test, and Development Commands

Use pnpm for local work because the repo includes `pnpm-lock.yaml`.

- `pnpm install`: install dependencies and run Nuxt preparation.
- `pnpm dev`: start the development server, usually at `http://localhost:3000`.
- `pnpm build`: build the production Nuxt app.
- `pnpm generate`: prerender static routes configured in `nuxt.config.ts`.
- `pnpm preview`: preview the production build locally.

There is no dedicated test script currently. For validation, run `pnpm build` before handing off changes that affect routes, components, content schema, or prerendering.

## Coding Style & Naming Conventions

Use TypeScript and Vue single-file components with `<script setup lang="ts">`. Follow the existing style: two-space indentation in Vue templates and JSON, no semicolons in TypeScript, single quotes in TS config/source, and concise computed/helper names. Component files use PascalCase, such as `DistrictKeyDateCards.vue`; composables use `useX.ts`; utility modules use camelCase names. District JSON filenames should be lowercase kebab-case matching the district identity, for example `round-rock-isd.json`.

## Testing Guidelines

No automated test framework is configured yet. When adding tests later, prefer colocated or clearly named specs using `*.spec.ts` and add a package script so contributors can run them consistently. For now, manually verify affected pages with `pnpm dev`, and run `pnpm build` or `pnpm generate` for changes to content, route rules, SEO metadata, or sitemap behavior.

## Commit & Pull Request Guidelines

Recent history uses conventional-style subjects such as `feat: add new school calendar entries for Plano ISD and Henrico County`. Keep commits short, imperative, and scoped to one change. Use prefixes like `feat:`, `fix:`, `docs:`, or `chore:` when appropriate.

Pull requests should include a clear summary, affected routes or districts, validation commands run, and screenshots for visible UI changes. For calendar data updates, cite official district sources and note any changed school years or slugs.
