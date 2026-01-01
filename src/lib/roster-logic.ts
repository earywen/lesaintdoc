// lib/roster-logic.ts
// Token and role calculation logic for the Raid Commander HUD

import { CLASSES, Role } from "./wow-constants";

// Token Mapping (updated: Armor Types)
export const TOKEN_MAPPING = {
    Zenith: ["Paladin", "Warrior", "Death Knight"], // Plate
    Dreadful: ["Priest", "Mage", "Warlock"],        // Cloth
    Mystic: ["Druid", "Monk", "Rogue", "Demon Hunter"], // Leather
    Venerated: ["Evoker", "Hunter", "Shaman"],      // Mail
} as const;

export type TokenType = keyof typeof TOKEN_MAPPING;

export function getTokenType(className: string): TokenType {
    for (const [token, classes] of Object.entries(TOKEN_MAPPING)) {
        if ((classes as readonly string[]).includes(className)) {
            return token as TokenType;
        }
    }
    return "Zenith";
}

export function getRole(className: string, specName: string): Role | "Unknown" {
    const cls = Object.values(CLASSES).find((c) => c.name === className);
    return cls?.roles?.[specName] || "Unknown";
}

// Analyze roster composition
export interface RosterAnalysis {
    totalPlayers: number;
    confirmedPlayers: number;

    // Role counts (confirmed only) - main chars
    tanks: { main: number; alt: number; total: number };
    healers: { main: number; alt: number; total: number };
    meleeDps: { main: number; alt: number; total: number };
    rangedDps: { main: number; alt: number; total: number };
    augmentation: { main: number; alt: number; total: number };

    // Token distribution (confirmed only)
    tokens: Record<TokenType, { main: number; alt: number; total: number }>;

    // Player data
    players: Array<{
        id: string;
        userId: string;
        name: string;
        mainClass: string;
        mainSpec: string;
        offSpec: string | null;
        altClass: string | null;
        altSpec: string | null;
        role: Role | "Unknown";
        token: TokenType;
        status: Exclude<RosterInput["status"], null>;
        originalStatus: string;
        notes: string | null;
    }>;
}

import { RosterEntry } from "@/db/schema";

export type RosterInput = Pick<RosterEntry, "id" | "userId" | "mainClass" | "mainSpec" | "offSpec" | "altClass" | "altSpec" | "status" | "notes"> & { name: string };

export function analyzeRoster(rosterData: RosterInput[]): RosterAnalysis {
    const players = rosterData.map((entry) => {
        // Map legacy statuses if they exist in DB
        let status = entry.status as string;
        const originalStatus = status; // Preserve original status for filtering

        if (status === "tentative" || status === "late" || status === "bench" || status === "declined") {
            status = "pending";
        }
        if (!status) status = "pending";

        return {
            ...entry,
            offSpec: entry.offSpec || null,
            altClass: entry.altClass || null,
            altSpec: entry.altSpec || null,
            status: status as "pending" | "confirmed" | "apply",
            originalStatus,
            notes: entry.notes || null,
            role: getRole(entry.mainClass, entry.mainSpec),
            token: getTokenType(entry.mainClass),
        };
    });

    // Count roles from main characters (Excluding bench)
    const countRole = (role: Role) => {
        const main = players.filter((p) => p.role === role && p.originalStatus !== "bench").length;
        // Also count alts that provide this role (Excluding bench)
        const alt = players.filter((p) => {
            if (p.originalStatus === "bench") return false;
            if (!p.altClass || !p.altSpec) return false;
            return getRole(p.altClass, p.altSpec) === role;
        }).length;
        return { main, alt, total: main + alt };
    };

    // Token breakdown from mains (Excluding bench) - ALTS IGNORED
    const tokenBreakdown = {} as Record<TokenType, { main: number; alt: number; total: number }>;
    for (const token of Object.keys(TOKEN_MAPPING) as TokenType[]) {
        const main = players.filter((p) => p.token === token && p.originalStatus !== "bench").length;
        // User requested to ignore Alts for token count
        const alt = 0;
        tokenBreakdown[token] = { main, alt, total: main };
    }

    // We still track confirmed players for the count
    const confirmed = players.filter(p => p.status === "confirmed");

    return {
        totalPlayers: players.length,
        confirmedPlayers: confirmed.length,

        tanks: countRole("Tank"),
        healers: countRole("Healer"),
        meleeDps: countRole("Melee"),
        rangedDps: countRole("Ranged"),
        augmentation: countRole("Augmentation"),

        tokens: tokenBreakdown,
        players,
    };
}

// Status helpers
export function getRoleStatus(count: number, min: number, max: number): "danger" | "warning" | "good" {
    if (count < min) return "danger";
    if (count > max) return "warning";
    return "good";
}

export function getTokenStatus(count: number): "danger" | "warning" | "good" {
    if (count === 0) return "danger";
    if (count >= 7) return "warning";
    return "good";
}
