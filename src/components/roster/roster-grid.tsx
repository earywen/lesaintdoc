"use client";

import { motion } from "framer-motion";
import { RosterAnalysis, TokenType } from "@/lib/roster-logic";
import { CLASSES } from "@/lib/wow-constants";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { EditRosterDialog } from "./edit-dialog";

interface RosterGridProps {
    analysis: RosterAnalysis;
    currentUser: any;
}

const statusColors: Record<string, string> = {
    confirmed: "bg-emerald-500 shadow-emerald-500/50",
    pending: "bg-amber-500 shadow-amber-500/50",
    apply: "bg-cyan-500 shadow-cyan-500/50",
};

const roleIcons: Record<string, string> = {
    Tank: "🛡️",
    Healer: "💚",
    Melee: "⚔️",
    Ranged: "🏹",
    Augmentation: "✨",
    Unknown: "❓",
};

const tokenColors: Record<TokenType, string> = {
    Zenith: "text-teal-400 border-teal-500/30 bg-teal-500/10",
    Dreadful: "text-red-400 border-red-500/30 bg-red-500/10",
    Mystic: "text-blue-400 border-blue-500/30 bg-blue-500/10",
    Venerated: "text-amber-400 border-amber-500/30 bg-amber-500/10",
};

function getClassColor(className: string): string {
    const cls = Object.values(CLASSES).find((c) => c.name === className);
    return cls?.color || "#ffffff";
}

export function RosterGrid({ analysis, currentUser }: RosterGridProps) {
    const isAdmin = currentUser?.role === "admin";

    return (
        <div className="glass-card overflow-hidden">
            {/* Header Row */}
            <div className="grid grid-cols-[32px_1fr_120px_110px_110px_120px_110px_1fr_50px] gap-1 px-3 py-2 bg-zinc-900/50 border-b border-white/5 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                <div className="text-center">St</div>
                <div>Player</div>
                <div>Main Class</div>
                <div>Spec</div>
                <div>Off</div>
                <div className="text-cyan-400">Alt Class</div>
                <div className="text-cyan-400">Spec</div>
                <div>Notes</div>
                <div className="text-center">Edit</div>
            </div>

            {/* Data Rows */}
            <TooltipProvider delayDuration={100}>
                <div className="divide-y divide-white/5">
                    {analysis.players.map((player, index) => {
                        const mainColor = getClassColor(player.mainClass);
                        const altColor = player.altClass ? getClassColor(player.altClass) : "#555";
                        const canEdit = isAdmin || currentUser?.id === player.userId;

                        return (
                            <motion.div
                                key={player.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.015, duration: 0.25 }}
                                className={cn(
                                    "grid grid-cols-[32px_1fr_120px_110px_110px_120px_110px_1fr_50px] gap-1 px-3 py-1.5 items-center transition-all hover:bg-white/5 group",
                                    "h-9"
                                )}
                            >
                                {/* Status */}
                                <div className="flex justify-center">
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <div className={cn(
                                                "w-2 h-2 rounded-full shadow-lg",
                                                statusColors[player.status || "pending"] || statusColors.pending
                                            )} />
                                        </TooltipTrigger>
                                        <TooltipContent side="right">
                                            <span className="capitalize">{player.status}</span>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>

                                {/* Player Name */}
                                <div
                                    className="font-medium text-sm"
                                    style={{ color: mainColor }}
                                >
                                    {player.name}
                                </div>

                                {/* Main Class */}
                                <div className="flex items-center gap-1 text-xs">
                                    <div
                                        className="w-1 h-3 rounded-full"
                                        style={{ backgroundColor: mainColor }}
                                    />
                                    <span style={{ color: mainColor }}>{player.mainClass}</span>
                                </div>

                                {/* Main Spec */}
                                <div className="text-xs text-zinc-400">
                                    {player.mainSpec}
                                </div>

                                {/* Off Spec */}
                                <div className="text-xs text-zinc-600">
                                    {player.offSpec || "-"}
                                </div>

                                {/* Alt Class */}
                                <div className="flex items-center gap-1 text-xs">
                                    {player.altClass ? (
                                        <>
                                            <div
                                                className="w-1 h-3 rounded-full"
                                                style={{ backgroundColor: altColor }}
                                            />
                                            <span style={{ color: altColor }}>{player.altClass}</span>
                                        </>
                                    ) : (
                                        <span className="text-zinc-700">-</span>
                                    )}
                                </div>

                                {/* Alt Spec */}
                                <div className="text-xs text-zinc-500">
                                    {player.altSpec || "-"}
                                </div>

                                {/* Notes */}
                                <div className="text-xs text-zinc-500 truncate">
                                    {player.notes ? (
                                        <Tooltip>
                                            <TooltipTrigger className="cursor-help w-full text-left truncate">
                                                <span className="opacity-70 italic">{player.notes}</span>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="max-w-xs">{player.notes}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    ) : (
                                        <span className="opacity-20">-</span>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex justify-center">
                                    {canEdit && (
                                        <EditRosterDialog
                                            member={player}
                                            currentUser={currentUser}
                                        />
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </TooltipProvider>

            {/* Footer */}
            <div className="px-3 py-1.5 bg-zinc-900/50 border-t border-white/5 text-[10px] text-muted-foreground flex justify-between">
                <span>{analysis.confirmedPlayers} confirmed / {analysis.totalPlayers} total</span>
                <span className="text-zinc-600">Hover for actions</span>
            </div>
        </div>
    );
}
