
"use client";

import { useMusic } from "@/components/music-context";
import { Play, Pause, Square, Volume2, VolumeX, Music, Mic2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

const formatTime = (seconds: number) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export function MusicControls() {
    const { isPlaying, volume, isMuted, currentTime, duration, togglePlay, stop, toggleMute, setVolume, seek } = useMusic();

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 mr-4"
        >
            <div className="glass-card p-1.5 flex items-center gap-2 rounded-full border border-white/10 bg-black/40 backdrop-blur-md px-3 h-9">

                {/* Lyrics Toggle */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:bg-white/10 rounded-full text-muted-foreground hover:text-white"
                            title="Paroles"
                        >
                            <Mic2 className="h-3 w-3" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="w-[400px] sm:w-[540px] border-l border-white/10 bg-black/90 backdrop-blur-xl pt-10">
                        <SheetHeader>
                            <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                                Le Saint Doc 12.0
                            </SheetTitle>
                        </SheetHeader>
                        <ScrollArea className="h-[calc(100vh-100px)] mt-6 pr-4">
                            <div className="text-muted-foreground space-y-4 text-sm leading-relaxed whitespace-pre-line font-medium">
                                {`[Couplet 1]
                                C'est l'histoire d'un doc, un sacré numéro,
                                Dans les raids de minuit, c'est notre héros.
                                Il soigne les blessures, il remonte les vies,
                                Mais attention au pull, ou c'est la panique !

                                [Refrain]
                                Le Saint Doc, Le Saint Doc,
                                Il nous carry, il nous shock.
                                Avec ses hots et ses shields,
                                Sur le dps meter il build !

                                [Pont]
                                (Instrumental épique)

                                [Couplet 2]
                                Quand le tank prend cher, il est toujours là,
                                Un petit dispell et ça repart comme ça.
                                Il crie sur discord "Bougez des aoe !",
                                Et on l'écoute tous, c'est notre dieu.

                                [Refrain]
                                Le Saint Doc, Le Saint Doc,
                                Il nous carry, il nous shock.
                                Avec ses hots et ses shields,
                                Sur le dps meter il build !

                                [Outro]
                                12.0 c'est son patch, c'est son moment,
                                Le Saint Doc, pour toujours, éternellement.
                                `}
                            </div>
                        </ScrollArea>
                    </SheetContent>
                </Sheet>

                <div className="h-4 w-[1px] bg-white/10 mx-1" />

                {/* Visualizer Icon */}
                <div className="relative flex items-center justify-center p-1 rounded-full bg-primary/10">
                    <Music className={cn(
                        "w-3 h-3 text-primary",
                        isPlaying && "animate-pulse"
                    )} />
                </div>

                <div className="h-4 w-[1px] bg-white/10" />

                {/* Controls */}
                <div className="flex items-center gap-0.5">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-white/10 rounded-full"
                        onClick={togglePlay}
                    >
                        {isPlaying ? (
                            <Pause className="h-3 w-3 fill-current" />
                        ) : (
                            <Play className="h-3 w-3 fill-current ml-0.5" />
                        )}
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-white/10 rounded-full text-muted-foreground hover:text-red-400"
                        onClick={stop}
                    >
                        <Square className="h-2.5 w-2.5 fill-current" />
                    </Button>
                </div>

                <div className="h-4 w-[1px] bg-white/10 mx-1" />

                {/* Seek Bar with Time */}
                <div className="flex items-center gap-2 px-1">
                    <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">
                        {formatTime(currentTime)}
                    </span>
                    <div className="w-24 group/seek">
                        <Slider
                            value={[currentTime]}
                            max={duration || 100}
                            step={1}
                            onValueChange={([val]) => seek(val)}
                            className="cursor-pointer"
                        />
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground w-8">
                        {formatTime(duration)}
                    </span>
                </div>

                <div className="h-4 w-[1px] bg-white/10 mx-1" />

                {/* Volume */}
                <div className="flex items-center gap-2 group">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-white/10 rounded-full text-muted-foreground"
                        onClick={toggleMute}
                    >
                        {isMuted || volume[0] === 0 ? (
                            <VolumeX className="h-3 w-3" />
                        ) : (
                            <Volume2 className="h-3 w-3" />
                        )}
                    </Button>

                    <div className="w-0 overflow-hidden group-hover:w-16 transition-all duration-300 ease-in-out">
                        <Slider
                            value={volume}
                            max={1}
                            step={0.01}
                            onValueChange={setVolume}
                            className="w-16 pr-2"
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
