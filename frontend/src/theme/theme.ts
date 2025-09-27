import { MD3LightTheme, configureFonts } from 'react-native-paper';

const fontConfig = {
  web: {
    regular: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontWeight: '400' as const,
    },
    medium: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontWeight: '500' as const,
    },
    light: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontWeight: '300' as const,
    },
    thin: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontWeight: '100' as const,
    },
  },
  default: {
    regular: {
      fontFamily: 'System',
      fontWeight: '400' as const,
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500' as const,
    },
    light: {
      fontFamily: 'System',
      fontWeight: '300' as const,
    },
    thin: {
      fontFamily: 'System',
      fontWeight: '100' as const,
    },
  },
};

export const theme = {
  ...MD3LightTheme,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1E88E5', // Blue
    secondary: '#FFA726', // Orange
    tertiary: '#26A69A', // Teal
    success: '#4CAF50', // Green
    error: '#F44336', // Red
    warning: '#FF9800', // Orange
    surface: '#FFFFFF',
    background: '#F5F5F5',
    onSurface: '#212121',
    onBackground: '#212121',
    outline: '#E0E0E0',

    // Custom colors for app
    bullish: '#4CAF50', // Green for gains
    bearish: '#F44336', // Red for losses
    neutral: '#9E9E9E', // Gray for neutral

    // Flash multiplier colors
    multiplierGlow: '#FFD700', // Gold
    multiplierBg: '#FFF3C4', // Light gold

    // Live trading colors
    liveActive: '#FF5722', // Deep orange
    liveBg: '#FFE0B2', // Light orange
  },
};

export type AppTheme = typeof theme;