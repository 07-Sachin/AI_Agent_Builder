"use client";

import Link from "next/link";
import {
  Bot,
  LayoutDashboard,
  PlusCircle,
  MessageSquare,
  Settings,
} from "lucide-react";

const menu = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "My Agents",
    href: "/agents",
    icon: Bot,
  },
  {
    name: "Create Agent",
    href: "/create-agent",
    icon: PlusCircle,
  },
  {
    name: "Chat",
    href: "/chat",
    icon: MessageSquare,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-slate-950 text-white">

      {/* Logo */}
      <div className="border-b border-slate-800 p-6">

        <h1 className="flex items-center gap-2 text-2xl font-bold">
          🤖 AI Builder
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Enterprise AI Platform
        </p>

      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4">

        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <Icon className="h-5 w-5" />

              <span>
                {item.name}
              </span>
            </Link>
          );
        })}

      </nav>

      {/* Footer */}
      <div className="border-t border-slate-800 p-4">

        <p className="text-xs text-slate-500">
          AI Builder v1.0.0
        </p>

      </div>

    </aside>
  );
}