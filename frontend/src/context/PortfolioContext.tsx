import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Portfolio, Holding, Player } from '../../../shared/src/types';
import { apiService } from '../services/api';
import { useAuth } from './AuthContext';

interface PortfolioContextType {
  portfolio: Portfolio | null;
  loading: boolean;
  error: string | null;
  refreshPortfolio: () => Promise<void>;
  updateHoldingPrice: (playerId: string, newPrice: number) => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (user) {
      fetchPortfolio();
    } else if (!authLoading) {
      // If auth loading is complete but no user, set loading to false
      setLoading(false);
      setPortfolio(null);
    }
  }, [user, authLoading]);

  const fetchPortfolio = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getPortfolio(user.id);

      if (response.success && response.data) {
        setPortfolio(response.data);
      } else {
        setError(response.error || 'Failed to fetch portfolio');
      }
    } catch (err) {
      console.error('Error fetching portfolio:', err);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const refreshPortfolio = async () => {
    await fetchPortfolio();
  };

  const updateHoldingPrice = (playerId: string, newPrice: number) => {
    if (!portfolio) return;

    console.log('🔄 Price update received:', playerId, newPrice);

    // Temporarily disable debounce to test
    // if (updateTimeoutRef.current) {
    //   clearTimeout(updateTimeoutRef.current);
    // }

    // updateTimeoutRef.current = setTimeout(() => {
      console.log('📊 Updating portfolio for player:', playerId);
      const updateHoldings = (holdings: Holding[]): Holding[] => {
        return holdings.map(holding => {
          if (holding.playerId === playerId) {
            const totalValue = holding.shares * newPrice;
            const unrealizedPL = totalValue - (holding.shares * holding.averagePrice);
            const unrealizedPLPercent = ((totalValue - (holding.shares * holding.averagePrice)) / (holding.shares * holding.averagePrice)) * 100;

            return {
              ...holding,
              currentPrice: newPrice,
              totalValue: Math.round(totalValue * 100) / 100,
              unrealizedPL: Math.round(unrealizedPL * 100) / 100,
              unrealizedPLPercent: Math.round(unrealizedPLPercent * 100) / 100
            };
          }
          return holding;
        });
      };

      const updatedSeasonHoldings = updateHoldings(portfolio.seasonHoldings);
      const updatedLiveHoldings = updateHoldings(portfolio.liveHoldings);

      // Recalculate total values
      const seasonValue = updatedSeasonHoldings.reduce((sum, h) => sum + h.totalValue, 0);
      const liveValue = updatedLiveHoldings.reduce((sum, h) => sum + h.totalValue, 0);
      const totalValue = seasonValue + liveValue + portfolio.availableBalance;

      // Update P&L
      const seasonPL = updatedSeasonHoldings.reduce((sum, h) => sum + h.unrealizedPL, 0);
      const livePL = updatedLiveHoldings.reduce((sum, h) => sum + h.unrealizedPL, 0);

      setPortfolio({
        ...portfolio,
        seasonHoldings: updatedSeasonHoldings,
        liveHoldings: updatedLiveHoldings,
        totalValue: Math.round(totalValue * 100) / 100,
        seasonPL: Math.round(seasonPL * 100) / 100,
        livePL: Math.round(livePL * 100) / 100,
        lastUpdated: Date.now()
      });
    // }, 500); // Debounce for 500ms to prevent rapid updates
  };

  const value: PortfolioContextType = {
    portfolio,
    loading,
    error,
    refreshPortfolio,
    updateHoldingPrice,
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
}