"use client";

import { useState, useMemo, useEffect } from "react";
import AssignmentCard from "./AssignmentCard";
import AssignmentFilters from "./AssignmentFilters";
import type { Assignment } from "@/data/assignments";
import { useLearnerAssignments } from "@/context/LearnerAssignmentsContext";

export default function AssignmentListing() {
  const { assignments } = useLearnerAssignments();
  const initialSorted = useMemo(
    () => [...assignments].sort((a, b) => new Date(a.dueDateISO).getTime() - new Date(b.dueDateISO).getTime()),
    [assignments]
  );
  const [filtered, setFiltered] = useState<Assignment[]>(initialSorted);

  useEffect(() => {
    const sorted = [...assignments].sort(
      (a, b) => (new Date(a.dueDateISO || 0).getTime()) - (new Date(b.dueDateISO || 0).getTime())
    );
    setFiltered(sorted);
  }, [assignments]);

  return (
    <div className="space-y-6">
      <AssignmentFilters onFilter={setFiltered} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((a) => (
          <AssignmentCard key={a.id} assignment={a} />
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500">
          No assignments match your filters.
        </div>
      )}
    </div>
  );
}
