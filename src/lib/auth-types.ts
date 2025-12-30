import type { auth } from "./auth";

// Inférence automatique du type Session depuis Better Auth
export type Session = typeof auth.$Infer.Session;

// Type User avec le rôle custom
export type User = Session["user"];

// Helper type pour les vérifications de rôle
export type UserRole = "admin" | "member";
