import InstructorSidebar from "@/components/instructor/InstructorSidebar";

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <InstructorSidebar />
      <main className="flex-1 ml-64 min-w-0 p-8 bg-slate-50">{children}</main>
    </div>
  );
}
