// src/config/env.js

/**
 * Validates that all required environment variables are set
 * Exits process if any required variable is missing
 */
const validateEnv = () => {
  const requiredEnvVars = [
    'PORT',
    'NODE_ENV',
    'DB_HOST',
    'DB_PORT',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('\n Please check your .env file and ensure all variables are set.');
    process.exit(1);
  }

  console.log('All required environment variables are set');
};

module.exports = { validateEnv };