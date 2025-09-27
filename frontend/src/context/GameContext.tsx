import React, { createContext, useContext, useState, useEffect } from 'react';
import { LiveGame, Player } from '../../../shared/src/types';
import { apiService } from '../services/api';

interface GameContextType {
  currentGame: LiveGame | null;
  players: Player[];
  loading: boolean;
  error: string | null;
  refreshGame: () => Promise<void>;
  refreshPlayers: () => Promise<void>;
  updatePlayerPrice: (playerId: string, newPrice: number, change: number, changePercent: number) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [currentGame, setCurrentGame] = useState<LiveGame | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeGameData();
  }, []);

  const initializeGameData = async () => {
    await Promise.all([
      fetchCurrentGame(),
      fetchPlayers()
    ]);
    setLoading(false);
  };

  const fetchCurrentGame = async () => {
    try {
      const response = await apiService.getCurrentGame();

      if (response.success && response.data) {
        setCurrentGame(response.data);
      } else {
        // No active game is not an error
        setCurrentGame(null);
      }
    } catch (err) {
      console.error('Error fetching current game:', err);
      setError('Failed to fetch game data');
    }
  };

  const fetchPlayers = async () => {
    try {
      const response = await apiService.getPlayers();

      if (response.success && response.data) {
        setPlayers(response.data);
      } else {
        setError(response.error || 'Failed to fetch players');
      }
    } catch (err) {
      console.error('Error fetching players:', err);
      setError('Failed to fetch players');
    }
  };

  const refreshGame = async () => {
    await fetchCurrentGame();
  };

  const refreshPlayers = async () => {
    await fetchPlayers();
  };

  const updatePlayerPrice = (playerId: string, newPrice: number, change: number, changePercent: number) => {
    setPlayers(prevPlayers =>
      prevPlayers.map(player => {
        if (player.id === playerId) {
          // Add to price history
          const newPricePoint = {
            timestamp: Date.now(),
            price: newPrice,
            volume: Math.floor(Math.random() * 1000) + 100
          };

          const updatedHistory = [...player.priceHistory, newPricePoint];

          // Keep only last 100 points for performance
          if (updatedHistory.length > 100) {
            updatedHistory.shift();
          }

          return {
            ...player,
            currentPrice: newPrice,
            priceChange24h: change,
            priceChangePercent24h: changePercent,
            priceHistory: updatedHistory
          };
        }
        return player;
      })
    );
  };

  const value: GameContextType = {
    currentGame,
    players,
    loading,
    error,
    refreshGame,
    refreshPlayers,
    updatePlayerPrice,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}