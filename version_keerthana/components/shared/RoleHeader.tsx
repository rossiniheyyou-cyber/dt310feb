"use client";

import Image from "next/image";

interface RoleHeaderProps {
  greeting: string;
  subtitle: string;
  loading?: boolean;
}

export default function RoleHeader({ greeting, subtitle, loading }: RoleHeaderProps) {
  if (loading) {
    return (
      <div className="rounded-lg w-full card-gradient p-2 animate-pulse overflow-hidden min-h-[216px] sm:min-h-[296px]">
        <div className="flex items-center gap-3 min-h-[200px] sm:min-h-[280px]">
          <div className="h-[200px] w-[200px] sm:h-[280px] sm:w-[280px] bg-teal-200/50 rounded-full flex-shrink-0" />
          <div className="h-6 bg-teal-200/50 rounded w-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg w-full overflow-hidden border border-teal-200/60 shadow-md transition-all duration-300 hover:shadow-lg group min-h-[216px] sm:min-h-[296px]">
      <div className="relative card-gradient px-3 py-2 sm:px-4 sm:py-2.5 flex items-center gap-3 sm:gap-4 min-h-[200px] sm:min-h-[280px]">
        <div className="relative w-[200px] h-[200px] sm:w-[280px] sm:h-[280px] flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
          <Image
            src="/images/welcome-hero.png"
            alt=""
            fill
            className="object-contain"
          />
        </div>
        <div className="min-w-0 py-0.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-teal-900 truncate">
            {greeting}
          </h1>
          <p className="text-teal-800 font-semibold mt-1 text-sm sm:text-base truncate">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}
