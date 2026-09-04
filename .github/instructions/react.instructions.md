---
applyTo: "frontend/**/*.jsx,frontend/**/*.js"
description: "React and frontend coding standards for Three Rivers Bank frontend"
---

# React / Frontend Instructions

## Component Style
- Use functional components with hooks only — no class components.
- Keep components small and focused on a single responsibility.

## State Management
- Use React Query (TanStack Query) for all server state — do **not** use Redux, raw `fetch`, or raw `axios` for API calls.
- Use local `useState`/`useReducer` only for purely local UI state.

## Routing
- Use React Router v6 for all navigation (`useNavigate`, `<Link>`, `<Routes>`, `<Route>`).

## UI / Theming
- Use Material-UI (MUI) components for all UI elements.
- Always import and use the Three Rivers Bank theme from `frontend/src/theme.js`.
- Do **not** hardcode colors or override theme values inline — use the theme's palette (Navy `#003366`, Teal `#008080`).

## File Organization
- Place reusable components in `frontend/src/components/{cards,common,layout}/`.
- Place page-level components in `frontend/src/pages/` (e.g., `HomePage.jsx`, `CardComparisonPage.jsx`, `CardDetailsPage.jsx`).

## API Integration
- All API calls must go through React Query hooks (e.g., `useQuery`, `useMutation`).
- Base path for backend API: `/api/cards`.
