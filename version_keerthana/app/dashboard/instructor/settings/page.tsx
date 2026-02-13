"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  User,
  BookOpen,
  Bell,
  ChevronRight,
  Mail,
  Shield,
  Camera,
  Lock,
  Eye,
  Smartphone,
} from "lucide-react";
import { getCurrentUser, setCurrentUser } from "@/lib/currentUser";
import { useCanonicalStore } from "@/context/CanonicalStoreContext";

const PROFILE_PHOTO_KEY = "digitalt3-instructor-photo";

export default function InstructorSettingsPage() {
  const [activeSection, setActiveSection] = useState<
    "profile" | "courses" | "notifications" | "accessibility"
  >("profile");
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [emailNotif, setEmailNotif] = useState(true);
  const [inAppNotif, setInAppNotif] = useState(true);
  const [overdueReminder, setOverdueReminder] = useState(true);
  const [learnersAtRisk, setLearnersAtRisk] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const user = getCurrentUser();
  const displayName = name || user?.name || "Instructor";
  const { getCoursesForInstructor } = useCanonicalStore();
  const instructorCourses = getCoursesForInstructor();

  useEffect(() => {
    const photo = localStorage.getItem(PROFILE_PHOTO_KEY);
    if (photo) setProfilePhoto(photo);
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setProfilePhoto(dataUrl);
      localStorage.setItem(PROFILE_PHOTO_KEY, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = () => {
    setCurrentUser({
      name: name || user?.name || "Instructor",
      email: user?.email ?? "instructor@digitalt3.com",
    });
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMessage({ type: "error", text: "Password must be at least 8 characters." });
      return;
    }
    setPasswordMessage({ type: "success", text: "Password updated successfully." });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const sections = [
    { id: "profile" as const, label: "Instructor profile", icon: User },
    { id: "courses" as const, label: "Assigned Courses", icon: BookOpen },
    { id: "notifications" as const, label: "Notifications", icon: Bell },
    { id: "accessibility" as const, label: "Accessibility", icon: Eye },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Instructor Settings</h1>
        <p className="text-slate-500 mt-1">Manage your instructor profile, assigned courses, and preferences</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {sections.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                activeSection === tab.id
                  ? "bg-teal-600 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeSection === "profile" && (
        <div className="rounded-2xl bg-gradient-to-br from-white via-teal-50/20 to-white border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300">
          <h2 className="font-semibold text-slate-800 mb-4">Profile Information</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 border border-slate-100">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center text-2xl font-bold text-teal-700 overflow-hidden">
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    displayName.charAt(0)
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center shadow hover:bg-teal-700 transition"
                >
                  <Camera size={14} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>
              <div>
                <p className="font-medium text-slate-800">{displayName}</p>
                <p className="text-sm text-slate-500">{user?.email || "instructor@digitalt3.com"}</p>
                <p className="text-xs text-slate-400 mt-1">Instructor</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Display Name</label>
              <input
                type="text"
                value={name || user?.name || ""}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={user?.email || "instructor@digitalt3.com"}
                readOnly
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-600"
              />
              <p className="text-xs text-slate-500 mt-1">Contact admin to change email</p>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Lock size={16} />
                Change Password
              </h3>
              <form onSubmit={handlePasswordChange} className="space-y-3">
                <input
                  type="password"
                  placeholder="Current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                {passwordMessage && (
                  <p
                    className={`text-sm ${
                      passwordMessage.type === "success" ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {passwordMessage.text}
                  </p>
                )}
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-medium"
                >
                  Update Password
                </button>
              </form>
            </div>

            <button
              onClick={handleSaveProfile}
              className="px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-medium"
            >
              Save Profile
            </button>
          </div>
        </div>
      )}

      {activeSection === "courses" && (
        <div className="rounded-2xl bg-gradient-to-br from-white via-teal-50/20 to-white border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300">
          <div className="p-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-800">Assigned Courses</h2>
            <p className="text-sm text-slate-500 mt-1">Courses you are responsible for</p>
          </div>
          <div className="divide-y divide-slate-100">
            {instructorCourses.slice(0, 10).map((course) => (
              <Link
                key={course.id}
                href={`/dashboard/instructor/courses/${course.id}`}
                className="flex items-center justify-between p-4 hover:bg-slate-50 transition"
              >
                <div>
                  <p className="font-medium text-slate-800">{course.title}</p>
                  <p className="text-sm text-slate-500">
                    {course.roles.join(", ")} • {course.phase}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-600">{course.enrolledCount} enrolled</span>
                  <span className="text-sm font-medium text-teal-600">{course.completionRate}% completion</span>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {activeSection === "notifications" && (
        <div className="rounded-2xl bg-gradient-to-br from-white via-teal-50/20 to-white border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300">
          <h2 className="font-semibold text-slate-800 mb-4">Notification Preferences</h2>
          <p className="text-sm text-slate-500 mb-4">
            Choose how you want to be notified (email and/or in-app).
          </p>
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-teal-600" />
                <div>
                  <p className="font-medium text-slate-800">Email notifications</p>
                  <p className="text-sm text-slate-500">Receive notifications by email</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={emailNotif}
                onChange={(e) => setEmailNotif(e.target.checked)}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
            </label>
            <label className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-teal-600" />
                <div>
                  <p className="font-medium text-slate-800">In-app notifications</p>
                  <p className="text-sm text-slate-500">Show notifications in the LMS</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={inAppNotif}
                onChange={(e) => setInAppNotif(e.target.checked)}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
            </label>
            <label className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-teal-600" />
                <div>
                  <p className="font-medium text-slate-800">New Submissions</p>
                  <p className="text-sm text-slate-500">Notify when learners submit assignments or quizzes</p>
                </div>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
            </label>
            <label className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-teal-600" />
                <div>
                  <p className="font-medium text-slate-800">Overdue Reviews</p>
                  <p className="text-sm text-slate-500">Remind when reviews are overdue</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={overdueReminder}
                onChange={(e) => setOverdueReminder(e.target.checked)}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
            </label>
            <label className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-teal-600" />
                <div>
                  <p className="font-medium text-slate-800">Learners at Risk</p>
                  <p className="text-sm text-slate-500">Weekly digest of learners needing attention</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={learnersAtRisk}
                onChange={(e) => setLearnersAtRisk(e.target.checked)}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
            </label>
          </div>
          <button className="mt-6 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-medium">
            Save Preferences
          </button>
        </div>
      )}

      {activeSection === "accessibility" && (
        <div className="rounded-2xl bg-gradient-to-br from-white via-teal-50/20 to-white border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300">
          <h2 className="font-semibold text-slate-800 mb-4">Accessibility Preferences</h2>
          <p className="text-sm text-slate-500 mb-4">
            Adjust how content is displayed. Theme and layout remain consistent.
          </p>
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-teal-600" />
                <div>
                  <p className="font-medium text-slate-800">Reduce motion</p>
                  <p className="text-sm text-slate-500">Minimize animations and transitions</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={reduceMotion}
                onChange={(e) => setReduceMotion(e.target.checked)}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
            </label>
            <label className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-teal-600" />
                <div>
                  <p className="font-medium text-slate-800">High contrast</p>
                  <p className="text-sm text-slate-500">Increase contrast for readability</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={highContrast}
                onChange={(e) => setHighContrast(e.target.checked)}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
            </label>
          </div>
          <button className="mt-6 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-medium">
            Save Preferences
          </button>
        </div>
      )}
    </div>
  );
}
