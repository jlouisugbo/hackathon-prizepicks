import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { apiService } from '../services/api';
import { io, Socket } from 'socket.io-client';
import Constants from 'expo-constants';

import {
  Player,
  FlashMultiplier,
  GameEvent,
  LeaderboardEntry,
  ChatMessage,
  MarketData,
  NotificationData,
  Trade,
  Portfolio,
  LiveGame
} from '../../../shared/src/types';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  priceUpdates: Map<string, { price: number; change: number; changePercent: number }>;
  flashMultipliers: Map<string, FlashMultiplier>;
  gameEvents: GameEvent[];
  leaderboard: LeaderboardEntry[];
  chatMessages: ChatMessage[];
  marketData: MarketData | null;
  notifications: NotificationData[];
  userCount: number;
  liveGame: LiveGame | null;
  setLiveGame: (game: LiveGame | null) => void;
  liveGames: LiveGame[];
  tradeFeed: any[];
  marketImpacts: any[];
  volumeAlerts: any[];
  marketSentiment: any | null;

  // Socket actions
  joinRoom: (userId: string, username: string) => void;
  sendChatMessage: (message: string) => void;
  subscribeToPlayer: (playerId: string) => void;
  unsubscribeFromPlayer: (playerId: string) => void;
  joinLiveTrading: () => void;
  leaveLiveTrading: () => void;
  subscribeToLeaderboard: (type: 'season' | 'live' | 'daily') => void;
  subscribeToPortfolio: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

const SOCKET_URL = Constants.expoConfig?.extra?.socketUrl || 'http://localhost:3001';
const MAX_CHAT_MESSAGES = 100;
const MAX_GAME_EVENTS = 50;
const MAX_NOTIFICATIONS = 20;

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [priceUpdates, setPriceUpdates] = useState(new Map());
  const [flashMultipliers, setFlashMultipliers] = useState<Map<string, FlashMultiplier>>(new Map());
  const [gameEvents, setGameEvents] = useState<GameEvent[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [liveGame, setLiveGame] = useState<LiveGame | null>(null);
  const [liveGames, setLiveGames] = useState<LiveGame[]>([]);
  const [tradeFeed, setTradeFeed] = useState<any[]>([]);
  const [marketImpacts, setMarketImpacts] = useState<any[]>([]);
  const [volumeAlerts, setVolumeAlerts] = useState<any[]>([]);
  const [marketSentiment, setMarketSentiment] = useState<any | null>(null);
  // Keep a ref to current liveGames for event handlers
  const liveGamesRef = useRef<LiveGame[]>([]);
  useEffect(() => { liveGamesRef.current = liveGames; }, [liveGames]);

  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const isConnectingRef = useRef(false);
  const hasJoinedRoomRef = useRef(false);

  useEffect(() => {
    if (!isConnectingRef.current) {
      connectSocket();
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  // Fallback: Ensure we always have a liveGame set
  const ensureLiveGame = async (reason: string) => {
    try {
      console.log(`🛟 ensureLiveGame invoked (${reason}). Current liveGame:`, liveGame);
      if (liveGame) return;
      // Try REST API first
      const resp = await apiService.getCurrentGame();
      if (resp?.success && resp.data) {
        console.log('🛟 ensureLiveGame: using REST current game:', resp.data);
        setLiveGames([resp.data]);
        setLiveGame(resp.data);
        return;
      }
    } catch (e) {
      console.warn('🛟 ensureLiveGame REST failed:', e);
    }
    // Hardcoded demo as last resort
    const demo: LiveGame = {
      id: 'demo-1',
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
    console.log('🛟 ensureLiveGame: setting DEMO liveGame fallback:', demo);
    setLiveGames([demo]);
    setLiveGame(demo);
  };

  const connectSocket = () => {
    if (isConnectingRef.current) return;
    
    isConnectingRef.current = true;
    console.log('🔌 Connecting to socket server:', SOCKET_URL);

    const newSocket = io(SOCKET_URL, {
      path: '/socket.io/',
      transports: ['polling', 'websocket'],
      timeout: 30000,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      autoConnect: true,
    });

    // Global event logger for debugging
    newSocket.onAny((event, ...args) => {
      console.log(`[Socket] Event: ${event}`, ...args);
    });

    // Fallback: listen for single live_game event
    newSocket.on('live_game', (game: LiveGame) => {
      console.log('[Socket] live_game received:', game);
      setLiveGames([game]);
      setLiveGame(game);
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id);
      console.log('🔌 Transport:', newSocket.io.engine.transport.name);
      console.log('🌐 URL:', SOCKET_URL);
      setIsConnected(true);
      reconnectAttempts.current = 0;
      // Proactively join and request live games
      try {
        newSocket.emit('join_live_trading');
        newSocket.emit('request_live_games'); // if backend supports; harmless otherwise
      } catch (e) {
        console.warn('⚠️ emit on connect failed:', e);
      }
      // Also ensure we have a live game via REST fallback
      ensureLiveGame('on-connect');
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      setIsConnected(false);
      hasJoinedRoomRef.current = false; // Reset room join flag

      // Auto-reconnect logic
      if (reason === 'io server disconnect') {
        // Server disconnected, reconnect manually
        handleReconnect();
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      setIsConnected(false);
      handleReconnect();
    });

    // Real-time data events
    newSocket.on('price_update', (data: { playerId: string; price: number; change: number; changePercent: number }) => {
      setPriceUpdates(prev => {
        const updated = new Map(prev);
        updated.set(data.playerId, {
          price: data.price,
          change: data.change,
          changePercent: data.changePercent
        });
        return updated;
      });
    });

    newSocket.on('flash_multiplier', (data: FlashMultiplier) => {
      setFlashMultipliers(prev => {
        const updated = new Map(prev);
        updated.set(data.playerId, data);
        return updated;
      });

      // Auto-remove after duration
      setTimeout(() => {
        setFlashMultipliers(prev => {
          const updated = new Map(prev);
          updated.delete(data.playerId);
          return updated;
        });
      }, data.duration);
    });

    newSocket.on('flash_multiplier_expired', (data: { playerId: string }) => {
      setFlashMultipliers(prev => {
        const updated = new Map(prev);
        updated.delete(data.playerId);
        return updated;
      });
    });

    newSocket.on('game_event', (event: GameEvent) => {
      setGameEvents(prev => [event, ...prev].slice(0, MAX_GAME_EVENTS));
    });

    newSocket.on('leaderboard_update', (data: { type: string; leaderboard: LeaderboardEntry[] }) => {
      setLeaderboard(data.leaderboard);
    });

    newSocket.on('chat_message', (message: ChatMessage) => {
      setChatMessages(prev => [...prev, message].slice(-MAX_CHAT_MESSAGES));
    });

    newSocket.on('market_data', (data: MarketData) => {
      setMarketData(data);
    });

    newSocket.on('notification', (notification: NotificationData) => {
      setNotifications(prev => [notification, ...prev].slice(0, MAX_NOTIFICATIONS));
    });

    newSocket.on('user_count', (count: number) => {
      setUserCount(count);
    });

    newSocket.on('trade_executed', (trade: Trade) => {
      // Handle trade execution confirmation
      console.log('💰 Trade executed:', trade);
    });

    newSocket.on('portfolio_update', (portfolio: Portfolio) => {
      // Handle portfolio updates
      console.log('💼 Portfolio updated:', portfolio);
    });

    newSocket.on('pong', (data: { timestamp: number }) => {
      // Handle ping response for connection health
      console.log('🏓 Pong received, latency:', Date.now() - data.timestamp, 'ms');
    });

    // Listen for multiple live games
    newSocket.on('live_games', (games: LiveGame[]) => {
      console.log('[Socket] live_games received:', games);
      setLiveGames(games);
      // Always set liveGame to first if none selected or if current is not in the list
      if (games.length > 0 && (!liveGame || !games.some(g => g.id === liveGame.id))) {
        setLiveGame(games[0]);
        console.log('[Socket] liveGame set to:', games[0]);
      } else {
        console.log('[Socket] liveGame remains:', liveGame);
      }
    });

    newSocket.on('game_score_update', (data: {
      gameId?: string;
      homeScore: number;
      awayScore: number;
      quarter: number;
      timeRemaining: string;
      lastScore?: {
        team: 'home' | 'away';
        points: number;
        teamName: string;
      };
    }) => {
      console.log('🏀 [Frontend] game_score_update received:', data);
      // Update liveGames list
      setLiveGames(prevGames => {
        if (data.gameId) {
          return prevGames.map(game =>
            game.id === data.gameId
              ? { ...game, homeScore: data.homeScore, awayScore: data.awayScore, quarter: data.quarter, timeRemaining: data.timeRemaining }
              : game
          );
        }
        // No gameId: update first game or selected
        if (prevGames.length > 0) {
          const idx = liveGame ? prevGames.findIndex(g => g.id === liveGame.id) : 0;
          const targetIndex = idx >= 0 ? idx : 0;
          const updated = [...prevGames];
          updated[targetIndex] = {
            ...updated[targetIndex],
            homeScore: data.homeScore,
            awayScore: data.awayScore,
            quarter: data.quarter,
            timeRemaining: data.timeRemaining,
          } as any;
          return updated;
        }
        return prevGames;
      });

      // Update selected liveGame
      setLiveGame(prev => {
        // If we don't have a liveGame yet OR it's a demo, adopt the update
        const isDemo = prev && typeof prev.id === 'string' && prev.id.startsWith('demo');
        if (!prev || isDemo) {
          const fromList = data.gameId ? liveGamesRef.current.find(g => g.id === data.gameId) : (liveGamesRef.current[0] || null);
          if (fromList) {
            return {
              ...fromList,
              homeScore: data.homeScore,
              awayScore: data.awayScore,
              quarter: data.quarter,
              timeRemaining: data.timeRemaining,
            };
          }
          // Synthesize minimal object if not found
          return {
            id: data.gameId || (prev?.id || 'unknown'),
            homeTeam: prev?.homeTeam || 'HOME',
            awayTeam: prev?.awayTeam || 'AWAY',
            homeScore: data.homeScore,
            awayScore: data.awayScore,
            quarter: data.quarter,
            timeRemaining: data.timeRemaining,
            isActive: true,
            startTime: prev?.startTime || Date.now(),
            activePlayers: prev?.activePlayers || [],
          } as LiveGame;
        }
        // If update belongs to a different game than the one selected, ignore
        if (data.gameId && prev.id !== data.gameId) return prev;
        // Normal update path
        return {
          ...prev,
          homeScore: data.homeScore,
          awayScore: data.awayScore,
          quarter: data.quarter,
          timeRemaining: data.timeRemaining,
        };
      });

      if (data.lastScore) {
        console.log(`🏀 ${data.lastScore.teamName} scores ${data.lastScore.points} points!`);
      }
    });

    // Market Impact Events
    newSocket.on('trade_feed', (trade: any) => {
      setTradeFeed(prev => [trade, ...prev].slice(0, 50)); // Keep last 50 trades
    });

    newSocket.on('market_impact', (impact: any) => {
      setMarketImpacts(prev => [impact, ...prev].slice(0, 20)); // Keep last 20 impacts
      console.log('📈 Market Impact:', impact.description);
    });

    newSocket.on('volume_alert', (alert: any) => {
      setVolumeAlerts(prev => [alert, ...prev].slice(0, 10)); // Keep last 10 alerts
      console.log('📊 Volume Alert:', alert.description);
    });

    newSocket.on('market_sentiment', (sentiment: any) => {
      setMarketSentiment(sentiment);
      console.log('📊 Market Sentiment:', sentiment.sentiment);
    });

    newSocket.on('trading_activity', (activity: any) => {
      console.log('📊 Trading Activity:', activity.playerName);
    });

    // Set socket after all event listeners are attached
    setSocket(newSocket);
    isConnectingRef.current = false;
    // Schedule a delayed fallback if still no live game after socket setup
    setTimeout(() => {
      if (!liveGame) {
        ensureLiveGame('post-connect-timeout');
      }
    }, 2000);
  };

  const handleReconnect = () => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      console.log('❌ Max reconnection attempts reached');
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000); // Exponential backoff, max 10s
    reconnectAttempts.current += 1;

    console.log(`🔄 Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts.current})`);

    reconnectTimeoutRef.current = setTimeout(() => {
      connectSocket();
    }, delay);
  };

  // Socket action functions
  const joinRoom = (userId: string, username: string) => {
    if (socket && isConnected && !hasJoinedRoomRef.current) {
      hasJoinedRoomRef.current = true;
      socket.emit('join_room', { userId, username });
    }
  };

  const sendChatMessage = (message: string) => {
    if (socket && isConnected && message.trim()) {
      socket.emit('send_chat_message', message.trim());
    }
  };

  const subscribeToPlayer = (playerId: string) => {
    if (socket && isConnected) {
      socket.emit('subscribe_player', playerId);
    }
  };

  const unsubscribeFromPlayer = (playerId: string) => {
    if (socket && isConnected) {
      socket.emit('unsubscribe_player', playerId);
    }
  };

  const joinLiveTrading = () => {
    if (socket && isConnected) {
      socket.emit('join_live_trading');
    }
  };

  const leaveLiveTrading = () => {
    if (socket && isConnected) {
      socket.emit('leave_live_trading');
    }
  };

  const subscribeToLeaderboard = (type: 'season' | 'live' | 'daily') => {
    if (socket && isConnected) {
      socket.emit('subscribe_leaderboard', type);
    }
  };

  const subscribeToPortfolio = () => {
    if (socket && isConnected) {
      socket.emit('subscribe_portfolio');
    }
  };

  // Ping for connection health
  useEffect(() => {
    if (socket && isConnected) {
      const pingInterval = setInterval(() => {
        socket.emit('ping');
      }, 30000); // Ping every 30 seconds

      return () => clearInterval(pingInterval);
    }
  }, [socket, isConnected]);

  const value: SocketContextType = {
    socket,
    isConnected,
    priceUpdates,
    flashMultipliers,
    gameEvents,
    leaderboard,
    chatMessages,
    marketData,
    notifications,
    userCount,
  liveGame,
  setLiveGame,
  liveGames,
    tradeFeed,
    marketImpacts,
    volumeAlerts,
    marketSentiment,
    joinRoom,
    sendChatMessage,
    subscribeToPlayer,
    unsubscribeFromPlayer,
    joinLiveTrading,
    leaveLiveTrading,
    subscribeToLeaderboard,
    subscribeToPortfolio,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}