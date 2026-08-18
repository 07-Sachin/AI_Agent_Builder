import { ReactNode } from "react";
import AppSidebar from "./AppSidebar";
import TopNavbar from "./TopNavbar";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({
  children,
}: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <AppSidebar />

      <div className="flex flex-1 flex-col">
        <TopNavbar />

        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}