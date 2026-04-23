"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Mail, Users, LogOut, Settings2, Home, ChevronRight } from "lucide-react";
import { getUserDisplayName } from "@repo/auth";
import { DirectRentalLockup } from "@repo/brand";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCurrentUser, useLogoutMutation } from "@/features/auth/hooks";

type NavChild = {
  href: string;
  label: string;
  tab: string;
};

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavChild[];
};

type NavSection = {
  label: string;
  items: NavItem[];
};

const navigationSections: NavSection[] = [
  {
    label: "Properties",
    items: [
      { href: "/properties", label: "All Properties", icon: Home },
    ],
  },
  {
    label: "Marketing",
    items: [
      { href: "/contacts", label: "Contacts", icon: Users },
      {
        href: "/campaigns",
        label: "Campaigns",
        icon: Mail,
        children: [
          { href: "/campaigns?tab=templates", label: "Template Library", tab: "templates" },
          { href: "/campaigns?tab=calendar", label: "Calendar", tab: "calendar" },
        ],
      },
      { href: "/marketing/configuration", label: "Configuration", icon: Settings2 },
    ],
  },
];

type AppShellProps = {
  children: React.ReactNode;
  compactShell?: boolean;
};

function getInitials(firstName: string | undefined, lastName: string | undefined) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "?";
}

export function AppShell({ children, compactShell = false }: AppShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const logoutMutation = useLogoutMutation();

  if (compactShell) {
    return <div className="min-h-screen bg-slate-50">{children}</div>;
  }

  const isAccountActive = pathname.startsWith("/account");

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="border-b bg-white px-5 py-5 lg:fixed lg:inset-y-0 lg:left-0 lg:w-[260px] lg:border-b-0 lg:border-r">
        <div className="mx-auto lg:flex lg:h-full lg:flex-col">
          <div className="mb-4 px-3 py-2">
            <DirectRentalLockup
              className="items-start"
              logoClassName="h-6 w-auto"
            />
          </div>

          <nav className="grid gap-5">
            {navigationSections.map((section) => (
              <div key={section.label}>
                <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {section.label}
                </p>
                <div className="grid gap-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname.startsWith(item.href);

                    return (
                      <div key={item.href} className="grid gap-0.5">
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900",
                            isActive && "bg-slate-100 text-slate-950",
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </Link>
                        {item.children && isActive ? (
                          <div className="ml-7 grid gap-0.5 border-l border-slate-200 pl-3">
                            {item.children.map((child) => {
                              const childIsActive =
                                pathname.startsWith("/campaigns") &&
                                searchParams.get("tab") === child.tab;

                              return (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  className={cn(
                                    "rounded-md px-3 py-2 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-900",
                                    childIsActive && "bg-slate-100 font-medium text-slate-950",
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
              </div>
            ))}
          </nav>

          <div className="mt-auto pt-6">
            <Link
              href="/account"
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-3 transition hover:bg-slate-100",
                isAccountActive && "bg-slate-100",
              )}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                {getInitials(user?.firstName, user?.lastName)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">
                  {getUserDisplayName(user)}
                </p>
                <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            </Link>
          </div>
        </div>
      </aside>

      <div className="min-w-0 lg:pl-[260px]">
        <div className="min-h-screen">
          <header className="flex items-center justify-between border-b bg-white px-6 py-4 lg:sticky lg:top-0 lg:z-20">
            <div>
              <p className="text-sm font-medium text-slate-900">Welcome back</p>
              <p className="text-sm text-muted-foreground">{getUserDisplayName(user)}</p>
            </div>
            <Button
              variant="outline"
              onClick={async () => {
                await logoutMutation.mutateAsync();
                router.replace("/login");
                router.refresh();
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </header>
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
