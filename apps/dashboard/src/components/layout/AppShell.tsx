"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Mail, Users, LogOut, Settings2, Home, EllipsisVertical, CalendarDays, CircleUserRound, PanelLeft } from "lucide-react";
import { getUserDisplayName } from "@repo/auth";
import { DirectRentalLockup } from "@repo/brand";
import { cn } from "@/lib/utils";
import { usePageTitleContext } from "@/components/layout/PageTitleProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser, useLogoutMutation } from "@/features/auth/hooks";
import {
  CONTACTS_TABS, CONTACTS_DEFAULT_TAB,
  CAMPAIGNS_TABS, CAMPAIGNS_DEFAULT_TAB,
} from "@/lib/pageTabConfigs";

type NavChild = {
  href: string;
  label: string;
  tab: string | null;
};

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavChild[];
};

function toNavChildren(
  tabs: Array<{ value: string; label: string }>,
  basePath: string,
  defaultTab: string,
): NavChild[] {
  return tabs.map((tab) => ({
    href: tab.value === defaultTab ? basePath : `${basePath}?tab=${tab.value}`,
    label: tab.label,
    tab: tab.value === defaultTab ? null : tab.value,
  }));
}

const mainNavigation: NavItem[] = [
  { href: "/properties", label: "All Properties", icon: Home },
];

const marketingNavigation: NavItem[] = [
  { href: "/marketing/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/campaigns", label: "Campaigns", icon: Mail },
];

const bottomNavigation: NavItem[] = [
  {
    href: "/settings",
    label: "Settings",
    icon: Settings2,
  },
];

type AppShellProps = {
  children: React.ReactNode;
  compactShell?: boolean;
};

function getInitials(firstName: string | undefined, lastName: string | undefined) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "?";
}

function getPageTitle(pathname: string, searchParams: URLSearchParams) {
  if (pathname === "/dashboard") return "Dashboard";
  if (pathname === "/properties") return "Properties";
  if (/^\/properties\/[^/]+$/.test(pathname)) return "Property details";
  if (pathname === "/contacts") {
    const tab = searchParams.get("tab");
    if (tab === "segments") return "Contacts";
    if (tab === "imports") return "Contacts";
    return "Contacts";
  }
  if (/^\/contacts\/[^/]+$/.test(pathname)) return "Contact details";
  if (pathname === "/campaigns") return "Campaigns";
  if (pathname === "/campaigns/new") return "New campaign";
  if (/^\/campaigns\/[^/]+\/edit$/.test(pathname)) return "Edit campaign";
  if (/^\/campaigns\/[^/]+$/.test(pathname)) return "Campaign details";
  if (pathname === "/marketing/calendar") return "Marketing calendar";
  if (pathname === "/settings" || pathname === "/marketing/configuration") return "Settings";
  if (pathname === "/account") return "Account";
  if (pathname === "/templates") return "Templates";
  return "Dashboard";
}

export function AppShell({ children, compactShell = false }: AppShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const logoutMutation = useLogoutMutation();
  const { title: pageTitleOverride, headerActions } = usePageTitleContext();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (compactShell) {
    return <div className="min-h-screen bg-slate-50">{children}</div>;
  }

  const isAccountActive = pathname.startsWith("/account");
  const pageTitle = pageTitleOverride ?? getPageTitle(pathname, searchParams);

  return (
    <div className="min-h-screen bg-slate-100/70">
      <aside
        className="hidden transition-transform duration-300 ease-in-out lg:fixed lg:inset-y-0 lg:left-0 lg:block lg:w-[280px] lg:p-2"
        style={sidebarCollapsed ? { transform: "translateX(-100%)" } : undefined}
      >
        <div className="flex h-full flex-col rounded-2xl bg-slate-50/80">
          <div className="px-4 py-4">
            <DirectRentalLockup
              className="items-start"
              logoClassName="h-6 w-auto"
            />
          </div>

          <nav className="grid gap-6 px-3 py-4">
            <div>
              <p className="mb-1.5 px-2 text-xs font-normal text-slate-400">Properties</p>
              <div className="grid gap-1">
                {mainNavigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname.startsWith(item.href);

                  return (
                    <div key={item.href} className="grid gap-1">
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-normal text-slate-600 transition hover:bg-white hover:text-slate-950",
                          isActive && "bg-white text-slate-950",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-1.5 px-2 text-xs font-normal text-slate-400">Marketing</p>
              <div className="grid gap-1">
                {marketingNavigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname.startsWith(item.href);

                  return (
                    <div key={item.href} className="grid gap-1">
                    <Link
                      href={item.href}
                      className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-normal text-slate-600 transition hover:bg-white hover:text-slate-950",
                          isActive && "bg-white text-slate-950",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </nav>

          <div className="mt-auto px-3 pb-3">
            <div className="mb-3 grid gap-1">
              {bottomNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);

                return (
                  <div key={item.href} className="grid gap-1">
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-normal text-slate-600 transition hover:bg-white hover:text-slate-950",
                        isActive && "bg-white text-slate-950",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                    {item.children && isActive ? (
                      <div className="ml-4 grid gap-1 pl-3">
                        {item.children.map((child) => {
                          const childIsActive =
                            pathname === item.href &&
                            (child.tab === null
                              ? !searchParams.get("tab")
                              : searchParams.get("tab") === child.tab);

                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={cn(
                                "rounded-md px-3 py-1.5 text-sm text-slate-500 transition hover:bg-white hover:text-slate-900",
                                childIsActive && "bg-white font-medium text-slate-950",
                              )}
                            >
                              {child.label}
                            </Link>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-white",
                  isAccountActive && "bg-white",
                )}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-xs font-semibold text-white">
                  {getInitials(user?.firstName, user?.lastName)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-normal text-slate-900">
                    {getUserDisplayName(user)}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <EllipsisVertical className="h-4 w-4 shrink-0 text-slate-400" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="top" className="min-w-[220px] rounded-xl border-slate-200 p-1.5 shadow-lg">
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-xs font-semibold text-white">
                      {getInitials(user?.firstName, user?.lastName)}
                    </div>
                    <div className="grid min-w-0 flex-1 leading-tight">
                      <span className="truncate text-sm font-normal text-slate-900">
                        {getUserDisplayName(user)}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem className="gap-2 rounded-lg" onSelect={() => router.push("/account")}>
                    <CircleUserRound className="h-4 w-4" />
                    Account
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-2 rounded-lg"
                  onSelect={async () => {
                    await logoutMutation.mutateAsync();
                    router.replace("/login");
                    router.refresh();
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      <div
        className={cn(
          "min-w-0 transition-[padding] duration-300 ease-in-out",
          !sidebarCollapsed && "lg:pl-[280px]",
        )}
      >
        <div className="lg:p-2">
          <div className="min-h-screen bg-white lg:rounded-2xl lg:border lg:border-slate-200 lg:shadow-sm">
            <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-slate-200 bg-white/90 px-3 backdrop-blur lg:rounded-t-2xl lg:px-5">
              <button
                type="button"
                onClick={() => setSidebarCollapsed((s) => !s)}
                className="hidden h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 lg:flex"
                aria-label="Toggle sidebar"
              >
                <PanelLeft className="h-4 w-4" />
              </button>
              <div className="hidden h-4 w-px bg-slate-200 lg:block" />
              <div className="min-w-0">
                <h1 className="truncate text-base font-normal text-slate-900">{pageTitle}</h1>
              </div>
              {headerActions.length > 0 ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="ml-auto flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900">
                    <EllipsisVertical className="h-4 w-4" />
                    <span className="sr-only">Page actions</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-32">
                    {headerActions.map((action, i) => {
                      const prev = headerActions[i - 1];
                      const showSep = action.destructive && prev && !prev.destructive;
                      return (
                        <Fragment key={action.label}>
                          {showSep ? <DropdownMenuSeparator /> : null}
                          <DropdownMenuItem
                            onSelect={action.onClick}
                            className={action.destructive ? "text-red-600 hover:bg-red-50 focus:bg-red-50" : undefined}
                          >
                            {action.label}
                          </DropdownMenuItem>
                        </Fragment>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
            </header>
            <main className="p-3 md:p-5">{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
}
