---
description: 'React coding standards for the Three Rivers Bank frontend'
applyTo: 'frontend/src/**/*.{jsx,js}'
---

# React / Frontend Coding Standards

## State Management

- Use **React Query (TanStack Query)** for all server state — do NOT use Redux or raw `fetch`/`axios` calls outside of query functions.
- Use React built-in hooks (`useState`, `useReducer`) for local UI state only.

## UI Components

- Use **Material-UI (MUI)** components for all UI elements.
- Import and apply the custom Three Rivers Bank theme from `frontend/src/theme.js`.
- Use the bank's brand colors: Navy `#003366` (primary) and Teal `#008080` (secondary).

## Routing

- Use **React Router v6** for all client-side navigation.
- Use `<Link>` and `useNavigate` for programmatic navigation.

## Component Style

- Use **functional components with hooks** exclusively — no class components.
- Page-level components go in `frontend/src/pages/`.
- Reusable components go in `frontend/src/components/{cards,common,layout}`.

## Props Documentation

- Document component props with JSDoc `@param` comments or PropTypes declarations.

## Theme Usage

- Always import the theme from `frontend/src/theme.js` when referencing design tokens.
- Do not hardcode color values that are already defined in the theme.
