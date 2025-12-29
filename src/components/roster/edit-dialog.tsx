"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateRosterEntry, deleteRosterEntry } from "@/actions/roster";
import { toast } from "sonner";
import { CLASSES } from "@/lib/wow-constants";

import { RosterInput } from "@/lib/roster-logic";

import { Textarea } from "@/components/ui/textarea";

interface EditDialogProps {
    member: RosterInput;
    currentUser: any;
}

export function EditRosterDialog({
    member,
    currentUser
}: EditDialogProps) {
    const {
        id: entryId,
        userId,
        name: playerName,
        mainClass: currentMainClass,
        mainSpec: currentMainSpec,
        offSpec: currentOffSpec,
        altClass: currentAltClass,
        altSpec: currentAltSpec,
        status: currentStatus,
        notes: currentNotes
    } = member;
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(currentStatus);
    const [notes, setNotes] = useState(currentNotes || "");

    // Main character
    const [mainClass, setMainClass] = useState(currentMainClass);
    const [mainSpec, setMainSpec] = useState(currentMainSpec);
    const [offSpec, setOffSpec] = useState(currentOffSpec || "none");

    // Alt character
    const [altClass, setAltClass] = useState(currentAltClass || "none");
    const [altSpec, setAltSpec] = useState(currentAltSpec || "");

    const [isSaving, setIsSaving] = useState(false);

    // Get specs for classes
    const mainClassData = Object.values(CLASSES).find(c => c.name === mainClass);
    const mainSpecs = mainClassData ? Object.keys(mainClassData.roles) : [];

    const altClassData = Object.values(CLASSES).find(c => c.name === altClass);
    const altSpecs = altClassData ? Object.keys(altClassData.roles) : [];

    const handleMainClassChange = (newClass: string) => {
        setMainClass(newClass);
        const data = Object.values(CLASSES).find(c => c.name === newClass);
        if (data) {
            const specs = Object.keys(data.roles);
            setMainSpec(specs[0] || "");
            setOffSpec("none");
        }
    };

    const handleAltClassChange = (newClass: string) => {
        setAltClass(newClass);
        if (newClass && newClass !== "none") {
            const data = Object.values(CLASSES).find(c => c.name === newClass);
            if (data) {
                const specs = Object.keys(data.roles);
                setAltSpec(specs[0] || "");
            }
        } else {
            setAltSpec("");
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        const result = await updateRosterEntry({
            entryId,
            data: {
                mainClass,
                mainSpec,
                offSpec: offSpec === "none" ? null : offSpec,
                altClass: altClass === "none" ? null : altClass,
                altSpec: altSpec || null,
                status: status as any,
                notes,
            }
        });
        setIsSaving(false);

        if (result.success) {
            toast.success(`Updated ${playerName}`);
            setOpen(false);
            window.location.reload();
        } else {
            toast.error(result.error || "Failed to update");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                    suppressHydrationWarning
                >
                    Edit
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-zinc-900 border-zinc-700">
                <DialogHeader>
                    <DialogTitle>Edit {playerName}</DialogTitle>
                    <p className="text-sm text-muted-foreground">Configure main and alt characters.</p>
                </DialogHeader>

                <div className="space-y-4 py-3">
                    {/* Status */}
                    <div className="grid grid-cols-4 items-center gap-3">
                        <Label className="text-right text-xs">Status</Label>
                        <Select value={status || "pending"} onValueChange={(val) => setStatus(val as any)}>
                            <SelectTrigger className="col-span-3 h-8">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pending">⏳ Pending</SelectItem>
                                <SelectItem value="confirmed">✅ Confirmed</SelectItem>
                                <SelectItem value="apply">👋 Apply</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Main Character Section */}
                    <div className="border-t border-zinc-700 pt-3">
                        <h4 className="text-xs font-semibold text-white mb-2">🌟 Main Character</h4>

                        <div className="grid grid-cols-4 items-center gap-3 mb-2">
                            <Label className="text-right text-xs">Class</Label>
                            <Select value={mainClass} onValueChange={handleMainClassChange}>
                                <SelectTrigger className="col-span-3 h-8">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.values(CLASSES).map((cls) => (
                                        <SelectItem key={cls.name} value={cls.name}>
                                            <span style={{ color: cls.color }}>{cls.name}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-3 mb-2">
                            <Label className="text-right text-xs">Main Spec</Label>
                            <Select value={mainSpec} onValueChange={setMainSpec}>
                                <SelectTrigger className="col-span-3 h-8">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {mainSpecs.map((spec) => (
                                        <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-3">
                            <Label className="text-right text-xs">Off Spec</Label>
                            <Select value={offSpec} onValueChange={setOffSpec}>
                                <SelectTrigger className="col-span-3 h-8">
                                    <SelectValue placeholder="Optional" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {mainSpecs.filter(s => s !== mainSpec).map((spec) => (
                                        <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Alt Character Section */}
                    <div className="border-t border-zinc-700 pt-3">
                        <h4 className="text-xs font-semibold text-zinc-400 mb-2">👤 Alt Character (Optional)</h4>

                        <div className="grid grid-cols-4 items-center gap-3 mb-2">
                            <Label className="text-right text-xs">Class</Label>
                            <Select value={altClass} onValueChange={handleAltClassChange}>
                                <SelectTrigger className="col-span-3 h-8">
                                    <SelectValue placeholder="Select alt class" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No Alt</SelectItem>
                                    {Object.values(CLASSES).map((cls) => (
                                        <SelectItem key={cls.name} value={cls.name}>
                                            <span style={{ color: cls.color }}>{cls.name}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {altClass && (
                            <div className="grid grid-cols-4 items-center gap-3">
                                <Label className="text-right text-xs">Alt Spec</Label>
                                <Select value={altSpec} onValueChange={setAltSpec}>
                                    <SelectTrigger className="col-span-3 h-8">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {altSpecs.map((spec) => (
                                            <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                </div>

                <div className="border-t border-zinc-700 pt-3">
                    <Label className="text-xs font-semibold text-zinc-400 block mb-2">📝 Notes</Label>
                    <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="bg-zinc-950 border-zinc-800 min-h-[80px]"
                        placeholder="Player notes..."
                    />
                </div>

                <DialogFooter className="flex justify-between sm:justify-between mt-4">
                    {currentUser?.role === "admin" && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={async () => {
                                if (confirm(`Delete ${playerName} from roster?`)) {
                                    const result = await deleteRosterEntry({ entryId });
                                    if (result.success) {
                                        toast.success("Entry deleted");
                                        setOpen(false);
                                        window.location.reload();
                                    } else {
                                        toast.error(result.error || "Failed to delete");
                                    }
                                }
                            }}
                        >
                            🗑️ Delete
                        </Button>
                    )}
                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button size="sm" onClick={handleSave} disabled={isSaving}>
                            {isSaving ? "Saving..." : "Save"}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
