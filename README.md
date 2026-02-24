# Product Planner

A visual timeline tool for planning tasks and milestones. Built with React, TypeScript, and Vite.

## Features

- **Timeline view** — visualize tasks as horizontal bars across a week or month grid
- **Task management** — add, edit, and delete tasks with a title, start date, duration, and color
- **Milestones** — mark specific weeks with milestone labels directly on the timeline
- **Week / month view modes** — toggle between week-level and month-level granularity
- **Date range picker** — control which time window is displayed
- **Navigation** — jump to today or step forward/backward through the timeline
- **Export** — export the timeline as a PNG screenshot
- **Keyboard shortcut** — `Ctrl+N` opens the add task form
- **Persistent state** — tasks, milestones, and timeline settings are saved to `localStorage`

## Development Commands

```bash
# Start development server with HMR
npm run dev

# Build for production
npm run build

# Lint all TypeScript/TSX files
npm run lint

# Preview production build locally
npm run preview
```

## Technology Stack

- **Framework**: React 19
- **Language**: TypeScript 5 (strict mode)
- **Build tool**: Vite 7 with `@vitejs/plugin-react` (Babel / Fast Refresh)
- **Date utilities**: date-fns
- **Linting**: ESLint 9 with TypeScript ESLint, React Hooks, and React Refresh plugins

## Project Structure

```
src/
  components/
    Header/          # App header, navigation, date range picker, view toggle
    TaskForm/        # Add/edit task modal form
    Timeline/        # Timeline grid, task bars, milestone indicators
    ConfirmDialog/   # Generic confirmation dialog
  context/
    TaskContext      # Task CRUD + localStorage persistence
    MilestoneContext # Milestone CRUD + localStorage persistence
    TimelineSettingsContext # View mode + date range state
  hooks/             # useLocalStorage, useKeyboardShortcuts, useTimelineScroll, …
  types/             # TypeScript interfaces (Task, Milestone, timeline types)
  utils/             # Week/time helpers, timeline PNG export
  constants.ts
```
