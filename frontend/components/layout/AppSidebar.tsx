import SidebarMenu from "./SidebarMenu";

export default function AppSidebar() {
  return (
    <aside className="hidden w-72 border-r bg-slate-950 text-white lg:flex lg:flex-col">
      <div className="border-b border-slate-800 p-6">
        <h1 className="text-3xl font-bold">
          🤖 AI Builder
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Enterprise AI Platform
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <SidebarMenu />
      </div>

      <div className="border-t border-slate-800 p-4 text-sm text-slate-400">
        Version 1.0.0
      </div>
    </aside>
  );
}