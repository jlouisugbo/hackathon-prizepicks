#!/usr/bin/env node

/**
 * Demo Game Script for HackGT Presentation
 *
 * This script simulates exciting game moments and price changes
 * for demonstration purposes. Run this during the presentation
 * to show dynamic real-time features.
 */

const axios = require('axios');
const io = require('socket.io-client');

const API_BASE = 'http://localhost:3001';
const SOCKET_URL = 'http://localhost:3001';

// Demo scenarios for presentation
const DEMO_SCENARIOS = {
  'clutch-curry': {
    name: 'Curry Game Winner',
    player: 'Stephen Curry',
    events: [
      { action: 'announce', message: '🏀 Final 30 seconds - GSW down by 1!' },
      { action: 'wait', duration: 2000 },
      { action: 'announce', message: '⏰ Curry brings the ball up court...' },
      { action: 'wait', duration: 3000 },
      { action: 'price_spike', playerId: 'curry', multiplier: 2.5 },
      { action: 'announce', message: '🔥 CURRY FOR THREE... BANG! GAME WINNER!' },
      { action: 'flash_multiplier', playerId: 'curry', multiplier: 5.0 },
      { action: 'wait', duration: 2000 },
      { action: 'leaderboard_update' }
    ]
  },

  'lebron-takeover': {
    name: 'LeBron Takeover',
    player: 'LeBron James',
    events: [
      { action: 'announce', message: '👑 LeBron James takes over in the 4th!' },
      { action: 'price_spike', playerId: 'lebron', multiplier: 1.8 },
      { action: 'wait', duration: 3000 },
      { action: 'announce', message: '💪 Thunderous dunk + AND ONE!' },
      { action: 'flash_multiplier', playerId: 'lebron', multiplier: 2.1 },
      { action: 'wait', duration: 2000 },
      { action: 'announce', message: '🚫 HUGE BLOCK ON THE OTHER END!' },
      { action: 'price_spike', playerId: 'lebron', multiplier: 1.5 }
    ]
  },

  'giannis-poster': {
    name: 'Giannis Poster Dunk',
    player: 'Giannis Antetokounmpo',
    events: [
      { action: 'announce', message: '🦌 Giannis gets the steal!' },
      { action: 'wait', duration: 2000 },
      { action: 'announce', message: '💥 GIANNIS RUNS THE FLOOR...' },
      { action: 'wait', duration: 2000 },
      { action: 'announce', message: '🔨 POSTER DUNK! THE CROWD GOES WILD!' },
      { action: 'flash_multiplier', playerId: 'giannis', multiplier: 3.2 },
      { action: 'price_spike', playerId: 'giannis', multiplier: 2.0 }
    ]
  },

  'market-chaos': {
    name: 'Market Volatility',
    player: 'Multiple',
    events: [
      { action: 'announce', message: '📊 MASSIVE MARKET VOLATILITY!' },
      { action: 'bulk_price_changes', intensity: 'high' },
      { action: 'wait', duration: 2000 },
      { action: 'announce', message: '📈 Trading volume spike detected!' },
      { action: 'flash_multiplier', playerId: 'random', multiplier: 2.5 },
      { action: 'wait', duration: 3000 },
      { action: 'bulk_price_changes', intensity: 'medium' },
      { action: 'leaderboard_update' }
    ]
  }
};

class DemoGameController {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.players = [];
  }

  async initialize() {
    console.log('🎮 Initializing Demo Game Controller...');

    // Connect to WebSocket
    this.socket = io(SOCKET_URL);

    this.socket.on('connect', () => {
      console.log('✅ Connected to WebSocket');
      this.isConnected = true;
      this.socket.emit('join_room', {
        userId: 'demo-controller',
        username: 'DemoController'
      });
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from WebSocket');
      this.isConnected = false;
    });

    // Load player data
    await this.loadPlayers();
  }

  async loadPlayers() {
    try {
      const response = await axios.get(`${API_BASE}/api/players`);
      this.players = response.data.data;
      console.log(`📊 Loaded ${this.players.length} players`);
    } catch (error) {
      console.error('Failed to load players:', error.message);
    }
  }

  getPlayerIdByName(name) {
    const player = this.players.find(p => p.name === name);
    return player ? player.id : null;
  }

  async executeAction(action) {
    switch (action.action) {
      case 'announce':
        console.log(`\n🎤 ${action.message}`);
        if (this.isConnected) {
          this.socket.emit('demo_announcement', { message: action.message });
        }
        break;

      case 'wait':
        console.log(`⏳ Waiting ${action.duration}ms...`);
        await new Promise(resolve => setTimeout(resolve, action.duration));
        break;

      case 'price_spike':
        await this.triggerPriceSpike(action.playerId, action.multiplier);
        break;

      case 'flash_multiplier':
        await this.triggerFlashMultiplier(action.playerId, action.multiplier);
        break;

      case 'bulk_price_changes':
        await this.triggerBulkPriceChanges(action.intensity);
        break;

      case 'leaderboard_update':
        await this.refreshLeaderboard();
        break;

      default:
        console.log(`❓ Unknown action: ${action.action}`);
    }
  }

  async triggerPriceSpike(playerId, multiplier) {
    // In a real scenario, we'd have an admin endpoint to trigger this
    // For demo, we'll simulate it via WebSocket
    if (this.isConnected) {
      console.log(`📈 Triggering price spike for ${playerId} (${multiplier}x)`);
      this.socket.emit('demo_price_spike', { playerId, multiplier });
    }
  }

  async triggerFlashMultiplier(playerId, multiplier) {
    if (this.isConnected) {
      console.log(`⚡ Triggering flash multiplier for ${playerId} (${multiplier}x)`);
      this.socket.emit('demo_flash_multiplier', { playerId, multiplier });
    }
  }

  async triggerBulkPriceChanges(intensity) {
    console.log(`📊 Triggering ${intensity} market volatility`);
    // Simulate multiple price changes
    const changeCount = intensity === 'high' ? 8 : intensity === 'medium' ? 5 : 3;

    for (let i = 0; i < changeCount; i++) {
      const randomPlayer = this.players[Math.floor(Math.random() * this.players.length)];
      const multiplier = intensity === 'high' ?
        1.5 + Math.random() * 1.0 :
        1.2 + Math.random() * 0.6;

      if (this.isConnected) {
        this.socket.emit('demo_price_spike', {
          playerId: randomPlayer.id,
          multiplier
        });
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  async refreshLeaderboard() {
    try {
      console.log('🏆 Refreshing leaderboard...');
      const response = await axios.get(`${API_BASE}/api/leaderboard/season`);
      const topThree = response.data.data.slice(0, 3);

      console.log('\n🏆 TOP 3 LEADERBOARD:');
      topThree.forEach((user, index) => {
        const medal = ['🥇', '🥈', '🥉'][index];
        console.log(`${medal} ${user.username}: $${user.portfolioValue.toFixed(2)} (${user.todaysPL >= 0 ? '+' : ''}${user.todaysPL.toFixed(2)})`);
      });

    } catch (error) {
      console.error('Failed to refresh leaderboard:', error.message);
    }
  }

  async runScenario(scenarioName) {
    const scenario = DEMO_SCENARIOS[scenarioName];
    if (!scenario) {
      console.error(`❌ Scenario '${scenarioName}' not found`);
      return;
    }

    console.log(`\n🎬 Running scenario: ${scenario.name}`);
    console.log(`👤 Featured player: ${scenario.player}`);
    console.log('─'.repeat(50));

    for (const action of scenario.events) {
      await this.executeAction(action);
    }

    console.log('─'.repeat(50));
    console.log(`✅ Scenario '${scenario.name}' completed!\n`);
  }

  showMenu() {
    console.log('\n🎮 DEMO GAME CONTROLLER');
    console.log('═'.repeat(50));
    console.log('Available Scenarios:');

    Object.keys(DEMO_SCENARIOS).forEach((key, index) => {
      const scenario = DEMO_SCENARIOS[key];
      console.log(`${index + 1}. ${scenario.name} (${scenario.player})`);
    });

    console.log('─'.repeat(50));
    console.log('Commands:');
    console.log('• Type scenario name or number to run');
    console.log('• "status" - Show current game status');
    console.log('• "players" - Show player prices');
    console.log('• "leaderboard" - Show current rankings');
    console.log('• "exit" - Quit demo controller');
    console.log('═'.repeat(50));
  }

  async showStatus() {
    try {
      const gameResponse = await axios.get(`${API_BASE}/api/game/current`);
      const game = gameResponse.data.data;

      console.log('\n🏀 CURRENT GAME STATUS');
      console.log(`${game.awayTeam} @ ${game.homeTeam}`);
      console.log(`Score: ${game.awayTeam} ${game.awayScore} - ${game.homeScore} ${game.homeTeam}`);
      console.log(`Quarter: ${game.quarter}, Time: ${game.timeRemaining}`);
      console.log(`Status: ${game.isActive ? '🟢 LIVE' : '🔴 INACTIVE'}`);

    } catch (error) {
      console.error('Failed to get game status:', error.message);
    }
  }

  async showPlayerPrices() {
    console.log('\n📊 CURRENT PLAYER PRICES');
    console.log('─'.repeat(60));
    this.players.forEach(player => {
      const change = player.priceChangePercent24h >= 0 ? '📈' : '📉';
      console.log(`${change} ${player.name.padEnd(20)} $${player.currentPrice.toFixed(2).padStart(8)} (${player.priceChangePercent24h >= 0 ? '+' : ''}${player.priceChangePercent24h.toFixed(2)}%)`);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

// Main execution
async function main() {
  const controller = new DemoGameController();
  await controller.initialize();

  // Wait for connection
  await new Promise(resolve => {
    const checkConnection = () => {
      if (controller.isConnected) {
        resolve();
      } else {
        setTimeout(checkConnection, 100);
      }
    };
    checkConnection();
  });

  // Command line interface
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  controller.showMenu();

  const handleCommand = async (input) => {
    const command = input.trim().toLowerCase();

    if (command === 'exit') {
      console.log('👋 Goodbye!');
      controller.disconnect();
      rl.close();
      process.exit(0);
    } else if (command === 'status') {
      await controller.showStatus();
    } else if (command === 'players') {
      await controller.showPlayerPrices();
    } else if (command === 'leaderboard') {
      await controller.refreshLeaderboard();
    } else if (DEMO_SCENARIOS[command]) {
      await controller.runScenario(command);
    } else {
      // Try number input
      const scenarioKeys = Object.keys(DEMO_SCENARIOS);
      const index = parseInt(command) - 1;
      if (index >= 0 && index < scenarioKeys.length) {
        await controller.runScenario(scenarioKeys[index]);
      } else {
        console.log('❌ Unknown command. Type a scenario name/number, or "exit" to quit.');
      }
    }

    rl.prompt();
  };

  rl.on('line', handleCommand);
  rl.setPrompt('demo> ');
  rl.prompt();
}

// Handle script execution
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { DemoGameController, DEMO_SCENARIOS };