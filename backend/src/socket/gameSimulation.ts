import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import {
  getPlayers,
  getCurrentGame,
  updatePlayerPrice,
  updateGameScore,
  players
} from '../data/mockData';
import {
  broadcastPriceUpdate,
  broadcastFlashMultiplier,
  broadcastGameEvent,
  broadcastMarketData
} from './socketHandler';
import { GameEvent, FlashMultiplier, MarketData } from '../types';

// Game simulation state
let simulationInterval: NodeJS.Timeout | null = null;
let flashMultiplierInterval: NodeJS.Timeout | null = null;
let gameEventInterval: NodeJS.Timeout | null = null;
let priceUpdateInterval: NodeJS.Timeout | null = null;
let scoreUpdateInterval: NodeJS.Timeout | null = null;

// Configuration - Optimized for Railway memory limits
const PRICE_UPDATE_INTERVAL = 10000; // 10 seconds (reduced frequency)
const FLASH_MULTIPLIER_CHANCE = 0.15; // 15% chance per interval
const GAME_EVENT_INTERVAL = 60000; // 60 seconds (reduced frequency)
const MARKET_DATA_INTERVAL = 45000; // 45 seconds (reduced frequency)
const SCORE_UPDATE_INTERVAL = 15000; // 15 seconds (reduced frequency)

// Active flash multipliers
const activeFlashMultipliers = new Map<string, FlashMultiplier>();

// Pre-scripted game events for demo
const gameEvents: Omit<GameEvent, 'id' | 'timestamp'>[] = [
  {
    playerId: '', // Will be set dynamically
    playerName: 'LeBron James',
    eventType: 'three_pointer',
    multiplier: 2.5,
    description: 'LeBron James hits a clutch three-pointer!',
    priceImpact: 15.50,
    quarter: 3,
    gameTime: '7:32'
  },
  {
    playerId: '',
    playerName: 'Stephen Curry',
    eventType: 'steal',
    multiplier: 3.2,
    description: 'Curry steals and hits a deep three!',
    priceImpact: 22.30,
    quarter: 3,
    gameTime: '4:12'
  },
  {
    playerId: '',
    playerName: 'Giannis Antetokounmpo',
    eventType: 'dunk',
    multiplier: 1.8,
    description: 'Giannis with a thunderous dunk!',
    priceImpact: 8.75,
    quarter: 4,
    gameTime: '9:45'
  },
  {
    playerId: '',
    playerName: 'Luka Dončić',
    eventType: 'assist',
    multiplier: 1.5,
    description: 'Luka with a no-look assist!',
    priceImpact: 5.20,
    quarter: 4,
    gameTime: '3:28'
  },
  {
    playerId: '',
    playerName: 'Joel Embiid',
    eventType: 'block',
    multiplier: 2.1,
    description: 'Embiid with a massive block!',
    priceImpact: 12.40,
    quarter: 4,
    gameTime: '1:15'
  },
  {
    playerId: '',
    playerName: 'Stephen Curry',
    eventType: 'three_pointer',
    multiplier: 5.0,
    description: 'CURRY FOR THE WIN! Game-winning three!',
    priceImpact: 45.80,
    quarter: 4,
    gameTime: '0:02'
  }
];

let eventIndex = 0;

export function startGameSimulation(io: Server) {
  console.log('🎮 Starting game simulation...');

  // Start price updates
  startPriceUpdates(io);

  // Start flash multiplier system
  //startFlashMultiplierSystem(io);

  // Start game events
  startGameEvents(io);

  // Start market data broadcasting
  startMarketDataBroadcast(io);

  // Start live score updates
  startScoreUpdates(io);

  console.log('✅ Game simulation started');
}

function startPriceUpdates(io: Server) {
  priceUpdateInterval = setInterval(() => {
    const playersList = getPlayers();
    const currentGame = getCurrentGame();

    if (!currentGame || !currentGame.isActive) return;

    // Update prices for playing players more frequently
    const playingPlayers = playersList.filter(p => p.isPlaying);

    playingPlayers.forEach(player => {
      // Base volatility influenced by game state
      let volatility = player.volatility;

      // Increase volatility if player has active flash multiplier
      if (activeFlashMultipliers.has(player.id)) {
        volatility *= 2.5;
      }

      // Random price change
      const changePercent = (Math.random() - 0.5) * 2 * volatility * 100;
      const priceChange = (player.currentPrice * changePercent) / 100;
      const newPrice = Math.max(10, player.currentPrice + priceChange);

      // Update player price
      const oldPrice = player.currentPrice;
      updatePlayerPrice(player.id, newPrice);

      // Broadcast price update
      broadcastPriceUpdate(io, player.id, newPrice, newPrice - oldPrice, changePercent);
    });

    // Update non-playing players with reduced volatility
    const benchPlayers = playersList.filter(p => !p.isPlaying);
    benchPlayers.forEach(player => {
      if (Math.random() < 0.3) { // 30% chance to update bench players
        const changePercent = (Math.random() - 0.5) * 2 * 0.05; // 5% max volatility
        const priceChange = (player.currentPrice * changePercent) / 100;
        const newPrice = Math.max(10, player.currentPrice + priceChange);

        const oldPrice = player.currentPrice;
        updatePlayerPrice(player.id, newPrice);
        broadcastPriceUpdate(io, player.id, newPrice, newPrice - oldPrice, changePercent * 100);
      }
    });

  }, PRICE_UPDATE_INTERVAL) as unknown as NodeJS.Timeout;
}

/*
function startFlashMultiplierSystem(io: Server) {
  flashMultiplierInterval = setInterval(() => {
    const currentGame = getCurrentGame();
    if (!currentGame || !currentGame.isActive) return;

    // Random chance for flash multiplier
    if (Math.random() < FLASH_MULTIPLIER_CHANCE) {
      triggerFlashMultiplier(io);
    }

    // Clean up expired flash multipliers
    cleanupExpiredMultipliers(io);

  }, PRICE_UPDATE_INTERVAL);
}
*/

function triggerFlashMultiplier(io: Server, flashData: FlashMultiplier) {
  const playersList = getPlayers();
  const playingPlayers = playersList.filter(p => p.isPlaying);

  if (playingPlayers.length === 0) return;

  // Select random playing player
  //const randomPlayer = playingPlayers[Math.floor(Math.random() * playingPlayers.length)];

  /*
  // Generate multiplier (1.2x to 4.0x, with higher multipliers being rarer)
  let multiplier: number;
  const rand = Math.random();
  if (rand < 0.5) multiplier = 1.2 + Math.random() * 0.8; // 1.2x - 2.0x (50% chance)
  else if (rand < 0.8) multiplier = 2.0 + Math.random() * 1.0; // 2.0x - 3.0x (30% chance)
  else multiplier = 3.0 + Math.random() * 1.0; // 3.0x - 4.0x (20% chance)

  multiplier = Math.round(multiplier * 10) / 10; // Round to 1 decimal
  */

  /*
  const flashData: FlashMultiplier = {
    playerId: randomPlayer.id,
    playerName: randomPlayer.name,
    multiplier,
    duration: 30000, // 30 seconds
    startTime: Date.now(),
    eventDescription: generateFlashEvent(randomPlayer.name, multiplier),
    isActive: true
  };
*/

  // Store active multiplier
  activeFlashMultipliers.set(flashData.playerId, flashData);

  // Broadcast flash multiplier
  broadcastFlashMultiplier(io, flashData);

  console.log(`⚡ Flash multiplier triggered: ${flashData.playerName} ${flashData.multiplier}x`);
}

function generateFlashEvent(playerName: string, multiplier: number): string {
  const events = [
    `${playerName} is on fire! 🔥`,
    `${playerName} heating up! 🌡️`,
    `${playerName} in the zone! ⚡`,
    `${playerName} can't miss! 🎯`,
    `${playerName} going nuclear! 💥`,
    `${playerName} unstoppable! 🚀`
  ];

  if (multiplier >= 3.0) {
    return `${playerName} EXPLODING! 💥💥💥`;
  } else if (multiplier >= 2.5) {
    return events[Math.floor(Math.random() * events.length)];
  } else {
    return `${playerName} getting hot! 🔥`;
  }
}

function cleanupExpiredMultipliers(io: Server) {
  const now = Date.now();

  for (const [playerId, multiplier] of activeFlashMultipliers.entries()) {
    if (now - multiplier.startTime >= multiplier.duration) {
      // Mark as expired
      multiplier.isActive = false;

      // Broadcast expiration
      io.to('general').emit('flash_multiplier_expired', {
        playerId,
        playerName: multiplier.playerName
      });

      // Remove from active multipliers
      activeFlashMultipliers.delete(playerId);

      console.log(`⚡ Flash multiplier expired: ${multiplier.playerName}`);
    }
  }
}

function startGameEvents(io: Server) {
  gameEventInterval = setInterval(() => {
    const currentGame = getCurrentGame();
    if (!currentGame || !currentGame.isActive) return;

    // Trigger pre-scripted events
    if (eventIndex < gameEvents.length) {
      triggerGameEvent(io, gameEvents[eventIndex]);
      eventIndex++;
    } else {
      // Generate random events after scripted ones
      if (Math.random() < 0.4) { // 40% chance
        generateRandomGameEvent(io);
      }
    }

  }, GAME_EVENT_INTERVAL) as unknown as NodeJS.Timeout;
}

function triggerGameEvent(io: Server, eventTemplate: Omit<GameEvent, 'id' | 'timestamp'>) {
  const playersList = getPlayers();
  const player = playersList.find(p => p.name === eventTemplate.playerName);

  if (!player) return;

  const gameEvent: GameEvent = {
    id: uuidv4(),
    timestamp: Date.now(),
    playerId: player.id,
    playerName: eventTemplate.playerName,
    eventType: eventTemplate.eventType,
    multiplier: eventTemplate.multiplier,
    description: eventTemplate.description,
    priceImpact: eventTemplate.priceImpact,
    quarter: eventTemplate.quarter,
    gameTime: eventTemplate.gameTime
  };

  // Apply price impact
  const newPrice = player.currentPrice + eventTemplate.priceImpact;
  const oldPrice = player.currentPrice;
  updatePlayerPrice(player.id, newPrice);

  // Broadcast game event
  broadcastGameEvent(io, gameEvent);

  // Broadcast price update
  const changePercent = ((newPrice - oldPrice) / oldPrice) * 100;
  broadcastPriceUpdate(io, player.id, newPrice, newPrice - oldPrice, changePercent);

  // Trigger flash multiplier if specified
  if (eventTemplate.multiplier && eventTemplate.multiplier > 1) {
    const flashData: FlashMultiplier = {
      playerId: player.id,
      playerName: player.name,
      multiplier: eventTemplate.multiplier,
      duration: 30000,
      startTime: Date.now(),
      eventDescription: eventTemplate.description,
      isActive: true
    };

    activeFlashMultipliers.set(player.id, flashData);
    triggerFlashMultiplier(io, flashData);
  }

  console.log(`🏀 Game event: ${gameEvent.description}`);
}

function generateRandomGameEvent(io: Server) {
  const playersList = getPlayers();
  const playingPlayers = playersList.filter(p => p.isPlaying);

  if (playingPlayers.length === 0) return;

  const randomPlayer = playingPlayers[Math.floor(Math.random() * playingPlayers.length)];
  const eventTypes: any[] = ['basket', 'assist', 'rebound', 'steal', 'block'];
  const randomEventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];

  const descriptions = {
    basket: `${randomPlayer.name} scores!`,
    assist: `${randomPlayer.name} with a great assist!`,
    rebound: `${randomPlayer.name} grabs the rebound!`,
    steal: `${randomPlayer.name} gets the steal!`,
    block: `${randomPlayer.name} with the block!`
  };

  const priceImpact = (Math.random() - 0.3) * 10; // -3 to +7 price impact

  const gameEvent: GameEvent = {
    id: uuidv4(),
    timestamp: Date.now(),
    playerId: randomPlayer.id,
    playerName: randomPlayer.name,
    eventType: randomEventType,
    description: descriptions[randomEventType as keyof typeof descriptions],
    priceImpact,
    quarter: 3, // Default to 3rd quarter
    gameTime: '5:30'
  };

  // Apply price impact
  const newPrice = Math.max(10, randomPlayer.currentPrice + priceImpact);
  const oldPrice = randomPlayer.currentPrice;
  updatePlayerPrice(randomPlayer.id, newPrice);

  // Broadcast event and price update
  broadcastGameEvent(io, gameEvent);

  const changePercent = ((newPrice - oldPrice) / oldPrice) * 100;
  broadcastPriceUpdate(io, randomPlayer.id, newPrice, newPrice - oldPrice, changePercent);
}

function startScoreUpdates(io: Server) {
  scoreUpdateInterval = setInterval(() => {
    const currentGame = getCurrentGame();
    if (!currentGame || !currentGame.isActive) return;

    // Randomly decide which team scores (slightly favor home team)
    const homeTeamScores = Math.random() < 0.52; // 52% chance home team scores

    // Determine points scored (1, 2, or 3 points with realistic probabilities)
    let pointsScored: number;
    const rand = Math.random();
    if (rand < 0.65) pointsScored = 2; // 65% chance for 2 points (regular basket)
    else if (rand < 0.90) pointsScored = 3; // 25% chance for 3 points
    else pointsScored = 1; // 10% chance for 1 point (free throw)

    // Update scores
    const newHomeScore = homeTeamScores ? currentGame.homeScore + pointsScored : currentGame.homeScore;
    const newAwayScore = !homeTeamScores ? currentGame.awayScore + pointsScored : currentGame.awayScore;

    // Advance game time randomly (30 seconds to 2 minutes)
    const timeAdvance = Math.floor(Math.random() * 90) + 30; // 30-120 seconds
    const newGameTime = advanceGameTime(currentGame.timeRemaining, timeAdvance);
    let newQuarter = currentGame.quarter;

    // Check if quarter should advance
    if (isQuarterOver(newGameTime.time)) {
      newQuarter = Math.min(4, currentGame.quarter + 1);
      newGameTime.time = '12:00'; // Reset time for new quarter
    }

    // Update game state
    updateGameScore(newHomeScore, newAwayScore, newQuarter, newGameTime.time);

    // Broadcast score update (include gameId for frontend mapping)
    const scoreUpdateData = {
      gameId: currentGame.id,
      homeScore: newHomeScore,
      awayScore: newAwayScore,
      quarter: newQuarter,
      timeRemaining: newGameTime.time,
      lastScore: {
        team: homeTeamScores ? 'home' : 'away',
        points: pointsScored,
        teamName: homeTeamScores ? currentGame.homeTeam : currentGame.awayTeam
      }
    };

    io.to('general').emit('game_score_update', scoreUpdateData);

    console.log(`🏀 Score Update: ${currentGame.awayTeam} ${newAwayScore} - ${newHomeScore} ${currentGame.homeTeam} | Q${newQuarter} ${newGameTime.time}`);
    console.log(`📡 Broadcasting game_score_update to 'general' room:`, scoreUpdateData);

  }, SCORE_UPDATE_INTERVAL) as unknown as NodeJS.Timeout;
}

// Helper function to advance game time
function advanceGameTime(currentTime: string, secondsToAdvance: number): { time: string } {
  const [minutes, seconds] = currentTime.split(':').map(Number);
  const totalSeconds = minutes * 60 + seconds;
  const newTotalSeconds = Math.max(0, totalSeconds - secondsToAdvance);

  const newMinutes = Math.floor(newTotalSeconds / 60);
  const newSeconds = newTotalSeconds % 60;

  return {
    time: `${newMinutes}:${newSeconds.toString().padStart(2, '0')}`
  };
}

// Helper function to check if quarter is over
function isQuarterOver(timeString: string): boolean {
  const [minutes, seconds] = timeString.split(':').map(Number);
  return minutes === 0 && seconds === 0;
}

function startMarketDataBroadcast(io: Server) {
  setInterval(() => {
    const playersList = getPlayers();

    // Calculate market statistics
    const totalMarketCap = playersList.reduce((sum, p) => sum + (p.currentPrice * 1000), 0); // Assume 1000 shares per player
    const totalVolume24h = Math.random() * 500000 + 100000; // Random volume
    const activeTraders = Math.floor(Math.random() * 50) + 20; // 20-70 active traders

    // Find top gainer and loser
    const gainers = playersList.filter(p => p.priceChangePercent24h > 0);
    const losers = playersList.filter(p => p.priceChangePercent24h < 0);

    const topGainer = gainers.length > 0 ?
      gainers.reduce((prev, current) => prev.priceChangePercent24h > current.priceChangePercent24h ? prev : current) :
      playersList[0];

    const topLoser = losers.length > 0 ?
      losers.reduce((prev, current) => prev.priceChangePercent24h < current.priceChangePercent24h ? prev : current) :
      playersList[0];

    const marketData: MarketData = {
      totalMarketCap: Math.round(totalMarketCap),
      totalVolume24h: Math.round(totalVolume24h),
      activeTraders,
      topGainer: {
        playerId: topGainer.id,
        playerName: topGainer.name,
        priceChange: topGainer.priceChange24h,
        priceChangePercent: topGainer.priceChangePercent24h
      },
      topLoser: {
        playerId: topLoser.id,
        playerName: topLoser.name,
        priceChange: topLoser.priceChange24h,
        priceChangePercent: topLoser.priceChangePercent24h
      }
    };

    broadcastMarketData(io, marketData);

  }, MARKET_DATA_INTERVAL);
}

export function stopGameSimulation() {
  console.log('🛑 Stopping game simulation...');

  if (priceUpdateInterval) {
    clearInterval(priceUpdateInterval);
    priceUpdateInterval = null;
  }

  if (flashMultiplierInterval) {
    clearInterval(flashMultiplierInterval);
    flashMultiplierInterval = null;
  }

  if (gameEventInterval) {
    clearInterval(gameEventInterval);
    gameEventInterval = null;
  }

  if (scoreUpdateInterval) {
    clearInterval(scoreUpdateInterval);
    scoreUpdateInterval = null;
  }

  // Clear active flash multipliers
  activeFlashMultipliers.clear();

  console.log('✅ Game simulation stopped');
}

export function getActiveFlashMultipliers(): FlashMultiplier[] {
  return Array.from(activeFlashMultipliers.values());
}