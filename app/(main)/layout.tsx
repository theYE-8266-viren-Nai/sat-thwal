import { BottomNav } from "@/components/nav/BottomNav";
import { SidebarNav } from "@/components/nav/SidebarNav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <SidebarNav />
      <div className="flex min-h-screen flex-1 flex-col">
        <main className="flex-1 pb-24 md:pb-10">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
