"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, X, Mail, User as UserIcon, Shield, Trash2, AlertCircle, Briefcase } from "lucide-react";
import { getUser, updateUser, revokeUser, PROFESSIONAL_TITLES } from "@/lib/api/users";
import type { User } from "@/lib/api/users";

export default function AdminUserEditPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [revokeReason, setRevokeReason] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    name: "",
    role: "learner" as "learner" | "instructor" | "manager" | "admin",
    status: "active" as "pending" | "active" | "revoked",
    professionalTitle: "Fullstack Developer" as (typeof PROFESSIONAL_TITLES)[number],
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await getUser(userId);
        setUser(response.user);
        setFormData({
          email: response.user.email,
          name: response.user.name,
          role: response.user.role,
          status: response.user.status || "active",
          professionalTitle:
            (response.user.professionalTitle as (typeof PROFESSIONAL_TITLES)[number]) ??
            "Fullstack Developer",
        });
      } catch (err: any) {
        console.error("Failed to fetch user:", err);
        setError(err.response?.data?.message || "Failed to load user");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      await updateUser(userId, formData);
      setSuccess("User updated successfully!");
      setTimeout(() => {
        router.push("/dashboard/admin/users");
      }, 1500);
    } catch (err: any) {
      console.error("Failed to update user:", err);
      setError(err.response?.data?.message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const handleRevoke = async () => {
    if (!revokeReason.trim() || revokeReason.trim().length < 10) {
      alert("Please provide a reason (at least 10 characters)");
      return;
    }

    try {
      setSaving(true);
      await revokeUser(userId, revokeReason.trim());
      setShowRevokeModal(false);
      setRevokeReason("");
      alert("User account revoked successfully");
      router.push("/dashboard/admin/users");
    } catch (err: any) {
      console.error("Failed to revoke user:", err);
      alert(err.response?.data?.message || "Failed to revoke user");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading user...</p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition"
        >
          <ArrowLeft size={20} />
          Back to Users
        </button>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition"
      >
        <ArrowLeft size={20} />
        Back to Users
      </button>

      <div className="bg-white border border-slate-200/60 rounded-2xl p-8 shadow-soft card-flashy">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center">
              <UserIcon className="w-8 h-8 text-teal-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">Edit User</h1>
              <p className="text-slate-600">Update user details and permissions</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-700 mb-6">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input-modern w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-modern w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              className="input-modern w-full"
            >
              <option value="learner">Learner</option>
              <option value="instructor">Instructor</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
            <p className="text-xs text-slate-500 mt-2">
              Note: Users can have multiple roles. To assign multiple roles, contact system administrator.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Account Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="input-modern w-full"
            >
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="revoked">Revoked</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Title
            </label>
            <select
              value={formData.professionalTitle}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  professionalTitle: e.target.value as (typeof PROFESSIONAL_TITLES)[number],
                })
              }
              className="input-modern w-full"
            >
              {PROFESSIONAL_TITLES.map((title) => (
                <option key={title} value={title}>
                  {title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
          <button
            onClick={handleRevoke}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center gap-2"
          >
            <Trash2 size={18} />
            Revoke Account
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => router.back()}
              className="px-6 py-2.5 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

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
                  setShowRevokeModal(false);
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
                <p className="text-slate-900 font-semibold">{user?.name}</p>
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
                    setShowRevokeModal(false);
                    setRevokeReason("");
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRevoke}
                  disabled={!revokeReason.trim() || revokeReason.trim().length < 10 || saving}
                  className="btn-fun px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Revoking..." : "Revoke Account"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
