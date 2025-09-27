import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

// Context Providers
import { SocketProvider } from './src/context/SocketContext';
import { PortfolioProvider } from './src/context/PortfolioContext';
import { GameProvider } from './src/context/GameContext';

// Screens
import SeasonPortfolioScreen from './src/screens/SeasonPortfolioScreen';
import LiveTradingScreen from './src/screens/LiveTradingScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// Theme
import { theme } from './src/theme/theme';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <SocketProvider>
          <PortfolioProvider>
            <GameProvider>
              <NavigationContainer>
                <StatusBar style="auto" />
                <Tab.Navigator
                  screenOptions={({ route }) => ({
                    tabBarIcon: ({ focused, color, size }) => {
                      let iconName: keyof typeof Ionicons.glyphMap;

                      switch (route.name) {
                        case 'Portfolio':
                          iconName = focused ? 'wallet' : 'wallet-outline';
                          break;
                        case 'Live Trading':
                          iconName = focused ? 'flash' : 'flash-outline';
                          break;
                        case 'Leaderboard':
                          iconName = focused ? 'trophy' : 'trophy-outline';
                          break;
                        case 'Profile':
                          iconName = focused ? 'person' : 'person-outline';
                          break;
                        default:
                          iconName = 'circle';
                      }

                      return <Ionicons name={iconName} size={size} color={color} />;
                    },
                    tabBarActiveTintColor: theme.colors.primary,
                    tabBarInactiveTintColor: 'gray',
                    headerStyle: {
                      backgroundColor: theme.colors.surface,
                    },
                    headerTintColor: theme.colors.onSurface,
                    tabBarStyle: {
                      backgroundColor: theme.colors.surface,
                      borderTopColor: theme.colors.outline,
                    },
                  })}
                >
                  <Tab.Screen
                    name="Portfolio"
                    component={SeasonPortfolioScreen}
                    options={{
                      title: 'Portfolio',
                      headerTitle: 'Season Portfolio'
                    }}
                  />
                  <Tab.Screen
                    name="Live Trading"
                    component={LiveTradingScreen}
                    options={{
                      title: 'Live',
                      headerTitle: 'Live Trading'
                    }}
                  />
                  <Tab.Screen
                    name="Leaderboard"
                    component={LeaderboardScreen}
                    options={{
                      title: 'Rankings',
                      headerTitle: 'Leaderboard'
                    }}
                  />
                  <Tab.Screen
                    name="Profile"
                    component={ProfileScreen}
                    options={{
                      title: 'Profile',
                      headerTitle: 'Profile'
                    }}
                  />
                </Tab.Navigator>
              </NavigationContainer>
            </GameProvider>
          </PortfolioProvider>
        </SocketProvider>
      </SafeAreaProvider>
    </PaperProvider>
  );
}