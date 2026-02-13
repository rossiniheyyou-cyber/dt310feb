"use client";

import { useSidebar } from "@/context/SidebarContext";

export default function SidebarToggleSwitch() {
  const { isOpen, toggle } = useSidebar();

  return (
    <div
      className={`rounded-lg border-2 border-teal-800/80 transition-all duration-300 shrink-0 ${
        isOpen ? "w-20 h-10 bg-teal-800/40" : "w-10 h-10 bg-teal-900/60"
      }`}
    >
      <div className={`flex h-full w-full items-center ${isOpen ? "px-1 gap-x-1" : "px-1 justify-center"}`}>
        {isOpen && <div className="w-2 h-2 flex-shrink-0 rounded-full border-2 border-teal-800/80" />}
        <label
          htmlFor="sidebar-switch"
          className={`flex-1 min-w-0 h-6 border-2 border-teal-800/80 rounded cursor-pointer block transition-transform duration-300 origin-center ${
            !isOpen ? "scale-x-[-1] scale-75" : ""
          }`}
        >
          <input
            type="checkbox"
            id="sidebar-switch"
            checked={!isOpen}
            onChange={toggle}
            className="sr-only"
            aria-label="Toggle sidebar"
          />
          <div
            className="w-full h-full relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #ffd700 0%, #ffe44d 25%, #daa520 50%, #b8860b 100%)",
              boxShadow: "inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -1px 2px rgba(0,0,0,0.2), 0 0 8px rgba(255,215,0,0.4)",
            }}
          >
            {/* Arrow/triangle pointer - scaled down */}
            <div className="w-0 h-0 z-20 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[10px] border-t-teal-900/90 relative">
              <div
                className="w-0 h-0 absolute border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[7px] border-t-[#ffe44d] -top-[22px] -left-[8px]"
                style={{ filter: "drop-shadow(0 0 1px rgba(255,228,77,0.5))" }}
              />
            </div>
            <div
              className="w-[12px] h-4 z-10 absolute top-[4px] left-0 border-r border-b-2 border-teal-900/90 transform skew-y-[39deg]"
              style={{ background: "linear-gradient(180deg, #ffe44d, #ffd700)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5)" }}
            />
            <div
              className="w-[12px] h-4 z-10 absolute top-[4px] left-[12px] border-r-2 border-l border-b-2 border-teal-900/90 transform skew-y-[-39deg]"
              style={{ background: "linear-gradient(180deg, #daa520, #b8860b)", boxShadow: "inset 0 -1px 0 rgba(0,0,0,0.3)" }}
            />
          </div>
        </label>
        {isOpen && <div className="w-2 h-0.5 flex-shrink-0 bg-teal-800/80 rounded-full" />}
      </div>
    </div>
  );
}
