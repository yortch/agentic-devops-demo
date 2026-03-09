# ADR-003: React Frontend with TanStack Query State Management

## Status
Accepted

## Context
The frontend needs to display credit card catalog data with comparison features, filtering, and responsive design. State management approach must handle server-side data efficiently.

## Decision
Use React with TanStack Query (React Query) for server state management, Material-UI for component library, and React Router v6 for navigation.

## Decision Drivers
- **Server-state heavy**: Application primarily displays data from backend API
- **No client-side mutations**: Read-only interface with no form submissions
- **Rapid development**: Material-UI provides pre-built accessible components
- **Caching built-in**: React Query provides automatic caching and background refetching

## Technology Stack
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19 | UI framework |
| TanStack Query | 5 | Server state management |
| Material-UI | 7 | Component library |
| React Router | 7 | Client-side routing |
| Axios | 1.x | HTTP client |
| Vite | 6.x | Build tooling |

## Consequences
- No Redux or global state store needed (React Query handles all server state)
- Automatic request deduplication and caching
- Background refetching keeps data fresh
- Material-UI ensures baseline accessibility (WCAG 2.1 AA)

## Risks
- **Bundle size**: Material-UI adds significant bundle weight
- **React 19 maturity**: Newest React version may have ecosystem compatibility issues
- **No offline support**: Application requires network connectivity

## Related
- `frontend/src/App.jsx` - Query client configuration
- `frontend/src/services/api.js` - API service layer
- `frontend/src/theme.js` - Material-UI theme customization
