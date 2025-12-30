"use client";

import { useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { refreshDashboardData } from "@/actions/refresh";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export function RefreshButton() {
    const [isPending, startTransition] = useTransition();
    const [rotated, setRotated] = useState(false);

    const handleRefresh = () => {
        setRotated(true);
        startTransition(async () => {
            try {
                await refreshDashboardData();
                toast.success("Données mises à jour");

                // Reset rotation animation after a delay for visual feedback
                setTimeout(() => setRotated(false), 1000);
            } catch (err) {
                toast.error("Erreur lors de la mise à jour");
                setRotated(false);
            }
        });
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleRefresh}
                        disabled={isPending}
                        className="h-9 w-9 text-muted-foreground hover:text-white"
                        aria-label="Actualiser les données"
                    >
                        <RefreshCw
                            className={cn(
                                "h-5 w-5 transition-all duration-700",
                                (isPending || rotated) ? "animate-spin" : ""
                            )}
                        />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                    <p>Forcer la mise à jour des données</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
