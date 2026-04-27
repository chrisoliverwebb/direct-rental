import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TabbedPageProps<T extends string> = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  navigation?: React.ReactNode;
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
  navigation,
  tabs,
  activeTab,
  onTabChange,
  beforeTabs,
  tabsTrailing,
  children,
}: TabbedPageProps<T>) {
  return (
    <div className="grid gap-4">
      {navigation}
      {(description || action) ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          {description ? (
            <div className="grid gap-1">
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          ) : (
            <div />
          )}
          {action ?? null}
        </div>
      ) : null}

      <div className="grid gap-2.5">
        {beforeTabs}
        {tabsTrailing ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Tabs value={activeTab} onValueChange={(tab) => onTabChange(tab as T)}>
              <TabsList>
                {tabs.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            {tabsTrailing}
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={(tab) => onTabChange(tab as T)}>
            <TabsList>
              {tabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}
      </div>

      {children}
    </div>
  );
}
