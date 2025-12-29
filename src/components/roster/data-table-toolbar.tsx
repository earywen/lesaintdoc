
"use client"

import { Table } from "@tanstack/react-table"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import { CLASSES } from "@/lib/wow-constants"

interface DataTableToolbarProps<TData> {
    table: Table<TData>
    children?: React.ReactNode
}

const statusOptions = [
    { label: "Pending", value: "pending" },
    { label: "Confirmed", value: "confirmed" },
    { label: "Apply", value: "apply" },
]

const classOptions = Object.values(CLASSES).map(c => ({
    label: c.name,
    value: c.name,
    color: c.color
}))

export function DataTableToolbar<TData>({
    table,
    children
}: DataTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
                <Input
                    placeholder="Filter players..."
                    value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("name")?.setFilterValue(event.target.value)
                    }
                    className="h-8 w-[150px] lg:w-[250px] bg-zinc-900/50 border-white/10"
                />
                {table.getColumn("status") && (
                    <DataTableFacetedFilter
                        column={table.getColumn("status")}
                        title="Status"
                        options={statusOptions}
                    />
                )}
                {table.getColumn("mainClass") && (
                    <DataTableFacetedFilter
                        column={table.getColumn("mainClass")}
                        title="Class"
                        options={classOptions}
                    />
                )}
                {isFiltered && (
                    <Button
                        variant="ghost"
                        onClick={() => table.resetColumnFilters()}
                        className="h-8 px-2 lg:px-3"
                    >
                        Reset
                        <X className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>
            <div className="ml-auto">
                {children}
            </div>
        </div>
    )
}
