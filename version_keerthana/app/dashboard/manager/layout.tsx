import ManagerSidebar from "@/components/manager/ManagerSidebar";

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <ManagerSidebar />
      <main
        className="flex-1 ml-64 min-w-0 min-h-screen"
        style={{
          backgroundImage: "url(/images/card-background.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="min-h-screen p-8">{children}</div>
      </main>
    </div>
  );
}
