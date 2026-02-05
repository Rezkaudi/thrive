import { createTheme, responsiveFontSizes } from '@mui/material/styles';

export const theme = responsiveFontSizes(createTheme({
  palette: {
    primary: {
      main: '#5C633A', // Warm coral/salmon - reminiscent of Japanese lanterns
      light: '#D4BC8C', // Cherry blossom pink
      dark: '#283618',
    },
    secondary: {
      main: '#A6531C', // Teal - like Japanese ocean paintings
      light: '#7ED4D0',
      dark: '#3BA59E',
    },
    background: {
      default: '#FAFAFA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2D3436',
      secondary: '#636E72',
    },
    error: {
      main: '#FF9FAC',
    },
    success: {
      main: '#483C32',
    },
  },
  typography: {
    fontFamily: '"Inter", "Noto Sans JP", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '3rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2.25rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.875rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.7,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiInputLabel: {
      styleOverrides: {
        root: {
          '& .MuiFormLabel-asterisk': {
            color: '#d32f2f',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '12px 24px',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #5C633A 0%, #D4BC8C 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #283618 0%, #D4BC8C 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover fieldset': {
              borderColor: '#D4BC8C',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#5C633A',
            },
          },
        },
      },
    },
  },
}));