// scripts/db-admin.ts
// Usage: npx tsx scripts/db-admin.ts delete-roster "GarmouZze"

import 'dotenv/config';
import { db } from '../src/db';
import { rosterEntries, user, session, account } from '../src/db/schema';
import { eq } from 'drizzle-orm';

const command = process.argv[2];
const arg = process.argv[3];

async function main() {
    switch (command) {
        case 'delete-roster': {
            if (!arg) {
                console.log('Usage: npx tsx scripts/db-admin.ts delete-roster "Username"');
                process.exit(1);
            }
            const users = await db.select().from(user).where(eq(user.name, arg));
            if (users.length === 0) {
                console.log(`User "${arg}" not found`);
                process.exit(1);
            }
            await db.delete(rosterEntries).where(eq(rosterEntries.userId, users[0].id));
            console.log(`✓ Roster entry deleted for "${arg}"`);
            break;
        }

        case 'delete-user': {
            if (!arg) {
                console.log('Usage: npx tsx scripts/db-admin.ts delete-user "Username"');
                process.exit(1);
            }
            const users = await db.select().from(user).where(eq(user.name, arg));
            if (users.length === 0) {
                console.log(`User "${arg}" not found`);
                process.exit(1);
            }
            const userId = users[0].id;
            // Delete in order due to foreign keys
            await db.delete(rosterEntries).where(eq(rosterEntries.userId, userId));
            await db.delete(session).where(eq(session.userId, userId));
            await db.delete(account).where(eq(account.userId, userId));
            await db.delete(user).where(eq(user.id, userId));
            console.log(`✓ User "${arg}" and all related data deleted`);
            break;
        }

        case 'list-users': {
            const users = await db.select({ id: user.id, name: user.name, email: user.email }).from(user);
            console.log('Users:');
            users.forEach(u => console.log(`  - ${u.name} (${u.email})`));
            break;
        }

        case 'list-roster': {
            const entries = await db
                .select({
                    userName: user.name,
                    mainClass: rosterEntries.mainClass,
                    mainSpec: rosterEntries.mainSpec,
                    status: rosterEntries.status,
                })
                .from(rosterEntries)
                .leftJoin(user, eq(rosterEntries.userId, user.id));
            console.log('Roster Entries:');
            entries.forEach(e => console.log(`  - ${e.userName}: ${e.mainClass} ${e.mainSpec} (${e.status})`));
            break;
        }

        default:
            console.log('Available commands:');
            console.log('  delete-roster "Username"  - Delete roster entry for a user');
            console.log('  delete-user "Username"    - Delete user and all their data');
            console.log('  list-users                - List all users');
            console.log('  list-roster               - List all roster entries');
    }

    process.exit(0);
}

main().catch(console.error);
