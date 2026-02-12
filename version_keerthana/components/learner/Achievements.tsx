"use client";

export default function Achievements() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
        🏆 Achievements
      </h3>

      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2 text-slate-700">
          🔥 <span className="font-medium">7-day streak</span>
        </div>

        <div className="flex items-center gap-2 text-slate-700">
          🏆 <span className="font-medium">First certificate</span>
        </div>

        <div className="flex items-center gap-2 text-slate-700">
          ⚡ <span className="font-medium">5 quizzes completed</span>
        </div>
      </div>
    </div>
  );
}
