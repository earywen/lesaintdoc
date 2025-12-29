// scripts/set-admins.ts
// One-time script to set admin users
// Usage: npx tsx scripts/set-admins.ts

import 'dotenv/config';
import { db } from '../src/db';
import { user } from '../src/db/schema';
import { eq, or } from 'drizzle-orm';

const ADMIN_USERNAMES = [
    "garmouzze",
    "aura.2256",
    "vasq6205",
    // Also match display names just in case
    "GarmouZze",
];

async function main() {
    console.log("🔐 Setting admin roles...\n");

    // Get all users
    const allUsers = await db.select().from(user);

    let updated = 0;
    for (const u of allUsers) {
        // Check if username matches (case-insensitive)
        const isAdmin = ADMIN_USERNAMES.some(
            admin => u.name?.toLowerCase() === admin.toLowerCase() ||
                u.email?.toLowerCase().includes(admin.toLowerCase())
        );

        if (isAdmin) {
            await db.update(user)
                .set({ role: "admin" })
                .where(eq(user.id, u.id));
            console.log(`  ✓ ${u.name} (${u.email}) → ADMIN`);
            updated++;
        }
    }

    if (updated === 0) {
        console.log("  ⚠️ No matching users found. They may need to log in first.");
        console.log("\n  Looking for these usernames:");
        ADMIN_USERNAMES.forEach(name => console.log(`    - ${name}`));
        console.log("\n  Current users in database:");
        allUsers.forEach(u => console.log(`    - ${u.name} (${u.email})`));
    } else {
        console.log(`\n✅ Updated ${updated} user(s) to admin role!`);
    }

    process.exit(0);
}

main().catch(console.error);
