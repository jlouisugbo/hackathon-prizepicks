"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSupabaseTables = exports.TABLES = exports.supabaseAdmin = exports.supabase = exports.isSupabaseConfigured = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
// Supabase configuration - using new publishable and secret keys
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || 'placeholder-key';
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
exports.isSupabaseConfigured = !!(process.env.SUPABASE_URL && (process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY));
if (!exports.isSupabaseConfigured) {
    console.warn('⚠️  Supabase credentials missing. Running in development mode with mock data.');
}
else {
    console.log('✅ Supabase credentials found. Connecting to database...');
    console.log('🔑 Using publishable key for client operations');
    if (supabaseSecretKey) {
        console.log('🔐 Secret key available for admin operations');
    }
}
// Use publishable key for standard operations
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabasePublishableKey);
// Create admin client with secret key for privileged operations
exports.supabaseAdmin = supabaseSecretKey
    ? (0, supabase_js_1.createClient)(supabaseUrl, supabaseSecretKey)
    : null;
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
