#!/usr/bin/env node

const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL.replace('?sslmode=require', ''),
  ssl: false,
});

async function fixUserNames() {
  const isVerbose = process.env.DEBUG === 'true' || process.argv.includes('--verbose');

  try {
    if (isVerbose) console.log('🔧 Connecting to database...');
    await client.connect();
    if (isVerbose) console.log('✅ Connected successfully');

    // Update standard test users
    const adminResult = await client.query(
      'UPDATE users SET name = $1 WHERE email = $2',
      ['Tourista A', 'admin@test.com']
    );
    const profesorResult = await client.query(
      'UPDATE users SET name = $1 WHERE email = $2',
      ['Tourista B', 'profesor@test.com']
    );
    const parentResult = await client.query(
      'UPDATE users SET name = $1 WHERE email = $2',
      ['Tourista C', 'parent@test.com']
    );

    // Update emergency-named users
    const emergencyAdmin = await client.query(
      'UPDATE users SET name = $1 WHERE name LIKE $2 AND role = $3',
      ['Tourista A', '%Emergency%', 'ADMIN']
    );
    const emergencyProfesor = await client.query(
      'UPDATE users SET name = $1 WHERE name LIKE $2 AND role = $3',
      ['Tourista B', '%Emergency%', 'PROFESOR']
    );
    const emergencyParent = await client.query(
      'UPDATE users SET name = $1 WHERE name LIKE $2 AND role = $3',
      ['Tourista C', '%Emergency%', 'PARENT']
    );

    const totalUpdated = adminResult.rowCount + profesorResult.rowCount + parentResult.rowCount +
                        emergencyAdmin.rowCount + emergencyProfesor.rowCount + emergencyParent.rowCount;

    if (isVerbose) {
      console.log(`✅ Updated ${totalUpdated} user(s) total`);
    }

    if (isVerbose || totalUpdated > 0) {
      console.log('\n📊 Current test users:');
      const users = await client.query(
        'SELECT email, name, role FROM users WHERE email IN ($1, $2, $3, $4) ORDER BY email',
        ['admin@test.com', 'profesor@test.com', 'parent@test.com', 'agustinaramac@gmail.com']
      );

      users.rows.forEach(user => {
        console.log(`  👤 ${user.name} (${user.email}) - ${user.role}`);
      });
    }

    console.log(`✅ User names fixed successfully! (${totalUpdated} updated)`);

  } catch (error) {
    console.error('❌ Error fixing user names:', error);
  } finally {
    await client.end();
  }
}

fixUserNames();