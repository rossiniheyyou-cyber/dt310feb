"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, BookOpen, User, Monitor } from "lucide-react";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "@/lib/api/notifications";
import type { Notification } from "@/lib/api/notifications";

function relativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const sec = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (sec < 60) return "Just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min${min !== 1 ? "s" : ""} ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hour${hr !== 1 ? "s" : ""} ago`;
  const d = Math.floor(hr / 24);
  if (d < 7) return `${d} day${d !== 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
}

export default function NotificationsPage() {
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(10);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await getNotifications(false);
      setNotifications(response.notifications || []);
      setUnreadCount(response.unreadCount || 0);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      await fetchNotifications();
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      await fetchNotifications();
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const getActorAndAction = (n: Notification): { actor: string; action: string } => {
    switch (n.type) {
      case "course_approved":
        return { actor: "System", action: "approved your course" };
      case "course_rejected":
      case "course_removed":
        return { actor: "System", action: n.type === "course_removed" ? "removed a course" : "rejected your course" };
      case "user_approved":
        return { actor: "Admin", action: "approved your account" };
      case "user_revoked":
      case "user_removed":
        return { actor: "System", action: "updated your account status" };
      default:
        return { actor: "System", action: "sent you a notification" };
    }
  };

  const getRightIcon = (type: Notification["type"]) => {
    if (type.startsWith("course")) {
      return (
        <div className="w-12 h-12 rounded-lg bg-teal-100 flex items-center justify-center shrink-0">
          <BookOpen className="w-6 h-6 text-teal-600" />
        </div>
      );
    }
    if (type.startsWith("user")) {
      return (
        <div className="w-12 h-12 rounded-lg bg-teal-100 flex items-center justify-center shrink-0">
          <User className="w-6 h-6 text-teal-600" />
        </div>
      );
    }
    return (
      <div className="w-12 h-12 rounded-lg bg-teal-100 flex items-center justify-center shrink-0">
        <Monitor className="w-6 h-6 text-teal-600" />
      </div>
    );
  };

  const visible = notifications.slice(0, displayCount);
  const hasMore = notifications.length > displayCount;

  return (
    <div className="space-y-6">
      {/* Header: Notifications + teal underline + bell */}
      <div className="flex items-center justify-between border-b-2 border-teal-500 pb-2">
        <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
        <Bell className="w-6 h-6 text-teal-600 shrink-0" aria-hidden />
      </div>

      {mounted && unreadCount > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600" suppressHydrationWarning>{unreadCount} unread</p>
          <button
            onClick={handleMarkAllRead}
            className="text-sm font-medium text-teal-600 hover:text-teal-700"
          >
            Mark all read
          </button>
        </div>
      )}

      {!mounted || loading ? (
        <div className="flex items-center justify-center min-h-[320px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-teal-600 border-t-transparent mx-auto mb-3" />
            <p className="text-slate-500">Loading notifications...</p>
          </div>
        </div>
      ) : mounted && notifications.length === 0 ? (
        <div className="rounded-2xl card-gradient border border-slate-200 p-12 text-center shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300">
          <Bell className="w-14 h-14 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600">No notifications yet</p>
        </div>
      ) : mounted && notifications.length > 0 ? (
        <div>
          <div className="space-y-3">
            {visible.map((notification) => {
              const { actor, action } = getActorAndAction(notification);
              const initial = actor.charAt(0).toUpperCase();
              return (
                <div
                  key={notification.id}
                  className={`flex items-start gap-4 rounded-2xl border border-slate-200 card-gradient overflow-hidden shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300 ${
                    !notification.isRead ? "bg-teal-50/20" : ""
                  }`}
                >
                  {/* Left: vertical teal accent */}
                  <div className="w-1 shrink-0 self-stretch bg-teal-500 min-h-[80px]" aria-hidden />

                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-semibold text-lg shrink-0 mt-3">
                    {initial}
                  </div>

                  {/* Main content */}
                  <div className="flex-1 min-w-0 py-3 pr-2">
                    <p className="font-semibold text-slate-900">
                      <span>{actor}</span>{" "}
                      <span className="font-normal text-slate-700">{action}</span>
                    </p>
                    <p className="text-sm text-slate-600 mt-0.5 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-slate-500 mt-1" suppressHydrationWarning>
                      {mounted ? relativeTime(notification.createdAt) : "—"}
                    </p>
                  </div>

                  {/* Right: thumbnail/icon */}
                  <div className="shrink-0 py-3">
                    {getRightIcon(notification.type)}
                  </div>

                  {!notification.isRead && (
                    <button
                      onClick={() => handleMarkRead(notification.id)}
                      className="sr-only focus:not-sr-only text-xs text-teal-600"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {hasMore && (
            <div className="text-center pt-2">
              <button
                onClick={() => setDisplayCount((c) => c + 10)}
                className="text-sm font-medium text-slate-700 hover:text-teal-600 underline underline-offset-2"
              >
                Load more activity
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
