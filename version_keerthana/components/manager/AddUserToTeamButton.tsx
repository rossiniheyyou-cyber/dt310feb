"use client";

import { useState } from "react";
import { Plus, Search, X, Check } from "lucide-react";
import { searchUsersByEmail } from "@/lib/api/users";
import type { User } from "@/lib/api/users";

export default function AddUserToTeamButton({ onUserAdded }: { onUserAdded?: () => void }) {
  const [showModal, setShowModal] = useState(false);
  const [emailSearch, setEmailSearch] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!emailSearch.trim() || !emailSearch.includes("@")) {
      alert("Please enter a valid email address");
      return;
    }

    try {
      setSearching(true);
      const response = await searchUsersByEmail(emailSearch.trim());
      setSearchResults(response.users || []);
    } catch (err: any) {
      console.error("Search failed:", err);
      alert(err.response?.data?.message || "Failed to search users");
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleAddToTeam = async (user: User) => {
    try {
      setAdding(user.id);
      // TODO: Implement backend endpoint to add user to manager's team
      // For now, just show success message
      alert(`${user.name} has been added to your team!`);
      setShowModal(false);
      setEmailSearch("");
      setSearchResults([]);
      onUserAdded?.();
    } catch (err: any) {
      console.error("Add to team failed:", err);
      alert(err.response?.data?.message || "Failed to add user to team");
    } finally {
      setAdding(null);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="btn-primary inline-flex items-center gap-2"
      >
        <Plus size={18} />
        Add to Team
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 card-flashy">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Add User to Team</h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEmailSearch("");
                  setSearchResults([]);
                }}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Search by Email
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      placeholder="user@example.com"
                      value={emailSearch}
                      onChange={(e) => setEmailSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && emailSearch.trim()) {
                          handleSearch();
                        }
                      }}
                      className="input-modern pl-10"
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    disabled={searching || !emailSearch.trim()}
                    className="btn-primary disabled:opacity-50"
                  >
                    {searching ? "Searching..." : "Search"}
                  </button>
                </div>
              </div>

              {searchResults.length > 0 && (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="max-h-64 overflow-y-auto">
                    {searchResults.map((user) => (
                      <div
                        key={user.id}
                        className="p-4 border-b border-slate-100 last:border-none hover:bg-slate-50 transition"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-slate-900">{user.name}</p>
                            <p className="text-sm text-slate-600">{user.email}</p>
                            <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                              {user.role}
                            </span>
                          </div>
                          <button
                            onClick={() => handleAddToTeam(user)}
                            disabled={adding === user.id}
                            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-medium flex items-center gap-2 disabled:opacity-50"
                          >
                            {adding === user.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Adding...
                              </>
                            ) : (
                              <>
                                <Check size={16} />
                                Add
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {searchResults.length === 0 && emailSearch && !searching && (
                <div className="text-center py-8 text-slate-500">
                  <p>No users found with that email.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
