
import { db } from "@/db";
import { rosterEntries, user, account } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { analyzeFullCoverage, analyzeClassCounts } from "@/lib/buff-logic";
import { analyzeRoster } from "@/lib/roster-logic";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { RosterClient } from "@/components/roster/roster-client";
import { isWhitelisted } from "@/lib/guild-whitelist";
import { syncUserWithWhitelist } from "@/lib/sync-user";
import { MusicControls } from "@/components/music-controls";

async function getDiscordId(userId: string): Promise<string | null> {
    const result = await db
        .select({ accountId: account.accountId })
        .from(account)
        .where(and(eq(account.userId, userId), eq(account.providerId, "discord")))
        .limit(1);
    return result[0]?.accountId || null;
}

async function getRosterData() {
    const data = await db
        .select({
            id: rosterEntries.id,
            odaigUserId: rosterEntries.userId,
            mainClass: rosterEntries.mainClass,
            mainSpec: rosterEntries.mainSpec,
            offSpec: rosterEntries.offSpec,
            altClass: rosterEntries.altClass,
            altSpec: rosterEntries.altSpec,
            status: rosterEntries.status,
            notes: rosterEntries.notes,
            userName: user.name,
        })
        .from(rosterEntries)
        .leftJoin(user, eq(rosterEntries.userId, user.id));

    return data.map((entry) => ({
        id: entry.id,
        userId: entry.odaigUserId,
        name: entry.userName || "Unknown",
        mainClass: entry.mainClass,
        mainSpec: entry.mainSpec,
        offSpec: entry.offSpec,
        altClass: entry.altClass,
        altSpec: entry.altSpec,
        notes: entry.notes,
        status: (entry.status || "pending") as "pending" | "confirmed" | "apply",
    }));
}

async function getUserWithRole(userId: string) {
    const result = await db
        .select({ id: user.id, name: user.name, email: user.email, role: user.role })
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);
    return result[0] || null;
}


import { notInArray } from "drizzle-orm";

async function getAvailableUsers() {
    // Get all users currently in the roster
    const currentRoster = await db.select({ userId: rosterEntries.userId }).from(rosterEntries);
    const setOfRosterUserIds = new Set(currentRoster.map(r => r.userId));

    // Get all users
    const allUsers = await db.select({ id: user.id, name: user.name }).from(user);

    // Filter client-side or use notInArray if array is not empty
    // Simulating "Left Join where null" or "Not In"
    return allUsers.filter(u => !setOfRosterUserIds.has(u.id));
}

export default async function DashboardPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/api/auth/signin");
    }

    // Sync name from whitelist if needed
    try {
        await syncUserWithWhitelist(session.user.id);
    } catch (error) {
        console.error("Failed to sync user with whitelist:", error);
    }

    // Whitelist check
    const discordId = await getDiscordId(session.user.id);
    if (!discordId || !isWhitelisted(discordId)) {
        redirect("/access-denied");
    }

    const currentUserWithRole = await getUserWithRole(session.user.id);
    const rosterData = await getRosterData();
    const availableUsers = await getAvailableUsers();

    const analysis = analyzeRoster(rosterData);
    const fullCoverage = analyzeFullCoverage(analysis.players);
    const classCounts = analyzeClassCounts(
        analysis.players.map(p => ({
            mainClass: p.mainClass,
            altClass: p.altClass,
            status: p.status
        }))
    );

    const currentUser = {
        ...session.user,
        role: currentUserWithRole?.role || "member",
    };

    return (
        <div className="min-h-screen relative">
            {/* Wallpaper Background - Subtle */}
            <div
                className="fixed inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/wallpaper.jpg')" }}
            />
            {/* Dark Overlay for Glassmorphism Effect */}
            <div className="fixed inset-0 bg-black/85" />

            {/* Gradient decoration */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-3xl" />
            </div>

            <div className="relative container mx-auto px-4 py-6 max-w-7xl">
                {/* Header */}
                <header className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold heading-glow">
                            Le Saint Doc 12.0
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Midnight • {analysis.confirmedPlayers} raiders confirmed
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <MusicControls />
                        <div className="text-right text-xs text-muted-foreground border-l border-white/10 pl-4">
                            <p>Logged in as <span className="text-white font-medium">{session.user.name}</span></p>
                            <p className={currentUser.role === "admin" ? "text-amber-400 uppercase font-bold" : "capitalize"}>
                                {currentUser.role}
                            </p>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <RosterClient
                    analysis={analysis}
                    coverage={fullCoverage}
                    classCounts={classCounts}
                    currentUser={currentUser}
                    availableUsers={availableUsers}
                />
            </div>
        </div>
    );
}

