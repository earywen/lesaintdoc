
import 'dotenv/config';
import { db } from '../src/db';
import { user, account } from '../src/db/schema';
import { GUILD_WHITELIST } from '../src/lib/guild-whitelist';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';

async function main() {
    console.log('🌱 Starting user seeding...');

    const entries = Object.entries(GUILD_WHITELIST);
    let createdCount = 0;
    let existingCount = 0;

    for (const [discordId, info] of entries) {
        // 1. Check if user exists by email (our placeholder convention)
        // We use a fake email convention: discordId@midnight.local to avoid collisions
        // and allow Better-Auth to link accounts if they log in later (auth linking usually relies on provider ID,
        // but creating the user record first is safe if we link the account correctly).
        const placeholderEmail = `${discordId}@midnight.local`;

        // Check if user exists by Discord Provider ID in Account table
        // We do a join manually or just look up account first
        const accounts = await db.select()
            .from(account)
            .where(and(
                eq(account.providerId, "discord"),
                eq(account.accountId, discordId)
            ))
            .limit(1);

        const existingAccount = accounts[0];

        if (existingAccount) {
            // Check associated user role
            const users = await db.select().from(user).where(eq(user.id, existingAccount.userId)).limit(1);
            const existingUser = users[0];

            if (existingUser) {
                if (existingUser.role !== info.role) {
                    await db.update(user)
                        .set({ role: info.role })
                        .where(eq(user.id, existingUser.id));
                    console.log(`  ↻ Updated role for ${info.name} to ${info.role}`);
                } else {
                    // console.log(`  ✓ ${info.name} already exists`);
                }
            }
            existingCount++;
            continue;
        }

        // If no account, check if user exists by email (unlikely for this specific flow but good practice)
        let userId: string;
        const existingUser = await db.query.user.findFirst({
            where: eq(user.email, placeholderEmail)
        });

        if (existingUser) {
            userId = existingUser.id;
        } else {
            // Create New User
            userId = nanoid();
            await db.insert(user).values({
                id: userId,
                name: info.name,
                email: placeholderEmail,
                emailVerified: true,
                role: info.role,
                createdAt: new Date(),
                updatedAt: new Date(),
                image: `https://cdn.discordapp.com/embed/avatars/${parseInt(discordId) % 5}.png`, // Default Discord avatar
            });
        }

        // Create Account Link
        await db.insert(account).values({
            id: nanoid(),
            userId: userId,
            accountId: discordId,
            providerId: "discord",
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        console.log(`  + Created user: ${info.name} (${info.role})`);
        createdCount++;
    }

    console.log(`\n✅ Seeding complete.`);
    console.log(`   - Created: ${createdCount}`);
    console.log(`   - Existing: ${existingCount}`);
    console.log(`   - Total: ${entries.length}`);

    process.exit(0);
}

main().catch((err) => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
});
