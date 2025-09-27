"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const socketHandler_1 = require("./socket/socketHandler");
const mockData_1 = require("./data/mockData");
const gameSimulation_1 = require("./socket/gameSimulation");
// Import routes
const players_1 = __importDefault(require("./routes/players"));
const portfolio_1 = __importDefault(require("./routes/portfolio"));
const trades_1 = __importDefault(require("./routes/trades"));
const leaderboard_1 = __importDefault(require("./routes/leaderboard"));
const game_1 = __importDefault(require("./routes/game"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:19006",
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }
});
exports.io = io;
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || "http://localhost:19006",
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});
// API Routes
app.use('/api/players', players_1.default);
app.use('/api/portfolio', portfolio_1.default);
app.use('/api/trades', trades_1.default);
app.use('/api/leaderboard', leaderboard_1.default);
app.use('/api/game', game_1.default);
// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`
    });
});
// Initialize mock data and socket handlers
(0, mockData_1.initializeMockData)();
(0, socketHandler_1.initializeSocketHandlers)(io);
// Start game simulation
(0, gameSimulation_1.startGameSimulation)(io);
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 CORS origin: ${process.env.CORS_ORIGIN || 'http://localhost:19006'}`);
    console.log(`⚡ Socket.IO server ready`);
});
exports.default = app;
