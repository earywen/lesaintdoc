import { z, ZodError } from "zod";

export type ErrorCode =
    | "VALIDATION"
    | "UNAUTHORIZED"
    | "FORBIDDEN"
    | "NOT_FOUND"
    | "CONFLICT"
    | "UNKNOWN";

export type ActionState<T> =
    | { success: true; data: T }
    | { success: false; error: string; code: ErrorCode };

/**
 * Wrapper for Server Actions with Zod validation and error handling.
 * Preserves business logic error messages and categorizes them.
 */
export async function safeAction<S extends z.ZodType<unknown>, T>(
    schema: S,
    action: (data: z.infer<S>) => Promise<T>,
    input: z.infer<S>
): Promise<ActionState<T>> {
    try {
        const validated = schema.parse(input);
        const data = await action(validated);
        return { success: true, data };
    } catch (e) {
        // Zod validation errors
        if (e instanceof ZodError) {
            return {
                success: false,
                error: e.issues.map((i) => i.message).join(", "),
                code: "VALIDATION"
            };
        }

        // Business logic errors - categorize by message content
        if (e instanceof Error) {
            const msg = e.message.toLowerCase();
            const code: ErrorCode =
                msg.includes("unauthorized") ? "UNAUTHORIZED" :
                    msg.includes("forbidden") ? "FORBIDDEN" :
                        msg.includes("not found") ? "NOT_FOUND" :
                            msg.includes("already") ? "CONFLICT" :
                                "UNKNOWN";

            return {
                success: false,
                error: e.message,
                code
            };
        }

        return {
            success: false,
            error: "An unexpected error occurred",
            code: "UNKNOWN"
        };
    }
}
