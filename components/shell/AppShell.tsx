"use client";

import { NavBar } from "./NavBar";
import { FilterBar } from "./FilterBar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <FilterBar />
      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
