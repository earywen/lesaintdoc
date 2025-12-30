import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { account } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { isAdmin, isWhitelisted } from "@/lib/guild-whitelist";

// Date de déblocage global (27 Janvier 2026 à 23h59)
const MIDNIGHT_RELEASE_DATE = new Date("2026-01-27T23:59:00");

/**
 * Next.js 16 Middleware with Better Auth session validation.
 * Centralizes route protection instead of checking in each page.
 */
export async function middleware(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    // Not authenticated - redirect to home
    if (!session) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    // AUTH & SECURITY CHECK
    try {
        // Retrieve Discord ID linked to the user
        const userAccount = await db.select({ accountId: account.accountId })
            .from(account)
            .where(and(
                eq(account.userId, session.user.id),
                eq(account.providerId, "discord")
            ))
            .limit(1)
            .then(res => res[0]);

        const discordId = userAccount?.accountId;

        if (!discordId) {
            // No Discord ID found ?? Reject.
            return NextResponse.redirect(new URL("/?error=no_discord_id", request.url));
        }

        // MIDNIGHT PROTOCOL (Avant la date)
        if (new Date() < MIDNIGHT_RELEASE_DATE) {
            // Seuls les ADMINS peuvent passer via la backdoor
            if (!isAdmin(discordId)) {
                return NextResponse.redirect(new URL("/?access=denied_admin_only", request.url));
            }
        }
        // OPEN ACCESS (Après la date)
        else {
            // La Whitelist générale s'applique (Mode Privé)
            if (!isWhitelisted(discordId)) {
                return NextResponse.redirect(new URL("/?access=denied_whitelist", request.url));
            }
        }

    } catch (error) {
        console.error("Middleware DB Error:", error);
        return NextResponse.redirect(new URL("/?error=server_error", request.url));
    }

    return NextResponse.next();
}

export const config = {
    // Use Node.js runtime for Better Auth DB session checks
    runtime: "nodejs",

    // Protected routes
    matcher: [
        "/dashboard/:path*",
        "/onboarding/:path*"
    ]
};
