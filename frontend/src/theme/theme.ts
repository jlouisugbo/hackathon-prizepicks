import { MD3DarkTheme } from 'react-native-paper';

// Use default MD3 fonts to avoid platform-specific font config issues

// PrizePicks Dark Theme
export const theme = {
  ...MD3DarkTheme,
  // fonts: MD3DarkTheme.fonts,
  colors: {
    ...MD3DarkTheme.colors,
    // Purple Theme Colors
  primary: '#8B5CF6', // Purple primary (stay main)
  secondary: '#FF3A44', // Red for sells/negative
  tertiary: '#06B6D4', // Cyan accent
  neonGreen: '#22D3EE', // Neon cyan-blue
  neonBlue: '#00E5FF', // Neon blue
  neonLime: '#32D583', // Neon green (lime)

    // Backgrounds - Dark theme
    background: '#0D1421', // Main dark background
    surface: '#1A2332', // Card background
    surfaceVariant: '#242C3B', // Slightly lighter surface

    // Text colors
    onBackground: '#FFFFFF', // White text on dark bg
    onSurface: '#FFFFFF', // White text on cards
    onSurfaceVariant: '#8B9BB4', // Gray text

    // Status colors
  success: '#32D583', // Neon lime for success
    error: '#FF3A44', // Red for errors
    warning: '#FFA726', // Orange warning

    // Borders and outlines
    outline: '#2C3A4B', // Dark border
    outlineVariant: '#1F2937', // Darker border

    // Custom colors
  bullish: '#32D583', // Neon lime for gains
    bearish: '#FF3A44', // Red for losses
    neutral: '#8B9BB4', // Gray for neutral

    // Player card colors
    cardBg: '#1A2332', // Player card background
    cardBorder: '#2C3A4B', // Player card border

    // Flash multiplier colors
    multiplierGlow: '#8B5CF6', // Purple glow
    multiplierBg: '#2D1B69', // Dark purple background
    multiplier2x: '#8B5CF6', // 2x multiplier
    multiplier3x: '#FFA726', // 3x multiplier
    multiplier5x: '#FF3A44', // 5x multiplier

    // Live trading colors
    liveActive: '#8B5CF6', // Live purple
    liveBg: '#2D1B69', // Dark purple background
    liveInactive: '#8B9BB4', // Inactive gray

    // Price movement colors
  priceUp: '#32D583', // Price increase (neon lime)
    priceDown: '#FF3A44', // Price decrease
    priceStable: '#8B9BB4', // No change

    // Portfolio colors
  portfolioPositive: '#32D583', // Positive P&L
    portfolioNegative: '#FF3A44', // Negative P&L
    portfolioNeutral: '#8B9BB4', // Break even

    // Action colors
  buyButton: '#32D583', // Buy button (stands out from purple)
    sellButton: '#FF3A44', // Sell button
    disabledButton: '#2C3A4B', // Disabled state

    // Header and navigation
    headerBg: '#0D1421', // Header background
    tabActive: '#8B5CF6', // Active tab
    tabInactive: '#8B9BB4', // Inactive tab
  },
};

export type AppTheme = typeof theme;