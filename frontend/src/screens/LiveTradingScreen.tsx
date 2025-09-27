import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import {
  Card,
  Title,
  Text,
  Button,
  Chip,
  Surface,
  ActivityIndicator,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useGame } from '../context/GameContext';
import { useSocket } from '../context/SocketContext';
import { usePortfolio } from '../context/PortfolioContext';
import { theme } from '../theme/theme';
import { formatCurrency, formatGameTime, formatMultiplier } from '../utils/formatters';
import { Player, FlashMultiplier } from '../../../../shared/src/types';

const { width } = Dimensions.get('window');

export default function LiveTradingScreen() {
  const { currentGame, players, loading } = useGame();
  const {
    flashMultipliers,
    gameEvents,
    marketData,
    isConnected,
    joinLiveTrading
  } = useSocket();
  const { portfolio } = usePortfolio();

  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const flashScale = useSharedValue(1);

  useEffect(() => {
    if (isConnected) {
      joinLiveTrading();
    }
  }, [isConnected]);

  // Animate flash multipliers
  useEffect(() => {
    if (flashMultipliers.length > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      flashScale.value = withSequence(
        withSpring(1.2),
        withSpring(1),
        withTiming(1, { duration: 1000 })
      );
    }
  }, [flashMultipliers]);

  const animatedFlashStyle = useAnimatedStyle(() => ({
    transform: [{ scale: flashScale.value }],
  }));

  const renderGameHeader = () => {
    if (!currentGame) {
      return (
        <Card style={styles.gameCard} mode="outlined">
          <Card.Content style={styles.noGameContent}>
            <Ionicons name="basketball-outline" size={48} color={theme.colors.outline} />
            <Title style={styles.noGameTitle}>No Live Game</Title>
            <Text style={styles.noGameText}>
              Live trading will be available during games
            </Text>
          </Card.Content>
        </Card>
      );
    }

    return (
      <Card style={styles.gameCard} mode="elevated">
        <Card.Content>
          <View style={styles.gameHeader}>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
            <Text style={styles.gameTime}>
              {formatGameTime(currentGame.quarter, currentGame.timeRemaining)}
            </Text>
          </View>

          <View style={styles.scoreBoard}>
            <View style={styles.teamScore}>
              <Text style={styles.teamName}>{currentGame.awayTeam}</Text>
              <Text style={styles.score}>{currentGame.awayScore}</Text>
            </View>
            <Text style={styles.scoreSeparator}>-</Text>
            <View style={styles.teamScore}>
              <Text style={styles.teamName}>{currentGame.homeTeam}</Text>
              <Text style={styles.score}>{currentGame.homeScore}</Text>
            </View>
          </View>

          {portfolio && (
            <View style={styles.tradingInfo}>
              <Text style={styles.tradesRemainingLabel}>Live Trades Remaining</Text>
              <Chip
                mode="outlined"
                style={[
                  styles.tradesChip,
                  {
                    backgroundColor: portfolio.tradesRemaining > 0
                      ? theme.colors.bullish + '20'
                      : theme.colors.bearish + '20'
                  }
                ]}
                textStyle={{
                  color: portfolio.tradesRemaining > 0
                    ? theme.colors.bullish
                    : theme.colors.bearish,
                  fontWeight: 'bold'
                }}
              >
                {portfolio.tradesRemaining}
              </Chip>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderFlashMultipliers = () => {
    if (flashMultipliers.length === 0) return null;

    return (
      <Animated.View style={[styles.flashSection, animatedFlashStyle]}>
        <Title style={styles.flashTitle}>🔥 Flash Multipliers Active!</Title>
        {flashMultipliers.map((flash: FlashMultiplier) => (
          <Card
            key={flash.playerId}
            style={[styles.flashCard, { backgroundColor: theme.colors.multiplierBg }]}
            mode="outlined"
          >
            <Card.Content style={styles.flashContent}>
              <View style={styles.flashInfo}>
                <Text style={styles.flashPlayerName}>{flash.playerName}</Text>
                <Text style={styles.flashDescription}>{flash.eventDescription}</Text>
              </View>
              <Chip
                style={[styles.multiplierChip, { backgroundColor: theme.colors.multiplierGlow }]}
                textStyle={styles.multiplierText}
              >
                {formatMultiplier(flash.multiplier)}
              </Chip>
            </Card.Content>
          </Card>
        ))}
      </Animated.View>
    );
  };

  const renderActivePlayers = () => {
    if (!currentGame) return null;

    const activePlayers = players.filter(p =>
      currentGame.activePlayers.includes(p.id)
    );

    if (activePlayers.length === 0) return null;

    return (
      <View style={styles.playersSection}>
        <Title style={styles.sectionTitle}>Active Players</Title>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.playersScroll}
        >
          {activePlayers.map((player: Player) => {
            const hasFlash = flashMultipliers.some(f => f.playerId === player.id);
            const isGain = player.priceChangePercent24h >= 0;

            return (
              <Card
                key={player.id}
                style={[
                  styles.playerCard,
                  hasFlash && { borderColor: theme.colors.multiplierGlow, borderWidth: 2 },
                  selectedPlayer?.id === player.id && styles.selectedPlayer
                ]}
                mode="outlined"
                onPress={() => setSelectedPlayer(player)}
              >
                <Card.Content style={styles.playerContent}>
                  {hasFlash && (
                    <View style={styles.flashBadge}>
                      <Ionicons name="flash" size={12} color={theme.colors.multiplierGlow} />
                    </View>
                  )}

                  <Text style={styles.playerName}>{player.name}</Text>
                  <Text style={styles.playerTeam}>{player.team}</Text>

                  <View style={styles.playerPriceInfo}>
                    <Text style={styles.playerPrice}>
                      {formatCurrency(player.currentPrice)}
                    </Text>
                    <Text style={[
                      styles.playerChange,
                      { color: isGain ? theme.colors.bullish : theme.colors.bearish }
                    ]}>
                      {isGain ? '+' : ''}{player.priceChangePercent24h.toFixed(1)}%
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderTradeActions = () => {
    if (!selectedPlayer || !portfolio) return null;

    const canTrade = portfolio.tradesRemaining > 0;
    const hasBalance = portfolio.availableBalance >= selectedPlayer.currentPrice;

    return (
      <Card style={styles.tradeCard} mode="outlined">
        <Card.Content>
          <Title style={styles.tradeTitle}>
            Quick Trade: {selectedPlayer.name}
          </Title>
          <Text style={styles.tradePrice}>
            {formatCurrency(selectedPlayer.currentPrice)} per share
          </Text>

          <View style={styles.tradeButtons}>
            <Button
              mode="contained"
              style={[styles.tradeButton, { backgroundColor: theme.colors.bullish }]}
              disabled={!canTrade || !hasBalance}
              onPress={() => handleTrade('buy')}
            >
              Buy 1 Share
            </Button>
            <Button
              mode="contained"
              style={[styles.tradeButton, { backgroundColor: theme.colors.bearish }]}
              disabled={!canTrade}
              onPress={() => handleTrade('sell')}
            >
              Sell 1 Share
            </Button>
          </View>

          {!canTrade && (
            <Text style={styles.tradeWarning}>
              No live trades remaining today
            </Text>
          )}
          {canTrade && !hasBalance && (
            <Text style={styles.tradeWarning}>
              Insufficient balance for purchase
            </Text>
          )}
        </Card.Content>
      </Card>
    );
  };

  const handleTrade = (type: 'buy' | 'sell') => {
    if (!selectedPlayer) return;

    Alert.alert(
      'Confirm Trade',
      `${type.toUpperCase()} 1 share of ${selectedPlayer.name} for ${formatCurrency(selectedPlayer.currentPrice)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            // TODO: Implement actual trade execution
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Trade Executed!', `Successfully ${type === 'buy' ? 'bought' : 'sold'} 1 share of ${selectedPlayer.name}`);
          }
        }
      ]
    );
  };

  const renderRecentEvents = () => {
    if (gameEvents.length === 0) return null;

    return (
      <View style={styles.eventsSection}>
        <Title style={styles.sectionTitle}>Recent Events</Title>
        {gameEvents.slice(0, 5).map((event, index) => (
          <Surface key={event.id} style={styles.eventItem} elevation={1}>
            <View style={styles.eventContent}>
              <Text style={styles.eventDescription}>{event.description}</Text>
              <Text style={styles.eventTime}>{event.gameTime}</Text>
            </View>
            {event.multiplier && (
              <Chip
                style={styles.eventMultiplier}
                textStyle={{ fontSize: 10 }}
              >
                {formatMultiplier(event.multiplier)}
              </Chip>
            )}
          </Surface>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading live trading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderGameHeader()}
      {renderFlashMultipliers()}
      {renderActivePlayers()}
      {renderTradeActions()}
      {renderRecentEvents()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 16,
    color: theme.colors.onBackground,
  },
  gameCard: {
    margin: 16,
    marginBottom: 8,
  },
  noGameContent: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noGameTitle: {
    marginTop: 16,
  },
  noGameText: {
    marginTop: 8,
    textAlign: 'center',
    color: theme.colors.onSurface + '60',
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.liveActive,
    marginRight: 6,
  },
  liveText: {
    color: theme.colors.liveActive,
    fontWeight: 'bold',
    fontSize: 12,
  },
  gameTime: {
    fontSize: 16,
    fontWeight: '600',
  },
  scoreBoard: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  teamScore: {
    alignItems: 'center',
    minWidth: 60,
  },
  teamName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scoreSeparator: {
    fontSize: 20,
    marginHorizontal: 20,
    color: theme.colors.onSurface + '60',
  },
  tradingInfo: {
    alignItems: 'center',
  },
  tradesRemainingLabel: {
    fontSize: 12,
    color: theme.colors.onSurface + '60',
    marginBottom: 4,
  },
  tradesChip: {
    borderWidth: 0,
  },
  flashSection: {
    margin: 16,
    marginTop: 8,
  },
  flashTitle: {
    textAlign: 'center',
    marginBottom: 12,
    color: theme.colors.liveActive,
  },
  flashCard: {
    marginBottom: 8,
    borderColor: theme.colors.multiplierGlow,
  },
  flashContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flashInfo: {
    flex: 1,
  },
  flashPlayerName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  flashDescription: {
    color: theme.colors.onSurface + '80',
    marginTop: 2,
  },
  multiplierChip: {
    borderWidth: 0,
  },
  multiplierText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  playersSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  playersScroll: {
    paddingRight: 16,
  },
  playerCard: {
    width: 140,
    marginRight: 12,
    position: 'relative',
  },
  selectedPlayer: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  playerContent: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  flashBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: theme.colors.multiplierBg,
    borderRadius: 10,
    padding: 2,
  },
  playerName: {
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 12,
    marginBottom: 2,
  },
  playerTeam: {
    fontSize: 10,
    color: theme.colors.onSurface + '60',
    marginBottom: 8,
  },
  playerPriceInfo: {
    alignItems: 'center',
  },
  playerPrice: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  playerChange: {
    fontSize: 12,
    fontWeight: '500',
  },
  tradeCard: {
    margin: 16,
    marginTop: 8,
  },
  tradeTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  tradePrice: {
    textAlign: 'center',
    color: theme.colors.onSurface + '80',
    marginBottom: 16,
  },
  tradeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  tradeButton: {
    flex: 1,
  },
  tradeWarning: {
    textAlign: 'center',
    color: theme.colors.error,
    fontSize: 12,
    marginTop: 8,
  },
  eventsSection: {
    margin: 16,
    marginTop: 8,
  },
  eventItem: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eventContent: {
    flex: 1,
  },
  eventDescription: {
    fontSize: 14,
    marginBottom: 2,
  },
  eventTime: {
    fontSize: 12,
    color: theme.colors.onSurface + '60',
  },
  eventMultiplier: {
    marginLeft: 8,
  },
});