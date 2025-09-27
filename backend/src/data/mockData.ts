import { Player, User, Portfolio, Trade, LeaderboardEntry, LiveGame, PricePoint } from '../../../shared/src/types';
import { v4 as uuidv4 } from 'uuid';

// Global data stores
export let players: Player[] = [];
export let users: User[] = [];
export let portfolios: Portfolio[] = [];
export let trades: Trade[] = [];
export let currentGame: LiveGame | null = null;

// Generate realistic price history for the last 30 days
function generatePriceHistory(basePrice: number, volatility: number): PricePoint[] {
  const history: PricePoint[] = [];
  const now = Date.now();
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

  let currentPrice = basePrice * (0.8 + Math.random() * 0.4); // Start 20% below to above base

  for (let i = 0; i < 30; i++) {
    const timestamp = thirtyDaysAgo + (i * 24 * 60 * 60 * 1000);

    // Daily price change based on volatility
    const change = (Math.random() - 0.5) * 2 * volatility * currentPrice;
    currentPrice = Math.max(10, currentPrice + change); // Minimum price of $10

    history.push({
      timestamp,
      price: Math.round(currentPrice * 100) / 100,
      volume: Math.floor(Math.random() * 10000) + 1000
    });
  }

  return history;
}

export function initializeMockData() {
  console.log('🏀 Initializing mock NBA player data...');

  // Mock NBA Players with realistic data
  const mockPlayersData = [
    {
      name: 'LeBron James',
      team: 'LAL',
      position: 'SF' as const,
      basePrice: 189.50,
      volatility: 0.15,
      jersey: 23,
      stats: { ppg: 25.3, rpg: 7.3, apg: 7.4, fg: 0.504, threePt: 0.325, gamesPlayed: 71, minutesPerGame: 35.5 }
    },
    {
      name: 'Stephen Curry',
      team: 'GSW',
      position: 'PG' as const,
      basePrice: 176.25,
      volatility: 0.22,
      jersey: 30,
      stats: { ppg: 26.4, rpg: 4.5, apg: 5.1, fg: 0.427, threePt: 0.408, gamesPlayed: 74, minutesPerGame: 32.7 }
    },
    {
      name: 'Giannis Antetokounmpo',
      team: 'MIL',
      position: 'PF' as const,
      basePrice: 195.75,
      volatility: 0.18,
      jersey: 34,
      stats: { ppg: 31.1, rpg: 11.8, apg: 5.7, fg: 0.553, threePt: 0.274, gamesPlayed: 63, minutesPerGame: 32.1 }
    },
    {
      name: 'Luka Dončić',
      team: 'DAL',
      position: 'PG' as const,
      basePrice: 182.40,
      volatility: 0.25,
      jersey: 77,
      stats: { ppg: 32.4, rpg: 8.6, apg: 8.0, fg: 0.454, threePt: 0.343, gamesPlayed: 70, minutesPerGame: 36.2 }
    },
    {
      name: 'Jayson Tatum',
      team: 'BOS',
      position: 'SF' as const,
      basePrice: 168.90,
      volatility: 0.20,
      jersey: 0,
      stats: { ppg: 26.9, rpg: 8.1, apg: 4.9, fg: 0.466, threePt: 0.348, gamesPlayed: 74, minutesPerGame: 35.7 }
    },
    {
      name: 'Joel Embiid',
      team: 'PHI',
      position: 'C' as const,
      basePrice: 173.60,
      volatility: 0.23,
      jersey: 21,
      stats: { ppg: 33.1, rpg: 10.2, apg: 4.2, fg: 0.548, threePt: 0.330, gamesPlayed: 66, minutesPerGame: 34.6 }
    },
    {
      name: 'Nikola Jokić',
      team: 'DEN',
      position: 'C' as const,
      basePrice: 187.30,
      volatility: 0.16,
      jersey: 15,
      stats: { ppg: 24.5, rpg: 11.8, apg: 9.8, fg: 0.632, threePt: 0.382, gamesPlayed: 69, minutesPerGame: 33.7 }
    },
    {
      name: 'Kevin Durant',
      team: 'PHX',
      position: 'SF' as const,
      basePrice: 165.80,
      volatility: 0.19,
      jersey: 35,
      stats: { ppg: 27.1, rpg: 6.7, apg: 5.0, fg: 0.538, threePt: 0.404, gamesPlayed: 75, minutesPerGame: 36.9 }
    },
    {
      name: 'Damian Lillard',
      team: 'MIL',
      position: 'PG' as const,
      basePrice: 159.45,
      volatility: 0.24,
      jersey: 0,
      stats: { ppg: 24.3, rpg: 4.4, apg: 7.0, fg: 0.427, threePt: 0.350, gamesPlayed: 73, minutesPerGame: 35.3 }
    },
    {
      name: 'Anthony Davis',
      team: 'LAL',
      position: 'PF' as const,
      basePrice: 171.20,
      volatility: 0.21,
      jersey: 3,
      stats: { ppg: 25.9, rpg: 12.5, apg: 2.6, fg: 0.564, threePt: 0.270, gamesPlayed: 76, minutesPerGame: 35.1 }
    }
  ];

  // Create player objects
  players = mockPlayersData.map(playerData => {
    const priceHistory = generatePriceHistory(playerData.basePrice, playerData.volatility);
    const currentPrice = priceHistory[priceHistory.length - 1].price;
    const yesterdayPrice = priceHistory[priceHistory.length - 2].price;
    const priceChange24h = currentPrice - yesterdayPrice;
    const priceChangePercent24h = (priceChange24h / yesterdayPrice) * 100;

    return {
      id: uuidv4(),
      name: playerData.name,
      team: playerData.team,
      position: playerData.position,
      currentPrice,
      priceChange24h: Math.round(priceChange24h * 100) / 100,
      priceChangePercent24h: Math.round(priceChangePercent24h * 100) / 100,
      priceHistory,
      stats: playerData.stats,
      isPlaying: Math.random() > 0.3, // 70% chance of playing
      volatility: playerData.volatility,
      imageUrl: `https://cdn.nba.com/headshots/nba/latest/1040x760/${playerData.name.replace(' ', '_').toLowerCase()}.png`,
      jersey: playerData.jersey
    };
  });

  // Create mock users
  const mockUsernames = [
    'CourtVision23', 'DunkMaster', 'ThreePointKing', 'ReboundGod', 'AssistLegend',
    'BlockParty', 'SlamDunkFan', 'BasketBaller', 'HoopsDreamer', 'NBAOracle'
  ];

  users = mockUsernames.map((username, index) => ({
    id: uuidv4(),
    username,
    email: `${username.toLowerCase()}@example.com`,
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    joinDate: Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000, // Random join date within last year
    totalPortfolioValue: 8000 + Math.random() * 4000, // $8k - $12k
    seasonRank: index + 1,
    liveRank: Math.floor(Math.random() * 10) + 1,
    badges: [],
    stats: {
      totalTrades: Math.floor(Math.random() * 200) + 50,
      winRate: 0.45 + Math.random() * 0.25, // 45-70% win rate
      bestDay: Math.random() * 1000 + 200,
      worstDay: -(Math.random() * 800 + 100),
      longestStreak: Math.floor(Math.random() * 15) + 3,
      totalProfit: (Math.random() - 0.5) * 2000, // -$1000 to +$1000
      avgHoldTime: Math.random() * 7 + 1 // 1-8 days
    }
  }));

  // Create mock portfolios with realistic holdings
  portfolios = users.map(user => {
    const seasonHoldings = [];
    const liveHoldings = [];

    // Generate 2-4 season holdings per user
    const numSeasonHoldings = Math.floor(Math.random() * 3) + 2;
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

    // Generate 0-2 live holdings per user
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
      userId: user.id,
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
  });

  // Generate mock trade history
  const tradeTypes: ('buy' | 'sell')[] = ['buy', 'sell'];
  const accountTypes: ('season' | 'live')[] = ['season', 'live'];

  for (let i = 0; i < 100; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const player = players[Math.floor(Math.random() * players.length)];
    const type = tradeTypes[Math.floor(Math.random() * tradeTypes.length)];
    const shares = Math.floor(Math.random() * 15) + 1;
    const price = player.currentPrice * (0.95 + Math.random() * 0.1); // ±5% from current

    trades.push({
      id: uuidv4(),
      userId: user.id,
      playerId: player.id,
      playerName: player.name,
      type,
      orderType: 'market',
      shares,
      price: Math.round(price * 100) / 100,
      timestamp: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000, // Last 7 days
      accountType: accountTypes[Math.floor(Math.random() * accountTypes.length)],
      status: 'executed',
      multiplier: Math.random() > 0.9 ? (1.5 + Math.random() * 2) : undefined, // 10% chance of multiplier
      totalAmount: Math.round(shares * price * 100) / 100
    });
  }

  // Create mock live game
  currentGame = {
    id: uuidv4(),
    homeTeam: 'LAL',
    awayTeam: 'GSW',
    homeScore: 89,
    awayScore: 92,
    quarter: 3,
    timeRemaining: '7:32',
    isActive: true,
    startTime: Date.now() - (2.5 * 60 * 60 * 1000), // Started 2.5 hours ago
    activePlayers: players.filter(p => p.isPlaying).map(p => p.id)
  };

  console.log(`✅ Initialized ${players.length} players`);
  console.log(`✅ Initialized ${users.length} users`);
  console.log(`✅ Initialized ${portfolios.length} portfolios`);
  console.log(`✅ Initialized ${trades.length} trades`);
  console.log(`✅ Initialized live game: ${currentGame.awayTeam} @ ${currentGame.homeTeam}`);
}

// Getter functions for accessing mock data
export const getPlayers = () => players;
export const getUsers = () => users;
export const getPortfolios = () => portfolios;
export const getTrades = () => trades;
export const getCurrentGame = () => currentGame;

// Setter functions for updating mock data
export const updatePlayerPrice = (playerId: string, newPrice: number) => {
  const player = players.find(p => p.id === playerId);
  if (player) {
    const oldPrice = player.currentPrice;
    player.currentPrice = newPrice;
    player.priceChange24h = newPrice - oldPrice;
    player.priceChangePercent24h = ((newPrice - oldPrice) / oldPrice) * 100;

    // Add to price history
    player.priceHistory.push({
      timestamp: Date.now(),
      price: newPrice,
      volume: Math.floor(Math.random() * 5000) + 500
    });

    // Keep only last 100 points
    if (player.priceHistory.length > 100) {
      player.priceHistory = player.priceHistory.slice(-100);
    }
  }
};

export const addTrade = (trade: Trade) => {
  trades.unshift(trade); // Add to beginning

  // Keep only last 1000 trades
  if (trades.length > 1000) {
    trades = trades.slice(0, 1000);
  }
};

export const updateGameScore = (homeScore: number, awayScore: number, quarter: number, timeRemaining: string) => {
  if (currentGame) {
    currentGame.homeScore = homeScore;
    currentGame.awayScore = awayScore;
    currentGame.quarter = quarter;
    currentGame.timeRemaining = timeRemaining;
  }
};