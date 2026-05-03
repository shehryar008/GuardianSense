// src/config/env.js — Environment variable validation + export
// Import this at the very top of server.js so validation runs before anything else.

const REQUIRED_VARS = [
  'SUPABASE_URL',
  'SUPABASE_KEY',
];

const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`[Config] Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

module.exports = {
  port:            process.env.PORT || 5001,
  nodeEnv:         process.env.NODE_ENV || 'development',
  supabaseUrl:     process.env.SUPABASE_URL,
  supabaseKey:     process.env.SUPABASE_KEY,
  jwtSecret:       process.env.JWT_SECRET,
  jwtExpiresIn:    process.env.JWT_EXPIRES_IN || '7d',
  frontendUrl:     process.env.FRONTEND_URL || 'http://localhost:3001',
  adminFrontendUrl: process.env.ADMIN_FRONTEND_URL || 'http://localhost:3000',
};
