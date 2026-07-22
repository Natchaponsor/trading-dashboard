"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LineChart, Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/log", label: "Trade Log" },
  { href: "/calendar", label: "Calendar" },
  { href: "/analytics", label: "Analytics" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-serif text-lg font-medium text-fg shrink-0">
          <LineChart className="h-5 w-5 text-accent" strokeWidth={2} />
          Trading Dashboard
        </Link>

        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {NAV_ITEMS.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
                  active ? "bg-panel text-fg" : "text-fg-muted hover:text-fg"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2 shrink-0">
          <Link href="/trades/new">
            <Button variant="primary" size="sm">
              <Plus className="h-3.5 w-3.5" />
              Log Trade
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
