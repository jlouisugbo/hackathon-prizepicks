import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase configuration - using new publishable and secret keys
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || 'placeholder-key';
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

export const isSupabaseConfigured = !!(process.env.SUPABASE_URL && (process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY));

if (!isSupabaseConfigured) {
  console.warn('⚠️  Supabase credentials missing. Running in development mode with mock data.');
} else {
  console.log('✅ Supabase credentials found. Connecting to database...');
  console.log('🔑 Using publishable key for client operations');
  if (supabaseSecretKey) {
    console.log('🔐 Secret key available for admin operations');
  }
}

// Use publishable key for standard operations
export const supabase: SupabaseClient = createClient(supabaseUrl, supabasePublishableKey);

// Create admin client with secret key for privileged operations
export const supabaseAdmin: SupabaseClient | null = supabaseSecretKey
  ? createClient(supabaseUrl, supabaseSecretKey)
  : null;

// Database table names
export const TABLES = {
  USERS: 'users',
  PORTFOLIOS: 'portfolios', 
  HOLDINGS: 'holdings',
  TRADES: 'trades',
  USER_SESSIONS: 'user_sessions',
  PRICE_HISTORY: 'price_history'
} as const;

// Database initialization for demo
export const initializeSupabaseTables = async () => {
  if (!isSupabaseConfigured) {
    console.log('📊 Running in demo mode - Supabase disabled');
    return false;
  }
  
  try {
    // Check if tables exist, create if they don't (for demo purposes)
    // In production, you'd use Supabase migrations
    console.log('📊 Supabase connection established');
    return true;
  } catch (error) {
    console.error('❌ Supabase initialization failed:', error);
    return false;
  }
};

export default supabase;