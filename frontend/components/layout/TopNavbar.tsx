"use client";

import { Bell, Search, UserCircle2 } from "lucide-react";

export default function TopNavbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-8">
      <div className="flex w-96 items-center gap-3 rounded-xl border bg-slate-50 px-4 py-2">
        <Search size={18} />

        <input
          placeholder="Search..."
          className="w-full bg-transparent outline-none"
        />
      </div>

      <div className="flex items-center gap-6">
        <Bell />

        <UserCircle2 size={34} />
      </div>
    </header>
  );
}