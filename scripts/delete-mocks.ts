
import 'dotenv/config';
import { db } from '../src/db';
import { user, rosterEntries, account, session } from '../src/db/schema';
import { like, eq } from 'drizzle-orm';

async function main() {
    console.log('🧹 Starting mock data cleanup...');

    // Find all users with @mock.wow email
    const mockUsers = await db.select().from(user).where(like(user.email, '%@mock.wow'));

    if (mockUsers.length === 0) {
        console.log('No mock users found.');
        process.exit(0);
    }

    console.log(`Found ${mockUsers.length} mock users.`);

    for (const u of mockUsers) {
        console.log(`Deleting ${u.name} (${u.email})...`);

        // Delete in order to satisfy FK constraints
        await db.delete(rosterEntries).where(eq(rosterEntries.userId, u.id));
        await db.delete(session).where(eq(session.userId, u.id));
        await db.delete(account).where(eq(account.userId, u.id));
        await db.delete(user).where(eq(user.id, u.id));
    }

    console.log(`\n✅ Cleanup complete. Deleted ${mockUsers.length} users.`);
    process.exit(0);
}

main().catch((err) => {
    console.error('❌ Cleanup failed:', err);
    process.exit(1);
});
