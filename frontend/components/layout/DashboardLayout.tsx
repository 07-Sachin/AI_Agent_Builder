import { ReactNode } from "react";

import Sidebar from "./Sidebar";
import Navbar from "./TopNavbar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-slate-100">

      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">

        <Navbar />

        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>

      </div>

    </div>
  );
}