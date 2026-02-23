"use client";

import LearnerSidebar from "@/components/learner/LearnerSidebar";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";

function LearnerLayoutInner({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar();

  return (
    <div className="flex min-h-screen">
      <LearnerSidebar />
      <main
        className={`flex-1 min-h-screen transition-all duration-300 bg-white ${
          isOpen ? "ml-64" : "ml-16"
        }`}
      >
        <div className="min-h-screen pt-8 px-8 pb-8">{children}</div>
      </main>
    </div>
  );
}

export default function LearnerLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <LearnerLayoutInner>{children}</LearnerLayoutInner>
    </SidebarProvider>
  );
}
