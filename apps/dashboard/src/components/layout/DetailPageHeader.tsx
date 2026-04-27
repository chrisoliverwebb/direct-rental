"use client";

import { usePageTitle } from "@/components/layout/usePageTitle";
import { usePageHeaderActions } from "@/components/layout/usePageHeaderActions";
import { PageNavigation } from "@/components/navigation/PageNavigation";

type DetailPageHeaderProps = {
  title: string;
  listHref: string;
  listLabel: string;
  onEdit?: () => void;
  onDelete?: () => void;
  children?: React.ReactNode;
};

export function DetailPageHeader({
  title,
  listHref,
  listLabel,
  onEdit,
  onDelete,
  children,
}: DetailPageHeaderProps) {
  usePageTitle(title);
  usePageHeaderActions({ onEdit, onDelete });

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <PageNavigation
        items={[
          { label: listLabel, href: listHref },
          { label: title },
        ]}
      />
      {children}
    </div>
  );
}
