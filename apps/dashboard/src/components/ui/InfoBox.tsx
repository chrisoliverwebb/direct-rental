"use client";

import { InfoIcon, type LucideIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function InfoBox({
  title,
  description,
  icon: Icon = InfoIcon,
}: {
  title: string;
  description: string;
  icon?: LucideIcon;
}) {
  return (
    <Alert variant="info">
      <Icon />
      <div className="grid gap-1">
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{description}</AlertDescription>
      </div>
    </Alert>
  );
}
