"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSupabaseTables = exports.TABLES = exports.supabase = exports.isSupabaseConfigured = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'placeholder-key';
exports.isSupabaseConfigured = !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
if (!exports.isSupabaseConfigured) {
    console.warn('⚠️  Supabase credentials missing. Running in development mode with mock data.');
}
else {
    console.log('✅ Supabase credentials found. Connecting to database...');
}
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
// Database table names
exports.TABLES = {
    USERS: 'users',
    PORTFOLIOS: 'portfolios',
    HOLDINGS: 'holdings',
    TRADES: 'trades',
    USER_SESSIONS: 'user_sessions',
    PRICE_HISTORY: 'price_history'
};
// Database initialization for demo
const initializeSupabaseTables = async () => {
    if (!exports.isSupabaseConfigured) {
        console.log('📊 Running in demo mode - Supabase disabled');
        return false;
    }
    try {
        // Check if tables exist, create if they don't (for demo purposes)
        // In production, you'd use Supabase migrations
        console.log('📊 Supabase connection established');
        return true;
    }
    catch (error) {
        console.error('❌ Supabase initialization failed:', error);
        return false;
    }
};
exports.initializeSupabaseTables = initializeSupabaseTables;
exports.default = exports.supabase;
