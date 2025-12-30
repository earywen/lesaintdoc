
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
                        <ScrollArea className="h-[calc(100vh-120px)] mt-6">
                            <div className="text-zinc-300 space-y-4 text-sm leading-loose whitespace-pre-line font-medium px-6 pb-8">
                                {`[Verse 1]
Le vingt-quatre au soir, sous le sapin de Noël
Zay-nith attendait son cadeau providentiel
Pas de jouets, pas d'argent, il criait au scandale
"JE VEUX LE GOU-GUEUL SHEET !" pour son cadeau final !
Il a ri-fresh la page, jusqu'au petit matin
Mais le fichier n'était pas là, quel triste destin !
(Triste destin !)

[Chorus]
MID-NIGHT ! Les ténèbres nous appellent !
Mais avant de partir, remplis le bordel !
Bli-zard fait n'importe quoi, les ad-onze sont cassés !
On sait même pas si l'extension va nous haï-per !
Le Ross-teur se prépare, pour le mois de Mars
Arrêtez de paniquer, arrêtez la farce !
MID-NIGHT !

[Verse 2]
On regarde les logs, on regarde la Mé-ta
Mais y'a une certitude qui ne bougera pas
Peu importe la classe, peu importe le look
Le Tank le plus pété, sera joué par Xorouk !
Il a déjà ri-roll, quarante-douze fois
Pour être sûr de tanker, comme un vrai Roi !
(Comme un Roi !)

[Chorus]
MID-NIGHT! Les ténèbres nous appellent !
Mais avant de partir, remplis le bordel !
Bli-zard fait n'importe quoi, les ad-onze sont cassés !
On sait même pas si l'extension va nous haï-per !
Le Ross-teur se prépare, pour le mois de Mars
Arrêtez de paniquer, arrêtez la farce !

[Bridge - Slow, Ominous, Whispered then Screaming]
Le silence d'Air-ri-wenn... pèse sur nos âmes...
L'entretien n'a pas eu lieu... rangez vos lames...
Personne ne sait... Si on est pris...
OU SI ON EST VIRÉ !!!
(VIRÉÉÉÉÉÉ !)

[Guitar Solo - Melodic and Shredding]

[Verse 3]
Alors connecte-toi, sur le nouveau site
Avant que le G-M, ne te déshérite !
Fais tes choix de classe, coche tes dispos
Sinon tu finiras, sur un jeu solo !
L'hiver est fini, le printemps arrive
Rejoignez le raid, ou partez à la dérive !

[Outro]
Zay-nith a son fichier...
Xorouk a son Tank...
Air-ri-wenn vous juge...
MID-NIGHT !
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
