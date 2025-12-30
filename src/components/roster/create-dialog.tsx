
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createRosterEntry } from "@/actions/roster";
import { toast } from "sonner";
import { CLASSES } from "@/lib/wow-constants";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";

interface UserOption {
    id: string;
    name: string;
}

interface CreateDialogProps {
    availableUsers: UserOption[];
}

export function CreateRosterDialog({ availableUsers }: CreateDialogProps) {
    const [open, setOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Form States
    const [selectedUserId, setSelectedUserId] = useState<string>("");
    const [mainClass, setMainClass] = useState<string>("");
    const [mainSpec, setMainSpec] = useState<string>("");
    const [status, setStatus] = useState<string>("pending");
    const [notes, setNotes] = useState<string>("");

    // Helpers
    const mainClassData = Object.values(CLASSES).find(c => c.name === mainClass);
    const mainSpecs = mainClassData ? Object.keys(mainClassData.roles) : [];

    const handleMainClassChange = (newClass: string) => {
        setMainClass(newClass);
        const data = Object.values(CLASSES).find(c => c.name === newClass);
        if (data) {
            const specs = Object.keys(data.roles);
            setMainSpec(specs[0] || "");
        }
    };

    const handleSave = async () => {
        if (!selectedUserId) {
            toast.error("Please select a user");
            return;
        }
        if (!mainClass || !mainSpec) {
            toast.error("Please select a class and spec");
            return;
        }

        setIsSaving(true);
        try {
            const result = await createRosterEntry({
                userId: selectedUserId,
                data: {
                    mainClass,
                    mainSpec,
                    status: status as any,
                    notes,
                }
            });

            if (result.success) {
                toast.success("Member added to roster");
                setOpen(false);
                // Reset form
                setSelectedUserId("");
                setMainClass("");
                setMainSpec("");
                setNotes("");
            } else {
                toast.error(result.error || "Failed to create entry");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                    <Plus className="w-4 h-4" />
                    Add Member
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-zinc-900 border-zinc-700">
                <DialogHeader>
                    <DialogTitle>Add to Roster</DialogTitle>
                    <DialogDescription>Select a member and configure their main character.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-3">
                    {/* User Selection */}
                    <div className="grid grid-cols-4 items-center gap-3">
                        <Label className="text-right text-xs">Member</Label>
                        <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                            <SelectTrigger className="col-span-3 h-9">
                                <SelectValue placeholder="Select a user..." />
                            </SelectTrigger>
                            <SelectContent>
                                {availableUsers.length === 0 ? (
                                    <SelectItem value="none" disabled>No available users</SelectItem>
                                ) : (
                                    availableUsers.map((u) => (
                                        <SelectItem key={u.id} value={u.id}>
                                            {u.name}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Class Selection */}
                    <div className="grid grid-cols-4 items-center gap-3">
                        <Label className="text-right text-xs">Class</Label>
                        <Select value={mainClass} onValueChange={handleMainClassChange}>
                            <SelectTrigger className="col-span-3 h-9">
                                <SelectValue placeholder="Select class" />
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

                    {/* Spec Selection */}
                    <div className="grid grid-cols-4 items-center gap-3">
                        <Label className="text-right text-xs">Spec</Label>
                        <Select value={mainSpec} onValueChange={setMainSpec} disabled={!mainClass}>
                            <SelectTrigger className="col-span-3 h-9">
                                <SelectValue placeholder="Select spec" />
                            </SelectTrigger>
                            <SelectContent>
                                {mainSpecs.map((spec) => (
                                    <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Status */}
                    <div className="grid grid-cols-4 items-center gap-3">
                        <Label className="text-right text-xs">Status</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="col-span-3 h-9">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="apply">Apply</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Notes */}
                    <div className="border-t border-zinc-700 pt-3">
                        <Label className="text-xs font-semibold text-zinc-400 block mb-2">Notes</Label>
                        <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="bg-zinc-950 border-zinc-800 min-h-[80px]"
                            placeholder="Optional notes..."
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isSaving || !selectedUserId}>
                        {isSaving ? "Adding..." : "Add Member"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
