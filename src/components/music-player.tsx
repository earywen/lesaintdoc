"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Play, Pause, Square, Volume2, VolumeX, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function MusicPlayer() {
    const pathname = usePathname();
    const { data: session } = authClient.useSession();
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState([0.5]); // Start low (10%)
    const [isMuted, setIsMuted] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Initial Auto-play attempt & Interaction Fallback
    useEffect(() => {
        const attemptPlay = () => {
            if (audioRef.current && !isPlaying) {
                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => {
                            setIsPlaying(true);
                            setIsVisible(true);
                            // Remove listener once successful
                            window.removeEventListener('click', attemptPlay);
                            window.removeEventListener('keydown', attemptPlay);
                        })
                        .catch((error) => {
                            console.log("Autoplay prevented:", error);
                            setIsVisible(true);
                        });
                }
            }
        };

        if (session) {
            // Try immediately
            attemptPlay();

            // Also listen for any interaction (fallback)
            window.addEventListener('click', attemptPlay);
            window.addEventListener('keydown', attemptPlay);

            return () => {
                window.removeEventListener('click', attemptPlay);
                window.removeEventListener('keydown', attemptPlay);
            };
        }
    }, [session, isPlaying]); // Depend on isPlaying to avoid re-triggering if already playing

    // Volume handling
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume[0];
        }
    }, [volume, isMuted]);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const stop = () => {
        if (!audioRef.current) return;
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
    };

    // Always keep audio mounted for playback
    // Only show controls on dashboard
    const showControls = isVisible && pathname?.startsWith("/dashboard");

    return (
        <>
            <AnimatePresence>
                {showControls && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2"
                    >
                        <div className="glass-card p-2 flex items-center gap-3 rounded-full border border-white/10 bg-black/60 backdrop-blur-md shadow-2xl pl-4 pr-4 h-12">
                            {/* Visualizer Icon */}
                            <div className="relative flex items-center justify-center p-1.5 rounded-full bg-primary/10">
                                <Music className={cn(
                                    "w-4 h-4 text-primary",
                                    isPlaying && "animate-pulse"
                                )} />
                            </div>

                            <div className="h-6 w-[1px] bg-white/10" />

                            {/* Controls */}
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-white/10 rounded-full"
                                    onClick={togglePlay}
                                >
                                    {isPlaying ? (
                                        <Pause className="h-4 w-4 fill-current" />
                                    ) : (
                                        <Play className="h-4 w-4 fill-current ml-0.5" />
                                    )}
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-white/10 rounded-full text-muted-foreground hover:text-red-400"
                                    onClick={stop}
                                >
                                    <Square className="h-3 w-3 fill-current" />
                                </Button>
                            </div>

                            <div className="h-6 w-[1px] bg-white/10 mx-1" />

                            {/* Volume */}
                            <div className="flex items-center gap-2 group">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-white/10 rounded-full text-muted-foreground"
                                    onClick={toggleMute}
                                >
                                    {isMuted || volume[0] === 0 ? (
                                        <VolumeX className="h-4 w-4" />
                                    ) : (
                                        <Volume2 className="h-4 w-4" />
                                    )}
                                </Button>

                                <div className="w-0 overflow-hidden group-hover:w-20 transition-all duration-300 ease-in-out">
                                    <Slider
                                        value={volume}
                                        max={1}
                                        step={0.01}
                                        onValueChange={setVolume}
                                        className="w-20 pr-2"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <audio ref={audioRef} src="/music.mp3" loop />
        </>
    );
}
