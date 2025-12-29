import { db } from "@/db";
import { user, account } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { isWhitelisted, getMemberInfo } from "@/lib/guild-whitelist";

export async function syncUserWithWhitelist(userId: string) {
    // Get Discord ID
    const accountData = await db
        .select({ providerAccountId: account.accountId })
        .from(account)
        .where(and(eq(account.userId, userId), eq(account.providerId, "discord")))
        .limit(1);

    const discordId = accountData[0]?.providerAccountId;
    if (!discordId) return;

    // Check Whitelist
    if (isWhitelisted(discordId)) {
        const info = getMemberInfo(discordId);
        if (info) {
            // Check if update is needed to save DB writes
            const currentUser = await db.select({ name: user.name }).from(user).where(eq(user.id, userId)).limit(1);

            if (currentUser[0]?.name !== info.name) {
                await db.update(user)
                    .set({ name: info.name })
                    .where(eq(user.id, userId));
            }
        }
    }
}
