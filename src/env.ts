import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
    server: {
        DATABASE_URL: z.string().url(),
        DISCORD_CLIENT_ID: z.string().min(1),
        DISCORD_CLIENT_SECRET: z.string().min(1),
        BETTER_AUTH_SECRET: z.string().optional(), // Often needed for Better Auth production
        BETTER_AUTH_URL: z.string().url().optional(), // Server side URL if needed
    },
    client: {
        NEXT_PUBLIC_BETTER_AUTH_URL: z.string().url(),
    },
    // If you're using Next.js < 13.4.4, you'll need to specify the runtimeEnv manually
    // runtimeEnv: {
    //   DATABASE_URL: process.env.DATABASE_URL,
    //   DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    //   DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
    //   NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
    // },
    // For Next.js >= 13.4.4, you only need to destructure client variables:
    experimental__runtimeEnv: {
        NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
    },
});
