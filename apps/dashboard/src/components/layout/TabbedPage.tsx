import { TabSelector } from "@/components/ui/tab-selector";

type TabbedPageProps<T extends string> = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  tabs: ReadonlyArray<{ value: T; label: string }>;
  activeTab: T;
  onTabChange: (tab: T) => void;
  beforeTabs?: React.ReactNode;
  tabsTrailing?: React.ReactNode;
  children: React.ReactNode;
};

export function TabbedPage<T extends string>({
  title,
  description,
  action,
  tabs,
  activeTab,
  onTabChange,
  beforeTabs,
  tabsTrailing,
  children,
}: TabbedPageProps<T>) {
  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="grid gap-1">
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {action ?? null}
      </div>

      <div className="grid gap-3">
        {beforeTabs}
        {tabsTrailing ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <TabSelector options={tabs} value={activeTab} onChange={onTabChange} />
            {tabsTrailing}
          </div>
        ) : (
          <TabSelector options={tabs} value={activeTab} onChange={onTabChange} />
        )}
      </div>

      {children}
    </div>
  );
}
