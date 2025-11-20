import { createTheme } from '@mui/material/styles';

// Three Rivers Bank branding theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#003366', // Navy Blue
      light: '#0059a6',
      dark: '#002447',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#008080', // Teal
      light: '#4db8b8',
      dark: '#005959',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#212121',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#003366',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#003366',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      color: '#003366',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      color: '#003366',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          padding: '10px 24px',
          fontWeight: 600,
        },
        contained: {
          boxShadow: '0 2px 4px rgba(0,51,102,0.2)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,51,102,0.3)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

export default theme;
