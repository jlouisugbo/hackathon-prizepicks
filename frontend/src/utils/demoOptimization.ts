/**
 * Demo Optimization Utilities
 *
 * This file contains utilities to enhance the demo experience for judges
 */

import { InteractionManager, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/**
 * Optimized haptic feedback for demo interactions
 */
export const demoHaptics = {
  // Light feedback for card taps and navigation
  light: () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  },

  // Medium feedback for trade actions
  medium: () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  },

  // Heavy feedback for flash multipliers and major events
  heavy: () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  },

  // Success feedback for completed trades
  success: () => {
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  },

  // Error feedback for failed trades
  error: () => {
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  },
};

/**
 * Smooth animations configuration for demo
 */
export const demoAnimationConfig = {
  // Standard spring animation for UI elements
  spring: {
    damping: 15,
    stiffness: 120,
    mass: 1,
  },

  // Quick spring for flash effects
  quickSpring: {
    damping: 10,
    stiffness: 100,
    mass: 0.8,
  },

  // Smooth timing for price updates
  smoothTiming: {
    duration: 300,
    useNativeDriver: true,
  },

  // Flash multiplier animation
  flashMultiplier: {
    damping: 12,
    stiffness: 90,
    mass: 1.2,
  },
};

/**
 * Performance optimization utilities
 */
export const demoPerformance = {
  // Run after interactions complete to avoid blocking UI
  runAfterInteractions: (callback: () => void) => {
    InteractionManager.runAfterInteractions(callback);
  },

  // Throttle function calls to prevent excessive updates
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): T => {
    let inThrottle: boolean;
    return ((...args: any[]) => {
      if (!inThrottle) {
        func.apply(null, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    }) as T;
  },

  // Debounce function calls for search and input
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): T => {
    let timeoutId: NodeJS.Timeout;
    return ((...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    }) as T;
  },
};

/**
 * Demo data helpers for consistent experience
 */
export const demoHelpers = {
  // Generate realistic price fluctuations for demo
  generatePriceFluctuation: (basePrice: number, volatility: number = 0.02): number => {
    const change = (Math.random() - 0.5) * 2 * volatility * basePrice;
    return Math.max(basePrice * 0.5, basePrice + change); // Prevent prices from going too low
  },

  // Simulate realistic trade delays for demo
  simulateTradeDelay: (): Promise<void> => {
    return new Promise((resolve) => {
      // Random delay between 100-500ms to simulate network
      const delay = Math.random() * 400 + 100;
      setTimeout(resolve, delay);
    });
  },

  // Generate realistic volume for demo
  generateVolume: (): number => {
    return Math.floor(Math.random() * 10000) + 1000;
  },

  // Simulate flash multiplier events
  shouldTriggerFlashMultiplier: (): boolean => {
    return Math.random() < 0.15; // 15% chance
  },

  // Generate flash multiplier value
  generateFlashMultiplier: (): number => {
    const multipliers = [1.5, 2.0, 2.5, 3.0, 3.5, 5.0];
    const weights = [0.3, 0.25, 0.2, 0.15, 0.08, 0.02]; // Higher chance for lower multipliers

    const random = Math.random();
    let weightSum = 0;

    for (let i = 0; i < multipliers.length; i++) {
      weightSum += weights[i];
      if (random <= weightSum) {
        return multipliers[i];
      }
    }

    return multipliers[0]; // Fallback
  },
};

/**
 * Demo user configuration for optimal experience
 */
export const demoUserConfig = {
  // Starting portfolio value
  initialPortfolioValue: 10000,

  // Starting balance for trading
  initialBalance: 5000,

  // Number of live trades remaining
  liveTradesRemaining: 5,

  // Mock holdings for demonstration
  mockHoldings: [
    {
      playerId: 'lebron-james',
      playerName: 'LeBron James',
      shares: 8,
      averagePrice: 185.50,
    },
    {
      playerId: 'stephen-curry',
      playerName: 'Stephen Curry',
      shares: 12,
      averagePrice: 172.25,
    },
    {
      playerId: 'giannis-antetokounmpo',
      playerName: 'Giannis Antetokounmpo',
      shares: 5,
      averagePrice: 195.75,
    },
  ],
};

/**
 * Demo constants for consistent branding
 */
export const demoConstants = {
  // App name for demo
  appName: 'Player Stock Market',

  // Demo game info
  demoGame: {
    homeTeam: 'LAL',
    awayTeam: 'GSW',
    homeScore: 89,
    awayScore: 92,
    quarter: 3,
    timeRemaining: '7:32',
  },

  // Demo events for flash multipliers
  demoEvents: [
    {
      type: 'three_pointer',
      description: 'Clutch three-pointer!',
      icon: 'basketball',
    },
    {
      type: 'dunk',
      description: 'Thunderous dunk!',
      icon: 'flame',
    },
    {
      type: 'steal',
      description: 'Amazing steal!',
      icon: 'flash',
    },
    {
      type: 'assist',
      description: 'Beautiful assist!',
      icon: 'hand-left',
    },
    {
      type: 'block',
      description: 'Massive block!',
      icon: 'shield',
    },
  ],
};

/**
 * Logging utility for demo debugging (can be disabled for production)
 */
export const demoLogger = {
  info: (message: string, data?: any) => {
    if (__DEV__) {
      console.log(`[DEMO] ${message}`, data || '');
    }
  },

  warn: (message: string, data?: any) => {
    if (__DEV__) {
      console.warn(`[DEMO] ${message}`, data || '');
    }
  },

  error: (message: string, error?: any) => {
    if (__DEV__) {
      console.error(`[DEMO] ${message}`, error || '');
    }
  },
};