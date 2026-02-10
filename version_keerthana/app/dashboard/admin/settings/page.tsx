"use client";

import { useState, useEffect } from "react";
import { User, Lock, Bell, Eye, Shield } from "lucide-react";
import { getCurrentUser, setCurrentUser } from "@/lib/currentUser";

const SECTIONS = [
  { id: "profile", label: "Admin profile", icon: User },
  { id: "security", label: "Account & Security", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "accessibility", label: "Accessibility", icon: Eye },
] as const;

export default function AdminSettingsPage() {
  const [activeSection, setActiveSection] = useState<(typeof SECTIONS)[number]["id"]>("profile");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-white">
      <aside className="w-64 border-r border-slate-200 bg-slate-50/50 p-4 flex-shrink-0">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">
          Admin settings
        </h2>
        <p className="text-xs text-slate-400 px-3 mb-4">System owner — full platform access</p>
        <nav className="space-y-0.5">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition ${
                activeSection === id
                  ? "bg-teal-50 text-teal-700 border border-teal-100"
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
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-semibold text-slate-900">Admin profile</h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 text-white text-xs font-medium">
                <Shield className="w-3.5 h-3.5" />
                System owner
              </span>
            </div>
            <p className="text-slate-500 text-sm">Your display name and email. You have full access to all data, configurations, and system settings.</p>
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Display name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-teal-500"
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
                className="px-5 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700"
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
              <p className="text-slate-500 text-sm mt-1">Admin account password and security. Protect access to platform configuration and user management.</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Current password</label>
                <input type="password" className="w-full px-4 py-2.5 rounded-lg border border-slate-300" placeholder="Enter current password" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New password</label>
                <input type="password" className="w-full px-4 py-2.5 rounded-lg border border-slate-300" placeholder="Enter new password" />
              </div>
              <button className="px-5 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700">
                Update password
              </button>
            </div>
          </div>
        )}
        {activeSection === "notifications" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Notifications</h1>
              <p className="text-slate-500 text-sm mt-1">Alerts for user activity, system events, and platform updates.</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <label className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-slate-800">Email notifications</span>
                <input type="checkbox" defaultChecked className="rounded border-slate-300 text-teal-600" />
              </label>
              <label className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-slate-800">In-app notifications</span>
                <input type="checkbox" defaultChecked className="rounded border-slate-300 text-teal-600" />
              </label>
              <button className="px-5 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700">
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
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <label className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-slate-800">Reduce motion</span>
                <input type="checkbox" className="rounded border-slate-300 text-teal-600" />
              </label>
              <label className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-slate-800">High contrast</span>
                <input type="checkbox" className="rounded border-slate-300 text-teal-600" />
              </label>
              <button className="px-5 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700">
                Save
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
