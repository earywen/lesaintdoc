"use server";

import { db } from "@/db";
import { rosterEntries } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { safeAction } from "@/lib/safe-action";
import { z } from "zod";

// Input Schemas
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
        // @ts-ignore
        const userRole = session.user.role;
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

        revalidatePath("/dashboard");
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
        // @ts-ignore
        const isAdmin = session.user.role === "admin";
        const isOwner = entry.userId === session.user.id;

        if (!isOwner && !isAdmin) {
            throw new Error("Forbidden");
        }

        await db.delete(rosterEntries).where(eq(rosterEntries.id, entryId));

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
        // @ts-ignore
        const isAdmin = session.user.role === "admin";
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

        revalidatePath("/dashboard");
        return { success: true };
    }, input);
};
