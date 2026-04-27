"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { usePageHistoryMemory } from "@/components/navigation/NavigationHistoryProvider";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { cn } from "@/lib/utils";

type PageNavigationItem = {
  label: string;
  href?: string;
};

type PageNavigationProps = {
  items: PageNavigationItem[];
  className?: string;
};

export function PageNavigation({
  items,
  className,
}: PageNavigationProps) {
  const { canGoBack, canGoForward, goBack, goForward } = usePageHistoryMemory();

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <ButtonGroup>
        <Button type="button" variant="outline" size="icon" aria-label="Go back" disabled={!canGoBack} onClick={goBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button type="button" variant="outline" size="icon" aria-label="Go forward" disabled={!canGoForward} onClick={goForward}>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </ButtonGroup>

      <Breadcrumb>
        <BreadcrumbList>
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <BreadcrumbItem key={`${item.label}-${index}`}>
                {item.href && !isLast ? (
                  <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                )}
                {!isLast ? <BreadcrumbSeparator /> : null}
              </BreadcrumbItem>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
