import { DataTablePagination } from "@/components/data-table/DataTablePagination";
import { cn } from "@/lib/utils";

type DataTablePanelProps = {
  children: React.ReactNode;
  pagination?: React.ComponentProps<typeof DataTablePagination>;
  className?: string;
};

export function DataTablePanel({ children, pagination, className }: DataTablePanelProps) {
  return (
    <div className={cn("rounded-lg border bg-white", className)}>
      {children}
      {pagination ? <DataTablePagination {...pagination} /> : null}
    </div>
  );
}
