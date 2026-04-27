import { cn } from "@/lib/utils";

type DataTableToolbarProps = {
  children: React.ReactNode;
  className?: string;
};

export function DataTableToolbar({ children, className }: DataTableToolbarProps) {
  return <div className={cn("flex flex-col gap-2 sm:flex-row sm:items-center", className)}>{children}</div>;
}
