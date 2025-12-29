// lib/buff-logic.ts
// Analyzes roster for buff/utility coverage

import { BUFFS, UTILITIES, DEBUFFS, CLASSES, Role } from "./wow-constants";

export interface BuffStatus {
    id: string;
    name: string;
    icon: string;
    providers: string[]; // List of class names for tooltip (simplified)
    isActive: boolean;
    count: number; // How many players provide this
}

type BuffEntry = {
    id: string;
    name: string;
    icon: string;
    providers: readonly { class: string; specs?: readonly string[] }[];
};

function analyzeCategory(
    category: Record<string, BuffEntry>,
    activePlayers: Array<{ mainClass: string; mainSpec: string }>
): BuffStatus[] {
    return Object.values(category).map((buff) => {
        const activeProviders = activePlayers.filter((player) => {
            // Check if player matches any provider definition for this buff
            return buff.providers.some(provider => {
                const classMatch = provider.class === player.mainClass;
                if (!classMatch) return false;

                // If specs are defined, player must match one of them
                if (provider.specs && provider.specs.length > 0) {
                    return provider.specs.includes(player.mainSpec);
                }

                // If no specs defined, class match is enough
                return true;
            });
        });

        // Unique classes for the tooltip summary
        const providingClasses = Array.from(new Set(buff.providers.map(p => p.class)));

        return {
            id: buff.id,
            name: buff.name,
            icon: buff.icon,
            providers: providingClasses,
            isActive: activeProviders.length > 0,
            count: activeProviders.length,
        };
    });
}

export interface FullBuffAnalysis {
    buffs: BuffStatus[];
    utilities: BuffStatus[];
    debuffs: BuffStatus[];
}

export function analyzeBuffs(
    rosterData: Array<{ mainClass: string; mainSpec: string; status: string }> // Added mainSpec
): BuffStatus[] {
    // All players count regardless of status
    const activePlayers = rosterData
        .map((p) => ({ mainClass: p.mainClass, mainSpec: p.mainSpec }));

    return analyzeCategory(BUFFS as unknown as Record<string, BuffEntry>, activePlayers);
}

export function analyzeFullCoverage(
    rosterData: Array<{ mainClass: string; mainSpec: string; status: string }> // Added mainSpec
): FullBuffAnalysis {
    const activePlayers = rosterData
        .map((p) => ({ mainClass: p.mainClass, mainSpec: p.mainSpec }));

    return {
        buffs: analyzeCategory(BUFFS as unknown as Record<string, BuffEntry>, activePlayers),
        utilities: analyzeCategory(UTILITIES as unknown as Record<string, BuffEntry>, activePlayers),
        debuffs: analyzeCategory(DEBUFFS as unknown as Record<string, BuffEntry>, activePlayers),
    };
}

// Class count analysis
export interface ClassCount {
    name: string;
    color: string;
    mainCount: number;
    altCount: number;
    total: number;
}

export function analyzeClassCounts(
    rosterData: Array<{ mainClass: string; altClass: string | null; status: string }>
): ClassCount[] {
    // All players count regardless of status
    const activePlayers = rosterData;

    return Object.values(CLASSES).map((cls) => {
        const mains = activePlayers.filter(
            (p) => p.mainClass === cls.name
        ).length;
        const alts = activePlayers.filter(
            (p) => p.altClass === cls.name
        ).length;

        return {
            name: cls.name,
            color: cls.color,
            mainCount: mains,
            altCount: alts,
            total: mains + alts,
        };
    });
}
