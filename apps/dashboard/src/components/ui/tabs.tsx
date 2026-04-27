"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

type TabsContextValue = {
  value?: string;
  onValueChange?: (value: string) => void;
  orientation: "horizontal" | "vertical";
  variant: NonNullable<VariantProps<typeof tabsListVariants>["variant"]>;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext(componentName: string) {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error(`${componentName} must be used within Tabs.`);
  }

  return context;
}

function Tabs({
  className,
  orientation = "horizontal",
  value,
  onValueChange,
  children,
}: React.HTMLAttributes<HTMLDivElement> & {
  orientation?: "horizontal" | "vertical";
  value?: string;
  onValueChange?: (value: string) => void;
}) {
  const [variant, setVariant] =
    React.useState<NonNullable<VariantProps<typeof tabsListVariants>["variant"]>>("default");

  return (
    <TabsContext.Provider value={{ value, onValueChange, orientation, variant }}>
      <div
        data-slot="tabs"
        data-orientation={orientation}
        className={cn("group/tabs flex gap-2 data-[orientation=horizontal]:flex-col", className)}
      >
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child) || child.type !== TabsList) {
            return child;
          }

          return React.cloneElement(child, {
            __setTabsVariant: setVariant,
          } as { __setTabsVariant: typeof setVariant });
        })}
      </div>
    </TabsContext.Provider>
  );
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground group-data-[orientation=horizontal]/tabs:h-8 group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col data-[variant=line]:rounded-none",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function TabsList({
  className,
  variant = "default",
  __setTabsVariant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof tabsListVariants> & {
    __setTabsVariant?: (variant: NonNullable<VariantProps<typeof tabsListVariants>["variant"]>) => void;
  }) {
  React.useEffect(() => {
    __setTabsVariant?.(variant ?? "default");
  }, [__setTabsVariant, variant]);

  return (
    <div
      data-slot="tabs-list"
      data-variant={variant}
      role="tablist"
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  value,
  ...props
}: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value"> & {
  value: string;
}) {
  const { value: activeValue, onValueChange, orientation, variant } = useTabsContext("TabsTrigger");
  const isActive = activeValue === value;

  return (
    <button
      type="button"
      role="tab"
      data-slot="tabs-trigger"
      data-state={isActive ? "active" : "inactive"}
      data-active={isActive ? "" : undefined}
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
      className={cn(
        "relative inline-flex h-[calc(100%-1px)] flex-1 cursor-default items-center justify-center gap-1.5 rounded-md border border-transparent px-2.5 py-1 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        orientation === "vertical" ? "w-full justify-start" : "",
        variant === "default"
          ? "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          : "data-[state=active]:bg-transparent data-[state=active]:text-foreground after:absolute after:bg-foreground after:opacity-0 after:transition-opacity after:inset-x-0 after:bottom-[-5px] after:h-0.5 data-[state=active]:after:opacity-100",
        className,
      )}
      onClick={() => onValueChange?.(value)}
      {...props}
    />
  );
}

function TabsContent({ className, value, ...props }: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
  const { value: activeValue } = useTabsContext("TabsContent");

  if (activeValue !== value) {
    return null;
  }

  return <div data-slot="tabs-content" role="tabpanel" className={cn("flex-1 text-sm outline-none", className)} {...props} />;
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants };
