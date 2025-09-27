"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mockData_1 = require("../data/mockData");
const router = express_1.default.Router();
// GET /api/game/current - Get current live game information
router.get('/current', (req, res) => {
    try {
        const currentGame = (0, mockData_1.getCurrentGame)();
        if (!currentGame) {
            return res.status(404).json({
                success: false,
                error: 'No active game',
                message: 'There is no live game currently in progress'
            });
        }
        const response = {
            success: true,
            data: currentGame,
            message: `Retrieved current game: ${currentGame.awayTeam} @ ${currentGame.homeTeam}`
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error fetching current game:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch current game',
            message: 'An error occurred while retrieving current game information'
        });
    }
});
// GET /api/game/status - Get detailed game status
router.get('/status', (req, res) => {
    try {
        const currentGame = (0, mockData_1.getCurrentGame)();
        if (!currentGame) {
            return res.json({
                success: true,
                data: {
                    hasActiveGame: false,
                    message: 'No live game in progress'
                }
            });
        }
        // Calculate game progress
        const totalGameTime = 48 * 60; // 48 minutes in seconds
        const currentGameTime = ((currentGame.quarter - 1) * 12 * 60) +
            (12 * 60 - parseTimeToSeconds(currentGame.timeRemaining));
        const gameProgressPercent = (currentGameTime / totalGameTime) * 100;
        // Determine game phase
        let gamePhase = 'Pre-game';
        if (currentGame.quarter === 1)
            gamePhase = '1st Quarter';
        else if (currentGame.quarter === 2)
            gamePhase = '2nd Quarter';
        else if (currentGame.quarter === 3)
            gamePhase = '3rd Quarter';
        else if (currentGame.quarter === 4)
            gamePhase = '4th Quarter';
        else if (currentGame.quarter > 4)
            gamePhase = 'Overtime';
        // Calculate time elapsed since game start
        const timeElapsed = Date.now() - currentGame.startTime;
        const hoursElapsed = Math.floor(timeElapsed / (1000 * 60 * 60));
        const minutesElapsed = Math.floor((timeElapsed % (1000 * 60 * 60)) / (1000 * 60));
        const gameStatus = {
            hasActiveGame: true,
            game: currentGame,
            gamePhase,
            gameProgressPercent: Math.round(gameProgressPercent * 100) / 100,
            timeElapsed: `${hoursElapsed}h ${minutesElapsed}m`,
            isLive: currentGame.isActive,
            totalGameTime: `${Math.floor(totalGameTime / 60)}:00`,
            currentGameTime: formatSecondsToTime(currentGameTime),
            scoreDifferential: Math.abs(currentGame.homeScore - currentGame.awayScore),
            leadingTeam: currentGame.homeScore > currentGame.awayScore ? currentGame.homeTeam :
                currentGame.awayScore > currentGame.homeScore ? currentGame.awayTeam : 'Tied'
        };
        const response = {
            success: true,
            data: gameStatus,
            message: 'Retrieved detailed game status'
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error fetching game status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch game status',
            message: 'An error occurred while retrieving game status'
        });
    }
});
// GET /api/game/schedule - Get upcoming games (mock data)
router.get('/schedule', (req, res) => {
    try {
        const now = Date.now();
        const upcomingGames = [
            {
                id: 'game-2',
                homeTeam: 'BOS',
                awayTeam: 'MIA',
                scheduledTime: now + (2 * 60 * 60 * 1000), // 2 hours from now
                status: 'scheduled'
            },
            {
                id: 'game-3',
                homeTeam: 'DEN',
                awayTeam: 'PHX',
                scheduledTime: now + (4 * 60 * 60 * 1000), // 4 hours from now
                status: 'scheduled'
            },
            {
                id: 'game-4',
                homeTeam: 'MIL',
                awayTeam: 'DAL',
                scheduledTime: now + (6 * 60 * 60 * 1000), // 6 hours from now
                status: 'scheduled'
            }
        ];
        const response = {
            success: true,
            data: upcomingGames,
            message: `Retrieved ${upcomingGames.length} upcoming games`
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error fetching game schedule:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch game schedule',
            message: 'An error occurred while retrieving game schedule'
        });
    }
});
// Helper functions
function parseTimeToSeconds(timeString) {
    const [minutes, seconds] = timeString.split(':').map(Number);
    return (minutes * 60) + seconds;
}
function formatSecondsToTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
exports.default = router;
