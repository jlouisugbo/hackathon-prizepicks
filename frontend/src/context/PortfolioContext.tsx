import React, { createContext, useContext, useState, useEffect } from 'react';
import { Portfolio, Holding, Player } from '../../../shared/src/types';
import { apiService } from '../services/api';

interface PortfolioContextType {
  portfolio: Portfolio | null;
  loading: boolean;
  error: string | null;
  refreshPortfolio: () => Promise<void>;
  updateHoldingPrice: (playerId: string, newPrice: number) => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

// Demo user ID - in a real app this would come from authentication
const DEMO_USER_ID = 'user-1';

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getPortfolio(DEMO_USER_ID);

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