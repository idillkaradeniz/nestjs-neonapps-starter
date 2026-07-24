// One-off script proving db.transaction() rolls back both inserts when
// the second one violates the unique email constraint. Not part of the
// running app — run manually with: node scripts/test-transaction-rollback.mjs
import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();
  const sameEmail = `rollback-test-${Date.now()}@example.com`;

  try {
    await client.query('BEGIN');
    await client.query('INSERT INTO users (name, email) VALUES ($1, $2)', [
      'First User',
      sameEmail,
    ]);
    // Second insert reuses the same email — violates the unique constraint.
    await client.query('INSERT INTO users (name, email) VALUES ($1, $2)', [
      'Second User',
      sameEmail,
    ]);
    await client.query('COMMIT');
    console.log('✗ Unexpected: transaction committed (should have failed)');
  } catch (error) {
    await client.query('ROLLBACK');
    console.log('✓ Transaction failed as expected:', error.message);
  } finally {
    const { rows } = await client.query(
      'SELECT COUNT(*) FROM users WHERE email = $1',
      [sameEmail],
    );
    console.log(
      `✓ Rows in DB with this email after rollback: ${rows[0].count} (expected: 0)`,
    );
    client.release();
    await pool.end();
  }
}

main();
