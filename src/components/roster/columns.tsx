
"use client"

import { useState, useRef, useEffect } from "react"

import { ColumnDef } from "@tanstack/react-table"
import { CLASSES } from "@/lib/wow-constants"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"
import { EditRosterDialog } from "./edit-dialog"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

// Define the shape of our data (matches database schema roughly)
import { RosterAnalysis } from "@/lib/roster-logic";

export type RosterMember = RosterAnalysis["players"][0];

const NoteCell = ({ note }: { note: string }) => {
    const [isTruncated, setIsTruncated] = useState(false)
    const ref = useRef<HTMLSpanElement>(null)

    useEffect(() => {
        const checkTruncation = () => {
            if (ref.current) {
                // Check if scrollWidth is greater than clientWidth
                // We add a small buffer (1px) to avoid false positives due to sub-pixel rendering
                setIsTruncated(ref.current.scrollWidth > ref.current.clientWidth + 1)
            }
        }

        // Check initially and on resize
        checkTruncation()
        window.addEventListener("resize", checkTruncation)

        return () => {
            window.removeEventListener("resize", checkTruncation)
        }
    }, [note])

    const content = (
        <span
            ref={ref}
            className="text-xs text-zinc-400 max-w-[200px] truncate block cursor-default"
        >
            {note}
        </span>
    )

    if (!isTruncated) {
        return content
    }

    return (
        <TooltipProvider>
            <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                    {content}
                </TooltipTrigger>
                <TooltipContent className="max-w-[300px] text-wrap break-words bg-zinc-900 border-zinc-800 text-zinc-300">
                    <p>{note}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}

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
            // Status styling - colored text without emojis
            let colorClass = "text-zinc-500";
            let display = status;

            if (status === "confirmed") {
                colorClass = "text-emerald-400";
                display = "Confirmed";
            }
            if (status === "pending") {
                colorClass = "text-amber-400";
                display = "Pending";
            }
            if (status === "apply") {
                colorClass = "text-violet-400";
                display = "Apply";
            }

            return (
                <span className={`font-medium ${colorClass}`}>
                    {display}
                </span>
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
            return <NoteCell note={notes} />;
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
