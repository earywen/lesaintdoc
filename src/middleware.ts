import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

/**
 * Next.js 16 Middleware with Better Auth session validation.
 * Centralizes route protection instead of checking in each page.
 */
export async function middleware(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    // Not authenticated - redirect to home
    if (!session) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

export const config = {
    // Use Node.js runtime for Better Auth DB session checks
    runtime: "nodejs",

    // Protected routes
    matcher: [
        "/dashboard/:path*",
        "/onboarding/:path*"
    ]
};
