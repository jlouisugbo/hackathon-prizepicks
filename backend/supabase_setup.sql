-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_portfolio_value DECIMAL(15,2) DEFAULT 10000.00,
    season_rank INTEGER DEFAULT 0,
    live_rank INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_sessions table for socket connections
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    socket_id TEXT NOT NULL,
    is_online BOOLEAN DEFAULT true,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create portfolios table
CREATE TABLE IF NOT EXISTS portfolios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    available_balance DECIMAL(15,2) DEFAULT 10000.00,
    total_value DECIMAL(15,2) DEFAULT 10000.00,
    todays_pl DECIMAL(15,2) DEFAULT 0.00,
    season_pl DECIMAL(15,2) DEFAULT 0.00,
    live_pl DECIMAL(15,2) DEFAULT 0.00,
    trades_remaining INTEGER DEFAULT 100,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create holdings table
CREATE TABLE IF NOT EXISTS holdings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    player_id TEXT NOT NULL,
    player_name TEXT NOT NULL,
    shares INTEGER NOT NULL,
    average_price DECIMAL(10,2) NOT NULL,
    current_price DECIMAL(10,2) NOT NULL,
    total_value DECIMAL(15,2) NOT NULL,
    unrealized_pl DECIMAL(15,2) DEFAULT 0.00,
    unrealized_pl_percent DECIMAL(8,4) DEFAULT 0.0000,
    account_type TEXT CHECK (account_type IN ('season', 'live')) DEFAULT 'season',
    purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trades table
CREATE TABLE IF NOT EXISTS trades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    player_id TEXT NOT NULL,
    player_name TEXT NOT NULL,
    type TEXT CHECK (type IN ('buy', 'sell')) NOT NULL,
    order_type TEXT CHECK (order_type IN ('market', 'limit')) DEFAULT 'market',
    shares INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    limit_price DECIMAL(10,2),
    total_amount DECIMAL(15,2) NOT NULL,
    multiplier DECIMAL(8,4) DEFAULT 1.0000,
    account_type TEXT CHECK (account_type IN ('season', 'live')) DEFAULT 'season',
    status TEXT CHECK (status IN ('pending', 'executed', 'cancelled', 'failed')) DEFAULT 'pending',
    executed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create price_history table (optional for future use)
CREATE TABLE IF NOT EXISTS price_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_id TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    volume INTEGER DEFAULT 0,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_socket_id ON user_sessions(socket_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_holdings_user_id ON holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_holdings_player_id ON holdings(player_id);
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_player_id ON trades(player_id);
CREATE INDEX IF NOT EXISTS idx_price_history_player_id ON price_history(player_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic - you can customize these)
CREATE POLICY "Users can view their own data" ON users FOR ALL USING (auth.uid()::text = id::text);
CREATE POLICY "Users can view their own portfolios" ON portfolios FOR ALL USING (user_id::text = auth.uid()::text);
CREATE POLICY "Users can view their own holdings" ON holdings FOR ALL USING (user_id::text = auth.uid()::text);
CREATE POLICY "Users can view their own trades" ON trades FOR ALL USING (user_id::text = auth.uid()::text);
CREATE POLICY "Users can manage their own sessions" ON user_sessions FOR ALL USING (user_id::text = auth.uid()::text);

-- For demo purposes, also allow public access (you can remove this in production)
CREATE POLICY "Allow public access for demo" ON users FOR ALL USING (true);
CREATE POLICY "Allow public portfolios for demo" ON portfolios FOR ALL USING (true);
CREATE POLICY "Allow public holdings for demo" ON holdings FOR ALL USING (true);
CREATE POLICY "Allow public trades for demo" ON trades FOR ALL USING (true);
CREATE POLICY "Allow public sessions for demo" ON user_sessions FOR ALL USING (true);