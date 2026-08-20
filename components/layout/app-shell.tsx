import { SidebarNav } from "./sidebar-nav";
import { Topbar } from "./topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Topbar />
      <div className="flex flex-1">
        <aside className="hidden w-56 shrink-0 border-r p-4 md:block">
          <SidebarNav />
        </aside>
        <main className="flex-1 p-6 pb-20 md:p-8">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
      <div className="fixed inset-x-0 bottom-0 border-t bg-background p-1 md:hidden">
        <SidebarNav orientation="horizontal" />
      </div>
    </div>
  );
}
