"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Bus, ClipboardList, LayoutDashboard, UserRound } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { cn } from "@/lib/utils";

const DRIVER_NAV_ITEMS = [
  { label: "Dashboard", href: "/driver/dashboard", icon: LayoutDashboard },
  { label: "Registrations", href: "/driver/registrations", icon: ClipboardList },
  { label: "Routes", href: "/driver/routes", icon: Bus },
  { label: "Notifications", href: "/driver/notifications", icon: Bell },
  { label: "Profile", href: "/driver/profile", icon: UserRound },
];

interface DriverNavProps {
  unreadCount: number;
}

export function DriverNav({ unreadCount }: DriverNavProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen w-64 shrink-0 border-r border-border bg-card px-4 py-6 md:block">
      <Logo />
      <div className="mt-6 rounded-lg bg-secondary px-3 py-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Driver Panel
        </p>
        <p className="mt-1 text-sm text-foreground">Transportation provider tools</p>
      </div>
      <nav className="mt-6 flex flex-col gap-1">
        {DRIVER_NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          const showBadge = item.href === "/driver/notifications" && unreadCount > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-secondary text-brand-indigo"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
              )}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                {item.label}
              </span>
              {showBadge && (
                <span className="rounded-full bg-brand-mint px-2 py-0.5 text-xs text-white">
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function DriverMobileNav({ unreadCount }: DriverNavProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-card px-2 pb-[var(--safe-bottom)] pt-2 md:hidden">
      {DRIVER_NAV_ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        const showBadge = item.href === "/driver/notifications" && unreadCount > 0;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-[0.7rem]",
              active ? "bg-secondary text-brand-indigo" : "text-muted-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="max-w-full truncate">{item.label}</span>
            {showBadge && <span className="absolute right-4 top-1 h-2 w-2 rounded-full bg-brand-mint" />}
          </Link>
        );
      })}
    </nav>
  );
}
