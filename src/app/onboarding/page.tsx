
import { OnboardingWizard } from "@/components/onboarding/wizard";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { syncUserWithWhitelist } from "@/lib/sync-user";

export default async function OnboardingPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/api/auth/signin");
    }

    await syncUserWithWhitelist(session.user.id);

    const existingEntry = await db.query.rosterEntries.findFirst({
        where: (entries, { eq, and }) => and(
            eq(entries.userId, session.user.id),
            eq(entries.patchId, "Midnight")
        )
    });

    if (existingEntry) {
        redirect("/dashboard");
    }

    return (
        <div className="relative min-h-screen">
            {/* Wallpaper Background - Subtle */}
            <div
                className="fixed inset-0 bg-cover bg-center bg-no-repeat blur-sm scale-105"
                style={{ backgroundImage: "url('/wallpaper.jpg')" }}
            />
            {/* Dark Overlay for Glassmorphism Effect */}
            <div className="fixed inset-0 bg-black/85" />

            <div className="relative z-10">
                <OnboardingWizard userName={session.user.name} />
            </div>
        </div>
    );
}
