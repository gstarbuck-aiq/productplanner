# CLAUDE.md
asdfasdfhow hoII 

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React + TypeScript + Vite application called "productplanner". It's a minimal setup with HMR (Hot Module Replacement) and ESLint configured.

## Development Commands

```bash
# Start development server with HMR
npm run dev

# Build for production (runs TypeScript compiler then Vite build)
npm run build

# Lint all TypeScript/TSX files
npm run lint

# Preview production build locally
npm run preview
```

## Technology Stack

- **Build Tool**: Vite 7.x with @vitejs/plugin-react (uses Babel for Fast Refresh)
- **Framework**: React 19.2
- **Language**: TypeScript 5.9.x with strict mode enabled
- **Linting**: ESLint 9.x with TypeScript ESLint, React Hooks, and React Refresh plugins

## Architecture

### TypeScript Configuration

The project uses a composite TypeScript configuration:
- `tsconfig.json` - Root config that references app and node configs
- `tsconfig.app.json` - Application code config (strict mode, targets ES2022, uses react-jsx)
- `tsconfig.node.json` - Build tooling config for Vite

### Source Structure

- `src/main.tsx` - Application entry point, renders App in StrictMode
- `src/App.tsx` - Main application component
- `src/index.css` - Global styles
- `src/App.css` - Component-specific styles
- `src/assets/` - Static assets (images, SVGs)
- `public/` - Public static assets served at root

### Build Output

- Build artifacts are generated in `dist/` directory (ignored by git and ESLint)
- TypeScript build info cached in `node_modules/.tmp/`

## Code Style and Linting

ESLint is configured with:
- Recommended JS and TypeScript rules
- React Hooks flat config
- React Refresh Vite config
- Browser globals (ES2020)
- `dist/` directory ignored

The TypeScript compiler is strict with:
- `noUnusedLocals` and `noUnusedParameters` enabled
- `noFallthroughCasesInSwitch` enabled
- `noUncheckedSideEffectImports` enabled
