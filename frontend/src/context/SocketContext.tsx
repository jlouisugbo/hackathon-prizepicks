import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
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
  Portfolio
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

  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    connectSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  const connectSocket = () => {
    console.log('🔌 Connecting to socket server:', SOCKET_URL);

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id);
      setIsConnected(true);
      reconnectAttempts.current = 0;
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      setIsConnected(false);

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

    setSocket(newSocket);
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
    if (socket && isConnected) {
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