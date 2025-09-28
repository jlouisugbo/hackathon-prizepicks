import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Text, ActivityIndicator, FAB, TextInput, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Components
import PlayerCard from '../components/PlayerCard';
import TradeModal from '../components/TradeModal';
import LiveChat from '../components/LiveChat';
import GameHeader from '../components/GameHeader';
import PlayerList from '../components/PlayerList';
import FlashMultipliers from '../components/FlashMultipliers';
import RecentEvents from '../components/RecentEvents';
//

// Contexts
import { useGame } from '../context/GameContext';
import { useSocket } from '../context/SocketContext';
import { usePortfolio } from '../context/PortfolioContext';
import { theme } from '../theme/theme';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { Player, TradeRequest, FlashMultiplier, LiveGame } from '../../../shared/src/types';

const { width } = Dimensions.get('window');

export default function LiveTradingScreen() {
  // Dropdown state for selecting live game
  const [gameMenuVisible, setGameMenuVisible] = useState(false);
  // ...existing context destructuring...
  const {
    flashMultipliers,
    gameEvents,
    isConnected,
    joinLiveTrading,
    liveGame,
    setLiveGame,
    liveGames
  } = useSocket();
  // Now initialize selectedGameId after liveGame is defined
  const [selectedGameId, setSelectedGameId] = useState<string | null>(liveGame?.id || null);
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMultiplier, setFilterMultiplier] = useState(false);
  // Notification badge state for chat
  const [unreadMessages, setUnreadMessages] = useState(0);
  const chatRef = useRef<any>(null);
  const { players, loading, executeTrade } = useGame();
  console.log('[LiveTradingScreen] mount: isConnected, liveGame, liveGames, players:', isConnected, liveGame, liveGames?.length, players?.length);
  // (Removed duplicate destructuring)
  const { portfolio, refreshPortfolio } = usePortfolio();

  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [tradeModalVisible, setTradeModalVisible] = useState(false);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [refreshing, setRefreshing] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  // Listen for new chat messages via WebSocket
  useEffect(() => {
    if (!chatVisible && window && window.addEventListener) {
      // Listen for custom event from LiveChat
      const handler = (e: any) => {
        setUnreadMessages((prev) => prev + 1);
      };
      window.addEventListener('livechat:new_message', handler);
      return () => window.removeEventListener('livechat:new_message', handler);
    }
  }, [chatVisible]);

  // Reset unread count when chat is opened
  useEffect(() => {
    if (chatVisible) setUnreadMessages(0);
  }, [chatVisible]);

  useEffect(() => {
    if (isConnected) {
      console.log('[LiveTradingScreen] isConnected changed -> joining live trading');
      try { joinLiveTrading(); } catch (e) { console.warn('joinLiveTrading failed', e); }
      // If no liveGame yet, pick from list or force a demo
      if (!liveGame && liveGames && liveGames.length > 0) {
        console.log('[LiveTradingScreen] selecting first liveGame from list');
        setLiveGame(liveGames[0] as LiveGame);
      }
    }
  }, [isConnected]);

  useEffect(() => {
    if (flashMultipliers.size > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  }, [flashMultipliers]);

  // If still no liveGame but we have a list, pick one
  useEffect(() => {
    if (!liveGame && liveGames && liveGames.length > 0) {
      console.log('[LiveTradingScreen] ensuring liveGame from liveGames update');
      setLiveGame(liveGames[0] as LiveGame);
    }
  }, [liveGames, liveGame, setLiveGame]);

  // Absolute last-resort demo to prevent !liveGame state
  useEffect(() => {
    const t = setTimeout(() => {
      if (!liveGame) {
        const demo: LiveGame = {
          id: 'demo-screen',
          homeTeam: 'LAL',
          awayTeam: 'BOS',
          homeScore: 0,
          awayScore: 0,
          quarter: 1,
          timeRemaining: '12:00',
          isActive: true,
          startTime: Date.now(),
          activePlayers: [],
        };
        console.warn('[LiveTradingScreen] forcing DEMO liveGame fallback');
        setLiveGame(demo);
      }
    }, 2500);
    return () => clearTimeout(t);
  }, [liveGame, setLiveGame]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshPortfolio();
    setRefreshing(false);
  };

  const handleQuickBuy = (player: Player) => {
    setSelectedPlayer(player);
    setTradeType('buy');
    setTradeModalVisible(true);
  };

  const handleQuickSell = (player: Player) => {
    setSelectedPlayer(player);
    setTradeType('sell');
    setTradeModalVisible(true);
  };

  const handleConfirmTrade = async (trade: TradeRequest) => {
    try {
      await executeTrade({ ...trade, accountType: 'live' });
      await refreshPortfolio();
      Alert.alert('Trade Executed!', `Successfully ${trade.type === 'buy' ? 'bought' : 'sold'} ${trade.shares} share(s)`);
    } catch (error) {
      Alert.alert('Trade Failed', error instanceof Error ? error.message : 'Failed to execute trade');
    }
  };

  // ...existing code...

  const renderFlashMultipliers = () => {
    if (flashMultipliers.size === 0) return null;

    return (
      <View style={styles.flashSection}>
        <View style={styles.flashHeader}>
          <Text style={styles.flashTitle}>⚡ FLASH MULTIPLIERS ACTIVE</Text>
        </View>

        {Array.from(flashMultipliers.values()).map((flash: FlashMultiplier) => (
          <View
            key={flash.playerId}
            style={styles.flashItem}
            onTouchEnd={() => {
              // Open trade modal for player when notification is clicked
              const player = players.find(p => p.id === flash.playerId);
              if (player) {
                setSelectedPlayer(player);
                setTradeType('buy');
                setTradeModalVisible(true);
              }
            }}
          >
            <View style={styles.flashContent}>
              <Text style={styles.flashPlayerName}>{flash.playerName}</Text>
              <Text style={styles.flashDescription}>{flash.eventDescription}</Text>
            </View>
            <View style={styles.flashMultiplier}>
              <Text style={styles.flashMultiplierText}>{flash.multiplier}x</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderPlayers = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading players...</Text>
        </View>
      );
    }

    // Filter for active players if game is live, otherwise show all
    let displayPlayers = liveGame
      ? players.filter(p => liveGame.activePlayers.includes(p.id))
      : players;

    // Filter by search query
    if (searchQuery) {
      displayPlayers = displayPlayers.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.team.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by multiplier
    if (filterMultiplier) {
      displayPlayers = displayPlayers.filter(p => flashMultipliers.has(p.id));
    }

    // Sort so players with active multipliers are at the top
    displayPlayers = [...displayPlayers].sort((a, b) => {
      const aHas = flashMultipliers.has(a.id);
      const bHas = flashMultipliers.has(b.id);
      if (aHas === bHas) return 0;
      return aHas ? -1 : 1;
    });

    return (
      <View style={styles.playersSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {liveGame ? 'Live Players' : 'All Players'}
          </Text>
          <Text style={styles.sectionSubtitle}>
            {displayPlayers.length} players available
          </Text>
        </View>

        {/* Search and filter bar */}
        <View style={{ flexDirection: 'row', marginBottom: 12, gap: 8 }}>
          <View style={{ flex: 1 }}>
            <TextInput
              placeholder="Search players or teams..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{ backgroundColor: theme.colors.surfaceVariant, borderRadius: 8, paddingHorizontal: 12 }}
              dense
            />
          </View>
          <Button
            mode={filterMultiplier ? 'contained' : 'outlined'}
            onPress={() => setFilterMultiplier(f => !f)}
            style={{ borderRadius: 8 }}
            compact
          >
            Multiplier
          </Button>
        </View>

        <View style={styles.playersGrid}>
          {displayPlayers.map((player, index) => {
            const multiplier = flashMultipliers.get(player.id)?.multiplier;

            return (
              <View
                key={`player-${player.id}-${index}`}
                style={styles.playerCardWrapper}
              >
                <PlayerCard
                  player={player}
                  onBuy={() => handleQuickBuy(player)}
                  onSell={() => handleQuickSell(player)}
                  flashMultiplier={multiplier}
                  isLive={liveGame?.activePlayers.includes(player.id)}
                  compact={false}
                />
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderRecentEvents = () => {
    if (gameEvents.length === 0 || !liveGame) return null;

    return (
      <View style={styles.eventsSection}>
        <Text style={styles.sectionTitle}>Recent Events</Text>

        {gameEvents.slice(0, 3).map((event) => (
          <View key={event.id} style={styles.eventItem}>
            <View style={styles.eventContent}>
              <Text style={styles.eventDescription}>{event.description}</Text>
              <Text style={styles.eventTime}>Q{event.quarter} • {event.gameTime}</Text>
            </View>
            {event.multiplier && (
              <View style={styles.eventMultiplier}>
                <Text style={styles.eventMultiplierText}>
                  {event.multiplier}x
                </Text>
              </View>
            )}
          </View>
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
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <GameHeader
          liveGames={liveGames}
          selectedGameId={selectedGameId}
          setSelectedGameId={setSelectedGameId}
          setLiveGame={setLiveGame}
          liveGame={liveGame}
          portfolio={portfolio}
          theme={theme}
        />
        <FlashMultipliers
          flashMultipliers={flashMultipliers}
          players={players}
          setSelectedPlayer={setSelectedPlayer}
          setTradeType={setTradeType}
          setTradeModalVisible={setTradeModalVisible}
        />
        <PlayerList
          players={players}
          liveGame={liveGame}
          flashMultipliers={flashMultipliers}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterMultiplier={filterMultiplier}
          setFilterMultiplier={setFilterMultiplier}
          handleQuickBuy={handleQuickBuy}
          handleQuickSell={handleQuickSell}
          theme={theme}
        />
        <RecentEvents
          gameEvents={gameEvents}
          liveGame={liveGame}
        />
      </ScrollView>

      <TradeModal
        visible={tradeModalVisible}
        player={selectedPlayer}
        tradeType={tradeType}
        availableBalance={portfolio?.availableBalance || 0}
        onClose={() => setTradeModalVisible(false)}
        onConfirmTrade={handleConfirmTrade}
        isLive={true}
        tradesRemaining={portfolio?.tradesRemaining || 0}
      />

      {/* Chat FAB - always visible */}
      <View>
        <FAB
          icon="chat"
          style={styles.chatFAB}
          onPress={() => setChatVisible(true)}
          label="Chat"
        />
        {unreadMessages > 0 && (
          <View style={styles.chatBadge}>
            <Text style={styles.chatBadgeText}>{unreadMessages}</Text>
          </View>
        )}
      </View>

      {/* Live Chat Modal */}
      <LiveChat
        visible={chatVisible}
        onClose={() => setChatVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  chatBadge: {
    position: 'absolute',
    right: 10,
    bottom: 60,
    backgroundColor: theme.colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  chatBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 4,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
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
    fontSize: 16,
    fontWeight: '500',
  },

  // No game state
  noGameContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  noGameTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.onBackground,
    marginTop: 16,
    marginBottom: 8,
  },
  noGameSubtitle: {
    fontSize: 16,
    color: theme.colors.neutral,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Game header
  gameHeader: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: theme.colors.surface,
    marginBottom: 16,
  },
  liveIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.liveActive,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginRight: 6,
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  gameTime: {
    color: theme.colors.neutral,
    fontSize: 14,
    fontWeight: '600',
  },

  // Score
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  teamContainer: {
    alignItems: 'center',
    flex: 1,
  },
  teamName: {
    color: theme.colors.onSurface,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  teamScore: {
    color: theme.colors.onSurface,
    fontSize: 32,
    fontWeight: '900',
  },
  scoreDivider: {
    paddingHorizontal: 20,
  },
  scoreSeparator: {
    color: theme.colors.neutral,
    fontSize: 24,
    fontWeight: '300',
  },

  // Trading stats
  tradingStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardBorder,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    color: theme.colors.onSurface,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    color: theme.colors.neutral,
    fontSize: 12,
    fontWeight: '500',
  },

  // Flash multipliers
  flashSection: {
    marginHorizontal: 8,
    marginBottom: 8,
    backgroundColor: theme.colors.multiplierBg,
    borderRadius: 8,
    padding: 6,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    minHeight: 32,
  },
  flashHeader: {
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 2,
  },
  flashTitle: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 2,
  },
  flashItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.cardBorder,
    minHeight: 24,
  },
  flashContent: {
    flex: 1,
  },
  flashPlayerName: {
    color: theme.colors.onSurface,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 1,
  },
  flashDescription: {
    color: theme.colors.neutral,
    fontSize: 11,
    fontWeight: '400',
  },
  flashMultiplier: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    minWidth: 28,
    alignItems: 'center',
  },
  flashMultiplierText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  // Players section
  playersSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: theme.colors.onBackground,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: theme.colors.neutral,
    fontSize: 14,
    fontWeight: '500',
  },
  playersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  playerCardWrapper: {
    width: '48%',
    marginBottom: 12,
  },

  // Events section
  eventsSection: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 20,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  eventContent: {
    flex: 1,
  },
  eventDescription: {
    color: theme.colors.onSurface,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  eventTime: {
    color: theme.colors.neutral,
    fontSize: 12,
    fontWeight: '500',
  },
  eventMultiplier: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  eventMultiplierText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  // Chat FAB
  chatFAB: {
    position: 'absolute',
    right: 16,
    bottom: 20,
    backgroundColor: theme.colors.primary,
  },
});