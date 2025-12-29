
import 'dotenv/config';
import { db } from '../src/db';
import { rosterEntries } from '../src/db/schema';
import { sql } from 'drizzle-orm';

async function main() {
    console.log('Migrating roster status values...');

    // Convert legacy statuses to 'pending'
    // Legacy: tentative, bench, late, declined
    // New: pending, confirmed, apply

    // Add new enum values first (Postgres specific)
    try {
        await db.execute(sql`ALTER TYPE roster_status ADD VALUE IF NOT EXISTS 'pending';`);
        await db.execute(sql`ALTER TYPE roster_status ADD VALUE IF NOT EXISTS 'apply';`);
        console.log('✓ Added new enum values');
    } catch (e) {
        console.log('values might already exist', e);
    }

    // Using raw SQL to bypass enum typing check for now
    await db.execute(sql`
        UPDATE roster_entries 
        SET status = 'pending' 
        WHERE status IN ('tentative', 'bench', 'late', 'declined');
    `);

    console.log('✓ Updated legacy statuses to "pending"');

    // Confirmed stays confirmed

    console.log('Data migration complete. Now run "npx drizzle-kit push" to update the Enum type.');
    process.exit(0);
}

main().catch(console.error);
