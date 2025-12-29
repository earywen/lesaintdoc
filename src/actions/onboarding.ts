"use server";

import { db } from "@/db";
import { rosterEntries } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { safeAction } from "@/lib/safe-action";
import { z } from "zod";

const submitRosterSchema = z.object({
    isPlaying: z.boolean(),
    mainClass: z.string().optional(),
    mainSpec: z.string().optional(),
    offSpec: z.string().optional(),
    altClass: z.string().optional(),
    altSpec: z.string().optional(),
    notes: z.string().optional(),
});

export const submitRosterEntry = async (input: z.infer<typeof submitRosterSchema>) => {
    return safeAction(submitRosterSchema, async (data) => {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            throw new Error("Unauthorized");
        }

        const userId = session.user.id;
        const patchId = "Midnight"; // Hardcoded for now

        try {
            await db.insert(rosterEntries).values({
                userId,
                patchId,
                mainClass: data.mainClass || "Unknown",
                mainSpec: data.mainSpec || "Unknown",
                offSpec: data.offSpec || null,
                altClass: data.altClass || null,
                altSpec: data.altSpec || null,
                notes: data.notes || null,
                status: data.isPlaying ? "pending" : "apply",
                isLockedIn: false,
            });

            revalidatePath("/");
            return { success: true };
        } catch (error) {
            console.error("Failed to submit roster entry:", error);
            throw new Error("Failed to save entry");
        }
    }, input);
};
