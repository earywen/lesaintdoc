"use client";

import { RosterMetrics } from "./roster-metrics";
import { SystemStatusPanel } from "./system-status-panel";
import { RosterAnalysis } from "@/lib/roster-logic";
import { FullBuffAnalysis, ClassCount } from "@/lib/buff-logic";
import { CreateRosterDialog } from "./create-dialog";
import { RosterDataTable } from "./data-table";
import { getColumns } from "./columns";

interface RosterClientProps {
    analysis: RosterAnalysis;
    coverage: FullBuffAnalysis;
    classCounts: ClassCount[];
    currentUser: any;
    availableUsers: { id: string; name: string }[];
}

export function RosterClient({ analysis, coverage, classCounts, currentUser, availableUsers }: RosterClientProps) {
    const isAdmin = currentUser?.role === "admin";

    return (
        <div className="space-y-4">
            {/* Top Row: 5-column grid (1+1+1+2) */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
                {/* Roles - 1/5 */}
                <div className="lg:col-span-3 h-full">
                    <RosterMetrics
                        analysis={analysis}
                        coverage={coverage}
                        classCounts={classCounts}
                    />
                </div>
                {/* System Status - 2/5 */}
                <div className="lg:col-span-2 flex flex-col gap-3">
                    <SystemStatusPanel coverage={coverage} analysis={analysis} />
                </div>
            </div>


            {/* Main Grid - Advanced Data Table */}
            <div className="glass-card p-4">
                <RosterDataTable
                    columns={getColumns(currentUser)}
                    data={analysis.players}
                    toolbarAction={
                        currentUser?.role === "admin" && (
                            <CreateRosterDialog availableUsers={availableUsers} />
                        )
                    }
                />
            </div>
        </div>
    );
}
