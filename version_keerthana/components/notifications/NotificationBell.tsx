"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "@/lib/api/notifications";
import type { Notification } from "@/lib/api/notifications";

interface NotificationBellProps {
  className?: string;
}

export default function NotificationBell({ className = "" }: NotificationBellProps) {
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

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
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkRead = async (notificationId: string) => {
    try {
      await markNotificationRead(notificationId);
      await fetchNotifications();
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
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

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'course_published':
        return '📚';
      case 'course_completed':
        return '🏁';
      case 'course_approved':
        return '✅';
      case 'course_rejected':
      case 'course_removed':
        return '❌';
      case 'user_approved':
        return '✅';
      case 'user_revoked':
      case 'user_removed':
        return '⚠️';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'course_approved':
      case 'user_approved':
        return 'bg-emerald-50 border-emerald-200';
      case 'course_rejected':
      case 'course_removed':
      case 'user_revoked':
      case 'user_removed':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const viewAllHref = pathname?.startsWith("/dashboard/admin")
    ? "/dashboard/admin/notifications"
    : pathname?.startsWith("/dashboard/instructor")
      ? "/dashboard/instructor/notifications"
      : pathname?.startsWith("/dashboard/manager")
        ? "/dashboard/manager/notifications"
        : pathname?.startsWith("/dashboard/learner")
          ? "/dashboard/learner/notifications"
          : "/dashboard/notifications";

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-lg transition ${
          className.includes('justify-start') 
            ? 'w-full hover:bg-slate-700/60 text-slate-200' 
            : 'hover:bg-slate-100 text-slate-600'
        }`}
        aria-label="Notifications"
      >
        <div className="flex items-center gap-2">
          <Bell size={20} />
          {className.includes('justify-start') && (
            <span className="font-medium">Notifications</span>
          )}
        </div>
        {unreadCount > 0 && (
          <span className={`absolute ${className.includes('justify-start') ? 'right-2' : '-top-1 -right-1'} w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center`}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-[600px] overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                  >
                    Mark all read
                  </button>
                )}
                <Link
                  href={viewAllHref}
                  onClick={() => setIsOpen(false)}
                  className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                >
                  View all
                </Link>
              </div>
            </div>
            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600 mx-auto mb-2"></div>
                  <p className="text-sm text-slate-500">Loading...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-slate-50 transition cursor-pointer ${
                        !notification.isRead ? 'bg-blue-50/50' : ''
                      }`}
                      onClick={() => {
                        if (!notification.isRead) {
                          handleMarkRead(notification.id);
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl shrink-0">{getNotificationIcon(notification.type)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className={`font-semibold text-sm ${!notification.isRead ? 'text-slate-900' : 'text-slate-700'}`}>
                              {notification.title}
                            </h4>
                            {!notification.isRead && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1"></span>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{notification.message}</p>
                          {notification.reason && (
                            <div className="mt-2 p-2 bg-slate-100 rounded text-xs text-slate-700">
                              <strong>Reason:</strong> {notification.reason}
                            </div>
                          )}
                          <p className="text-xs text-slate-500 mt-2">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
