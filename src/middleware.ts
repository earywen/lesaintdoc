import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { account } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// IDs des Admins autorisés à bypasser le Midnight Protocol
const ADMIN_IDS = [
    "155437093659607040", // garmouzze
    "159390867914883083", // Jyke
    "219427667257065475", // Vask
];

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

    // MIDNIGHT PROTOCOL CHECK
    // Si on est avant la date de release...
    if (new Date() < MIDNIGHT_RELEASE_DATE) {
        // On vérifie si l'utilisateur est un Admin via son ID Discord
        try {
            const userAccount = await db.select({ accountId: account.accountId })
                .from(account)
                .where(and(
                    eq(account.userId, session.user.id),
                    eq(account.providerId, "discord")
                ))
                .limit(1)
                .then(res => res[0]);

            const discordId = userAccount?.accountId;

            if (!discordId || !ADMIN_IDS.includes(discordId)) {
                // Pas dans la whitelist -> On rejette (même si connecté)
                // On redirige vers l'accueil avec un paramètre d'erreur (optionnel)
                return NextResponse.redirect(new URL("/?access=denied", request.url));
            }
        } catch (error) {
            console.error("Middleware DB Error:", error);
            // En cas d'erreur DB, par sécurité, on refuse
            return NextResponse.redirect(new URL("/", request.url));
        }
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
