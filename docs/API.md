# NBA Player Stock Market API Documentation

## Base URL
- **Development**: `http://localhost:3001`
- **Production**: TBD (deployment pending)

## Authentication
Most endpoints accept either:
- `Authorization: Bearer <jwt_token>` header
- `user-id: <user_id>` header (demo mode)

## Core REST Endpoints

### Health Check
```
GET /health
```
Returns server status and environment info.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-09-27T12:17:34.910Z",
  "environment": "development"
}
```

### Players

#### Get All Players
```
GET /api/players
```
**Query Parameters:**
- `sortBy`: name, currentPrice, priceChange24h, priceChangePercent24h
- `order`: asc, desc
- `position`: PG, SG, SF, PF, C
- `team`: Team abbreviation (LAL, GSW, etc.)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "87b84e1c-1ace-4086-982d-5cd8a9a4a609",
      "name": "Stephen Curry",
      "team": "GSW",
      "position": "PG",
      "currentPrice": 261.94,
      "priceChange24h": 0.94,
      "priceChangePercent24h": 0.36,
      "priceHistory": [...],
      "stats": {
        "ppg": 29.8,
        "rpg": 5.8,
        "apg": 6.8,
        "fg": 0.427,
        "threePt": 0.408
      },
      "isPlaying": true,
      "volatility": 0.15,
      "jersey": 30
    }
  ]
}
```

#### Get Player Details
```
GET /api/players/:playerId
```

#### Get Price History
```
GET /api/players/:playerId/history
```
**Query Parameters:**
- `period`: 1d, 7d, 30d, 3m, 1y

#### Get Trending Players
```
GET /api/players/trending/gainers
GET /api/players/trending/losers
```

### Portfolio

#### Get User Portfolio
```
GET /api/portfolio/:userId
```
**Headers:** `user-id: <userId>` or `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "demo-user",
    "seasonHoldings": [
      {
        "playerId": "87b84e1c-1ace-4086-982d-5cd8a9a4a609",
        "playerName": "Stephen Curry",
        "shares": 14,
        "averagePrice": 120.16,
        "currentPrice": 261.94,
        "totalValue": 3667.16,
        "unrealizedPL": 1984.92,
        "unrealizedPLPercent": 117.99
      }
    ],
    "liveHoldings": [...],
    "totalValue": 6690.76,
    "availableBalance": -1428.91,
    "todaysPL": -91.03,
    "seasonPL": -519.56,
    "livePL": -38.07,
    "tradesRemaining": 0
  }
}
```

#### Get Portfolio Performance
```
GET /api/portfolio/:userId/performance
```

#### Get Holdings by Account Type
```
GET /api/portfolio/:userId/holdings/:accountType
```
**Account Types:** `season`, `live`

### Trading

#### Execute Trade
```
POST /api/trades
```
**Headers:** `user-id: <userId>` or `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "playerId": "87b84e1c-1ace-4086-982d-5cd8a9a4a609",
  "playerName": "Stephen Curry",
  "type": "buy", // or "sell"
  "shares": 1,
  "orderType": "market", // or "limit"
  "accountType": "season", // or "live"
  "limitPrice": 260.00 // required for limit orders
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "trade-uuid",
    "userId": "demo-user",
    "playerId": "87b84e1c-1ace-4086-982d-5cd8a9a4a609",
    "type": "buy",
    "shares": 1,
    "price": 261.94,
    "totalAmount": 261.94,
    "timestamp": 1758975469865,
    "status": "executed"
  }
}
```

#### Get Trade History
```
GET /api/trades/:userId/history
```

#### Get Recent Trades Feed
```
GET /api/trades/recent
```

### Leaderboards

#### Season Leaderboard
```
GET /api/leaderboard/season
```

#### Live Game Leaderboard
```
GET /api/leaderboard/live
```

#### Daily Top Performers
```
GET /api/leaderboard/daily
```

**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "userId": "607f4e53-cb4f-4113-aad3-7e159099a428",
      "username": "NBAOracle",
      "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=NBAOracle",
      "portfolioValue": 13715.95,
      "todaysPL": -152.65,
      "todaysPLPercent": -1.11,
      "rank": 1,
      "previousRank": 10,
      "badges": []
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 11,
    "totalPages": 1
  }
}
```

### Game

#### Get Current Live Game
```
GET /api/game/current
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "35e6c274-b213-4473-8446-6c256f4006e3",
    "homeTeam": "LAL",
    "awayTeam": "GSW",
    "homeScore": 89,
    "awayScore": 92,
    "quarter": 3,
    "timeRemaining": "7:32",
    "isActive": true,
    "startTime": 1758966339757,
    "activePlayers": ["player-id-1", "player-id-2", ...]
  }
}
```

#### Get Game Status
```
GET /api/game/status
```

#### Get Game Schedule
```
GET /api/game/schedule
```

### Authentication

#### Login
```
POST /api/auth/login
```

#### Register
```
POST /api/auth/register
```

#### Verify Token
```
GET /api/auth/verify
```

## WebSocket Events

Connect to WebSocket at same base URL: `ws://localhost:3001`

### Client → Server Events

#### Join User Room
```javascript
socket.emit('join_room', {
  userId: 'user-id',
  username: 'username',
  token: 'jwt-token' // optional
});
```

#### Send Chat Message
```javascript
socket.emit('send_chat_message', {
  message: 'Hello everyone!',
  gameId: 'game-id'
});
```

#### Subscribe to Player Updates
```javascript
socket.emit('subscribe_player', {
  playerId: 'player-id'
});
```

#### Join Live Trading Room
```javascript
socket.emit('join_live_trading', {
  gameId: 'game-id'
});
```

### Server → Client Events

#### Price Updates
```javascript
socket.on('price_update', (data) => {
  // data: { playerId, price, change, changePercent, timestamp }
});
```

#### Flash Multiplier Events
```javascript
socket.on('flash_multiplier', (data) => {
  // data: { playerId, multiplier, duration, eventType }
});
```

#### Game Events
```javascript
socket.on('game_event', (data) => {
  // data: { playerId, eventType, description, impact }
});
```

#### Trade Executed
```javascript
socket.on('trade_executed', (data) => {
  // data: { trade object, updatedPortfolio }
});
```

#### Leaderboard Updates
```javascript
socket.on('leaderboard_update', (data) => {
  // data: { leaderboard array, timestamp }
});
```

#### Chat Messages
```javascript
socket.on('chat_message', (data) => {
  // data: { userId, username, message, timestamp }
});
```

## Trading Rules & Logic

### Account Types
1. **Season Portfolio**: Long-term holdings, unlimited trades
2. **Live Trading**: During games only, max 5 trades per game

### Trading Limits
- **Live Trading**: 5 trades maximum per game session
- **Minimum Trade**: 1 share
- **Balance Validation**: Must have sufficient funds for buy orders

### Price Mechanics
- **Price Updates**: Every 20 seconds during live games
- **Flash Multipliers**: 15% chance per update cycle
- **Volatility**: Player-specific (0.1-0.3 range)
- **Market Hours**: Active during simulated game time

### Multiplier System
- **Holding Bonuses**: 1.1x (1-10 shares), 1.2x (11-25 shares), 1.5x (25+ shares)
- **Flash Multipliers**: 1.5x to 5.0x during special events
- **Game Event Triggers**: Dunks, assists, three-pointers, blocks

## Error Handling

All endpoints return consistent error format:
```json
{
  "success": false,
  "error": "Error Type",
  "message": "Detailed error message",
  "code": "ERROR_CODE" // optional
}
```

## Demo Data

### Test Users
- `demo-user`: Default demo account
- 10 additional users with realistic portfolios

### Players Available
1. LeBron James (LAL)
2. Stephen Curry (GSW)
3. Giannis Antetokounmpo (MIL)
4. Luka Dončić (DAL)
5. Jayson Tatum (BOS)
6. Joel Embiid (PHI)
7. Nikola Jokić (DEN)
8. Kevin Durant (PHX)
9. Damian Lillard (MIL)
10. Anthony Davis (LAL)

## Rate Limiting
Currently no rate limiting implemented for demo purposes.

## CORS Configuration
- **Development**: `http://localhost:19006` (Expo default)
- **Production**: Update CORS_ORIGIN environment variable