"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

type DataTableColumnHeaderProps = {
  title: string;
  sorted: false | "asc" | "desc";
  onToggle: () => void;
};

export function DataTableColumnHeader({ title, sorted, onToggle }: DataTableColumnHeaderProps) {
  return (
    <Button type="button" variant="ghost" size="sm" className="-ml-3 h-8 gap-2 px-3" onClick={onToggle}>
      <span>{title}</span>
      {sorted === "asc" ? (
        <ArrowUp className="h-4 w-4" />
      ) : sorted === "desc" ? (
        <ArrowDown className="h-4 w-4" />
      ) : (
        <ArrowUpDown className="h-4 w-4" />
      )}
    </Button>
  );
}
