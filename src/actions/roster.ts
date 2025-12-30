"use server";

import { db } from "@/db";
import { rosterEntries, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { safeAction } from "@/lib/safe-action";
import { z } from "zod";
import type { Session } from "@/lib/auth-types";
import { syncToSheet } from "@/lib/sheets";
import { sendRosterJoin, sendRosterUpdate } from "@/lib/discord";

// Input Schemas
const syncAllSchema = z.object({});

export const syncAllToSheet = async () => {
    return safeAction(syncAllSchema, async () => {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session || (session.user as Session["user"]).role !== "admin") {
            throw new Error("Unauthorized");
        }

        const entries = await db.query.rosterEntries.findMany({
            with: {
                user: true // Ensure we get user data
            }
        });

        console.log(`Syncing ${entries.length} entries to Sheets...`);

        // Serial execution to avoid rate limiting
        for (const entry of entries) {
            await syncToSheet({
                name: entry.user.name,
                mainClass: entry.mainClass,
                mainSpec: entry.mainSpec,
                offSpec: entry.offSpec || "",
                altClass: entry.altClass || "",
                altSpec: entry.altSpec || "",
                note: entry.notes || "",
                status: entry.status || "pending",
            });
        }

        return { success: true, count: entries.length };
    }, {});
};

const updateRosterSchema = z.object({
    entryId: z.string(),
    data: z.object({
        mainClass: z.string(),
        mainSpec: z.string(),
        offSpec: z.string().optional().nullable(),
        altClass: z.string().optional().nullable(),
        altSpec: z.string().optional().nullable(),
        status: z.enum(["pending", "confirmed", "apply"]),
        notes: z.string().optional(),
    }),
});

const deleteRosterSchema = z.object({
    entryId: z.string(),
});

export const updateRosterEntry = async (input: z.infer<typeof updateRosterSchema>) => {
    return safeAction(updateRosterSchema, async ({ entryId, data }) => {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            throw new Error("Unauthorized");
        }

        const entry = await db.query.rosterEntries.findFirst({
            where: eq(rosterEntries.id, entryId),
        });

        if (!entry) {
            throw new Error("Entry not found");
        }

        // Permission Check
        const userRole = (session.user as Session["user"]).role;
        const isOwner = entry.userId === session.user.id;
        const isAdmin = userRole === "admin";

        if (!isOwner && !isAdmin) {
            throw new Error("Forbidden");
        }

        await db.update(rosterEntries)
            .set({
                mainClass: data.mainClass,
                mainSpec: data.mainSpec,
                offSpec: data.offSpec,
                altClass: data.altClass,
                altSpec: data.altSpec,
                status: data.status,
                notes: data.notes,
            })
            .where(eq(rosterEntries.id, entryId));

        revalidateTag("roster", "max");
        revalidatePath("/dashboard");

        // Google Sheets Sync
        try {
            const userInfo = await db.query.user.findFirst({
                where: eq(user.id, entry.userId),
            });

            if (userInfo) {
                // Discord Notification
                const changes: string[] = [];
                if (entry.mainClass !== data.mainClass) changes.push(`Classe: ${entry.mainClass} ➔ ${data.mainClass}`);
                if (entry.mainSpec !== data.mainSpec) changes.push(`Spé: ${entry.mainSpec} ➔ ${data.mainSpec}`);
                if (entry.status !== data.status) changes.push(`Statut: ${entry.status || "pending"} ➔ ${data.status}`);

                if (changes.length > 0) {
                    await sendRosterUpdate(userInfo.name, changes);
                }

                await syncToSheet({
                    name: userInfo.name, // Ensure this property is correctly referenced
                    mainClass: data.mainClass,
                    mainSpec: data.mainSpec,
                    offSpec: data.offSpec || "",
                    altClass: data.altClass || "",
                    altSpec: data.altSpec || "",
                    note: data.notes || "",
                    status: data.status,
                });
            }
        } catch (error) {
            console.error("Failed to sync to Google Sheets:", error);
            // Non-blocking error
        }

        return { success: true };
    }, input);
};

export const deleteRosterEntry = async (input: z.infer<typeof deleteRosterSchema>) => {
    return safeAction(deleteRosterSchema, async ({ entryId }) => {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            throw new Error("Unauthorized");
        }

        const entry = await db.query.rosterEntries.findFirst({
            where: eq(rosterEntries.id, entryId),
        });

        if (!entry) {
            throw new Error("Entry not found");
        }

        // Only admins or owners can delete
        const isAdmin = (session.user as Session["user"]).role === "admin";
        const isOwner = entry.userId === session.user.id;

        if (!isOwner && !isAdmin) {
            throw new Error("Forbidden");
        }

        await db.delete(rosterEntries).where(eq(rosterEntries.id, entryId));

        revalidateTag("roster", "max");
        revalidatePath("/dashboard");
        return { success: true };
    }, input);
};

const createRosterSchema = z.object({
    userId: z.string(),
    data: z.object({
        mainClass: z.string(),
        mainSpec: z.string(),
        status: z.enum(["pending", "confirmed", "apply"]),
        notes: z.string().optional(),
    }),
});

export const createRosterEntry = async (input: z.infer<typeof createRosterSchema>) => {
    return safeAction(createRosterSchema, async ({ userId, data }) => {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            throw new Error("Unauthorized");
        }

        // Permission Check: only admins can manually create entries for others
        const isAdmin = (session.user as Session["user"]).role === "admin";
        if (!isAdmin) {
            throw new Error("Forbidden");
        }

        // Check if entry already exists for this user
        const existingEntry = await db.query.rosterEntries.findFirst({
            where: eq(rosterEntries.userId, userId),
        });

        if (existingEntry) {
            throw new Error("User already in roster");
        }

        await db.insert(rosterEntries).values({
            userId: userId,
            patchId: "Midnight", // Default patch
            mainClass: data.mainClass,
            mainSpec: data.mainSpec,
            status: data.status,
            notes: data.notes,
            characterType: "main",
        });

        revalidateTag("roster", "max");
        revalidatePath("/dashboard");

        // Google Sheets Sync
        try {
            const userInfo = await db.query.user.findFirst({
                where: eq(user.id, userId),
            });

            if (userInfo) {
                await sendRosterJoin(userInfo.name, data.mainClass, data.mainSpec);

                await syncToSheet({
                    name: userInfo.name,
                    mainClass: data.mainClass,
                    mainSpec: data.mainSpec,
                    status: data.status,
                    note: data.notes || "",
                });
            }
        } catch (error) {
            console.error("Failed to sync to Google Sheets:", error);
        }

        return { success: true };
    }, input);
};
