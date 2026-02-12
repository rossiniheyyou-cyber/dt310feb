"use client";

import { useState, useEffect } from "react";
import {
  User,
  Lock,
  Bell,
  BookOpen,
  Eye,
  Shield,
  Link2,
  Settings,
  HelpCircle,
  Power,
  Camera,
  ChevronRight,
} from "lucide-react";
import { getCurrentUser, setCurrentUser, PROFESSIONAL_TITLES } from "@/lib/currentUser";
import { updateProfile } from "@/lib/api/auth";

const SECTIONS = [
  { id: "profile", label: "Profile Settings", icon: User },
  { id: "security", label: "Account & Security", icon: Lock },
  { id: "notifications", label: "Notification Preferences", icon: Bell },
  { id: "learning", label: "Learning Preferences", icon: BookOpen },
  { id: "accessibility", label: "Accessibility", icon: Eye },
  { id: "privacy", label: "Privacy & Data", icon: Shield },
  { id: "linked", label: "Linked Accounts", icon: Link2 },
  { id: "system", label: "System Preferences", icon: Settings },
  { id: "support", label: "Support & Help", icon: HelpCircle },
  { id: "actions", label: "Account Actions", icon: Power },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

const DEFAULT_READONLY = {
  employeeId: "EMP-2024-0847",
  role: "learner",
  department: "Engineering",
  lastPasswordUpdated: "Nov 15, 2024",
};

export default function LearnerSettingsPage() {
  const [activeSection, setActiveSection] = useState<SectionId>("profile");
  const [profileUser, setProfileUser] = useState({
    fullName: "",
    email: "",
    professionalTitle: "Fullstack Developer" as (typeof PROFESSIONAL_TITLES)[number],
    ...DEFAULT_READONLY,
  });

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setProfileUser((prev) => ({
        ...prev,
        fullName: user.name,
        email: user.email,
        professionalTitle:
          (user.professionalTitle as (typeof PROFESSIONAL_TITLES)[number]) ??
          "Fullstack Developer",
      }));
    } else {
      setProfileUser((prev) => ({
        ...prev,
        fullName: "Learner",
        email: "",
      }));
    }
  }, []);

  const handleProfileSave = async (
    fullName: string,
    _email: string,
    professionalTitle?: (typeof PROFESSIONAL_TITLES)[number]
  ) => {
    try {
      const { user } = await updateProfile({
        name: fullName,
        professionalTitle,
      });
      setCurrentUser({
        name: user.name,
        email: user.email,
        role: user.role,
        professionalTitle: user.professionalTitle ?? "Fullstack Developer",
      });
      setProfileUser((prev) => ({
        ...prev,
        fullName: user.name,
        professionalTitle:
          (user.professionalTitle as (typeof PROFESSIONAL_TITLES)[number]) ??
          "Fullstack Developer",
      }));
    } catch (e) {
      console.error("Failed to update profile", e);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-white">
      {/* Left: Settings navigation */}
      <aside className="w-64 border-r border-slate-200 bg-slate-50/50 p-4 flex-shrink-0">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 px-3">
          Settings
        </h2>
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

      {/* Right: Content panel */}
      <main className="flex-1 overflow-y-auto p-8">
        {activeSection === "profile" && (
          <ProfileSettings
            user={profileUser}
            onSave={handleProfileSave}
          />
        )}
        {activeSection === "security" && (
          <AccountSecurity user={profileUser} />
        )}
        {activeSection === "notifications" && <NotificationPreferences />}
        {activeSection === "learning" && <LearningPreferences />}
        {activeSection === "accessibility" && <AccessibilitySettings />}
        {activeSection === "privacy" && <PrivacyData />}
        {activeSection === "linked" && <LinkedAccounts />}
        {activeSection === "system" && <SystemPreferences />}
        {activeSection === "support" && <SupportHelp />}
        {activeSection === "actions" && <AccountActions />}
      </main>
    </div>
  );
}

/* --- Profile Settings --- */
type ProfileUser = {
  fullName: string;
  email: string;
  professionalTitle: (typeof PROFESSIONAL_TITLES)[number];
  employeeId: string;
  role: string;
  department: string;
  lastPasswordUpdated: string;
};

function ProfileSettings({
  user,
  onSave,
}: {
  user: ProfileUser;
  onSave?: (
    fullName: string,
    email: string,
    professionalTitle?: (typeof PROFESSIONAL_TITLES)[number]
  ) => void;
}) {
  const [fullName, setFullName] = useState(user.fullName);
  const [professionalTitle, setProfessionalTitle] = useState(
    user.professionalTitle
  );
  const [timezone, setTimezone] = useState("America/New_York");

  useEffect(() => {
    setFullName(user.fullName);
    setProfessionalTitle(user.professionalTitle);
  }, [user.fullName, user.professionalTitle]);

  const handleSave = () => {
    onSave?.(fullName, user.email, professionalTitle);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Profile Settings
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage your profile information
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-start gap-6">
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 rounded-full bg-teal-100 flex items-center justify-center">
              <User size={40} className="text-teal-600" />
            </div>
            <button
              type="button"
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center hover:bg-teal-700 transition"
              aria-label="Upload photo"
            >
              <Camera size={16} />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-700 mb-1">
              Profile photo
            </p>
            <p className="text-xs text-slate-500 mb-3">
              JPG, PNG or GIF. Max 2MB.
            </p>
            <button
              type="button"
              className="text-sm font-medium text-teal-600 hover:text-teal-700"
            >
              Upload new photo
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <ReadOnlyField label="Email" value={user.email} />
          <ReadOnlyField label="Employee ID" value={user.employeeId} />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Title
            </label>
            <select
              value={professionalTitle}
              onChange={(e) =>
                setProfessionalTitle(
                  e.target.value as (typeof PROFESSIONAL_TITLES)[number]
                )
              }
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              {PROFESSIONAL_TITLES.map((title) => (
                <option key={title} value={title}>
                  {title}
                </option>
              ))}
            </select>
          </div>
          <ReadOnlyField label="Department" value={user.department} />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Time zone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="Europe/London">London (GMT)</option>
              <option value="Asia/Kolkata">India (IST)</option>
            </select>
          </div>
        </div>

        <SaveButton onClick={handleSave} />
      </div>
    </div>
  );
}

/* --- Account & Security --- */
function AccountSecurity({ user }: { user: ProfileUser }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const strength = newPassword.length >= 8 ? (newPassword.length >= 12 ? "strong" : "medium") : "weak";

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Account & Security
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage your password and security options
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 mb-4">
            Change password
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Current password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                New password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              {newPassword && (
                <div className="mt-1.5 flex gap-1">
                  {["weak", "medium", "strong"].map((s) => (
                    <div
                      key={s}
                      className={`h-1 flex-1 rounded ${
                        strength === s
                          ? s === "strong"
                            ? "bg-green-500"
                            : s === "medium"
                            ? "bg-amber-500"
                            : "bg-red-400"
                          : ["weak", "medium", "strong"].indexOf(strength) >=
                            ["weak", "medium", "strong"].indexOf(s)
                          ? s === "strong"
                            ? "bg-green-200"
                            : s === "medium"
                            ? "bg-amber-200"
                            : "bg-red-200"
                          : "bg-slate-100"
                      }`}
                    />
                  ))}
                </div>
              )}
              <p className="text-xs text-slate-500 mt-1">
                Use 8+ characters with letters and numbers
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Confirm new password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </div>
          <ReadOnlyField
            label="Last password updated"
            value={user.lastPasswordUpdated}
            className="mt-4"
          />
          <SaveButton />
        </div>

        <hr className="border-slate-200" />

        <div>
          <h3 className="text-sm font-semibold text-slate-800 mb-2">
            Active sessions
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            Manage devices where you&apos;re currently logged in
          </p>
          <div className="border border-slate-200 rounded-lg divide-y divide-slate-100">
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-800">
                  Chrome on macOS • Current session
                </p>
                <p className="text-xs text-slate-500">Last active: Just now</p>
              </div>
              <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-1 rounded">
                Active
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-800">
                  Safari on iPhone
                </p>
                <p className="text-xs text-slate-500">Last active: 2 hours ago</p>
              </div>
              <button
                type="button"
                className="text-xs font-medium text-slate-600 hover:text-slate-800"
              >
                Log out
              </button>
            </div>
          </div>
          <button
            type="button"
            className="mt-4 text-sm font-medium text-teal-600 hover:text-teal-700"
          >
            Log out from all other devices
          </button>
        </div>

        <hr className="border-slate-200" />

        <div>
          <h3 className="text-sm font-semibold text-slate-800 mb-2">
            Two-factor authentication
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            Add an extra layer of security to your account (coming soon)
          </p>
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
              <Lock size={20} className="text-slate-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-700">Not enabled</p>
              <p className="text-xs text-slate-500">
                Enable 2FA for enhanced security
              </p>
            </div>
            <button
              type="button"
              disabled
              className="px-4 py-2 rounded-lg bg-slate-200 text-slate-500 text-sm font-medium cursor-not-allowed"
            >
              Coming soon
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --- Notification Preferences --- */
function NotificationPreferences() {
  const [courseUpdates, setCourseUpdates] = useState(true);
  const [assignments, setAssignments] = useState(true);
  const [announcements, setAnnouncements] = useState(true);
  const [certificates, setCertificates] = useState(true);
  const [inApp, setInApp] = useState(true);
  const [reminderFreq, setReminderFreq] = useState("daily");

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Notification Preferences
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Choose how you want to be notified
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 mb-4">
            Email notifications
          </h3>
          <div className="space-y-3">
            <ToggleRow
              label="Course updates"
              description="New content and course changes"
              checked={courseUpdates}
              onChange={setCourseUpdates}
            />
            <ToggleRow
              label="Assignment deadlines"
              description="Reminders before due dates"
              checked={assignments}
              onChange={setAssignments}
            />
            <ToggleRow
              label="Announcements"
              description="Important LMS announcements"
              checked={announcements}
              onChange={setAnnouncements}
            />
            <ToggleRow
              label="Certificate issued"
              description="When you earn a certificate"
              checked={certificates}
              onChange={setCertificates}
            />
          </div>
        </div>

        <hr className="border-slate-200" />

        <ToggleRow
          label="In-app notifications"
          description="Show notifications within the LMS"
          checked={inApp}
          onChange={setInApp}
        />

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Reminder frequency
          </label>
          <select
            value={reminderFreq}
            onChange={(e) => setReminderFreq(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="realtime">In real time</option>
            <option value="daily">Daily digest</option>
            <option value="weekly">Weekly digest</option>
            <option value="none">No reminders</option>
          </select>
        </div>

        <SaveButton />
      </div>
    </div>
  );
}

/* --- Learning Preferences --- */
function LearningPreferences() {
  const [language, setLanguage] = useState("en");
  const [contentPref, setContentPref] = useState("mixed");
  const [playbackSpeed, setPlaybackSpeed] = useState("1");
  const [resumeLesson, setResumeLesson] = useState(true);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Learning Preferences
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Customize your learning experience
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Preferred language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Content preference
          </label>
          <select
            value={contentPref}
            onChange={(e) => setContentPref(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="video">Video</option>
            <option value="reading">Reading</option>
            <option value="practice">Practice</option>
            <option value="mixed">Mixed (recommended)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Default video playback speed
          </label>
          <select
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="0.5">0.5x</option>
            <option value="0.75">0.75x</option>
            <option value="1">1x (Normal)</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
            <option value="1.75">1.75x</option>
            <option value="2">2x</option>
          </select>
        </div>

        <ToggleRow
          label="Resume from last lesson"
          description="Automatically continue where you left off"
          checked={resumeLesson}
          onChange={setResumeLesson}
        />

        <SaveButton />
      </div>
    </div>
  );
}

/* --- Accessibility --- */
function AccessibilitySettings() {
  const [fontSize, setFontSize] = useState("medium");
  const [highContrast, setHighContrast] = useState(false);
  const [captions, setCaptions] = useState(false);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Accessibility</h1>
        <p className="text-slate-500 text-sm mt-1">
          Adjust display and accessibility options
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Font size
          </label>
          <div className="flex gap-2">
            {[
              { id: "small", label: "Small" },
              { id: "medium", label: "Medium" },
              { id: "large", label: "Large" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setFontSize(opt.id)}
                className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition ${
                  fontSize === opt.id
                    ? "border-teal-500 bg-teal-50 text-teal-700"
                    : "border-slate-300 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <ToggleRow
          label="High contrast mode"
          description="Increase contrast for better visibility"
          checked={highContrast}
          onChange={setHighContrast}
        />

        <ToggleRow
          label="Captions / subtitles"
          description="Show captions for video content"
          checked={captions}
          onChange={setCaptions}
        />

        <SaveButton />
      </div>
    </div>
  );
}

/* --- Privacy & Data --- */
function PrivacyData() {
  const [visibility, setVisibility] = useState("internal");

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Privacy & Data
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Control your privacy and data preferences
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Profile visibility
          </label>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="internal">Internal only (organization)</option>
            <option value="private">Private</option>
          </select>
        </div>

        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <h4 className="text-sm font-medium text-slate-800 mb-1">
            Learning activity tracking
          </h4>
          <p className="text-sm text-slate-500">
            Your progress and completion data is used to personalize your
            learning and for organizational reporting.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-slate-800 mb-2">
            Download personal data
          </h4>
          <p className="text-sm text-slate-500 mb-3">
            Request a copy of your learning data and profile information.
          </p>
          <button
            type="button"
            className="text-sm font-medium text-teal-600 hover:text-teal-700"
          >
            Request data export
          </button>
        </div>

        <div className="flex gap-4 text-sm">
          <a
            href="#"
            className="text-teal-600 hover:text-teal-700 font-medium"
          >
            Privacy policy
          </a>
          <a
            href="#"
            className="text-teal-600 hover:text-teal-700 font-medium"
          >
            Terms of service
          </a>
        </div>

        <SaveButton />
      </div>
    </div>
  );
}

/* --- Linked Accounts --- */
function LinkedAccounts() {
  const accounts = [
    { name: "Google", connected: false },
    { name: "Microsoft", connected: true },
    { name: "Company SSO", connected: true },
  ];

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Linked Accounts
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage your connected sign-in methods
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        {accounts.map((acc) => (
          <div
            key={acc.name}
            className="flex items-center justify-between p-4 rounded-lg border border-slate-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                <Link2 size={20} className="text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">{acc.name}</p>
                <p className="text-xs text-slate-500">
                  {acc.connected ? "Connected" : "Not connected"}
                </p>
              </div>
            </div>
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded ${
                acc.connected
                  ? "bg-teal-50 text-teal-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {acc.connected ? "Connected" : "Not connected"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* --- System Preferences --- */
function SystemPreferences() {
  const [theme, setTheme] = useState("light");
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");
  const [uiLanguage, setUiLanguage] = useState("en");

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          System Preferences
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          App appearance and display options
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Theme preference
          </label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System default</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Date & time format
          </label>
          <select
            value={dateFormat}
            onChange={(e) => setDateFormat(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            UI language
          </label>
          <select
            value={uiLanguage}
            onChange={(e) => setUiLanguage(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </select>
        </div>

        <SaveButton />
      </div>
    </div>
  );
}

/* --- Support & Help --- */
function SupportHelp() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Support & Help
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Get assistance and resources
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex items-start gap-4 p-4 rounded-lg border border-slate-200 hover:border-teal-200 transition">
          <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0">
            <HelpCircle size={20} className="text-teal-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-800 mb-1">
              Contact support
            </h3>
            <p className="text-sm text-slate-500 mb-2">
              Reach out to our support team for assistance
            </p>
            <a
              href="#"
              className="text-sm font-medium text-teal-600 hover:text-teal-700 inline-flex items-center gap-1"
            >
              Contact support <ChevronRight size={16} />
            </a>
          </div>
        </div>

        <div className="flex items-start gap-4 p-4 rounded-lg border border-slate-200 hover:border-teal-200 transition">
          <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0">
            <Settings size={20} className="text-teal-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-800 mb-1">
              Raise a ticket
            </h3>
            <p className="text-sm text-slate-500 mb-2">
              Submit a support ticket for technical issues
            </p>
            <a
              href="#"
              className="text-sm font-medium text-teal-600 hover:text-teal-700 inline-flex items-center gap-1"
            >
              Create ticket <ChevronRight size={16} />
            </a>
          </div>
        </div>

        <div className="flex items-start gap-4 p-4 rounded-lg border border-slate-200 hover:border-teal-200 transition">
          <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0">
            <BookOpen size={20} className="text-teal-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-800 mb-1">
              FAQ / Help Center
            </h3>
            <p className="text-sm text-slate-500 mb-2">
              Browse FAQs and help articles
            </p>
            <a
              href="#"
              className="text-sm font-medium text-teal-600 hover:text-teal-700 inline-flex items-center gap-1"
            >
              Visit Help Center <ChevronRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --- Account Actions --- */
function AccountActions() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Account Actions
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Account and organization information
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 mb-2">
            Request account deactivation
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            Submit a request to deactivate your account. This action may require
            admin approval.
          </p>
          <button
            type="button"
            className="text-sm font-medium text-amber-600 hover:text-amber-700"
          >
            Request deactivation
          </button>
        </div>

        <hr className="border-slate-200" />

        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <h4 className="text-sm font-semibold text-slate-800 mb-2">
            Organization
          </h4>
          <p className="text-sm text-slate-700 font-medium">Acme Corporation</p>
          <p className="text-sm text-slate-500 mt-1">LMS licensed to your organization</p>
        </div>

        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <h4 className="text-sm font-semibold text-slate-800 mb-2">
            Admin contact
          </h4>
          <p className="text-sm text-slate-700">admin@acmecorp.com</p>
          <p className="text-sm text-slate-500 mt-1">Contact your LMS administrator</p>
        </div>
      </div>
    </div>
  );
}

/* --- Shared components --- */
function ReadOnlyField({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
      </label>
      <div className="px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-sm">
        {value}
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium text-slate-800">{label}</p>
        {description && (
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition ${
          checked ? "bg-teal-600" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function SaveButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-6 px-5 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition"
    >
      Save Changes
    </button>
  );
}
