// add-test-user.js
require('dotenv').config();
const { query } = require('./src/config/database');

async function addTestUser() {
  try {
    // Add test user
    await query(`
      INSERT INTO businesses (business_name, email, password_hash, industry, phone) 
      VALUES (
        'Test Restaurant', 
        'test@feedlyze.com', 
        '$2b$10$XQfh5aNgYdH5qYZK.WKzGO7qJ5VyXGH9jKNmVP2F3HNQQqxKFjXYi', 
        'Food & Beverage', 
        '9876543210'
      ) 
      ON CONFLICT (email) DO NOTHING
    `);
    
    console.log('✅ Test user added successfully!');
    
    // Show all users
    const res = await query('SELECT id, email, business_name FROM businesses');
    console.log('\n📋 All users in database:');
    res.rows.forEach(row => {
      console.log(`   - ID: ${row.id}, Email: ${row.email}, Business: ${row.business_name}`);
    });
    
    console.log('\n🔑 You can now login with:');
    console.log('   Email: test@feedlyze.com');
    console.log('   Password: password123');
    
  } catch (e) {
    console.error('❌ Error:', e.message);
  } finally {
    process.exit();
  }
}

addTestUser();
