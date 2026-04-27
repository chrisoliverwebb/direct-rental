"use client";

import { useEffect, useState } from "react";
import type { ContactDetail } from "@repo/api-contracts";
import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { useUpdateContact } from "@/features/marketing/hooks";

type Draft = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

function toDraft(contact: ContactDetail): Draft {
  return {
    firstName: contact.firstName,
    lastName: contact.lastName,
    email: contact.email ?? "",
    phone: contact.phone ?? "",
  };
}

export function ContactEditorDialog({
  contact,
  open,
  onOpenChange,
}: {
  contact: ContactDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const updateMutation = useUpdateContact(contact.id);
  const [draft, setDraft] = useState<Draft>(() => toDraft(contact));

  useEffect(() => {
    if (open) setDraft(toDraft(contact));
  }, [open, contact]);

  const set = (key: keyof Draft, value: string) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const isValid = draft.firstName.trim().length > 0 && draft.lastName.trim().length > 0;

  const handleSave = async () => {
    await updateMutation.mutateAsync({
      firstName: draft.firstName.trim(),
      lastName: draft.lastName.trim(),
      email: draft.email.trim() || undefined,
      phone: draft.phone.trim() || undefined,
    });
    toast.success("Contact updated");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit contact</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <label className="text-xs font-medium text-slate-700" htmlFor="firstName">
                  First name
                </label>
                <Input
                  id="firstName"
                  value={draft.firstName}
                  onChange={(e) => set("firstName", e.target.value)}
                  placeholder="First name"
                />
              </div>
              <div className="grid gap-1.5">
                <label className="text-xs font-medium text-slate-700" htmlFor="lastName">
                  Last name
                </label>
                <Input
                  id="lastName"
                  value={draft.lastName}
                  onChange={(e) => set("lastName", e.target.value)}
                  placeholder="Last name"
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <label className="text-xs font-medium text-slate-700" htmlFor="email">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={draft.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="email@example.com"
              />
            </div>
            <div className="grid gap-1.5">
              <label className="text-xs font-medium text-slate-700" htmlFor="phone">
                Phone number
              </label>
              <Input
                id="phone"
                type="tel"
                value={draft.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+44 7700 000000"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={updateMutation.isPending}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSave} disabled={!isValid || updateMutation.isPending}>
                {updateMutation.isPending ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
