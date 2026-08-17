import React, { createContext, useContext, useState, useMemo, type ReactNode } from 'react';
import { ThemeProvider, createTheme, type PaletteMode } from '@mui/material';

interface ColorModeContextType {
  mode: PaletteMode;
  toggleColorMode: () => void;
}

const ColorModeContext = createContext<ColorModeContextType>({
  mode: 'dark',
  toggleColorMode: () => {},
});

export const ColorModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<PaletteMode>(() => {
    const savedMode = localStorage.getItem('ticketdesk_theme_mode');
    return (savedMode === 'light' || savedMode === 'dark') ? savedMode : 'dark';
  });

  const toggleColorMode = () => {
    setMode((prevMode) => {
      const nextMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('ticketdesk_theme_mode', nextMode);
      return nextMode;
    });
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#0284c7',       // Deep Ocean Blue
            light: '#38bdf8',      // Vivid Sky Blue
            dark: '#0369a1',       // Navy Accent
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#6366f1',       // Indigo Accent
            light: '#818cf8',
            dark: '#4f46e5',
          },
          background: mode === 'dark'
            ? {
                default: '#0b0f19',    // Deep Slate Main Surface
                paper: '#151c2c',      // Surface Panels
              }
            : {
                default: '#f8fafc',    // Soft Slate Main Surface
                paper: '#ffffff',      // Pure White Panels
              },
          text: mode === 'dark'
            ? {
                primary: '#f8fafc',
                secondary: '#94a3b8',
                disabled: '#64748b',
              }
            : {
                primary: '#0f172a',
                secondary: '#64748b',
                disabled: '#94a3b8',
              },
          divider: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
        },
        typography: {
          fontFamily: 'Inter, Outfit, Roboto, system-ui, -apple-system, sans-serif',
          h4: { fontWeight: 800, letterSpacing: '-0.02em' },
          h5: { fontWeight: 700, fontSize: '1.25rem' },
          h6: { fontWeight: 600, fontSize: '1rem' },
          subtitle1: { fontWeight: 600, fontSize: '0.9rem' },
          subtitle2: { fontWeight: 600, fontSize: '0.825rem' },
          body1: { fontSize: '0.875rem', lineHeight: 1.5 },
          body2: { fontSize: '0.8125rem', lineHeight: 1.4 },
          caption: { fontSize: '0.75rem', lineHeight: 1.3 },
        },
        shape: {
          borderRadius: 8,
        },
        components: {
          MuiCard: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
                boxShadow: mode === 'dark'
                  ? '0 4px 12px rgba(0, 0, 0, 0.4)'
                  : '0 2px 6px rgba(0, 0, 0, 0.04)',
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                borderRadius: 6,
                fontWeight: 600,
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                fontWeight: 700,
                fontSize: '0.6875rem',
                height: 22,
                borderRadius: 4,
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={{ mode, toggleColorMode }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export const useColorMode = () => useContext(ColorModeContext);
