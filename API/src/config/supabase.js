const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://zvabuwroqlgnbgnryazd.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2YWJ1d3JvcWxnbmJnbnJ5YXpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDM0MTY3NiwiZXhwIjoyMDY5OTE3Njc2fQ.yNtIHFnmVDWacBrvNnS-wG70Pl2CTElvOi7IlT-8_SY';

// Create Supabase client with service role key for backend operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Test Supabase connection
const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error) {
      logger.error('Supabase connection test failed:', error);
      return false;
    }
    logger.info('Supabase connection test successful');
    return true;
  } catch (err) {
    logger.error('Supabase connection error:', err);
    return false;
  }
};

// Initialize connection test
testConnection();

module.exports = {
  supabase,
  testConnection
};