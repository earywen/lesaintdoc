
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { CLASSES } from "@/lib/wow-constants"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"
import { EditRosterDialog } from "./edit-dialog"

// Define the shape of our data (matches database schema roughly)
import { RosterAnalysis } from "@/lib/roster-logic";

export type RosterMember = RosterAnalysis["players"][0];

export const getColumns = (currentUser: any): ColumnDef<RosterMember>[] => [
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="-ml-3 h-8 data-[state=open]:bg-accent"
                >
                    Player Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const cls = CLASSES[Object.keys(CLASSES).find(key => CLASSES[key as keyof typeof CLASSES].name === row.original.mainClass) as keyof typeof CLASSES];
            const color = cls?.color || "#fff";
            return <span className="font-medium" style={{ color }}>{row.getValue("name")}</span>
        }
    },
    {
        accessorKey: "mainClass",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="-ml-3 h-8 data-[state=open]:bg-accent"
                >
                    Class
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const clsName = row.original.mainClass;
            const cls = Object.values(CLASSES).find(c => c.name === clsName);
            return (
                <Badge variant="outline" className="border-opacity-50" style={{ borderColor: cls?.color, color: cls?.color }}>
                    {clsName}
                </Badge>
            )
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
    },
    {
        accessorKey: "mainSpec",
        header: "Spec",
        cell: ({ row }) => <span className="text-muted-foreground">{row.getValue("mainSpec")}</span>
    },
    {
        accessorKey: "offSpec",
        header: "Off Spec",
        cell: ({ row }) => <span className="text-xs text-zinc-500">{row.original.offSpec || "-"}</span>
    },
    {
        accessorKey: "altClass",
        header: "Alt Class",
        cell: ({ row }) => {
            const altClass = row.original.altClass;
            if (!altClass) return <span className="text-zinc-700">-</span>;

            const cls = Object.values(CLASSES).find(c => c.name === altClass);
            return (
                <div className="flex items-center gap-1">
                    {cls && (
                        <div className="w-1 h-3 rounded-full" style={{ backgroundColor: cls.color }} />
                    )}
                    <span className="font-medium text-xs" style={{ color: cls?.color }}>{altClass}</span>
                </div>
            )
        }
    },
    {
        accessorKey: "altSpec",
        header: "Alt Spec",
        cell: ({ row }) => <span className="text-xs text-zinc-500">{row.original.altSpec || "-"}</span>
    },
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
            return <span>{row.original.role}</span>
        }
    },
    {
        accessorKey: "status",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="-ml-3 h-8 data-[state=open]:bg-accent"
                >
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const status = row.original.status as string;
            // Status styling
            let color = "zinc";
            let icon = "⚪";
            let display = "";

            if (status === "confirmed") { color = "emerald"; icon = "✅"; display = "Confirmed" }
            if (status === "pending") { color = "amber"; icon = "⏳"; display = "Pending" }
            if (status === "apply") { color = "blue"; icon = "👋"; display = "Apply" }

            // Fallback for legacy
            if (!display) { display = status; icon = "❓"; }

            return (
                <div className="flex items-center gap-2">
                    <span>{icon}</span>
                    <span className="capitalize">{display}</span>
                </div>
            )
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
    },
    {
        accessorKey: "notes",
        header: "Notes",
        cell: ({ row }) => {
            const notes = row.original.notes;
            if (!notes) return <span className="text-zinc-700">-</span>;
            return <span className="text-xs text-zinc-400 max-w-[200px] truncate block" title={notes}>{notes}</span>;
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            return (
                <div className="flex justify-end">
                    <EditRosterDialog member={row.original} currentUser={currentUser} />
                </div>
            )
        }
    }
]
