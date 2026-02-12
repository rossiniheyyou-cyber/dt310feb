"use client";

import { useState } from "react";
import { Search, Award, Shield, XCircle } from "lucide-react";
import { issuedCertificates } from "@/data/adminData";

export default function AdminCertificatesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const certList = issuedCertificates;

  const filtered = certList.filter((c) => {
    const matchSearch =
      c.courseTitle.toLowerCase().includes(search.toLowerCase()) ||
      c.pathTitle.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Certificate Management</h1>
        <p className="text-slate-500 mt-1">
          View all issued certificates. Revoke if needed and verify authenticity. Define eligibility rules.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by course or path..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-slate-800"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-slate-200 rounded-lg text-slate-700"
        >
          <option value="all">All status</option>
          <option value="Issued">Issued</option>
          <option value="Revoked">Revoked</option>
        </select>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700">Certificate ID</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700">Course / Path</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700">Role</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700">Earned at</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700">Status</th>
                <th className="w-24 py-4 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 last:border-none hover:bg-slate-50">
                  <td className="py-4 px-4 font-mono text-sm text-slate-700">{c.id}</td>
                  <td className="py-4 px-4">
                    <p className="font-medium text-slate-800">{c.courseTitle}</p>
                    <p className="text-sm text-slate-500">{c.pathTitle}</p>
                  </td>
                  <td className="py-4 px-4 text-sm text-slate-600">{c.pathTitle}</td>
                  <td className="py-4 px-4 text-sm text-slate-600">
                    {new Date(c.earnedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700">
                      {c.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500" title="Verify">
                        <Shield className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600" title="Revoke">
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No certificates issued yet.</p>
        </div>
      )}
    </div>
  );
}
