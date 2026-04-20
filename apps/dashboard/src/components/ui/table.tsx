import * as React from "react";
import { cn } from "@/lib/utils";

export const Table = ({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) => (
  <div className="w-full overflow-x-auto">
    <table className={cn("w-full caption-bottom text-sm", className)} {...props} />
  </div>
);

export const TableHeader = (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <thead className="border-b" {...props} />
);

export const TableBody = (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody className="divide-y" {...props} />
);

export const TableRow = ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr className={cn("transition-colors hover:bg-muted/40", className)} {...props} />
);

export const TableHead = ({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th
    className={cn(
      "h-10 px-4 text-left align-middle text-xs font-semibold uppercase tracking-wide text-muted-foreground",
      className,
    )}
    {...props}
  />
);

export const TableCell = ({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={cn("px-4 py-3 align-middle", className)} {...props} />
);
