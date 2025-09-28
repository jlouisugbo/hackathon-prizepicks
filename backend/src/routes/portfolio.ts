import express from 'express';
import { getPortfolios, getUsers, portfolios, getPlayers } from '../data/mockData';
import { databaseService } from '../services/databaseService';
import { ApiResponse, Portfolio, Holding } from '../types';

const router = express.Router();

// GET /api/portfolio/:userId - Get user portfolio
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Try to get from Supabase first
    let portfolio = await databaseService.getPortfolioByUserId(userId);
    
    // Fallback to mock data if Supabase is not configured
    if (!portfolio) {
      const portfolioList = getPortfolios();
      portfolio = portfolioList.find(p => p.userId === userId);

      // If still not found, generate a dummy portfolio for any user ID
      if (!portfolio) {
        console.log(`📊 Generating dummy portfolio for user: ${userId}`);
        portfolio = generateDummyPortfolio(userId);
      }
    }

    const response: ApiResponse<Portfolio> = {
      success: true,
      data: portfolio,
      message: `Retrieved portfolio for user ${userId}`
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch portfolio',
      message: 'An error occurred while retrieving portfolio'
    });
  }
});

// GET /api/portfolio/:userId/performance - Get portfolio performance stats
router.get('/:userId/performance', (req, res) => {
  try {
    const { userId } = req.params;
    const portfolioList = getPortfolios();
    const portfolio = portfolioList.find(p => p.userId === userId);

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        error: 'Portfolio not found',
        message: `Portfolio for user ${userId} not found`
      });
    }

    // Calculate performance metrics
    const totalInvested = portfolio.seasonHoldings.reduce((sum, holding) =>
      sum + (holding.shares * holding.averagePrice), 0) +
      portfolio.liveHoldings.reduce((sum, holding) =>
        sum + (holding.shares * holding.averagePrice), 0);

    const totalCurrentValue = portfolio.totalValue;
    const totalReturn = totalCurrentValue - totalInvested;
    const totalReturnPercent = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

    const seasonInvested = portfolio.seasonHoldings.reduce((sum, holding) =>
      sum + (holding.shares * holding.averagePrice), 0);
    const seasonCurrentValue = portfolio.seasonHoldings.reduce((sum, holding) =>
      sum + holding.totalValue, 0);
    const seasonReturn = seasonCurrentValue - seasonInvested;
    const seasonReturnPercent = seasonInvested > 0 ? (seasonReturn / seasonInvested) * 100 : 0;

    const liveInvested = portfolio.liveHoldings.reduce((sum, holding) =>
      sum + (holding.shares * holding.averagePrice), 0);
    const liveCurrentValue = portfolio.liveHoldings.reduce((sum, holding) =>
      sum + holding.totalValue, 0);
    const liveReturn = liveCurrentValue - liveInvested;
    const liveReturnPercent = liveInvested > 0 ? (liveReturn / liveInvested) * 100 : 0;

    const performanceData = {
      totalInvested: Math.round(totalInvested * 100) / 100,
      totalCurrentValue: Math.round(totalCurrentValue * 100) / 100,
      totalReturn: Math.round(totalReturn * 100) / 100,
      totalReturnPercent: Math.round(totalReturnPercent * 100) / 100,
      todaysPL: portfolio.todaysPL,
      season: {
        invested: Math.round(seasonInvested * 100) / 100,
        currentValue: Math.round(seasonCurrentValue * 100) / 100,
        return: Math.round(seasonReturn * 100) / 100,
        returnPercent: Math.round(seasonReturnPercent * 100) / 100,
        holdingsCount: portfolio.seasonHoldings.length
      },
      live: {
        invested: Math.round(liveInvested * 100) / 100,
        currentValue: Math.round(liveCurrentValue * 100) / 100,
        return: Math.round(liveReturn * 100) / 100,
        returnPercent: Math.round(liveReturnPercent * 100) / 100,
        holdingsCount: portfolio.liveHoldings.length,
        tradesRemaining: portfolio.tradesRemaining
      }
    };

    const response: ApiResponse = {
      success: true,
      data: performanceData,
      message: `Retrieved performance stats for user ${userId}`
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching portfolio performance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch portfolio performance',
      message: 'An error occurred while calculating portfolio performance'
    });
  }
});

// GET /api/portfolio/:userId/holdings/:accountType - Get holdings for specific account type
router.get('/:userId/holdings/:accountType', (req, res) => {
  try {
    const { userId, accountType } = req.params;

    if (!['season', 'live'].includes(accountType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid account type',
        message: 'Account type must be "season" or "live"'
      });
    }

    const portfolioList = getPortfolios();
    const portfolio = portfolioList.find(p => p.userId === userId);

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        error: 'Portfolio not found',
        message: `Portfolio for user ${userId} not found`
      });
    }

    const holdings = accountType === 'season' ? portfolio.seasonHoldings : portfolio.liveHoldings;
    const sortBy = req.query.sortBy as string || 'totalValue';
    const order = req.query.order as string || 'desc';

    // Sort holdings
    const sortedHoldings = [...holdings].sort((a, b) => {
      let aValue = a[sortBy as keyof typeof a];
      let bValue = b[sortBy as keyof typeof b];

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return order === 'desc' ? bValue - aValue : aValue - bValue;
      } else if (typeof aValue === 'string' && typeof bValue === 'string') {
        return order === 'desc' ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
      }
      return 0;
    });

    const response: ApiResponse = {
      success: true,
      data: {
        accountType,
        holdings: sortedHoldings,
        totalValue: holdings.reduce((sum, h) => sum + h.totalValue, 0),
        totalPL: holdings.reduce((sum, h) => sum + h.unrealizedPL, 0),
        holdingsCount: holdings.length
      },
      message: `Retrieved ${holdings.length} ${accountType} holdings for user ${userId}`
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching holdings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch holdings',
      message: 'An error occurred while retrieving holdings'
    });
  }
});

// PUT /api/portfolio/:userId/balance - Update available balance (for demo purposes)
router.put('/:userId/balance', (req, res) => {
  try {
    const { userId } = req.params;
    const { amount } = req.body;

    if (typeof amount !== 'number' || amount < 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount',
        message: 'Amount must be a positive number'
      });
    }

    const portfolioIndex = portfolios.findIndex(p => p.userId === userId);

    if (portfolioIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Portfolio not found',
        message: `Portfolio for user ${userId} not found`
      });
    }

    portfolios[portfolioIndex].availableBalance = Math.round(amount * 100) / 100;
    portfolios[portfolioIndex].lastUpdated = Date.now();

    const response: ApiResponse<Portfolio> = {
      success: true,
      data: portfolios[portfolioIndex],
      message: `Updated balance for user ${userId}`
    };

    res.json(response);
  } catch (error) {
    console.error('Error updating balance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update balance',
      message: 'An error occurred while updating balance'
    });
  }
});

// Helper function to generate dummy portfolio for any user ID
function generateDummyPortfolio(userId: string): Portfolio {
  const players = getPlayers();
  const seasonHoldings: Holding[] = [];
  const liveHoldings: Holding[] = [];

  // Generate 3-5 season holdings
  const numSeasonHoldings = Math.floor(Math.random() * 3) + 3;
  for (let i = 0; i < numSeasonHoldings; i++) {
    const player = players[Math.floor(Math.random() * players.length)];
    const shares = Math.floor(Math.random() * 20) + 5; // 5-25 shares
    const averagePrice = player.currentPrice * (0.85 + Math.random() * 0.3); // ±15% from current
    const totalValue = shares * player.currentPrice;
    const unrealizedPL = totalValue - (shares * averagePrice);
    const unrealizedPLPercent = (unrealizedPL / (shares * averagePrice)) * 100;

    seasonHoldings.push({
      playerId: player.id,
      playerName: player.name,
      shares,
      averagePrice: Math.round(averagePrice * 100) / 100,
      currentPrice: player.currentPrice,
      totalValue: Math.round(totalValue * 100) / 100,
      unrealizedPL: Math.round(unrealizedPL * 100) / 100,
      unrealizedPLPercent: Math.round(unrealizedPLPercent * 100) / 100,
      purchaseDate: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000 // Last 30 days
    });
  }

  // Generate 0-2 live holdings
  const numLiveHoldings = Math.floor(Math.random() * 3);
  for (let i = 0; i < numLiveHoldings; i++) {
    const player = players[Math.floor(Math.random() * players.length)];
    const shares = Math.floor(Math.random() * 10) + 2; // 2-12 shares
    const averagePrice = player.currentPrice * (0.9 + Math.random() * 0.2); // ±10% from current
    const totalValue = shares * player.currentPrice;
    const unrealizedPL = totalValue - (shares * averagePrice);
    const unrealizedPLPercent = (unrealizedPL / (shares * averagePrice)) * 100;

    liveHoldings.push({
      playerId: player.id,
      playerName: player.name,
      shares,
      averagePrice: Math.round(averagePrice * 100) / 100,
      currentPrice: player.currentPrice,
      totalValue: Math.round(totalValue * 100) / 100,
      unrealizedPL: Math.round(unrealizedPL * 100) / 100,
      unrealizedPLPercent: Math.round(unrealizedPLPercent * 100) / 100,
      purchaseDate: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000 // Last 7 days
    });
  }

  const seasonValue = seasonHoldings.reduce((sum, holding) => sum + holding.totalValue, 0);
  const liveValue = liveHoldings.reduce((sum, holding) => sum + holding.totalValue, 0);
  const totalValue = seasonValue + liveValue;
  const seasonPL = seasonHoldings.reduce((sum, holding) => sum + holding.unrealizedPL, 0);
  const livePL = liveHoldings.reduce((sum, holding) => sum + holding.unrealizedPL, 0);
  const todaysPL = (Math.random() - 0.5) * 500; // ±$250 daily P&L

  return {
    userId,
    seasonHoldings,
    liveHoldings,
    totalValue: Math.round(totalValue * 100) / 100,
    availableBalance: Math.round((10000 - seasonValue) * 100) / 100,
    todaysPL: Math.round(todaysPL * 100) / 100,
    seasonPL: Math.round(seasonPL * 100) / 100,
    livePL: Math.round(livePL * 100) / 100,
    tradesRemaining: Math.floor(Math.random() * 6), // 0-5 trades remaining
    lastUpdated: Date.now()
  };
}

export default router;