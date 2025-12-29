import { z } from "zod";

export type ActionState<T> =
    | { success: true; data: T }
    | { success: false; error: string };

export async function safeAction<S extends z.ZodType<any, any>, T>(
    schema: S,
    action: (data: z.infer<S>) => Promise<T>,
    input: z.infer<S>
): Promise<ActionState<T>> {
    try {
        const validated = schema.parse(input);
        const data = await action(validated);
        return { success: true, data };
    } catch (e) {
        if (e instanceof z.ZodError) {
            return { success: false, error: "Validation failed: " + e.issues.map((err: z.ZodIssue) => err.message).join(", ") };
        }
        return { success: false, error: "An unexpected error occurred" };
    }
}
