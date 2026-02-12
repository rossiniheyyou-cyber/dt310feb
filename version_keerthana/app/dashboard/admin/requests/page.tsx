"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, Mail, User, Shield, X, AlertCircle } from "lucide-react";
import apiClient from "@/lib/api/client";
import { approveAccount, rejectAccount } from "@/lib/api/users";

interface AccountRequest {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

export default function AdminRequestsPage() {
  const [mounted, setMounted] = useState(false);
  const [userRequests, setUserRequests] = useState<AccountRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<{ type: "user"; id: string } | null>(null);
  const [showApproveModal, setShowApproveModal] = useState<{ userId: string; userName: string } | null>(null);
  const [selectedRole, setSelectedRole] = useState<"learner" | "instructor" | "manager" | "admin">("learner");
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchUserRequests = async () => {
    try {
      const response = await apiClient.get<{ requests: AccountRequest[] }>("/users/requests");
      const raw = response.data.requests || [];
      setUserRequests(raw.map((r) => ({
        id: String(r.id),
        email: r.email ?? '',
        name: r.name ?? '',
        role: r.role ?? 'unknown',
        createdAt: r.createdAt ?? '',
      })));
      setError("");
    } catch (err: any) {
      console.error("Failed to fetch user requests:", err);
      const status = err.response?.status;
      const msg = err.response?.data?.message || err.message || "Failed to load requests";
      if (status === 403) {
        setError("Insufficient permissions. This page requires an admin account. Log in as an admin or ask an administrator to grant you access.");
      } else if (status === 503) {
        setError(msg || "Database not available. Check that the backend can connect to MySQL.");
      } else {
        setError(msg);
      }
    }
  };

  const fetchAllRequests = async () => {
    try {
      setLoading(true);
      setError("");
      await fetchUserRequests();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRequests();
    // Refresh every 10 seconds for faster updates
    const interval = setInterval(fetchAllRequests, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleApproveUser = async () => {
    if (!showApproveModal) return;
    const { userId } = showApproveModal;
    try {
      setProcessingId(`user-${userId}`);
      await approveAccount(userId, selectedRole);
      setShowApproveModal(null);
      setSelectedRole("learner");
      await fetchAllRequests();
      alert("Account approved successfully!");
    } catch (err: any) {
      console.error("Failed to approve:", err);
      alert(err.response?.data?.message || "Failed to approve account");
    } finally {
      setProcessingId(null);
    }
  };

  // Course publishing no longer requires admin approval.
  // Admin can remove courses (with a reason) after they are published from Course Oversight.

  const handleRejectUser = () => {
    if (!showRejectModal || showRejectModal.type !== "user") return;
    if (!rejectReason.trim() || rejectReason.trim().length < 10) {
      alert("Please provide a reason (at least 10 characters)");
      return;
    }

    const handleSubmit = async () => {
      try {
        setProcessingId(`user-${showRejectModal.id}`);
        await rejectAccount(showRejectModal.id, rejectReason.trim());
        setShowRejectModal(null);
        setRejectReason("");
        await fetchAllRequests();
        alert("Account request rejected and removed");
      } catch (err: any) {
        console.error("Failed to reject:", err);
        alert(err.response?.data?.message || "Failed to reject account");
      } finally {
        setProcessingId(null);
      }
    };

    handleSubmit();
  };

  // (course rejection removed)

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "instructor":
        return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "manager":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "learner":
        return "bg-teal-100 text-teal-700 border-teal-200";
      case "unknown":
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const displayRole = (role: string) => {
    if (!role || role === "unknown") return "Unknown";
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };

  const formatDate = (dateString: string) => {
    if (!dateString || !mounted) return ""; // Prevent hydration mismatch
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };


  const currentRequests = userRequests;
  const hasRequests = currentRequests.length > 0;

  // Always render the same layout to avoid hydration mismatch (no early return).
  const showLoading = !mounted || (loading && !hasRequests);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Requests</h1>
          <p className="text-slate-600">
            Review and approve or reject account requests
          </p>
        </div>
        <button
          onClick={fetchAllRequests}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-medium"
        >
          Refresh
        </button>
      </div>

      {/* User requests only */}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          <p className="font-semibold mb-1">Error loading requests:</p>
          <p>{error}</p>
          <p className="text-xs mt-2">Check browser console for more details.</p>
        </div>
      )}

      <div className="min-h-[400px]">
      {showLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading requests...</p>
          </div>
        </div>
      ) : !hasRequests ? (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center card-flashy">
            <Clock className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No Pending User Requests</h3>
            <p className="text-slate-600 mb-4">
              All account requests have been processed.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {true ? (
            userRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all duration-300 card-flashy card-interactive"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-teal-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-slate-900">{request.name}</h3>
                        <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getRoleColor(request.role)}`} title="Requested role">
                          {displayRole(request.role)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mb-2">
                        Requested as: <strong className="text-slate-700">{displayRole(request.role)}</strong>
                      </p>
                      <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                        <Mail className="w-4 h-4" />
                        <span>{request.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        {mounted ? (
                          <span>Requested {formatDate(request.createdAt)}</span>
                        ) : (
                          <span>Requested —</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => setShowApproveModal({ userId: request.id, userName: request.name })}
                      disabled={processingId === `user-${request.id}`}
                      className="btn-fun px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover-glow-intense"
                    >
                      <CheckCircle size={18} />
                      Approve
                    </button>
                    <button
                      onClick={() => setShowRejectModal({ type: "user", id: request.id })}
                      disabled={processingId === `user-${request.id}`}
                      className="btn-fun px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <XCircle size={18} />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            null
          )}
        </div>
      )}
      </div>

      {/* Reject Reason Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 card-flashy">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Reject Account Request
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowRejectModal(null);
                  setRejectReason("");
                }}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Reason for Rejection <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Please provide a detailed reason for rejection (minimum 10 characters)..."
                  rows={5}
                  className="input-modern w-full resize-none"
                />
                <p className="text-xs text-slate-500 mt-1">
                  {rejectReason.length}/10 characters minimum
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => {
                    setShowRejectModal(null);
                    setRejectReason("");
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectUser}
                  disabled={!rejectReason.trim() || rejectReason.trim().length < 10 || processingId !== null}
                  className="btn-fun px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingId ? "Processing..." : "Reject"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approve User Modal with Role Selection */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 card-flashy">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Approve Account Request
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowApproveModal(null);
                  setSelectedRole("learner");
                }}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-600 mb-4">
                  Approve account for <strong>{showApproveModal.userName}</strong> and assign a role:
                </p>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Select Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as "learner" | "instructor" | "manager" | "admin")}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="learner">Learner</option>
                  <option value="instructor">Instructor</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => {
                    setShowApproveModal(null);
                    setSelectedRole("learner");
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApproveUser}
                  disabled={processingId !== null}
                  className="btn-fun px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingId ? "Processing..." : "Approve & Assign Role"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
