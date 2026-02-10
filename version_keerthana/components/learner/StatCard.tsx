import { LucideIcon } from "lucide-react";

export default function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
}) {
  return (
    <div className="min-w-[160px] rounded-xl bg-neutral-900 p-4 border border-neutral-800 hover:border-teal-500 transition">
      <Icon className="text-teal-400 mb-2" />
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  );
}
