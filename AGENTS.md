# AGENTS.md

## Project Scope

- This workspace contains two different artifacts:
- A prebuilt static export at the repository root (`index.html`, `404.html`, `_next/`, route folders with `index.html`/`index.txt`).
- A Vite + React + TypeScript app in `freeapps-components/` used for component/UI development.

## Source Of Truth

- Treat root-level `_next/` files and `index.txt` route payload files as generated output. Do not hand-edit them unless the user explicitly asks for output-only changes.
- Prefer implementing UI/code changes in `freeapps-components/src/`.
- If a requested change targets the published site output at root, ask whether they want:
- A direct static patch in this repo, or
- A source-level fix in the upstream Next.js source project (if available).

## Working Directory And Commands

- Run app commands from `freeapps-components/`.
- Install dependencies: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Preview production build: `npm run preview`

Reference docs:
- `freeapps-components/README.md`
- `freeapps-components/package.json`

## Code Conventions (freeapps-components)

- Stack: React 19 + TypeScript + Vite.
- Keep imports extensionless for local TS/TSX modules (existing pattern).
- Respect TypeScript constraints from `tsconfig.app.json` (`noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`).
- Keep components functional and hooks-based, matching `src/App.tsx` style.
- Use `oxlint` as the lint source of truth.

## Safe Editing Rules

- Do not modify `node_modules/`.
- Avoid broad formatting-only rewrites; keep edits scoped to the task.
- Preserve existing naming and file structure unless the task requires refactoring.

## Validation Checklist

- For code changes in `freeapps-components/`:
- Run `npm run lint`.
- Run `npm run build` when changes affect types/build behavior.
- If no tests exist, explicitly state that validation used lint/build/manual checks only.