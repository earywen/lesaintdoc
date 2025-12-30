
"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { authClient } from "@/lib/auth-client";

interface MusicContextType {
    isPlaying: boolean;
    volume: number[];
    isMuted: boolean;
    togglePlay: () => void;
    stop: () => void;
    toggleMute: () => void;
    setVolume: (val: number[]) => void;
    currentTime: number;
    duration: number;
    seek: (time: number) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = authClient.useSession();
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState([0.5]); // Start at 50%
    const [isMuted, setIsMuted] = useState(false);
    const [hasAutoplayed, setHasAutoplayed] = useState(false);

    // Initial Auto-play attempt & Interaction Fallback
    useEffect(() => {
        if (!session || hasAutoplayed) return;

        const attemptPlay = () => {
            if (audioRef.current) {
                if (!audioRef.current.paused) {
                    setIsPlaying(true);
                    setHasAutoplayed(true);
                    return;
                }

                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => {
                            setIsPlaying(true);
                            setHasAutoplayed(true);
                        })
                        .catch((error) => {
                            console.log("Autoplay prevented, waiting for interaction");
                        });
                }
            }
        };

        // Try immediately
        attemptPlay();

        // Also listen for any interaction (fallback)
        window.addEventListener('click', attemptPlay);
        window.addEventListener('keydown', attemptPlay);

        return () => {
            window.removeEventListener('click', attemptPlay);
            window.removeEventListener('keydown', attemptPlay);
        };
    }, [session, hasAutoplayed]);

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

    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    // Throttled time update handler - limits updates to 4x per second max
    const lastTimeUpdateRef = useRef(0);
    const handleTimeUpdate = useCallback(() => {
        const now = Date.now();
        // Throttle: only update every 250ms (4 times per second)
        if (now - lastTimeUpdateRef.current < 250) return;
        lastTimeUpdateRef.current = now;

        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            // Fallback: if duration is missing (or Infinity/NaN), try to get it again
            if ((duration === 0 || !Number.isFinite(duration)) && Number.isFinite(audioRef.current.duration) && audioRef.current.duration > 0) {
                setDuration(audioRef.current.duration);
            }
        }
    }, [duration]);

    const handleLoadedMetadata = () => {
        if (audioRef.current && Number.isFinite(audioRef.current.duration)) {
            setDuration(audioRef.current.duration);
        }
    };

    const seek = (time: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    return (
        <MusicContext.Provider value={{
            isPlaying,
            volume,
            isMuted,
            currentTime,
            duration,
            togglePlay,
            stop,
            toggleMute,
            setVolume,
            seek
        }}>
            {children}
            <audio
                ref={audioRef}
                src="/music.mp3?v=2"
                loop
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onDurationChange={handleLoadedMetadata}
            />
        </MusicContext.Provider>
    );
}

export function useMusic() {
    const context = useContext(MusicContext);
    if (!context) {
        throw new Error("useMusic must be used within a MusicProvider");
    }
    return context;
}
