"use client";

import { motion } from "framer-motion";
import { RosterAnalysis, getRoleStatus, getTokenStatus, TokenType } from "@/lib/roster-logic";
import { FullBuffAnalysis, BuffStatus, ClassCount } from "@/lib/buff-logic";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface RosterMetricsProps {
    analysis: RosterAnalysis;
    coverage: FullBuffAnalysis;
    classCounts: ClassCount[];
}

// Micro Progress Bar Component
function MicroBar({
    label,
    mainCount,
    altCount,
    target,
    status
}: {
    label: string;
    mainCount: number;
    altCount: number;
    target: number;
    status: "danger" | "warning" | "good";
}) {
    const total = mainCount + altCount;
    // Only count mains for the bar progress
    const percentage = Math.min((mainCount / target) * 100, 100);
    const statusColors = {
        danger: "bg-red-500 shadow-red-500/50",
        warning: "bg-amber-500 shadow-amber-500/50",
        good: "bg-emerald-500 shadow-emerald-500/50",
    };

    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{label}</span>
                <span className={cn(
                    "font-mono",
                    status === "danger" && "text-red-400 animate-pulse",
                    status === "warning" && "text-amber-400",
                    status === "good" && "text-emerald-400"
                )}>
                    {mainCount}/{target} <span className="text-zinc-600 text-[10px]">(+{altCount}a)</span>
                </span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={cn("h-full rounded-full shadow-lg", statusColors[status])}
                />
            </div>
        </div>
    );
}

// DPS Split Bar (Melee vs Ranged)
function DpsSplitBar({ melee, ranged }: { melee: { main: number; alt: number }; ranged: { main: number; alt: number } }) {
    const meleeTotal = melee.main + melee.alt;
    const rangedTotal = ranged.main + ranged.alt;
    const total = meleeTotal + rangedTotal;
    const meleePercent = total > 0 ? (meleeTotal / total) * 100 : 50;

    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs">
                <span className="text-orange-400">⚔️ {melee.main}</span>
                <span className="text-muted-foreground">DPS Split</span>
                <span className="text-cyan-400">{ranged.main} 🏹</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden flex">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${meleePercent}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-orange-600 to-orange-400"
                />
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${100 - meleePercent}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600"
                />
            </div>
        </div>
    );
}

// Token Counter with micro-chart
function TokenCounter({ token, data }: { token: TokenType; data: { main: number; alt: number; total: number } }) {
    const status = getTokenStatus(data.total);
    const tokenColors: Record<TokenType, string> = {
        Zenith: "from-emerald-500 to-teal-500",
        Dreadful: "from-red-500 to-rose-500",
        Mystic: "from-blue-500 to-indigo-500",
        Venerated: "from-amber-500 to-yellow-500",
    };

    const maxDisplay = 8;
    const filled = Math.min(data.total, maxDisplay);
    const empty = maxDisplay - filled;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className={cn(
                        "glass-card p-2 text-center cursor-default transition-all hover:scale-105",
                        status === "warning" && "border-amber-500/50",
                        status === "danger" && "border-red-500/50 animate-pulse"
                    )}>
                        <div className="text-[10px] text-muted-foreground">{token}</div>
                        <div className={cn(
                            "text-xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
                            tokenColors[token]
                        )}>
                            {data.main}<span className="text-xs text-zinc-500">+{data.alt}</span>
                        </div>
                        <div className="font-mono text-[10px] text-zinc-600">
                            [{"█".repeat(filled)}{"-".repeat(empty)}]
                        </div>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{data.main} main + {data.alt} alt on {token}</p>
                    {data.total >= 7 && <p className="text-amber-400 text-xs">⚠️ High loot competition</p>}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

// Compact Buff/Utility Grid
function BuffUtilityGrid({ items, title }: { items: BuffStatus[]; title: string }) {
    return (
        <div>
            <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{title}</h4>
            <TooltipProvider delayDuration={100}>
                <div className="flex flex-wrap gap-1">
                    {items.map((item) => (
                        <Tooltip key={item.id}>
                            <TooltipTrigger>
                                <div className={cn(
                                    "w-6 h-6 rounded flex items-center justify-center text-sm transition-all",
                                    item.isActive
                                        ? "bg-emerald-500/20 border border-emerald-500/50"
                                        : "bg-zinc-800/50 border border-zinc-700/50 grayscale opacity-40"
                                )}>
                                    {item.icon}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                                <p className="font-semibold">{item.name}</p>
                                <p className={item.isActive ? "text-emerald-400" : "text-red-400"}>
                                    {item.isActive ? `✓ ${item.count}x` : "✗ Missing"}
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </div>
            </TooltipProvider>
        </div>
    );
}

// Class Count Grid
function ClassCountGrid({ classCounts }: { classCounts: ClassCount[] }) {
    const activeClasses = classCounts.filter(c => c.total > 0);

    return (
        <div className="grid grid-cols-4 gap-1">
            {classCounts.map((cls) => (
                <TooltipProvider key={cls.name} delayDuration={100}>
                    <Tooltip>
                        <TooltipTrigger>
                            <div className={cn(
                                "px-1 py-0.5 rounded text-[10px] font-mono text-center transition-all",
                                cls.total > 0
                                    ? "bg-zinc-800/80 border border-zinc-700"
                                    : "bg-zinc-900/50 border border-zinc-800 opacity-40"
                            )}>
                                <span style={{ color: cls.total > 0 ? cls.color : "#555" }}>
                                    {cls.name.substring(0, 3).toUpperCase()}
                                </span>
                                <span className="ml-1 text-zinc-400">
                                    {cls.mainCount}<span className="text-zinc-600">+{cls.altCount}</span>
                                </span>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p style={{ color: cls.color }}>{cls.name}</p>
                            <p className="text-xs">{cls.mainCount} main, {cls.altCount} alt</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            ))}
        </div>
    );
}

export function RosterMetrics({ analysis, coverage, classCounts }: RosterMetricsProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-3 h-full"
        >
            {/* Role Composition */}
            <div className="glass-card p-3 space-y-2 h-full">
                <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                    Roles
                </h3>
                <MicroBar
                    label="🛡️ Tanks"
                    mainCount={analysis.tanks.main}
                    altCount={analysis.tanks.alt}
                    target={2}
                    status={getRoleStatus(analysis.tanks.main, 2, 2)}
                />
                <MicroBar
                    label="💚 Healers"
                    mainCount={analysis.healers.main}
                    altCount={analysis.healers.alt}
                    target={4}
                    status={getRoleStatus(analysis.healers.main, 4, 5)}
                />
                <DpsSplitBar
                    melee={{ main: analysis.meleeDps.main, alt: 0 }}
                    ranged={{ main: analysis.rangedDps.main, alt: 0 }}
                />
                {analysis.augmentation.main > 0 && (
                    <div className="text-xs text-purple-400">
                        ✨ Aug: {analysis.augmentation.main}
                    </div>
                )}
            </div>

            {/* Class Counts */}
            <div className="glass-card p-3 h-full">
                <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">
                    Classes
                </h3>
                <ClassCountGrid classCounts={classCounts} />
            </div>

            {/* Token Balance */}
            <div className="glass-card p-3 h-full">
                <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">
                    Tokens
                </h3>
                <div className="grid grid-cols-2 gap-1">
                    <TokenCounter token="Zenith" data={analysis.tokens.Zenith} />
                    <TokenCounter token="Dreadful" data={analysis.tokens.Dreadful} />
                    <TokenCounter token="Mystic" data={analysis.tokens.Mystic} />
                    <TokenCounter token="Venerated" data={analysis.tokens.Venerated} />
                </div>
            </div>
        </motion.div>
    );
}
