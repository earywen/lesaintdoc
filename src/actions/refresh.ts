"use server";

import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Force revalidation of dashboard data
 * This is useful for manual refresh buttons
 */
export async function refreshDashboardData() {
    // Revalidate specific data tags we use in dashboard
    revalidateTag("roster-data", "max");
    revalidateTag("available-users", "max");
    revalidateTag("roster", "max");

    // Also revalidate the path to be sure
    revalidatePath("/dashboard");

    return { success: true, timestamp: Date.now() };
}
