
import { pgTable, text, boolean, timestamp, uuid, pgEnum } from "drizzle-orm/pg-core";

// Define Enums
export const roleEnum = pgEnum('user_role', ['admin', 'member']);
export const statusEnum = pgEnum('roster_status', ['pending', 'confirmed', 'apply']);
export const characterTypeEnum = pgEnum('character_type', ['main', 'alt']);

// User Table (Better-Auth Compatible)
export const user = pgTable("user", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").notNull(),
    image: text("image"),
    role: roleEnum("role").default('member'), // Custom field
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull()
});

export const session = pgTable("session", {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id").notNull().references(() => user.id)
});

export const account = pgTable("account", {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id").notNull().references(() => user.id),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull()
});

export const verification = pgTable("verification", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at")
});

// Business Logic

export const rosterEntries = pgTable("roster_entries", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").references(() => user.id, { onDelete: 'cascade' }).notNull(),

    // Patch context (e.g. "Midnight")
    patchId: text("patch_id").notNull(),

    // Main Selection
    mainClass: text("main_class").notNull(),
    mainSpec: text("main_spec").notNull(),
    characterType: characterTypeEnum("character_type").default('main').notNull(),

    // Offspec / Alt Selection
    offSpec: text("off_spec"),
    altClass: text("alt_class"),
    altSpec: text("alt_spec"),

    // Status & Notes
    status: statusEnum("status").default('pending'),
    isLockedIn: boolean("is_locked_in").default(false),
    notes: text("notes"),

    updatedAt: timestamp("updated_at").defaultNow(),
});

// Zod Schemas
import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const selectRosterEntrySchema = createSelectSchema(rosterEntries);
export const insertRosterEntrySchema = createInsertSchema(rosterEntries, {
    // Override validation if needed, e.g. enforcing specific formats
});

// Infer Types
export type RosterEntry = z.infer<typeof selectRosterEntrySchema>;
export type NewRosterEntry = z.infer<typeof insertRosterEntrySchema>;