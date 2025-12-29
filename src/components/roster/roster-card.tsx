"use client";

import { motion } from "framer-motion";
import { RosterMember } from "./columns";
import { CLASSES } from "@/lib/wow-constants";
import { cn } from "@/lib/utils";
import { EditRosterDialog } from "./edit-dialog";

interface RosterCardProps {
    member: RosterMember;
    currentUser: any;
    index: number;
}

function getClassSlug(className: string): string {
    return className.toLowerCase().replace(/\s+/g, "-");
}

function getClassColor(className: string): string {
    const cls = Object.values(CLASSES).find((c) => c.name === className);
    return cls?.color || "#ffffff";
}

function getRole(className: string, specName: string): string {
    const cls = Object.values(CLASSES).find((c) => c.name === className);
    // @ts-ignore
    return cls?.roles?.[specName] || "Unknown";
}

export function RosterCard({ member, currentUser, index }: RosterCardProps) {
    const classColor = getClassColor(member.mainClass);
    const role = getRole(member.mainClass, member.mainSpec);

    const statusStyles: Record<string, string> = {
        confirmed: "text-green-400 border-green-500/30 bg-green-500/10",
        pending: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
        apply: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{
                duration: 0.5,
                delay: index * 0.08,
                ease: [0.25, 0.46, 0.45, 0.94]
            }}
            className="roster-row group"
        >
            {/* Class Color Indicator */}
            <div
                className="w-1 h-12 rounded-full opacity-80"
                style={{
                    backgroundColor: classColor,
                    boxShadow: `0 0 15px ${classColor}40`
                }}
            />

            {/* Player Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                    <h3
                        className="font-semibold text-lg truncate class-glow"
                        style={{
                            color: classColor,
                            "--class-color": classColor
                        } as React.CSSProperties}
                    >
                        {member.name}
                    </h3>
                    <span
                        className={cn(
                            "px-2 py-0.5 text-xs rounded-full border font-medium uppercase tracking-wide",
                            statusStyles[member.status] || statusStyles.pending
                        )}
                    >
                        {member.status}
                    </span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                    <span style={{ color: classColor }}>{member.mainClass}</span>
                    <span className="mx-2 opacity-30">•</span>
                    <span>{member.mainSpec}</span>
                    <span className="mx-2 opacity-30">•</span>
                    <span className="text-zinc-500">{role}</span>
                </p>
            </div>

            {/* Actions */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <EditRosterDialog member={member} currentUser={currentUser} />
            </div>
        </motion.div>
    );
}
