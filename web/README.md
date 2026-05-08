# EventifyMTEP Web

Frontend for Eventify (Multi-Tenant Event Platform).

## Overview

`web/` contains a React + TypeScript client scaffold built with Vite.
It currently provides the base project structure, routing setup, Tailwind v4 integration, and a Jest + Testing Library test setup.

The backend API lives in [`../api/`](../api/README.md), and broader project docs are in [`../docs/`](../docs/README.md).

## Tech stack

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS v4 (`@tailwindcss/vite`)
- Jest + Testing Library
- ESLint + Prettier

## Prerequisites

- Node.js `24.15.0` (from `package.json` engines)
- npm

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white) ![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white) ![Jest](https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white) ![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white) ![ESLint](https://img.shields.io/badge/ESLint-4B3263?style=for-the-badge&logo=eslint&logoColor=white) ![Prettier](https://img.shields.io/badge/prettier-%23F7B93E.svg?style=for-the-badge&logo=prettier&logoColor=black)

## Getting started

```bash
cd web
npm install
npm run dev
```

Default local URL (Vite): `http://localhost:5173`

## Available scripts

- `npm run dev` - Start the Vite development server
- `npm run build` - Type-check and create a production build
- `npm run preview` - Preview the production build locally
- `npm run test` - Run Jest tests
- `npm run test:watch` - Run Jest in watch mode
- `npm run test:coverage` - Run tests with coverage output
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run format` - Format files with Prettier
- `npm run format:check` - Check formatting with Prettier

## Current implementation status

- App entry point is implemented in [`src/main.tsx`](./src/main.tsx).
- Router is configured in [`src/App.tsx`](./src/App.tsx) with a single `/` route.
- Tailwind CSS is enabled in [`src/styles/index.css`](./src/styles/index.css).
- Test tooling is configured in [`jest.config.ts`](./jest.config.ts) and [`src/test/setup.ts`](./src/test/setup.ts).
- A sample test exists at [`src/test/example.test.tsx`](./src/test/example.test.tsx).
- Feature folders (`components`, `pages`, `services`, `hooks`, `types`, `utils`) are present and ready for implementation.

## Notes

- Vite alias `@` maps to `src/` (see [`vite.config.ts`](./vite.config.ts)).
- No production UI flows or API integrations are fully implemented yet.
