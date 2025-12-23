// test-db.js
require('dotenv').config();
const { pool, query } = require('./src/config/database');

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...\n');

    // Test 1: Basic connection
    const result = await query('SELECT NOW()');
    console.log('✅ Database connected successfully!');
    console.log('   Server time:', result.rows[0].now);

    // Test 2: List all tables
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('\n📋 Tables in database:');
    tables.rows.forEach(row => {
      console.log('   -', row.table_name);
    });

    // Test 3: Count rows in each table
    console.log('\n📊 Row counts:');
    const tableNames = tables.rows.map(r => r.table_name);
    
    for (const tableName of tableNames) {
      const count = await query(`SELECT COUNT(*) FROM ${tableName}`);
      console.log(`   - ${tableName}: ${count.rows[0].count} rows`);
    }

    console.log('\n✅ Database test completed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    process.exit(1);
  }
}

testDatabase();
