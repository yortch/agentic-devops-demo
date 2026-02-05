---
name: 'Frontend React Development'
description: 'Guidelines for React + Vite + Material-UI development'
applyTo: 'frontend/**/*.{jsx,tsx,js,ts}'
---

<!-- 
  Based on: https://github.com/github/awesome-copilot/blob/main/instructions/reactjs.instructions.md
  Customized for Three Rivers Bank Credit Card Website React frontend
-->

# Frontend React Development (React + Vite + Material-UI)

## Project Context

This React frontend implements a credit card comparison interface with:
- **Vite** as the build tool and dev server
- **Material-UI (MUI)** for UI components with custom Three Rivers Bank theme
- **React Query (TanStack Query)** for server state management (NOT Redux)
- **React Router v6** for client-side routing
- **Component Structure**: Pages in `/pages/`, reusable components in `/components/{cards,common,layout}`

## Vite-Specific Patterns

### Development Workflow

- Start dev server: `npm run dev` (runs on port 5173)
- Build for production: `npm run build`
- Preview production build: `npm run preview`
- Vite HMR (Hot Module Replacement) is automatic - no refresh needed

### Vite Configuration

- Entry point: `frontend/src/main.jsx`
- Config file: `vite.config.js`
- Use absolute imports with alias configuration when needed
- Assets are automatically optimized during build
- Environment variables must be prefixed with `VITE_`

### Asset Imports

- Import static assets directly in components:
  ```jsx
  import logo from './assets/logo.svg'
  ```
- Assets in `public/` directory are served at root URL
- Use `import.meta.env.VITE_API_URL` for environment variables

## Material-UI (MUI) Component Usage

### Theme Customization

- **Theme file**: `frontend/src/theme.js`
- **Primary color**: Navy #003366
- **Secondary color**: Teal #008080
- **Typography**: Roboto (MUI default)
- Import theme: `import theme from './theme'`
- Apply theme with `ThemeProvider`:
  ```jsx
  import { ThemeProvider } from '@mui/material/styles';
  import theme from './theme';
  
  <ThemeProvider theme={theme}>
    <App />
  </ThemeProvider>
  ```

### Component Patterns

- Use MUI components consistently: `Button`, `Card`, `CardContent`, `Typography`, `AppBar`, `Toolbar`
- Apply spacing with theme: `sx={{ mt: 2, mb: 3 }}` (margin-top: 16px, margin-bottom: 24px)
- Use MUI Grid for layout: `<Grid container spacing={2}>`
- Implement responsive breakpoints: `sx={{ display: { xs: 'none', md: 'block' } }}`
- Use MUI icons: `import { Icon } from '@mui/icons-material'`

### Styling Approach

- Prefer `sx` prop for component-level styling
- Use `styled()` API for reusable styled components
- Avoid inline styles unless necessary
- Keep styles consistent with Three Rivers Bank branding
- Use MUI's responsive breakpoints: `xs`, `sm`, `md`, `lg`, `xl`

## React Query Patterns

### Server State Management

- **Use React Query for ALL API calls** - DO NOT use Redux
- Define API services in `frontend/src/services/`
- Use hooks pattern: `useQuery`, `useMutation`, `useQueryClient`

### Query Hooks

```jsx
import { useQuery } from '@tanstack/react-query';
import { fetchCards } from '../services/api';

function CardList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['cards'],
    queryFn: fetchCards,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  if (isLoading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error.message}</Alert>;
  
  return <CardGrid cards={data} />;
}
```

### Cache Configuration

- Configure stale time appropriately: 5min for transactions, 1hr for static data
- Use query keys that reflect data structure: `['cards']`, `['cards', cardId]`
- Invalidate cache when data changes: `queryClient.invalidateQueries(['cards'])`
- Don't use raw `fetch` or `axios` directly - wrap in React Query

### Loading and Error States

- Always handle `isLoading`, `error`, and `data` states
- Use MUI's `CircularProgress` for loading indicators
- Use MUI's `Alert` component for error messages
- Provide meaningful error messages to users

## React Router v6 Patterns

### Route Configuration

- Define routes in main application file
- Page components in `frontend/src/pages/`
- Use `<BrowserRouter>`, `<Routes>`, `<Route>` from `react-router-dom`

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CardDetailsPage from './pages/CardDetailsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cards/:id" element={<CardDetailsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### Navigation

- Use `useNavigate` hook for programmatic navigation
- Use `Link` component for declarative navigation
- Use `useParams` to access route parameters
- Use `useSearchParams` for query strings

## Component Architecture

### Component Organization

- **Page Components**: `HomePage.jsx`, `CardComparisonPage.jsx`, `CardDetailsPage.jsx` in `/pages/`
- **Card Components**: Comparison tables, detail views, filter sidebars in `/components/cards/`
- **Common Components**: Buttons, forms, alerts in `/components/common/`
- **Layout Components**: Header, footer, navigation in `/components/layout/`

### Functional Components with Hooks

- Use functional components exclusively
- Use hooks for state and side effects
- Create custom hooks for reusable logic
- Follow naming convention: `use` prefix for hooks (`useCardData`, `useFilters`)

### Component Design Principles

- Keep components small and focused (single responsibility)
- Use prop destructuring for clarity
- Define PropTypes or TypeScript interfaces for props
- Compose components rather than inherit
- Extract complex logic into custom hooks

### Component Example

```jsx
import { Card, CardContent, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function CreditCardItem({ card }) {
  const navigate = useNavigate();
  
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardContent>
        <Typography variant="h5">{card.name}</Typography>
        <Typography variant="body2">{card.description}</Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate(`/cards/${card.id}`)}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}

export default CreditCardItem;
```

## State Management

### Local State

- Use `useState` for component-local state
- Use `useReducer` for complex state logic
- Keep state as local as possible
- Lift state up only when needed

### Context API

- Use `useContext` for sharing state across component trees
- Create context providers for themes, auth, or global settings
- Don't overuse context - prefer React Query for server state

### Forms

- Use controlled components for form inputs
- Consider React Hook Form for complex forms
- Validate inputs appropriately
- Provide clear error messages

## Performance Optimization

### Memoization

- Use `React.memo` for expensive components that don't change often
- Use `useMemo` for expensive calculations
- Use `useCallback` for function references passed as props
- Don't over-optimize - measure first

### Code Splitting

- Use `React.lazy` and `Suspense` for route-based code splitting
- Lazy load heavy components or libraries
- Example:
  ```jsx
  const CardDetailsPage = lazy(() => import('./pages/CardDetailsPage'));
  
  <Suspense fallback={<CircularProgress />}>
    <CardDetailsPage />
  </Suspense>
  ```

## Best Practices

### Naming Conventions

- PascalCase for component files and names: `CardList.jsx`, `HomePage.jsx`
- camelCase for functions and variables: `handleClick`, `isLoading`
- Use descriptive names: `fetchCards` not `getData`

### File Organization

- One component per file
- Keep files under 250 lines when possible
- Co-locate related files (component, styles, tests)
- Use index files for clean imports

### Props and Data Flow

- Pass data down via props
- Use callback functions for child-to-parent communication
- Avoid prop drilling - use context or React Query when needed
- Document complex prop structures with PropTypes or TypeScript

### Effects and Lifecycle

- Use `useEffect` with proper dependency arrays
- Clean up side effects (subscriptions, timers)
- Don't perform side effects during render

## Testing with Playwright

- E2E tests are in `/tests/e2e/` directory
- Test files: `homepage.spec.ts`, `card-details.spec.ts`, etc.
- Run from `/tests/` directory: `npx playwright test`
- Test fixtures must match H2 seed data

## Common Pitfalls to Avoid

1. **Don't use Redux** - React Query handles all server state
2. **Don't bypass theme** - Always use theme colors, spacing, and typography
3. **Don't make direct API calls** - Use React Query hooks
4. **Don't mutate state directly** - Use state setters
5. **Don't forget loading and error states** - Users need feedback
6. **Don't skip accessibility** - Use semantic HTML and ARIA attributes

## Accessibility

- Use semantic HTML elements (`<button>`, `<nav>`, `<main>`)
- Provide alt text for images
- Ensure keyboard navigation works
- Use proper heading hierarchy
- Test with screen readers
- Maintain color contrast ratios
- Use ARIA attributes when needed

## Security

- Sanitize user inputs to prevent XSS
- Validate data before rendering
- Use HTTPS for all API calls
- Don't store sensitive data in localStorage
- Follow Content Security Policy guidelines

## Branding Constants

- **Bank Name**: Three Rivers Bank
- **Primary Color**: Navy #003366
- **Secondary Color**: Teal #008080
- **Contact**: 1-800-THREE-RB, business@threeriversbank.com
- **Location**: Pittsburgh, PA

## Key Reference Files

- Theme configuration: `frontend/src/theme.js`
- Page components: `frontend/src/pages/`
- Card components: `frontend/src/components/cards/`
- API services: `frontend/src/services/`
- Main entry: `frontend/src/main.jsx`
- App component: `frontend/src/App.jsx`
