"use client";

import { useState, useEffect } from "react";
import { LoginButton } from "@/components/auth/login-button";
import { MidnightCountdown } from "@/components/landing/midnight-countdown";
import { TypingAnimation } from "@/components/ui/typing-animation";
import { Particles } from "@/components/ui/particles";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function LandingClient() {
    // 9 Janvier 2026 à 00h00
    const TARGET_DATE = new Date("2026-01-09T00:00:00");

    // Initial state check
    const [isReleased, setIsReleased] = useState(false);
    const [isAdminBypass, setIsAdminBypass] = useState(false);

    useEffect(() => {
        if (new Date() > TARGET_DATE) {
            setIsReleased(true);
        }
    }, []);

    const showLogin = isReleased || isAdminBypass;

    return (
        <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-background">
            {/* Wallpaper Background - Subtle */}
            <div
                className="fixed inset-0 bg-cover bg-center bg-no-repeat blur-sm scale-105"
                style={{ backgroundImage: "url('/wallpaper.webp')" }}
            />
            {/* Dark Overlay for Glassmorphism Effect */}
            <div className="fixed inset-0 bg-black/85" />
            <Particles
                className="absolute inset-0 z-0"
                quantity={200}
                ease={80}
                color="#ffffff"
                refresh
            />

            {/* Content Container */}
            <div className="z-10 text-center space-y-8 px-4 sm:px-12 py-12 backdrop-blur-md rounded-xl border border-white/10 bg-black/20 max-w-4xl w-[95%]">
                <div className="space-y-2">
                    <h1 className="text-4xl sm:text-6xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-neutral-500">
                        Le Saint Doc 12.0
                    </h1>
                    <p className="text-lg sm:text-xl text-neutral-400 font-light tracking-wide uppercase">
                        Midnight Protocol
                    </p>
                </div>

                <TypingAnimation
                    className="text-xl sm:text-2xl font-light text-muted-foreground min-h-[40px]"
                    duration={50}
                >
                    {showLogin ? "Accès autorisé." : "Système verrouillé jusqu'au pré-patch."}
                </TypingAnimation>

                <div className="pt-8 min-h-[150px] flex flex-col justify-center items-center">
                    {showLogin ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <LoginButton />
                        </motion.div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <MidnightCountdown
                                targetDate={TARGET_DATE}
                                onComplete={() => setIsReleased(true)}
                            />
                            <p className="text-xs text-white/20 uppercase tracking-[0.2em] animate-pulse mt-[-10px]">
                                (Anniv de Frost 🎉)
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Secret Admin Button */}
            {!showLogin && (
                <div className="fixed bottom-4 right-4 z-50">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-20 hover:opacity-100 transition-opacity duration-500 hover:bg-white/10"
                        onClick={() => setIsAdminBypass(true)}
                        title="Admin Bypass"
                    >
                        <LockKeyhole className="h-4 w-4 text-white" />
                    </Button>
                </div>
            )}
        </div>
    );
}
