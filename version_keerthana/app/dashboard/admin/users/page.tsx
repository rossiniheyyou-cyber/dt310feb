"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Users,
  Filter,
  MoreVertical,
  Edit2,
  UserX,
  Upload,
  X,
  AlertCircle,
} from "lucide-react";
import {
  platformUsers,
  departments,
  teams,
  getDepartmentById,
  getTeamById,
  type PlatformUser,
  type UserRole,
} from "@/data/adminData";
import { getUsers, revokeUser } from "@/lib/api/users";
import type { User } from "@/lib/api/users";

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [showRevokeModal, setShowRevokeModal] = useState<{ userId: string; userName: string } | null>(null);
  const [revokeReason, setRevokeReason] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await getUsers({ status: "active" });
        setUsers(response.users || []);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        // Fallback to mock data if API fails
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleRevoke = async () => {
    if (!showRevokeModal) return;
    if (!revokeReason.trim() || revokeReason.trim().length < 10) {
      alert("Please provide a reason (at least 10 characters)");
      return;
    }

    try {
      setRevokingId(showRevokeModal.userId);
      await revokeUser(showRevokeModal.userId, revokeReason.trim());
      setUsers(users.filter(u => u.id !== showRevokeModal.userId));
      setShowRevokeModal(null);
      setRevokeReason("");
      alert("User account revoked successfully");
    } catch (err: any) {
      console.error("Failed to revoke:", err);
      alert(err.response?.data?.message || "Failed to revoke user");
    } finally {
      setRevokingId(null);
    }
  };

  // Combine backend users with mock data for now (until full migration)
  // Map backend users to include mock data properties for compatibility
  const backendUsersWithDefaults = users.map(u => ({
    ...u,
    enrolledCourseIds: (u as any).enrolledCourseIds || [],
    assignedCourseIds: (u as any).assignedCourseIds || [],
    departmentId: (u as any).departmentId || null,
    teamId: (u as any).teamId || null,
    managerId: (u as any).managerId || null,
  }));
  
  const allUsers = [...backendUsersWithDefaults, ...platformUsers.filter(mu => !users.find(u => u.email === mu.email))];
  
  const filtered = allUsers.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">User Management</h1>
          <p className="text-slate-500 mt-1">
            Create, edit, deactivate users. Assign roles, departments, teams, and managers.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBulkUpload(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
          >
            <Upload className="w-5 h-5" />
            Bulk upload (CSV)
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700"
          >
            <Plus className="w-5 h-5" />
            Add user
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-slate-800"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 border border-slate-200 rounded-lg text-slate-700"
        >
          <option value="all">All roles</option>
          <option value="learner">Learners</option>
          <option value="instructor">Instructors</option>
          <option value="manager">Managers</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700">User</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700">Role</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700">Department / Team</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700">Manager</th>
                <th className="text-center py-4 px-4 text-sm font-semibold text-slate-700">Status</th>
                <th className="text-center py-4 px-4 text-sm font-semibold text-slate-700">Courses</th>
                <th className="w-12 py-4 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const deptId = (u as any).departmentId;
                const teamId = (u as any).teamId;
                const managerId = (u as any).managerId;
                const dept = deptId ? getDepartmentById(deptId) : null;
                const team = teamId ? getTeamById(teamId) : null;
                const manager = managerId ? platformUsers.find((p) => p.id === managerId) : null;
                const enrolledCourseIds = (u as any).enrolledCourseIds || [];
                const assignedCourseIds = (u as any).assignedCourseIds || [];
                return (
                  <tr key={u.id} className="border-b border-slate-100 last:border-none hover:bg-slate-50">
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-slate-800">{u.name}</p>
                        <p className="text-sm text-slate-500">{u.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`capitalize px-3 py-1 rounded-lg text-xs font-semibold border ${
                        u.role === "admin" ? "bg-slate-100 text-slate-700 border-slate-200" :
                        u.role === "instructor" ? "bg-indigo-100 text-indigo-700 border-indigo-200" :
                        u.role === "manager" ? "bg-blue-100 text-blue-700 border-blue-200" :
                        "bg-teal-100 text-teal-700 border-teal-200"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-600">
                      {(() => {
                        const deptId = (u as any).departmentId;
                        const teamId = (u as any).teamId;
                        const dept = deptId ? getDepartmentById(deptId) : null;
                        const team = teamId ? getTeamById(teamId) : null;
                        return `${dept?.name ?? "—"} ${team ? ` / ${team.name}` : ""}`;
                      })()}
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-600">
                      {(() => {
                        const managerId = (u as any).managerId;
                        const manager = managerId ? platformUsers.find((p) => p.id === managerId) : null;
                        return manager?.name ?? "—";
                      })()}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          (u as any).status === "active" || !(u as any).status ? "bg-emerald-100 text-emerald-700" : 
                          (u as any).status === "pending" ? "bg-amber-100 text-amber-700" :
                          "bg-red-100 text-red-700"
                        }`}
                      >
                        {(u as any).status || "active"}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center text-sm text-slate-600">
                      {u.role === "learner" 
                        ? enrolledCourseIds.length 
                        : u.role === "instructor" 
                        ? assignedCourseIds.length 
                        : "—"}
                    </td>
                    <td className="py-4 px-4 relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === u.id ? null : u.id)}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {openMenuId === u.id && (
                        <div className="absolute right-0 top-full mt-1 py-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 min-w-[160px]">
                          <Link
                            href={`/dashboard/admin/users/${u.id}`}
                            onClick={() => setOpenMenuId(null)}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit / View profile
                          </Link>
                          <button 
                            onClick={() => {
                              setShowRevokeModal({ userId: u.id, userName: u.name });
                              setOpenMenuId(null);
                            }}
                            disabled={revokingId === u.id}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-left disabled:opacity-50"
                          >
                            <UserX className="w-4 h-4" />
                            Revoke Account
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500">
          No users match your filters.
        </div>
      )}

      {openMenuId && (
        <div className="fixed inset-0 z-0" onClick={() => setOpenMenuId(null)} aria-hidden />
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-slate-800">Add user</h3>
            <p className="text-sm text-slate-500 mt-1">Create a new user and assign role.</p>
            <form className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input type="text" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg" placeholder="Full name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg" placeholder="email@company.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select className="w-full px-4 py-2.5 border border-slate-200 rounded-lg">
                  <option value="learner">Learner</option>
                  <option value="instructor">Instructor</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                <select className="w-full px-4 py-2.5 border border-slate-200 rounded-lg">
                  <option value="">—</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Team</label>
                <select className="w-full px-4 py-2.5 border border-slate-200 rounded-lg">
                  <option value="">—</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </form>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2.5 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50">
                Cancel
              </button>
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700">
                Create user
              </button>
            </div>
          </div>
        </div>
      )}

      {showBulkUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-slate-800">Bulk upload users</h3>
            <p className="text-sm text-slate-500 mt-1">Upload a CSV with columns: name, email, role, departmentId, teamId, managerId</p>
            <div className="mt-6 border-2 border-dashed border-slate-200 rounded-xl p-8 text-center">
              <Upload className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Drop CSV file or click to browse</p>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowBulkUpload(false)} className="px-4 py-2.5 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50">
                Cancel
              </button>
              <button onClick={() => setShowBulkUpload(false)} className="px-4 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700">
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revoke Reason Modal */}
      {showRevokeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 card-flashy">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Revoke Account</h3>
              </div>
              <button
                onClick={() => {
                  setShowRevokeModal(null);
                  setRevokeReason("");
                }}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm font-medium text-slate-700 mb-1">User:</p>
                <p className="text-slate-900 font-semibold">{showRevokeModal.userName}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Reason for Revocation <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  placeholder="Please provide a detailed reason for revoking this account (minimum 10 characters)..."
                  rows={5}
                  className="input-modern w-full resize-none"
                />
                <p className="text-xs text-slate-500 mt-1">
                  {revokeReason.length}/10 characters minimum
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => {
                    setShowRevokeModal(null);
                    setRevokeReason("");
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRevoke}
                  disabled={!revokeReason.trim() || revokeReason.trim().length < 10 || revokingId !== null}
                  className="btn-fun px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {revokingId ? "Revoking..." : "Revoke Account"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
