"use client";

import { motion } from "framer-motion";
import { BuffStatus } from "@/lib/buff-logic";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function BuffHUD({ buffs }: { buffs: BuffStatus[] }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="glass-hud"
        >
            <div className="flex items-center gap-1">
                <span className="text-xs uppercase tracking-widest text-muted-foreground mr-4 font-medium">
                    Raid Buffs
                </span>
                <TooltipProvider delayDuration={100}>
                    <div className="flex items-center gap-2">
                        {buffs.map((buff, index) => (
                            <motion.div
                                key={buff.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 + index * 0.05, duration: 0.3 }}
                            >
                                <Tooltip>
                                    <TooltipTrigger>
                                        <div
                                            className={cn(
                                                "buff-icon text-2xl cursor-default",
                                                buff.isActive ? "active" : "missing"
                                            )}
                                        >
                                            {buff.icon}
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent
                                        side="bottom"
                                        className="glass-card border-white/10 px-3 py-2"
                                    >
                                        <p className="font-semibold text-sm">{buff.name}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {buff.providers.join(", ")}
                                        </p>
                                        <p className={cn(
                                            "text-xs font-medium mt-1",
                                            buff.isActive ? "text-green-400" : "text-red-400"
                                        )}>
                                            {buff.isActive ? "✓ Active" : "✗ Missing"}
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </motion.div>
                        ))}
                    </div>
                </TooltipProvider>
            </div>
        </motion.div>
    );
}
