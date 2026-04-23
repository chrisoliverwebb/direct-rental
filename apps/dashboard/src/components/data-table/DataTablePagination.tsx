"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

type DataTablePaginationProps = {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

export function DataTablePagination({
  page,
  pageSize,
  totalPages,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: DataTablePaginationProps) {
  return (
    <div className="flex flex-col gap-3 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-muted-foreground">
        Page {page} of {totalPages} · {totalItems} campaigns
      </div>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Rows</span>
          <Select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="w-[88px]"
          >
            {[10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </Select>
        </label>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="icon" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
