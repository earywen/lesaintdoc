"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Sheet } from "lucide-react";
import { syncAllToSheet } from "@/actions/roster";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SyncButtonProps {
    isAdmin: boolean;
    className?: string;
}

export function SyncButton({ isAdmin, className }: SyncButtonProps) {
    const [isSyncing, setIsSyncing] = useState(false);

    if (!isAdmin) return null;

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const result = await syncAllToSheet();
            if (result.success) {
                toast.success(`Roster synced! (${result.data.count} entries)`);
            } else {
                toast.error(result.error || "Sync failed");
            }
        } catch (error) {
            toast.error("Sync error");
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={isSyncing}
            className={cn("gap-2", className)}
        >
            <Sheet className="h-4 w-4" />
            {isSyncing ? "Syncing..." : "Sync Sheets"}
        </Button>
    );
}
