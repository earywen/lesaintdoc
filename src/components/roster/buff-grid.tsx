
"use client";

import { BuffStatus } from "@/lib/buff-logic";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function BuffGrid({ buffs }: { buffs: BuffStatus[] }) {
    return (
        <div className="flex flex-wrap gap-4 p-4 border rounded-lg bg-card/50 backdrop-blur mb-6 justify-center">
            <TooltipProvider>
                {buffs.map((buff) => (
                    <Tooltip key={buff.id}>
                        <TooltipTrigger>
                            <div
                                className={cn(
                                    "flex items-center justify-center text-3xl w-12 h-12 rounded-full border-2 transition-all",
                                    buff.isActive
                                        ? "border-green-500 bg-green-500/10 grayscale-0 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                                        : "border-red-500 bg-red-500/10 grayscale opacity-80"
                                )}
                            >
                                {buff.icon}
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="font-bold">{buff.name}</p>
                            <p className="text-xs text-muted-foreground">
                                Provided by: {buff.providers.join(", ")}
                            </p>
                            <p className={cn("text-sm mt-1", buff.isActive ? "text-green-500" : "text-red-500")}>
                                {buff.isActive ? "Active" : "Missing"}
                            </p>
                        </TooltipContent>
                    </Tooltip>
                ))}
            </TooltipProvider>
        </div>
    );
}
