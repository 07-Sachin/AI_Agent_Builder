"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  Bot,
  PlusCircle,
  MessageSquare,
  Settings,
} from "lucide-react";

const menu = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "My Agents",
    href: "/agents",
    icon: Bot,
  },
  {
    title: "Create Agent",
    href: "/create-agent",
    icon: PlusCircle,
  },
  {
    title: "Chat",
    href: "/chat",
    icon: MessageSquare,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export default function SidebarMenu() {
  const pathname = usePathname();

  return (
    <nav className="space-y-2">
      {menu.map((item) => {
        const Icon = item.icon;

        const active = pathname === item.href;

        return (
          <Link
            key={item.title}
            href={item.href}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
              active
                ? "bg-blue-600 text-white"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Icon size={20} />

            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}