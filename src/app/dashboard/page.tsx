
import { db } from "@/db";
import { rosterEntries, user, account } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { analyzeFullCoverage, analyzeClassCounts } from "@/lib/buff-logic";
import { analyzeRoster } from "@/lib/roster-logic";
import { auth } from "@/lib/auth";
import { Suspense } from "react";
import { RefreshButton } from "@/components/refresh-button";
import { SyncButton } from "@/components/roster/sync-button";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { RosterClient } from "@/components/roster/roster-client";
import { isWhitelisted } from "@/lib/guild-whitelist";
import { syncUserWithWhitelist } from "@/lib/sync-user";
import { MusicControls } from "@/components/music-controls";
import Image from "next/image";
import { unstable_cache } from "next/cache";

async function getDiscordId(userId: string): Promise<string | null> {
    const result = await db
        .select({ accountId: account.accountId })
        .from(account)
        .where(and(eq(account.userId, userId), eq(account.providerId, "discord")))
        .limit(1);
    return result[0]?.accountId || null;
}

// Cached roster data query - revalidates every 30s or on-demand via tag
const getCachedRosterData = unstable_cache(
    async () => {
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
    },
    ["roster-data"],
    { tags: ["roster"], revalidate: 30 }
);

async function getUserWithRole(userId: string) {
    const result = await db
        .select({ id: user.id, name: user.name, email: user.email, role: user.role })
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);
    return result[0] || null;
}


// Cached available users query
const getCachedAvailableUsers = unstable_cache(
    async () => {
        const result = await db
            .select({ id: user.id, name: user.name })
            .from(user)
            .leftJoin(rosterEntries, eq(user.id, rosterEntries.userId))
            .where(isNull(rosterEntries.id));
        return result;
    },
    ["available-users"],
    { tags: ["roster", "users"], revalidate: 30 }
);

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

    // Parallel data fetching to avoid waterfalls
    const [currentUserWithRole, rosterData, availableUsers] = await Promise.all([
        getUserWithRole(session.user.id),
        getCachedRosterData(),
        getCachedAvailableUsers()
    ]);

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
            {/* Wallpaper Background - Optimized with next/image */}
            <div className="fixed inset-0 -z-20">
                <Image
                    src="/wallpaper.webp"
                    alt="World of Warcraft background"
                    fill
                    priority
                    quality={85}
                    className="object-cover blur-sm scale-105"
                    sizes="100vw"
                />
            </div>
            {/* Dark Overlay for Glassmorphism Effect */}
            <div className="fixed inset-0 bg-black/85 -z-10" />

            {/* Gradient decoration */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-3xl" />
            </div>

            <div className="relative container mx-auto px-4 py-6 max-w-[1600px]">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl md:text-3xl font-bold heading-glow">
                                Le Saint Doc 12.0
                            </h1>
                            <RefreshButton />
                            <SyncButton isAdmin={currentUser.role === "admin"} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Midnight • {analysis.confirmedPlayers} raiders confirmed
                        </p>
                    </div>

                    <div className="w-full md:w-auto flex flex-wrap items-center justify-between md:justify-end gap-4 bg-zinc-900/50 p-2 rounded-lg md:bg-transparent md:p-0">
                        <MusicControls />
                        <div className="text-right text-xs text-muted-foreground border-l border-white/10 pl-4 ml-auto md:ml-0">
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

