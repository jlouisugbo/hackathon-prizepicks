import express from 'express';
import { getPlayers } from '../data/mockData';
import { ApiResponse, Player } from '../types';

const router = express.Router();

// GET /api/players - Get all players with current prices
router.get('/', (req, res) => {
  try {
    const players = getPlayers();
    const sortBy = req.query.sortBy as string || 'name';
    const order = req.query.order as string || 'asc';
    const position = req.query.position as string;
    const team = req.query.team as string;

    let filteredPlayers = [...players];

    // Filter by position if specified
    if (position) {
      filteredPlayers = filteredPlayers.filter(p => p.position === position.toUpperCase());
    }

    // Filter by team if specified
    if (team) {
      filteredPlayers = filteredPlayers.filter(p => p.team === team.toUpperCase());
    }

    // Sort players
    filteredPlayers.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Player];
      let bValue: any = b[sortBy as keyof Player];

      if (sortBy === 'currentPrice' || sortBy === 'priceChange24h' || sortBy === 'priceChangePercent24h') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (order === 'desc') {
        return aValue < bValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });

    const response: ApiResponse<Player[]> = {
      success: true,
      data: filteredPlayers,
      message: `Retrieved ${filteredPlayers.length} players`
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching players:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch players',
      message: 'An error occurred while retrieving players'
    });
  }
});

// GET /api/players/:id - Get specific player details
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const players = getPlayers();
    const player = players.find(p => p.id === id);

    if (!player) {
      return res.status(404).json({
        success: false,
        error: 'Player not found',
        message: `Player with ID ${id} not found`
      });
    }

    const response: ApiResponse<Player> = {
      success: true,
      data: player,
      message: `Retrieved player ${player.name}`
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching player:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch player',
      message: 'An error occurred while retrieving player details'
    });
  }
});

// GET /api/players/:id/history - Get player price history
router.get('/:id/history', (req, res) => {
  try {
    const { id } = req.params;
    const players = getPlayers();
    const player = players.find(p => p.id === id);

    if (!player) {
      return res.status(404).json({
        success: false,
        error: 'Player not found',
        message: `Player with ID ${id} not found`
      });
    }

    const limit = parseInt(req.query.limit as string) || 30;
    const priceHistory = player.priceHistory.slice(-limit);

    const response: ApiResponse = {
      success: true,
      data: {
        playerId: player.id,
        playerName: player.name,
        currentPrice: player.currentPrice,
        history: priceHistory
      },
      message: `Retrieved ${priceHistory.length} price points for ${player.name}`
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching price history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch price history',
      message: 'An error occurred while retrieving price history'
    });
  }
});

// GET /api/players/search/:query - Search players by name
router.get('/search/:query', (req, res) => {
  try {
    const { query } = req.params;
    const players = getPlayers();

    const searchResults = players.filter(player =>
      player.name.toLowerCase().includes(query.toLowerCase()) ||
      player.team.toLowerCase().includes(query.toLowerCase())
    );

    const response: ApiResponse<Player[]> = {
      success: true,
      data: searchResults,
      message: `Found ${searchResults.length} players matching "${query}"`
    };

    res.json(response);
  } catch (error) {
    console.error('Error searching players:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search players',
      message: 'An error occurred while searching players'
    });
  }
});

// GET /api/players/trending/gainers - Get top price gainers
router.get('/trending/gainers', (req, res) => {
  try {
    const players = getPlayers();
    const limit = parseInt(req.query.limit as string) || 5;

    const gainers = players
      .filter(p => p.priceChangePercent24h > 0)
      .sort((a, b) => b.priceChangePercent24h - a.priceChangePercent24h)
      .slice(0, limit);

    const response: ApiResponse<Player[]> = {
      success: true,
      data: gainers,
      message: `Retrieved top ${gainers.length} gainers`
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching gainers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch gainers',
      message: 'An error occurred while retrieving top gainers'
    });
  }
});

// GET /api/players/trending/losers - Get top price losers
router.get('/trending/losers', (req, res) => {
  try {
    const players = getPlayers();
    const limit = parseInt(req.query.limit as string) || 5;

    const losers = players
      .filter(p => p.priceChangePercent24h < 0)
      .sort((a, b) => a.priceChangePercent24h - b.priceChangePercent24h)
      .slice(0, limit);

    const response: ApiResponse<Player[]> = {
      success: true,
      data: losers,
      message: `Retrieved top ${losers.length} losers`
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching losers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch losers',
      message: 'An error occurred while retrieving top losers'
    });
  }
});

export default router;