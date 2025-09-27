"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSocketHandlers = initializeSocketHandlers;
exports.broadcastPriceUpdate = broadcastPriceUpdate;
exports.broadcastFlashMultiplier = broadcastFlashMultiplier;
exports.broadcastGameEvent = broadcastGameEvent;
exports.broadcastTradeExecution = broadcastTradeExecution;
exports.broadcastLeaderboardUpdate = broadcastLeaderboardUpdate;
exports.broadcastPortfolioUpdate = broadcastPortfolioUpdate;
exports.broadcastMarketData = broadcastMarketData;
exports.broadcastNotification = broadcastNotification;
exports.getConnectedUsersCount = getConnectedUsersCount;
exports.getConnectedUsers = getConnectedUsers;
exports.broadcastChatMessage = broadcastChatMessage;
const uuid_1 = require("uuid");
// Store connected users
const connectedUsers = new Map();
const userRooms = new Map(); // userId -> Set of room names
function initializeSocketHandlers(io) {
    console.log('🔌 Initializing Socket.IO handlers...');
    io.on('connection', (socket) => {
        console.log(`👤 User connected: ${socket.id}`);
        // Handle user joining
        socket.on('join_room', (data) => {
            const { userId, username } = data;
            // Store user info
            connectedUsers.set(socket.id, {
                userId,
                username,
                socketId: socket.id,
                joinedAt: Date.now()
            });
            // Join general rooms
            socket.join('general'); // All users
            socket.join(`user:${userId}`); // User-specific room
            // Initialize user rooms set
            if (!userRooms.has(userId)) {
                userRooms.set(userId, new Set());
            }
            userRooms.get(userId).add('general');
            userRooms.get(userId).add(`user:${userId}`);
            console.log(`✅ User ${username} (${userId}) joined room: general`);
            // Send welcome message
            const welcomeNotification = {
                id: (0, uuid_1.v4)(),
                userId,
                type: 'system',
                title: 'Welcome!',
                message: 'Connected to Player Stock Market',
                timestamp: Date.now(),
                isRead: false
            };
            socket.emit('notification', welcomeNotification);
            // Broadcast user count update
            io.to('general').emit('user_count', connectedUsers.size);
        });
        // Handle chat messages
        socket.on('send_chat_message', (message) => {
            const user = connectedUsers.get(socket.id);
            if (!user)
                return;
            const chatMessage = {
                id: (0, uuid_1.v4)(),
                userId: user.userId,
                username: user.username,
                message: message.trim(),
                timestamp: Date.now(),
                type: 'user'
            };
            // Broadcast to all users in general room
            io.to('general').emit('chat_message', chatMessage);
            console.log(`💬 Chat message from ${user.username}: ${message}`);
        });
        // Handle player subscription
        socket.on('subscribe_player', (playerId) => {
            const user = connectedUsers.get(socket.id);
            if (!user)
                return;
            const roomName = `player:${playerId}`;
            socket.join(roomName);
            if (!userRooms.has(user.userId)) {
                userRooms.set(user.userId, new Set());
            }
            userRooms.get(user.userId).add(roomName);
            console.log(`📊 User ${user.username} subscribed to player ${playerId}`);
            // Send current player data
            socket.emit('player_subscribed', { playerId, status: 'subscribed' });
        });
        // Handle player unsubscription
        socket.on('unsubscribe_player', (playerId) => {
            const user = connectedUsers.get(socket.id);
            if (!user)
                return;
            const roomName = `player:${playerId}`;
            socket.leave(roomName);
            if (userRooms.has(user.userId)) {
                userRooms.get(user.userId).delete(roomName);
            }
            console.log(`📊 User ${user.username} unsubscribed from player ${playerId}`);
            socket.emit('player_unsubscribed', { playerId, status: 'unsubscribed' });
        });
        // Handle live trading room
        socket.on('join_live_trading', () => {
            const user = connectedUsers.get(socket.id);
            if (!user)
                return;
            socket.join('live_trading');
            if (!userRooms.has(user.userId)) {
                userRooms.set(user.userId, new Set());
            }
            userRooms.get(user.userId).add('live_trading');
            console.log(`🔥 User ${user.username} joined live trading room`);
        });
        socket.on('leave_live_trading', () => {
            const user = connectedUsers.get(socket.id);
            if (!user)
                return;
            socket.leave('live_trading');
            if (userRooms.has(user.userId)) {
                userRooms.get(user.userId).delete('live_trading');
            }
            console.log(`🔥 User ${user.username} left live trading room`);
        });
        // Handle leaderboard subscription
        socket.on('subscribe_leaderboard', (type) => {
            const user = connectedUsers.get(socket.id);
            if (!user)
                return;
            const roomName = `leaderboard:${type}`;
            socket.join(roomName);
            if (!userRooms.has(user.userId)) {
                userRooms.set(user.userId, new Set());
            }
            userRooms.get(user.userId).add(roomName);
            console.log(`🏆 User ${user.username} subscribed to ${type} leaderboard`);
        });
        // Handle portfolio updates subscription
        socket.on('subscribe_portfolio', () => {
            const user = connectedUsers.get(socket.id);
            if (!user)
                return;
            const roomName = `portfolio:${user.userId}`;
            socket.join(roomName);
            if (!userRooms.has(user.userId)) {
                userRooms.set(user.userId, new Set());
            }
            userRooms.get(user.userId).add(roomName);
            console.log(`💼 User ${user.username} subscribed to portfolio updates`);
        });
        // Handle ping for connection keep-alive
        socket.on('ping', () => {
            socket.emit('pong', { timestamp: Date.now() });
        });
        // Handle disconnection
        socket.on('disconnect', (reason) => {
            const user = connectedUsers.get(socket.id);
            if (user) {
                console.log(`👋 User ${user.username} disconnected: ${reason}`);
                // Clean up user rooms
                userRooms.delete(user.userId);
                connectedUsers.delete(socket.id);
                // Broadcast updated user count
                io.to('general').emit('user_count', connectedUsers.size);
            }
            else {
                console.log(`👋 Unknown user disconnected: ${socket.id}`);
            }
        });
        // Handle errors
        socket.on('error', (error) => {
            const user = connectedUsers.get(socket.id);
            console.error(`❌ Socket error for user ${user?.username || 'unknown'}:`, error);
        });
    });
    console.log('✅ Socket.IO handlers initialized');
}
// Utility functions for broadcasting
function broadcastPriceUpdate(io, playerId, price, change, changePercent) {
    const priceData = {
        playerId,
        price: Math.round(price * 100) / 100,
        change: Math.round(change * 100) / 100,
        changePercent: Math.round(changePercent * 100) / 100,
        timestamp: Date.now()
    };
    // Broadcast to all users and player-specific subscribers
    io.to('general').emit('price_update', priceData);
    io.to(`player:${playerId}`).emit('price_update', priceData);
}
function broadcastFlashMultiplier(io, flashData) {
    // Broadcast to live trading room and general room
    io.to('live_trading').emit('flash_multiplier', flashData);
    io.to('general').emit('flash_multiplier', flashData);
    console.log(`⚡ Flash multiplier broadcast: ${flashData.playerName} ${flashData.multiplier}x`);
}
function broadcastGameEvent(io, gameEvent) {
    // Broadcast to all rooms
    io.to('general').emit('game_event', gameEvent);
    io.to('live_trading').emit('game_event', gameEvent);
    console.log(`🏀 Game event broadcast: ${gameEvent.description}`);
}
function broadcastTradeExecution(io, trade) {
    // Broadcast to user's room and general trading feed
    io.to(`user:${trade.userId}`).emit('trade_executed', trade);
    io.to('general').emit('trade_feed', {
        username: trade.username || 'Anonymous',
        playerName: trade.playerName,
        type: trade.type,
        shares: trade.shares,
        price: trade.price,
        timestamp: trade.timestamp
    });
    console.log(`💰 Trade executed: ${trade.type} ${trade.shares} shares of ${trade.playerName}`);
}
function broadcastLeaderboardUpdate(io, type, leaderboard) {
    io.to(`leaderboard:${type}`).emit('leaderboard_update', {
        type,
        leaderboard,
        timestamp: Date.now()
    });
    console.log(`🏆 ${type} leaderboard updated`);
}
function broadcastPortfolioUpdate(io, userId, portfolio) {
    io.to(`portfolio:${userId}`).emit('portfolio_update', portfolio);
    io.to(`user:${userId}`).emit('portfolio_update', portfolio);
}
function broadcastMarketData(io, marketData) {
    io.to('general').emit('market_data', marketData);
}
function broadcastNotification(io, userId, notification) {
    io.to(`user:${userId}`).emit('notification', notification);
}
function getConnectedUsersCount() {
    return connectedUsers.size;
}
function getConnectedUsers() {
    return Array.from(connectedUsers.values());
}
function broadcastChatMessage(io, chatMessage) {
    io.to('general').emit('chat_message', chatMessage);
}
