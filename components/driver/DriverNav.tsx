"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Bus,
  ClipboardCheck,
  ClipboardList,
  LayoutDashboard,
  Menu,
  UserRound,
  UsersRound,
} from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { LogoutButton } from "@/components/profile/LogoutButton";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const DRIVER_NAV_ITEMS = [
  { label: "Dashboard", href: "/driver/dashboard", icon: LayoutDashboard },
  { label: "Transportation Requests", href: "/driver/registrations", icon: ClipboardList },
  { label: "My Routes", href: "/driver/routes", icon: Bus },
  { label: "Approved Passengers", href: "/driver/registrations?status=approved", icon: UsersRound },
  { label: "Notifications", href: "/driver/notifications", icon: Bell },
  { label: "Driver Profile", href: "/driver/profile", icon: UserRound },
];
const DRIVER_QUICK_NAV_ITEMS = DRIVER_NAV_ITEMS.filter((item) => item.href !== "/driver/registrations?status=approved");

interface DriverNavProps {
  unreadCount: number;
  driverName?: string | null;
  providerName?: string | null;
  vehicleNumber?: string | null;
}

function initials(name?: string | null) {
  return (name ?? "Driver")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function DriverNav({ unreadCount, driverName, providerName, vehicleNumber }: DriverNavProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen w-72 shrink-0 border-r border-border bg-card px-4 py-5 shadow-sm md:block">
      <Logo />
      <div className="mt-6 rounded-xl border border-border bg-secondary p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-brand-indigo to-brand-indigo-dark text-sm font-semibold text-white shadow-sm">
            {initials(providerName ?? driverName)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {providerName ?? driverName ?? "Transportation provider"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {vehicleNumber ? `Vehicle ${vehicleNumber}` : "Driver operations"}
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-card px-2.5 py-2 text-xs font-medium text-brand-indigo">
          <ClipboardCheck className="h-3.5 w-3.5" />
          UIT route management
        </div>
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
                "flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 motion-reduce:transition-none",
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
                <span className={cn("rounded-full px-2 py-0.5 text-xs", active ? "bg-brand-indigo text-white" : "bg-brand-mint text-white")}>
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="mt-6 border-t border-border pt-4">
        <LogoutButton redirectTo="/driver-login" />
      </div>
    </aside>
  );
}

export function DriverMobileNav({ unreadCount }: DriverNavProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-card px-2 pb-[var(--safe-bottom)] pt-2 md:hidden">
      {DRIVER_QUICK_NAV_ITEMS.map((item) => {
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

export function DriverMobileDrawer({
  unreadCount,
  driverName,
  providerName,
  vehicleNumber,
}: DriverNavProps) {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open driver navigation">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[19rem] border-border bg-card p-0">
        <SheetHeader className="border-b border-border p-4 text-left">
          <Logo />
          <SheetTitle className="sr-only">Driver navigation</SheetTitle>
        </SheetHeader>
        <div className="p-4">
          <div className="rounded-xl border border-border bg-secondary p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-brand-indigo to-brand-indigo-dark text-sm font-semibold text-white">
                {initials(providerName ?? driverName)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {providerName ?? driverName ?? "Transportation provider"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {vehicleNumber ? `Vehicle ${vehicleNumber}` : "Driver operations"}
                </p>
              </div>
            </div>
          </div>
          <nav className="mt-5 flex flex-col gap-1">
            {DRIVER_NAV_ITEMS.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              const showBadge = item.href === "/driver/notifications" && unreadCount > 0;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium transition-all",
                    active
                      ? "bg-secondary text-brand-indigo"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                  )}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </span>
                  {showBadge && (
                    <span className={cn("rounded-full px-2 py-0.5 text-xs", active ? "bg-brand-indigo text-white" : "bg-brand-mint text-white")}>
                      {unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="mt-5 border-t border-border pt-4">
            <LogoutButton redirectTo="/driver-login" />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
