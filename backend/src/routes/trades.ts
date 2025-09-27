import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getPlayers, getPortfolios, getTrades, addTrade, portfolios, players } from '../data/mockData';
import { ApiResponse, Trade, TradeRequest, Portfolio } from '@player-stock-market/shared';

const router = express.Router();

// POST /api/trades/market - Execute market order
router.post('/market', (req, res) => {
  try {
    const tradeRequest: TradeRequest = req.body;
    const { playerId, type, shares, accountType } = tradeRequest;
    const userId = req.headers['user-id'] as string || 'user-1'; // Demo user ID

    // Validation
    if (!playerId || !type || !shares || !accountType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'playerId, type, shares, and accountType are required'
      });
    }

    if (!['buy', 'sell'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid trade type',
        message: 'Trade type must be "buy" or "sell"'
      });
    }

    if (!['season', 'live'].includes(accountType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid account type',
        message: 'Account type must be "season" or "live"'
      });
    }

    if (shares <= 0 || !Number.isInteger(shares)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid shares',
        message: 'Shares must be a positive integer'
      });
    }

    // Find player
    const playersList = getPlayers();
    const player = playersList.find(p => p.id === playerId);
    if (!player) {
      return res.status(404).json({
        success: false,
        error: 'Player not found',
        message: `Player with ID ${playerId} not found`
      });
    }

    // Find portfolio
    const portfoliosList = getPortfolios();
    const portfolioIndex = portfolios.findIndex(p => p.userId === userId);
    if (portfolioIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Portfolio not found',
        message: `Portfolio for user ${userId} not found`
      });
    }

    const portfolio = portfolios[portfolioIndex];
    const currentPrice = player.currentPrice;
    const totalAmount = shares * currentPrice;

    // Check live trading limits
    if (accountType === 'live' && portfolio.tradesRemaining <= 0) {
      return res.status(400).json({
        success: false,
        error: 'No trades remaining',
        message: 'You have no live trades remaining for today'
      });
    }

    let trade: Trade;

    if (type === 'buy') {
      // Check if user has enough balance
      if (portfolio.availableBalance < totalAmount) {
        return res.status(400).json({
          success: false,
          error: 'Insufficient funds',
          message: `You need $${totalAmount.toFixed(2)} but only have $${portfolio.availableBalance.toFixed(2)}`
        });
      }

      // Execute buy order
      portfolio.availableBalance -= totalAmount;

      // Add to holdings or update existing
      const holdings = accountType === 'season' ? portfolio.seasonHoldings : portfolio.liveHoldings;
      const existingHoldingIndex = holdings.findIndex(h => h.playerId === playerId);

      if (existingHoldingIndex >= 0) {
        // Update existing holding
        const holding = holdings[existingHoldingIndex];
        const totalShares = holding.shares + shares;
        const totalCost = (holding.shares * holding.averagePrice) + totalAmount;
        holding.averagePrice = totalCost / totalShares;
        holding.shares = totalShares;
        holding.currentPrice = currentPrice;
        holding.totalValue = totalShares * currentPrice;
        holding.unrealizedPL = holding.totalValue - totalCost;
        holding.unrealizedPLPercent = (holding.unrealizedPL / totalCost) * 100;
      } else {
        // Create new holding
        holdings.push({
          playerId,
          playerName: player.name,
          shares,
          averagePrice: currentPrice,
          currentPrice,
          totalValue: totalAmount,
          unrealizedPL: 0,
          unrealizedPLPercent: 0,
          purchaseDate: Date.now()
        });
      }

      trade = {
        id: uuidv4(),
        userId,
        playerId,
        playerName: player.name,
        type: 'buy',
        orderType: 'market',
        shares,
        price: currentPrice,
        timestamp: Date.now(),
        accountType,
        status: 'executed',
        totalAmount
      };

    } else {
      // Sell order
      const holdings = accountType === 'season' ? portfolio.seasonHoldings : portfolio.liveHoldings;
      const holdingIndex = holdings.findIndex(h => h.playerId === playerId);

      if (holdingIndex === -1) {
        return res.status(400).json({
          success: false,
          error: 'No holdings found',
          message: `You don't own any shares of ${player.name}`
        });
      }

      const holding = holdings[holdingIndex];

      if (holding.shares < shares) {
        return res.status(400).json({
          success: false,
          error: 'Insufficient shares',
          message: `You only own ${holding.shares} shares but tried to sell ${shares}`
        });
      }

      // Execute sell order
      portfolio.availableBalance += totalAmount;

      if (holding.shares === shares) {
        // Remove holding completely
        holdings.splice(holdingIndex, 1);
      } else {
        // Reduce shares
        holding.shares -= shares;
        holding.totalValue = holding.shares * currentPrice;
        holding.unrealizedPL = holding.totalValue - (holding.shares * holding.averagePrice);
        holding.unrealizedPLPercent = ((holding.totalValue - (holding.shares * holding.averagePrice)) / (holding.shares * holding.averagePrice)) * 100;
      }

      trade = {
        id: uuidv4(),
        userId,
        playerId,
        playerName: player.name,
        type: 'sell',
        orderType: 'market',
        shares,
        price: currentPrice,
        timestamp: Date.now(),
        accountType,
        status: 'executed',
        totalAmount
      };
    }

    // Update portfolio totals
    const seasonValue = portfolio.seasonHoldings.reduce((sum, h) => sum + h.totalValue, 0);
    const liveValue = portfolio.liveHoldings.reduce((sum, h) => sum + h.totalValue, 0);
    portfolio.totalValue = seasonValue + liveValue + portfolio.availableBalance;
    portfolio.lastUpdated = Date.now();

    // Reduce live trades remaining
    if (accountType === 'live') {
      portfolio.tradesRemaining = Math.max(0, portfolio.tradesRemaining - 1);
    }

    // Add trade to history
    addTrade(trade);

    const response: ApiResponse<Trade> = {
      success: true,
      data: trade,
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} order executed successfully`
    };

    res.json(response);

  } catch (error) {
    console.error('Error executing trade:', error);
    res.status(500).json({
      success: false,
      error: 'Trade execution failed',
      message: 'An error occurred while executing the trade'
    });
  }
});

// POST /api/trades/limit - Place limit order (for future implementation)
router.post('/limit', (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Not implemented',
    message: 'Limit orders are not yet implemented'
  });
});

// GET /api/trades/:userId/history - Get trade history for user
router.get('/:userId/history', (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const accountType = req.query.accountType as string;
    const type = req.query.type as string;

    const allTrades = getTrades();
    let userTrades = allTrades.filter(t => t.userId === userId);

    // Filter by account type if specified
    if (accountType && ['season', 'live'].includes(accountType)) {
      userTrades = userTrades.filter(t => t.accountType === accountType);
    }

    // Filter by trade type if specified
    if (type && ['buy', 'sell'].includes(type)) {
      userTrades = userTrades.filter(t => t.type === type);
    }

    // Sort by timestamp (newest first)
    userTrades.sort((a, b) => b.timestamp - a.timestamp);

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTrades = userTrades.slice(startIndex, endIndex);

    const response = {
      success: true,
      data: paginatedTrades,
      pagination: {
        page,
        limit,
        total: userTrades.length,
        totalPages: Math.ceil(userTrades.length / limit)
      },
      message: `Retrieved ${paginatedTrades.length} trades for user ${userId}`
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching trade history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trade history',
      message: 'An error occurred while retrieving trade history'
    });
  }
});

// GET /api/trades/recent - Get recent trades across all users
router.get('/recent', (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const allTrades = getTrades();

    const recentTrades = allTrades
      .filter(t => t.status === 'executed')
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);

    const response: ApiResponse<Trade[]> = {
      success: true,
      data: recentTrades,
      message: `Retrieved ${recentTrades.length} recent trades`
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching recent trades:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent trades',
      message: 'An error occurred while retrieving recent trades'
    });
  }
});

// GET /api/trades/volume/:playerId - Get trading volume for a player
router.get('/volume/:playerId', (req, res) => {
  try {
    const { playerId } = req.params;
    const timeframe = req.query.timeframe as string || '24h'; // 1h, 24h, 7d, 30d

    let timeMs: number;
    switch (timeframe) {
      case '1h':
        timeMs = 60 * 60 * 1000;
        break;
      case '24h':
        timeMs = 24 * 60 * 60 * 1000;
        break;
      case '7d':
        timeMs = 7 * 24 * 60 * 60 * 1000;
        break;
      case '30d':
        timeMs = 30 * 24 * 60 * 60 * 1000;
        break;
      default:
        timeMs = 24 * 60 * 60 * 1000;
    }

    const cutoffTime = Date.now() - timeMs;
    const allTrades = getTrades();
    const playerTrades = allTrades.filter(t =>
      t.playerId === playerId &&
      t.status === 'executed' &&
      t.timestamp >= cutoffTime
    );

    const totalVolume = playerTrades.reduce((sum, t) => sum + t.totalAmount, 0);
    const totalShares = playerTrades.reduce((sum, t) => sum + t.shares, 0);
    const buyVolume = playerTrades.filter(t => t.type === 'buy').reduce((sum, t) => sum + t.totalAmount, 0);
    const sellVolume = playerTrades.filter(t => t.type === 'sell').reduce((sum, t) => sum + t.totalAmount, 0);

    const response: ApiResponse = {
      success: true,
      data: {
        playerId,
        timeframe,
        totalVolume: Math.round(totalVolume * 100) / 100,
        totalShares,
        buyVolume: Math.round(buyVolume * 100) / 100,
        sellVolume: Math.round(sellVolume * 100) / 100,
        tradeCount: playerTrades.length,
        avgTradeSize: playerTrades.length > 0 ? Math.round((totalVolume / playerTrades.length) * 100) / 100 : 0
      },
      message: `Retrieved trading volume for player ${playerId} over ${timeframe}`
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching trading volume:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trading volume',
      message: 'An error occurred while retrieving trading volume'
    });
  }
});

export default router;