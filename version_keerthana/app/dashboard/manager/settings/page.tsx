"use client";

import { useState, useEffect, useMemo } from "react";
import { User, Lock, Bell, Eye, Building2, Users } from "lucide-react";
import { getCurrentUser, setCurrentUser } from "@/lib/currentUser";
import { platformUsers, getDepartmentById, getTeamById } from "@/data/adminData";

const SECTIONS = [
  { id: "profile", label: "Manager profile", icon: User },
  { id: "security", label: "Account & Security", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "accessibility", label: "Accessibility", icon: Eye },
] as const;

export default function ManagerSettingsPage() {
  const [activeSection, setActiveSection] = useState<(typeof SECTIONS)[number]["id"]>("profile");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const user = getCurrentUser();
  const managerUser = useMemo(
    () => (user?.email ? platformUsers.find((u) => u.role === "manager" && u.email === user.email) : null),
    [user?.email]
  );
  const department = managerUser?.departmentId ? getDepartmentById(managerUser.departmentId) : null;
  const team = managerUser?.teamId ? getTeamById(managerUser.teamId) : null;

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-white">
      <aside className="w-64 border-r border-slate-200 bg-slate-50/50 p-4 flex-shrink-0">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">
          Manager settings
        </h2>
        <p className="text-xs text-slate-400 px-3 mb-4">Team supervisor — read-only oversight</p>
        <nav className="space-y-0.5">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition ${
                activeSection === id
                  ? "bg-blue-50 text-blue-700 border border-blue-100"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon size={18} strokeWidth={1.5} className="flex-shrink-0" />
              {label}
            </button>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto p-8 max-w-2xl">
        {activeSection === "profile" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Manager profile</h1>
              <p className="text-slate-500 text-sm mt-1">Your display name and team assignment. You cannot create or edit courses or system settings.</p>
            </div>
            {(department || team) && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2">
                <p className="text-sm font-medium text-slate-700">Your assignment (read-only)</p>
                <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                  {department && (
                    <span className="inline-flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      {department.name}
                    </span>
                  )}
                  {team && (
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-blue-600" />
                      {team.name}
                    </span>
                  )}
                </div>
              </div>
            )}
            <div className="rounded-2xl card-gradient border border-slate-200 p-6 space-y-4 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Display name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600"
                />
              </div>
              <button
                onClick={() => setCurrentUser({ name, email })}
                className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        )}
        {activeSection === "security" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Account & Security</h1>
              <p className="text-slate-500 text-sm mt-1">Change your password. Managers do not have access to system-level security settings.</p>
            </div>
            <div className="rounded-2xl card-gradient border border-slate-200 p-6 space-y-4 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Current password</label>
                <input type="password" className="w-full px-4 py-2.5 rounded-lg border border-slate-300" placeholder="Enter current password" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New password</label>
                <input type="password" className="w-full px-4 py-2.5 rounded-lg border border-slate-300" placeholder="Enter new password" />
              </div>
              <button className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">
                Update password
              </button>
            </div>
          </div>
        )}
        {activeSection === "notifications" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Notification preferences</h1>
              <p className="text-slate-500 text-sm mt-1">Team deadlines, learner progress alerts, and report reminders.</p>
            </div>
            <div className="rounded-2xl card-gradient border border-slate-200 p-6 space-y-4 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300">
              <label className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-slate-800">Email notifications</span>
                <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              </label>
              <label className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-slate-800">In-app notifications</span>
                <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              </label>
              <button className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">
                Save
              </button>
            </div>
          </div>
        )}
        {activeSection === "accessibility" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Accessibility</h1>
              <p className="text-slate-500 text-sm mt-1">Display and readability options</p>
            </div>
            <div className="rounded-2xl card-gradient border border-slate-200 p-6 space-y-4 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300">
              <label className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-slate-800">Reduce motion</span>
                <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              </label>
              <label className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-slate-800">High contrast</span>
                <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              </label>
              <button className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">
                Save
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
