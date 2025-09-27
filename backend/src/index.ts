// Load environment variables first, before any other imports
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { initializeSocketHandlers } from './socket/socketHandler';
import { initializeMockData, getPlayers } from './data/mockData';
import { startGameSimulation } from './socket/gameSimulation';
import PriceEngine from './utils/priceEngine';
import { initializeSupabaseTables } from './config/supabase';

// Import routes
import playersRouter from './routes/players';
import portfolioRouter from './routes/portfolio';
import tradesRouter from './routes/trades';
import leaderboardRouter from './routes/leaderboard';
import gameRouter from './routes/game';
import authRouter from './routes/auth';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:19006",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

const PORT = parseInt(process.env.PORT || '3002', 10);

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:19006",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files for demo
app.use(express.static('public'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/players', playersRouter);
app.use('/api/portfolio', portfolioRouter);
app.use('/api/trades', tradesRouter);
app.use('/api/leaderboard', leaderboardRouter);
app.use('/api/game', gameRouter);

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
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
initializeMockData();
initializeSocketHandlers(io);

// Initialize Supabase (optional for demo)
initializeSupabaseTables();

// Start game simulation (handles all price updates globally)
startGameSimulation(io);

// IMPORTANT: PriceEngine auto-updates are DISABLED to prevent double refreshing
// Game simulation handles ALL price updates to ensure single global update loop
// This ensures price updates are consistent across all connected users
const priceEngine = PriceEngine.getInstance();
const players = getPlayers();

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS origin: ${process.env.CORS_ORIGIN || 'http://localhost:19006'}`);
  console.log(`⚡ Socket.IO server ready`);
});

export { io };
export default app;