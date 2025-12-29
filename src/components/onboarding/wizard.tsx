
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { submitRosterEntry } from "@/actions/onboarding";
import { CLASSES, CLASS_NAMES } from "@/lib/wow-constants";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

// --- Schema ---
const loadoutSchema = z.object({
    mainClass: z.string().min(1, "Ta classe est requise, champion."),
    mainSpec: z.string().min(1, "Ta spé est requise."),
    offSpec: z.string().optional(),
    hasAlt: z.boolean(),
    altClass: z.string().optional(),
    altSpec: z.string().optional(),
    notes: z.string().optional(),
}).refine((data) => !data.hasAlt || (data.altClass && data.altSpec), {
    message: "Si tu joues un alt, il faut nous dire quoi.",
    path: ["altClass"], // Focus error on altClass
});

type LoadoutFormValues = z.infer<typeof loadoutSchema>;

interface OnboardingWizardProps {
    userName: string;
}

export function OnboardingWizard({ userName }: OnboardingWizardProps) {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    // Form setup
    const form = useForm<LoadoutFormValues>({
        resolver: zodResolver(loadoutSchema),
        defaultValues: {
            mainClass: "",
            mainSpec: "",
            hasAlt: false,
            offSpec: undefined,
            altClass: undefined,
            altSpec: undefined,
            notes: undefined,
        },
    });

    const watchedClass = form.watch("mainClass");
    const watchedAltClass = form.watch("altClass");
    const hasAlt = form.watch("hasAlt");

    // Dynamic specs
    const getMainSpecs = () => watchedClass ? CLASSES[watchedClass.toUpperCase().replace(" ", "_") as keyof typeof CLASSES]?.specs || [] : [];
    const getAltSpecs = () => watchedAltClass ? CLASSES[watchedAltClass.toUpperCase().replace(" ", "_") as keyof typeof CLASSES]?.specs || [] : [];

    // Handlers
    const handleNext = () => setStep((prev) => (prev < 3 ? (prev + 1) as 1 | 2 | 3 : prev));

    const handleDecline = async () => {
        if (!confirm("T'es sûr de toi ? Ça veut dire pas d'accès au roster.")) return;
        setIsSubmitting(true);
        try {
            await submitRosterEntry({ isPlaying: false });
            toast.success("C'est noté. Dommage ! 👋");
            // Force reload or redirect to a goodbye page, currently just blocking access via standard flow
            window.location.href = "/access-denied";
        } catch {
            toast.error("Erreur lors de l'enregistrement du refus.");
            setIsSubmitting(false);
        }
    };

    const onSubmit = async (data: LoadoutFormValues) => {
        setIsSubmitting(true);
        try {
            const result = await submitRosterEntry({
                isPlaying: true,
                mainClass: data.mainClass,
                mainSpec: data.mainSpec,
                offSpec: data.offSpec === "None" ? undefined : data.offSpec, // Handle "None" cleanup if needed
                altClass: data.hasAlt ? data.altClass : undefined,
                altSpec: data.hasAlt ? data.altSpec : undefined,
                notes: data.notes,
            });

            if (result.success) {
                toast.success("Roster mis à jour ! Bienvenue à bord.");
                router.push("/dashboard");
            } else {
                toast.error("Erreur serveur.");
            }
        } catch {
            toast.error("Impossible de sauvegarder.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Animation variants
    const variants = {
        enter: { opacity: 0, x: 20, filter: "blur(10px)" },
        center: { opacity: 1, x: 0, filter: "blur(0px)" },
        exit: { opacity: 0, x: -20, filter: "blur(10px)" },
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-black/40 p-4 font-sans">
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
                    className="w-full max-w-lg"
                >
                    <Card className="border-white/10 bg-zinc-950/70 backdrop-blur-xl shadow-2xl ring-1 ring-white/5">

                        {/* STEP 1: INTRO */}
                        {step === 1 && (
                            <>
                                <CardHeader className="text-center pb-2">
                                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/10 ring-1 ring-indigo-500/50">
                                        <span className="text-3xl">👋</span>
                                    </div>
                                    <CardTitle className="text-2xl font-bold bg-gradient-to-br from-white to-zinc-400 bg-clip-text text-transparent">
                                        Ça y est {userName}, il est là.
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-center text-zinc-400 leading-relaxed">
                                    <p>
                                        C'est bon les gadjots, il est là la maudit doc'. La Jet Set rempile pour Midnight!
                                    </p>
                                </CardContent>
                                <CardFooter>
                                    <Button onClick={handleNext} className="w-full h-12 text-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02]">
                                        C'est pas trop tôt !
                                    </Button>
                                </CardFooter>
                            </>
                        )}

                        {/* STEP 2: DECISION */}
                        {step === 2 && (
                            <>
                                <CardHeader className="text-center pb-2">
                                    <CardTitle className="text-2xl font-bold text-white">
                                        Alors {userName}, tu signes pour Midnight ?
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-center text-zinc-400">
                                    <p>
                                        On a besoin de savoir si tu comptes raid avec nous ou si tu pars élever des chèvres dans le Larzac.
                                    </p>
                                </CardContent>
                                <CardFooter className="flex flex-col gap-3">
                                    <Button onClick={handleNext} className="w-full h-12 text-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                                        Je suis chaud ! 🔥
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={handleDecline}
                                        disabled={isSubmitting}
                                        className="w-full text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                                    >
                                        Non, je stop le jeu. 🐐
                                    </Button>
                                </CardFooter>
                            </>
                        )}

                        {/* STEP 3: LOADOUT */}
                        {step === 3 && (
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)}>
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-xl text-white">Allez {userName}, dis-nous tout.</CardTitle>
                                        <CardDescription>No troll please, merci (surtout Frost).</CardDescription>
                                    </CardHeader>

                                    <CardContent className="space-y-5">

                                        {/* Main Class & Spec Row */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="mainClass"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-zinc-300">Classe Main</FormLabel>
                                                        <Select onValueChange={(val) => { field.onChange(val); form.setValue("mainSpec", ""); }} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="bg-zinc-900/50 border-zinc-800">
                                                                    <SelectValue placeholder="Choisir..." />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {Object.values(CLASSES).map((cls) => (
                                                                    <SelectItem key={cls.name} value={cls.name} className="focus:bg-zinc-800">
                                                                        <span style={{ color: cls.color }} className="font-medium drop-shadow-sm">{cls.name}</span>
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="mainSpec"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-zinc-300">Spé Main</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value} disabled={!watchedClass}>
                                                            <FormControl>
                                                                <SelectTrigger className="bg-zinc-900/50 border-zinc-800">
                                                                    <SelectValue placeholder={watchedClass ? "Choisir..." : "Classe d'abord"} />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {getMainSpecs().map((spec) => (
                                                                    <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* Offspec */}
                                        <FormField
                                            control={form.control}
                                            name="offSpec"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-zinc-400 text-xs uppercase tracking-wider">Off Spec (Optionnel)</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value} disabled={!watchedClass}>
                                                        <FormControl>
                                                            <SelectTrigger className="bg-zinc-900/30 border-zinc-800 h-9 text-sm">
                                                                <SelectValue placeholder="Aucune" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="None">Aucune</SelectItem>
                                                            {getMainSpecs().map((spec) => (
                                                                <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}
                                        />

                                        {/* Alt Toggle */}
                                        <FormField
                                            control={form.control}
                                            name="hasAlt"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/30 p-3 shadow-sm">
                                                    <div className="space-y-0.5">
                                                        <FormLabel className="text-sm font-medium text-zinc-200">
                                                            Je compte jouer un Alt ?
                                                        </FormLabel>
                                                    </div>
                                                    <FormControl>
                                                        <Switch
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />

                                        {/* Alt Fields (Conditional) */}
                                        <AnimatePresence>
                                            {hasAlt && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden space-y-4 pt-1"
                                                >
                                                    <div className="grid grid-cols-2 gap-4 p-4 border border-zinc-800/50 rounded-lg bg-zinc-900/20">
                                                        <FormField
                                                            control={form.control}
                                                            name="altClass"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-xs text-zinc-400">Classe Alt</FormLabel>
                                                                    <Select onValueChange={(val) => { field.onChange(val); form.setValue("altSpec", ""); }}>
                                                                        <FormControl>
                                                                            <SelectTrigger className="bg-zinc-950 border-zinc-800 h-9">
                                                                                <SelectValue placeholder="Choisir..." />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent>
                                                                            {Object.values(CLASSES).map((cls) => (
                                                                                <SelectItem key={cls.name} value={cls.name}>
                                                                                    <span style={{ color: cls.color }}>{cls.name}</span>
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name="altSpec"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-xs text-zinc-400">Spé Alt</FormLabel>
                                                                    <Select onValueChange={field.onChange} value={field.value} disabled={!watchedAltClass}>
                                                                        <FormControl>
                                                                            <SelectTrigger className="bg-zinc-950 border-zinc-800 h-9">
                                                                                <SelectValue placeholder="Choisir..." />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent>
                                                                            {getAltSpecs().map((spec) => (
                                                                                <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Notes */}
                                        <FormField
                                            control={form.control}
                                            name="notes"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-zinc-300">Un petit mot pour le RL ?</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Dispo particulière, contraintes, ou juste un coucou..."
                                                            className="resize-none bg-zinc-900/50 border-zinc-800 min-h-[80px]"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />

                                    </CardContent>
                                    <CardFooter className="flex justify-between border-t border-white/5 pt-4">
                                        <Button type="button" variant="ghost" onClick={() => setStep(2)}>
                                            Retour
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="bg-indigo-600 hover:bg-indigo-500 text-white min-w-[120px]"
                                        >
                                            {isSubmitting ? "Envoi..." : "Valider 🚀"}
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Form>
                        )}
                    </Card>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
