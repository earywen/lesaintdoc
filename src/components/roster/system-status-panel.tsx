"use client";

import { motion } from "framer-motion";
import { FullBuffAnalysis, BuffStatus } from "@/lib/buff-logic";
import { RosterAnalysis } from "@/lib/roster-logic";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BUFFS, UTILITIES, DEBUFFS, CLASSES } from "@/lib/wow-constants";

interface SystemStatusPanelProps {
    coverage: FullBuffAnalysis;
    analysis: RosterAnalysis;
}

// Build a lookup map: buffId -> classes that provide it
// Build a lookup map: buffId -> list of {class, specs}
function buildProviderMap() {
    const map: Record<string, { class: string; specs?: readonly string[] }[]> = {};

    const allDefs = { ...BUFFS, ...UTILITIES, ...DEBUFFS };
    for (const buff of Object.values(allDefs)) {
        // @ts-ignore - dynamic access during refactor
        map[buff.id] = buff.providers;
    }

    return map;
}

const PROVIDER_MAP = buildProviderMap();

// Configuration - 2 categories
const PANEL_CONFIG = {
    majorBuffs: [
        { id: "intellect", name: "Intellect", category: "buffs" },
        { id: "ap", name: "Attack Power", category: "buffs" },
        { id: "stamina", name: "Stamina", category: "buffs" },
        { id: "devo", name: "3% DR", category: "buffs" },
        { id: "phys_vuln", name: "5% Phys", category: "buffs" },
        { id: "magic_3", name: "3% Magic", category: "buffs" },
        { id: "vers", name: "3% Vers", category: "buffs" },
    ],
    utility: [
        { id: "lust", name: "Lust", category: "utilities" },
        { id: "brez", name: "Brez", category: "utilities" },
        { id: "speed", name: "Speed", category: "utilities" },
        { id: "lock", name: "Lock", category: "utilities" },
        { id: "mdispel", name: "M.Dispel", category: "utilities" },
        { id: "innerv", name: "Innerv", category: "utilities" },
        { id: "grip", name: "Grip/AMZ", category: "utilities" },
        { id: "bop", name: "BoP", category: "utilities" },
        { id: "rally", name: "Rally", category: "utilities" },
        { id: "dark", name: "Dark", category: "utilities" },
        { id: "immu", name: "Immu", category: "utilities" },
        { id: "sky", name: "Skyfury", category: "utilities" },
        { id: "bossdr", name: "Boss DR", category: "utilities" },
        { id: "dragon", name: "Dragons", category: "utilities" },
        { id: "exec", name: "Exec", category: "utilities" },
        { id: "atkslow", name: "Atk Slow", category: "utilities" },
        { id: "castslow", name: "Cast Slow", category: "utilities" },
        { id: "knock", name: "Knock", category: "debuffs" },
        { id: "ms", name: "MS", category: "debuffs" },
        { id: "soothe", name: "Soothe", category: "debuffs" },
        { id: "purge", name: "Purge", category: "debuffs" },
        { id: "pi", name: "PI", category: "debuffs" },
        { id: "shield", name: "Shield", category: "debuffs" },
        { id: "cheat", name: "Cheat", category: "debuffs" },
        { id: "bos", name: "BoS", category: "debuffs" },
    ],
};

// Buff row with tooltip
function BuffRow({
    item,
    status,
    providers
}: {
    item: { id: string; name: string };
    status: BuffStatus | undefined;
    providers: { name: string; className: string }[];
}) {
    const isActive = status?.isActive ?? false;
    const count = status?.count ?? 0;

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div className="flex items-center justify-between text-xs cursor-help">
                    <span className={isActive ? "text-zinc-300" : "text-zinc-500"}>
                        {item.name}
                    </span>
                    <span className={cn(
                        "w-5 text-right font-mono text-[11px]",
                        isActive ? "text-emerald-400" : "text-red-400/60"
                    )}>
                        {count}
                    </span>
                </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="w-fit min-w-[120px]">
                {providers.length > 0 ? (
                    <div className="text-xs space-y-0.5">
                        {providers.map((p, i) => {
                            // Find class color safely
                            const classKey = p.className.toUpperCase().replace(" ", "_");
                            // Direct lookup or default
                            // @ts-ignore - dynamic key access
                            const color = CLASSES[classKey]?.color || "#FFFFFF";

                            return (
                                <p key={i} style={{ color }} className="font-medium shadow-sm drop-shadow-md">
                                    {p.name}
                                </p>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-xs text-red-400">Aucun joueur</p>
                )}
            </TooltipContent>
        </Tooltip>
    );
}

export function SystemStatusPanel({ coverage, analysis }: SystemStatusPanelProps) {
    const getStatus = (id: string, category: string) => {
        const categoryData = coverage[category as keyof FullBuffAnalysis];
        return categoryData?.find((b: BuffStatus) => b.id === id);
    };

    // Find roster players who provide a specific buff
    const getProviders = (buffId: string): { name: string; className: string }[] => {
        const providers = PROVIDER_MAP[buffId] || [];
        // Include all players regardless of status (matching buff count logic)
        const allPlayers = analysis.players;

        return allPlayers
            .filter(p => {
                return providers.some(prov => {
                    const classMatch = prov.class === p.mainClass;
                    if (!classMatch) return false;
                    if (prov.specs && prov.specs.length > 0) {
                        return prov.specs.includes(p.mainSpec);
                    }
                    return true;
                });
            })
            .map(p => ({
                name: p.name,
                className: p.mainClass
            }));
    };

    const buffActive = PANEL_CONFIG.majorBuffs.filter(i => getStatus(i.id, i.category)?.isActive).length;
    const utilActive = PANEL_CONFIG.utility.filter(i => getStatus(i.id, i.category)?.isActive).length;

    return (
        <TooltipProvider delayDuration={100}>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="glass-card p-3"
            >
                {/* Header */}
                <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">
                    System Status
                </h3>

                {/* Two sections side by side */}
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Buffs column */}
                    <div className="flex-shrink-0 min-w-[100px]">
                        <div className="text-[10px] uppercase tracking-wider font-semibold text-amber-400 border-b border-amber-500/30 pb-1 mb-1.5 flex justify-between">
                            <span>Buffs</span>
                            <span className="opacity-70">{buffActive}/7</span>
                        </div>
                        <div className="space-y-0.5">
                            {PANEL_CONFIG.majorBuffs.map((item) => (
                                <BuffRow
                                    key={item.id}
                                    item={item}
                                    status={getStatus(item.id, item.category)}
                                    providers={getProviders(item.id)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Utility - 3 column grid */}
                    <div className="flex-grow">
                        <div className="text-[10px] uppercase tracking-wider font-semibold text-cyan-400 border-b border-cyan-500/30 pb-1 mb-1.5 flex justify-between">
                            <span>Utility</span>
                            <span className="opacity-70">{utilActive}/25</span>
                        </div>
                        <div className="grid grid-cols-3 gap-x-4 gap-y-0.5">
                            {PANEL_CONFIG.utility.map((item) => (
                                <BuffRow
                                    key={item.id}
                                    item={item}
                                    status={getStatus(item.id, item.category)}
                                    providers={getProviders(item.id)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        </TooltipProvider>
    );
}
