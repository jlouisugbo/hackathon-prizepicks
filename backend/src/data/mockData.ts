import { Player, User, Portfolio, Trade, LeaderboardEntry, LiveGame, PricePoint } from '../types';
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
    },
    { name: 'Kyrie Irving', team: 'DAL', position: 'PG' as const, basePrice: 155.40, volatility: 0.22, jersey: 11, stats: { ppg: 26.9, rpg: 5.0, apg: 5.9, fg: 0.489, threePt: 0.394, gamesPlayed: 71, minutesPerGame: 35.2 }},
    { name: 'James Harden', team: 'LAC', position: 'SG' as const, basePrice: 149.30, volatility: 0.19, jersey: 1, stats: { ppg: 21.0, rpg: 6.1, apg: 10.7, fg: 0.461, threePt: 0.385, gamesPlayed: 72, minutesPerGame: 34.0 }},
    { name: 'Kawhi Leonard', team: 'LAC', position: 'SF' as const, basePrice: 172.10, volatility: 0.18, jersey: 2, stats: { ppg: 24.8, rpg: 6.5, apg: 3.9, fg: 0.512, threePt: 0.411, gamesPlayed: 68, minutesPerGame: 33.1 }},
    { name: 'Paul George', team: 'PHI', position: 'SF' as const, basePrice: 158.80, volatility: 0.20, jersey: 13, stats: { ppg: 23.6, rpg: 6.1, apg: 4.5, fg: 0.470, threePt: 0.412, gamesPlayed: 74, minutesPerGame: 34.8 }},
    { name: 'Devin Booker', team: 'PHX', position: 'SG' as const, basePrice: 170.25, volatility: 0.21, jersey: 1, stats: { ppg: 27.8, rpg: 4.5, apg: 6.8, fg: 0.493, threePt: 0.377, gamesPlayed: 70, minutesPerGame: 35.5 }},
    { name: 'Bradley Beal', team: 'PHX', position: 'SG' as const, basePrice: 142.50, volatility: 0.20, jersey: 3, stats: { ppg: 22.4, rpg: 4.2, apg: 5.1, fg: 0.485, threePt: 0.368, gamesPlayed: 64, minutesPerGame: 33.9 }},
    { name: 'Donovan Mitchell', team: 'CLE', position: 'SG' as const, basePrice: 167.60, volatility: 0.22, jersey: 45, stats: { ppg: 27.4, rpg: 4.3, apg: 5.2, fg: 0.478, threePt: 0.383, gamesPlayed: 73, minutesPerGame: 35.8 }},
    { name: 'Darius Garland', team: 'CLE', position: 'PG' as const, basePrice: 138.70, volatility: 0.20, jersey: 10, stats: { ppg: 21.6, rpg: 2.7, apg: 7.8, fg: 0.471, threePt: 0.397, gamesPlayed: 72, minutesPerGame: 34.2 }},
    { name: 'Jalen Brunson', team: 'NYK', position: 'PG' as const, basePrice: 160.15, volatility: 0.23, jersey: 11, stats: { ppg: 28.7, rpg: 3.6, apg: 6.7, fg: 0.481, threePt: 0.409, gamesPlayed: 75, minutesPerGame: 35.4 }},
    { name: 'Julius Randle', team: 'NYK', position: 'PF' as const, basePrice: 152.00, volatility: 0.21, jersey: 30, stats: { ppg: 24.2, rpg: 9.8, apg: 5.0, fg: 0.472, threePt: 0.345, gamesPlayed: 73, minutesPerGame: 35.8 }},
    { name: 'Tyrese Haliburton', team: 'IND', position: 'PG' as const, basePrice: 165.50, volatility: 0.24, jersey: 0, stats: { ppg: 21.1, rpg: 4.0, apg: 10.9, fg: 0.490, threePt: 0.392, gamesPlayed: 70, minutesPerGame: 34.0 }},
    { name: 'Shai Gilgeous-Alexander', team: 'OKC', position: 'PG' as const, basePrice: 188.90, volatility: 0.25, jersey: 2, stats: { ppg: 31.4, rpg: 5.6, apg: 6.2, fg: 0.538, threePt: 0.378, gamesPlayed: 75, minutesPerGame: 34.9 }},
    { name: 'Chet Holmgren', team: 'OKC', position: 'C' as const, basePrice: 150.20, volatility: 0.26, jersey: 7, stats: { ppg: 16.8, rpg: 7.9, apg: 2.5, fg: 0.534, threePt: 0.375, gamesPlayed: 76, minutesPerGame: 29.8 }},
    { name: 'Jamal Murray', team: 'DEN', position: 'PG' as const, basePrice: 158.40, volatility: 0.21, jersey: 27, stats: { ppg: 22.0, rpg: 4.1, apg: 6.2, fg: 0.479, threePt: 0.404, gamesPlayed: 66, minutesPerGame: 32.8 }},
    { name: 'Aaron Gordon', team: 'DEN', position: 'PF' as const, basePrice: 139.60, volatility: 0.18, jersey: 50, stats: { ppg: 16.3, rpg: 6.6, apg: 3.4, fg: 0.563, threePt: 0.345, gamesPlayed: 74, minutesPerGame: 31.1 }},
  { name: "De'Aaron Fox", team: 'SAC', position: 'PG' as const, basePrice: 162.30, volatility: 0.24, jersey: 5, stats: { ppg: 26.6, rpg: 4.2, apg: 6.5, fg: 0.479, threePt: 0.368, gamesPlayed: 74, minutesPerGame: 35.8 }},
    { name: 'Tyrese Maxey', team: 'PHI', position: 'PG' as const, basePrice: 156.30, volatility: 0.24, jersey: 0, stats: { ppg: 25.1, rpg: 3.7, apg: 6.2, fg: 0.482, threePt: 0.411, gamesPlayed: 76, minutesPerGame: 37.5 }},
    { name: 'Anthony Edwards', team: 'MIN', position: 'SG' as const, basePrice: 171.70, volatility: 0.25, jersey: 5, stats: { ppg: 26.5, rpg: 5.4, apg: 4.4, fg: 0.463, threePt: 0.368, gamesPlayed: 79, minutesPerGame: 36.0 }},
    { name: 'Karl-Anthony Towns', team: 'MIN', position: 'C' as const, basePrice: 165.10, volatility: 0.20, jersey: 32, stats: { ppg: 22.5, rpg: 8.8, apg: 3.0, fg: 0.506, threePt: 0.413, gamesPlayed: 72, minutesPerGame: 33.2 }},
    { name: 'Jayson Tatum', team: 'BOS', position: 'SF' as const, basePrice: 180.50, volatility: 0.19, jersey: 0, stats: { ppg: 27.1, rpg: 8.4, apg: 4.3, fg: 0.473, threePt: 0.377, gamesPlayed: 74, minutesPerGame: 36.0 }},
    { name: 'Jaylen Brown', team: 'BOS', position: 'SG' as const, basePrice: 160.80, volatility: 0.20, jersey: 7, stats: { ppg: 23.0, rpg: 6.5, apg: 3.6, fg: 0.492, threePt: 0.359, gamesPlayed: 72, minutesPerGame: 34.5 }},
    { name: 'Jimmy Butler', team: 'MIA', position: 'SF' as const, basePrice: 162.90, volatility: 0.18, jersey: 22, stats: { ppg: 22.9, rpg: 5.9, apg: 5.3, fg: 0.536, threePt: 0.414, gamesPlayed: 64, minutesPerGame: 33.0 }},
    { name: 'Bam Adebayo', team: 'MIA', position: 'C' as const, basePrice: 150.60, volatility: 0.19, jersey: 13, stats: { ppg: 19.3, rpg: 10.4, apg: 3.9, fg: 0.519, threePt: 0.091, gamesPlayed: 75, minutesPerGame: 34.2 }},
    { name: 'Trae Young', team: 'ATL', position: 'PG' as const, basePrice: 157.40, volatility: 0.24, jersey: 11, stats: { ppg: 26.2, rpg: 2.9, apg: 10.2, fg: 0.433, threePt: 0.372, gamesPlayed: 73, minutesPerGame: 36.2 }},
    { name: 'Dejounte Murray', team: 'ATL', position: 'SG' as const, basePrice: 146.20, volatility: 0.22, jersey: 5, stats: { ppg: 22.5, rpg: 5.3, apg: 6.3, fg: 0.466, threePt: 0.371, gamesPlayed: 74, minutesPerGame: 36.0 }},
    { name: 'Zion Williamson', team: 'NOP', position: 'PF' as const, basePrice: 162.10, volatility: 0.27, jersey: 1, stats: { ppg: 23.0, rpg: 6.4, apg: 4.7, fg: 0.583, threePt: 0.345, gamesPlayed: 61, minutesPerGame: 30.5 }},
    { name: 'Brandon Ingram', team: 'NOP', position: 'SF' as const, basePrice: 154.70, volatility: 0.22, jersey: 14, stats: { ppg: 23.9, rpg: 5.1, apg: 5.7, fg: 0.484, threePt: 0.387, gamesPlayed: 68, minutesPerGame: 34.0 }},
    { name: 'LaMelo Ball', team: 'CHA', position: 'PG' as const, basePrice: 150.10, volatility: 0.26, jersey: 1, stats: { ppg: 23.3, rpg: 6.4, apg: 8.4, fg: 0.436, threePt: 0.378, gamesPlayed: 58, minutesPerGame: 34.6 }},
    { name: 'Victor Wembanyama', team: 'SAS', position: 'C' as const, basePrice: 170.90, volatility: 0.30, jersey: 1, stats: { ppg: 21.4, rpg: 10.6, apg: 3.9, fg: 0.466, threePt: 0.323, gamesPlayed: 71, minutesPerGame: 29.7 }}
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

  // Add demo users for testing
  users.push({
    id: 'demo-user',
    username: 'DemoTrader',
    email: 'demo@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DemoTrader',
    joinDate: Date.now(),
    totalPortfolioValue: 10000,
    seasonRank: 11,
    liveRank: 11,
    badges: [],
    stats: {
      totalTrades: 0,
      winRate: 0,
      bestDay: 0,
      worstDay: 0,
      longestStreak: 0,
      totalProfit: 0,
      avgHoldTime: 0
    }
  });

  // Add user-1 for frontend compatibility
  users.push({
    id: 'user-1',
    username: 'PrizePicker',
    email: 'user1@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PrizePicker',
    joinDate: Date.now(),
    totalPortfolioValue: 10000,
    seasonRank: 12,
    liveRank: 12,
    badges: [],
    stats: {
      totalTrades: 5,
      winRate: 0.6,
      bestDay: 150,
      worstDay: -75,
      longestStreak: 3,
      totalProfit: 200,
      avgHoldTime: 2.5
    }
  });

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

// Portfolio management functions for trading engine
export const executeTradeOrder = (userId: string, playerId: string, shares: number, type: 'buy' | 'sell', accountType: 'season' | 'live'): { success: boolean; error?: string; trade?: Trade } => {
  const portfolio = portfolios.find(p => p.userId === userId);
  const player = players.find(p => p.id === playerId);
  
  if (!portfolio || !player) {
    return { success: false, error: 'Portfolio or player not found' };
  }

  const tradeAmount = shares * player.currentPrice;
  
  // Check if live trading and trades remaining
  if (accountType === 'live' && portfolio.tradesRemaining <= 0) {
    return { success: false, error: 'No trades remaining for live account' };
  }

  // Check balance for buy orders
  if (type === 'buy' && portfolio.availableBalance < tradeAmount) {
    return { success: false, error: 'Insufficient balance' };
  }

  // Execute the trade
  const trade: Trade = {
    id: uuidv4(),
    userId,
    playerId,
    playerName: player.name,
    type,
    orderType: 'market',
    shares,
    price: player.currentPrice,
    timestamp: Date.now(),
    accountType,
    status: 'executed',
    totalAmount: Math.round(tradeAmount * 100) / 100
  };

  // Update holdings
  const holdings = accountType === 'season' ? portfolio.seasonHoldings : portfolio.liveHoldings;
  const existingHolding = holdings.find(h => h.playerId === playerId);

  if (type === 'buy') {
    if (existingHolding) {
      // Update existing position
      const newShares = existingHolding.shares + shares;
      const newAveragePrice = ((existingHolding.shares * existingHolding.averagePrice) + tradeAmount) / newShares;
      
      existingHolding.shares = newShares;
      existingHolding.averagePrice = Math.round(newAveragePrice * 100) / 100;
      existingHolding.totalValue = Math.round(newShares * player.currentPrice * 100) / 100;
      existingHolding.unrealizedPL = Math.round((existingHolding.totalValue - (newShares * existingHolding.averagePrice)) * 100) / 100;
      existingHolding.unrealizedPLPercent = Math.round((existingHolding.unrealizedPL / (newShares * existingHolding.averagePrice)) * 100 * 100) / 100;
    } else {
      // Create new position
      holdings.push({
        playerId,
        playerName: player.name,
        shares,
        averagePrice: player.currentPrice,
        currentPrice: player.currentPrice,
        totalValue: tradeAmount,
        unrealizedPL: 0,
        unrealizedPLPercent: 0,
        purchaseDate: Date.now()
      });
    }
    portfolio.availableBalance -= tradeAmount;
  } else { // sell
    if (!existingHolding || existingHolding.shares < shares) {
      return { success: false, error: 'Insufficient shares to sell' };
    }
    
    existingHolding.shares -= shares;
    existingHolding.totalValue = Math.round(existingHolding.shares * player.currentPrice * 100) / 100;
    
    if (existingHolding.shares === 0) {
      const index = holdings.indexOf(existingHolding);
      holdings.splice(index, 1);
    } else {
      existingHolding.unrealizedPL = Math.round((existingHolding.totalValue - (existingHolding.shares * existingHolding.averagePrice)) * 100) / 100;
      existingHolding.unrealizedPLPercent = Math.round((existingHolding.unrealizedPL / (existingHolding.shares * existingHolding.averagePrice)) * 100 * 100) / 100;
    }
    
    portfolio.availableBalance += tradeAmount;
  }

  // Update portfolio totals
  const newSeasonValue = portfolio.seasonHoldings.reduce((sum, h) => sum + h.totalValue, 0);
  const newLiveValue = portfolio.liveHoldings.reduce((sum, h) => sum + h.totalValue, 0);
  portfolio.totalValue = Math.round((newSeasonValue + newLiveValue + portfolio.availableBalance) * 100) / 100;
  
  // Reduce trades remaining for live trades
  if (accountType === 'live') {
    portfolio.tradesRemaining = Math.max(0, portfolio.tradesRemaining - 1);
  }
  
  portfolio.lastUpdated = Date.now();
  
  // Add trade to history
  addTrade(trade);
  
  return { success: true, trade };
};

// Sync portfolio values with current prices (called when prices update)
export const syncPortfoliosWithPrices = () => {
  portfolios.forEach(portfolio => {
    let totalValue = portfolio.availableBalance;
    
    // Update season holdings
    portfolio.seasonHoldings.forEach(holding => {
      const player = players.find(p => p.id === holding.playerId);
      if (player) {
        holding.currentPrice = player.currentPrice;
        holding.totalValue = Math.round(holding.shares * player.currentPrice * 100) / 100;
        holding.unrealizedPL = Math.round((holding.totalValue - (holding.shares * holding.averagePrice)) * 100) / 100;
        holding.unrealizedPLPercent = Math.round((holding.unrealizedPL / (holding.shares * holding.averagePrice)) * 100 * 100) / 100;
        totalValue += holding.totalValue;
      }
    });
    
    // Update live holdings
    portfolio.liveHoldings.forEach(holding => {
      const player = players.find(p => p.id === holding.playerId);
      if (player) {
        holding.currentPrice = player.currentPrice;
        holding.totalValue = Math.round(holding.shares * player.currentPrice * 100) / 100;
        holding.unrealizedPL = Math.round((holding.totalValue - (holding.shares * holding.averagePrice)) * 100) / 100;
        holding.unrealizedPLPercent = Math.round((holding.unrealizedPL / (holding.shares * holding.averagePrice)) * 100 * 100) / 100;
        totalValue += holding.totalValue;
      }
    });
    
    portfolio.totalValue = Math.round(totalValue * 100) / 100;
    portfolio.lastUpdated = Date.now();
  });
};

// Limit Order System
interface LimitOrder {
  id: string;
  userId: string;
  playerId: string;
  playerName: string;
  type: 'buy' | 'sell';
  shares: number;
  limitPrice: number;
  accountType: 'season' | 'live';
  status: 'pending' | 'executed' | 'cancelled';
  createdAt: number;
  expiresAt: number;
}

export let limitOrders: LimitOrder[] = [];

export const createLimitOrder = (userId: string, playerId: string, shares: number, type: 'buy' | 'sell', limitPrice: number, accountType: 'season' | 'live'): { success: boolean; error?: string; order?: LimitOrder } => {
  const player = players.find(p => p.id === playerId);
  const portfolio = portfolios.find(p => p.userId === userId);
  
  if (!player || !portfolio) {
    return { success: false, error: 'Player or portfolio not found' };
  }

  const order: LimitOrder = {
    id: uuidv4(),
    userId,
    playerId,
    playerName: player.name,
    type,
    shares,
    limitPrice,
    accountType,
    status: 'pending',
    createdAt: Date.now(),
    expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  };

  limitOrders.push(order);
  return { success: true, order };
};

export const checkLimitOrders = () => {
  const now = Date.now();
  
  limitOrders.forEach(order => {
    if (order.status !== 'pending') return;
    
    // Check if expired
    if (now > order.expiresAt) {
      order.status = 'cancelled';
      return;
    }
    
    const player = players.find(p => p.id === order.playerId);
    if (!player) return;
    
    // Check if limit price conditions are met
    let shouldExecute = false;
    if (order.type === 'buy' && player.currentPrice <= order.limitPrice) {
      shouldExecute = true;
    } else if (order.type === 'sell' && player.currentPrice >= order.limitPrice) {
      shouldExecute = true;
    }
    
    if (shouldExecute) {
      const result = executeTradeOrder(order.userId, order.playerId, order.shares, order.type, order.accountType);
      if (result.success) {
        order.status = 'executed';
      }
    }
  });
  
  // Remove old cancelled/executed orders (keep last 100)
  limitOrders = limitOrders.filter(order => {
    if (order.status === 'pending') {
      return true;
    }
    // Keep recent cancelled/executed orders for 7 days
    return now - order.createdAt < 7 * 24 * 60 * 60 * 1000;
  }).slice(-100);
};

export const getLimitOrders = () => limitOrders;
export const getUserLimitOrders = (userId: string) => 
  limitOrders.filter(order => order.userId === userId && order.status === 'pending');

// User Management Functions (for demo mode without database)
const demoUsers = new Map<string, any>();
const demoSessions = new Map<string, { userId: string; socketId: string; lastSeen: Date }>();

export const addDemoUser = (user: any) => {
  demoUsers.set(user.id, user);
  console.log(`📝 Demo user added: ${user.username} (${user.id})`);
};

export const getDemoUser = (userId: string) => {
  return demoUsers.get(userId);
};

export const getDemoUserByEmail = (email: string) => {
  for (const user of demoUsers.values()) {
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

export const updateDemoUserSession = (userId: string, socketId: string, isOnline: boolean = true) => {
  if (isOnline) {
    demoSessions.set(userId, { userId, socketId, lastSeen: new Date() });
  } else {
    demoSessions.delete(userId);
  }
};

export const getDemoOnlineUsersCount = () => {
  return demoSessions.size;
};

export const getAllDemoUsers = () => {
  return Array.from(demoUsers.values());
};

export const createDemoPortfolio = (userId: string) => {
  const portfolio = {
    userId,
    seasonHoldings: [],
    liveHoldings: [],
    totalValue: 10000,
    availableBalance: 10000,
    todaysPL: 0,
    seasonPL: 0,
    livePL: 0,
    tradesRemaining: 100,
    lastUpdated: Date.now()
  };
  portfolios.push(portfolio);
  console.log(`📊 Demo portfolio created for user: ${userId}`);
  return portfolio;
};