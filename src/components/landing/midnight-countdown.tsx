"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface MidnightCountdownProps {
    targetDate: Date;
    onComplete: () => void;
}

export function MidnightCountdown({ targetDate, onComplete }: MidnightCountdownProps) {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    function calculateTimeLeft() {
        const difference = +targetDate - +new Date();
        if (difference <= 0) {
            return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }
        return {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
        };
    }

    useEffect(() => {
        const timer = setInterval(() => {
            const timeLeft = calculateTimeLeft();
            setTimeLeft(timeLeft);

            if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) {
                clearInterval(timer);
                onComplete();
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="flex gap-4 sm:gap-6 md:gap-8 justify-center items-center py-8">
            <TimeUnit value={timeLeft.days} label="Jours" />
            <Separator />
            <TimeUnit value={timeLeft.hours} label="Heures" />
            <Separator />
            <TimeUnit value={timeLeft.minutes} label="Minutes" />
            <Separator />
            <TimeUnit value={timeLeft.seconds} label="Secondes" />
        </div>
    );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex flex-col items-center">
            <div className="relative">
                <AnimatePresence mode="popLayout">
                    <motion.span
                        key={value}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="text-4xl sm:text-5xl md:text-7xl font-bold font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50"
                    >
                        {value.toString().padStart(2, '0')}
                    </motion.span>
                </AnimatePresence>
            </div>
            <span className="text-[10px] sm:text-xs md:text-sm uppercase tracking-widest text-muted-foreground mt-2">
                {label}
            </span>
        </div>
    );
}

function Separator() {
    return (
        <div className="text-2xl sm:text-3xl md:text-5xl font-light text-white/20 pb-6">:</div>
    );
}
