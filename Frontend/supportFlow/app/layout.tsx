'use client';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { Inter } from 'next/font/google';
import ToasterProvider from '@/components/ToasterProvider';
import Providers from '@/components/Providers';

// Load Inter font for professional typography
const inter = Inter({ subsets: ['latin'] });

// Define the MUI theme with a blue-heavy palette
const theme = createTheme({
  palette: {
    primary: {
      main: '#0052cc', // Zendesk-inspired blue
      light: '#4d8cff',
      dark: '#003087',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#40c4ff', // Lighter blue for secondary elements
      light: '#80d8ff',
      dark: '#0094cc',
    },
    background: {
      default: '#f0f4ff', // Light blue-gray background
      paper: '#ffffff',
    },
    text: {
      primary: '#1f2a44', // Dark text for readability
      secondary: '#6b7280',
    },
  },
  typography: {
    fontFamily: inter.style.fontFamily,
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none', // Modern button style
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Rounded buttons
          padding: '8px 16px',
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #0052cc 30%, #4d8cff 90%)', // Gradient for primary buttons
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', // Subtle shadow
          backgroundColor: '#ffffff',
        },
      },
    },
  },
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <ToasterProvider />
            {children}
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}