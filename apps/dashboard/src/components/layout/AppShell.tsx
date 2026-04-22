"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LayoutDashboard, Mail, Users, LogOut, Settings2, Home } from "lucide-react";
import { getUserDisplayName } from "@repo/auth";
import { DirectRentalLockup } from "@repo/brand";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCurrentUser, useLogoutMutation } from "@/features/auth/hooks";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/properties", label: "Properties", icon: Home },
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
  { href: "/settings", label: "Settings", icon: Settings2 },
];

type AppShellProps = {
  children: React.ReactNode;
  compactShell?: boolean;
};

export function AppShell({ children, compactShell = false }: AppShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const logoutMutation = useLogoutMutation();

  if (compactShell) {
    return <div className="min-h-screen bg-slate-50">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="border-b bg-white px-5 py-5 lg:fixed lg:inset-y-0 lg:left-0 lg:w-[260px] lg:border-b-0 lg:border-r">
        <div className="mx-auto lg:flex lg:h-full lg:flex-col">
          <div className="mb-8 flex min-h-10 items-center">
            <DirectRentalLockup
              className="items-start justify-center"
              logoClassName="h-5"
            />
          </div>
          <nav className="grid gap-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <div key={item.href} className="grid gap-1">
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
                    <div className="ml-7 grid gap-1 border-l border-slate-200 pl-3">
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
          </nav>
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
