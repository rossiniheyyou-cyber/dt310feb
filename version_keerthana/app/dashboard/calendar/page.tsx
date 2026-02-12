"use client";

import { useState, useEffect, useMemo } from "react";
import { Calendar as CalendarIcon, Clock, Users, BookOpen, FileText, Video, Plus, ChevronLeft, ChevronRight, List, Grid, Calendar as CalIcon } from "lucide-react";
import { getCurrentUser } from "@/lib/currentUser";

type EventType = "live_class" | "assignment" | "quiz" | "meeting";
type EventStatus = "upcoming" | "live" | "completed";
type ViewMode = "month" | "week" | "agenda";

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  type: EventType;
  status: EventStatus;
  courseId?: string;
  courseTitle?: string;
  meetingLink?: string;
  instructorName?: string;
}

export default function CalendarPage() {
  const [mounted, setMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const user = mounted ? getCurrentUser() : null;

  // Mock events - replace with API calls
  useEffect(() => {
    if (!mounted) return;
    // TODO: Fetch events from API based on user role
    const mockEvents: CalendarEvent[] = [
      {
        id: "1",
        title: "Introduction to React",
        date: new Date(2025, 1, 5, 10, 0),
        startTime: "10:00",
        endTime: "11:30",
        type: "live_class",
        status: "upcoming",
        courseId: "1",
        courseTitle: "Full Stack Development",
        instructorName: "Sarah Chen",
      },
      {
        id: "2",
        title: "Assignment: Build Todo App",
        date: new Date(2025, 1, 7, 23, 59),
        startTime: "23:59",
        type: "assignment",
        status: "upcoming",
        courseId: "1",
        courseTitle: "Full Stack Development",
      },
      {
        id: "3",
        title: "Team Standup",
        date: new Date(2025, 1, 6, 9, 0),
        startTime: "09:00",
        endTime: "09:30",
        type: "meeting",
        status: "upcoming",
        meetingLink: "https://teams.microsoft.com/l/meetup-join/...",
      },
    ];
    setEvents(mockEvents);
  }, [mounted]);

  const canCreateMeeting = mounted && (user?.role === "instructor" || user?.role === "admin" || user?.role === "manager");
  const canCreateLiveClass = mounted && user?.role === "instructor";

  const getEventTypeIcon = (type: EventType) => {
    switch (type) {
      case "live_class":
        return <Video className="w-4 h-4" />;
      case "assignment":
        return <FileText className="w-4 h-4" />;
      case "quiz":
        return <BookOpen className="w-4 h-4" />;
      case "meeting":
        return <Users className="w-4 h-4" />;
    }
  };

  // Event colors: meetings = pink, dues (assignments/quizzes) = blue, live_class = teal
  const getEventTypeBadge = (type: EventType) => {
    const configs = {
      live_class: { label: "Class", bg: "bg-teal-100 text-teal-700" },
      assignment: { label: "Assignment", bg: "bg-blue-100 text-blue-700" },
      quiz: { label: "Quiz", bg: "bg-blue-100 text-blue-700" },
      meeting: { label: "Meeting", bg: "bg-pink-100 text-pink-700" },
    };
    const config = configs[type];
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${config.bg}`}>
        {config.label}
      </span>
    );
  };

  const getEventChipClass = (type: EventType) => {
    const configs = {
      live_class: "bg-teal-100 border-teal-200 text-teal-800",
      assignment: "bg-blue-100 border-blue-200 text-blue-800",
      quiz: "bg-blue-100 border-blue-200 text-blue-800",
      meeting: "bg-pink-100 border-pink-200 text-pink-800",
    };
    return configs[type];
  };

  const getStatusBadge = (status: EventStatus) => {
    const configs = {
      upcoming: { label: "Upcoming", bg: "bg-slate-100 text-slate-700" },
      live: { label: "Live", bg: "bg-green-100 text-green-700" },
      completed: { label: "Completed", bg: "bg-gray-100 text-gray-600" },
    };
    const config = configs[status];
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${config.bg}`}>
        {config.label}
      </span>
    );
  };

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatDateHeader = () => {
    if (viewMode === "month") {
      return currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    } else if (viewMode === "week") {
      const start = new Date(currentDate);
      start.setDate(start.getDate() - start.getDay());
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    }
    return "Agenda";
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getEventsForDate = (date: Date | null) => {
    if (!date) return [];
    return events.filter((e) => {
      const eventDate = new Date(e.date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Week view: Morning 6–12, Afternoon 12–18, Evening 18–6
  const getSegmentIndex = (date: Date) => {
    const h = date.getHours();
    if (h >= 6 && h < 12) return 0; // Morning
    if (h >= 12 && h < 18) return 1; // Afternoon
    return 2; // Evening (18–24 or 0–6)
  };

  const getEventsForWeekCell = (dayIndex: number, segmentIndex: number) => {
    const weekStart = new Date(currentDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const cellDate = new Date(weekStart);
    cellDate.setDate(cellDate.getDate() + dayIndex);
    const [startHour, endHour] =
      segmentIndex === 0 ? [6, 12] : segmentIndex === 1 ? [12, 18] : [18, 24];
    return events.filter((e) => {
      const d = new Date(e.date);
      if (
        d.getDate() !== cellDate.getDate() ||
        d.getMonth() !== cellDate.getMonth() ||
        d.getFullYear() !== cellDate.getFullYear()
      )
        return false;
      const hour = e.startTime
        ? parseInt(e.startTime.split(":")[0], 10)
        : d.getHours();
      if (segmentIndex === 2) return hour >= 18 || hour < 6;
      if (segmentIndex === 0) return hour >= 6 && hour < 12;
      return hour >= 12 && hour < 18;
    });
  };

  const sortedAgendaEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateA !== dateB) return dateA - dateB;
      if (a.startTime && b.startTime) {
        return a.startTime.localeCompare(b.startTime);
      }
      return 0;
    });
  }, [events]);

  const eventsByWeek = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const weeks: CalendarEvent[][] = [[], [], [], [], []];
    events.forEach((e) => {
      const d = new Date(e.date);
      if (d.getFullYear() !== year || d.getMonth() !== month) return;
      const day = d.getDate();
      const weekIndex = Math.min(Math.floor((day - 1) / 7), 4);
      weeks[weekIndex].push(e);
    });
    weeks.forEach((w) => w.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    return weeks;
  }, [events, currentDate]);

  const renderMonthView = () => {
    const days = getDaysInMonth();
    const weekDays = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
    const monthName = currentDate.toLocaleDateString("en-US", { month: "long" });
    const yearNum = currentDate.getFullYear();

    return (
      <div className="flex gap-0 min-h-[560px] bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-soft">
        {/* Left: Top Priorities - DigitalT3 teal */}
        <div className="w-56 shrink-0 bg-gradient-to-b from-teal-50 to-teal-100/80 border-r border-teal-200/60 flex flex-col">
          <div className="p-4 border-b border-teal-200/60">
            <h3 className="text-sm font-bold uppercase tracking-wider text-teal-800">Top Priorities</h3>
            <p className="text-xs text-teal-600 mt-0.5">{monthName} {yearNum}</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {[1, 2, 3, 4, 5].map((weekNum) => (
              <div key={weekNum} className="space-y-2">
                <div className="text-xs font-semibold text-teal-700 bg-teal-200/40 px-2 py-1.5 rounded-lg">
                  Week {weekNum}
                </div>
                <ul className="space-y-1.5 pl-1">
                  {eventsByWeek[weekNum - 1]?.length ? (
                    eventsByWeek[weekNum - 1].map((ev) => (
                      <li key={ev.id} className="text-xs text-slate-700 leading-snug truncate" title={ev.title}>
                        {ev.title}
                      </li>
                    ))
                  ) : (
                    <li className="text-xs text-slate-400 italic">—</li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Month grid */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white">
            <span className="text-2xl font-semibold text-slate-800">{yearNum}</span>
            <span className="px-4 py-1.5 bg-teal-600 text-white rounded-lg font-medium text-sm">{monthName}</span>
          </div>
          <div className="grid grid-cols-7 flex-1 min-h-0">
            {weekDays.map((day) => (
              <div key={day} className="p-2 text-center text-xs font-semibold text-teal-800 bg-teal-50/70 border-b border-r border-teal-100">
                {day}
              </div>
            ))}
            {days.map((date, idx) => {
              const dayEvents = getEventsForDate(date);
              return (
                <div
                  key={idx}
                  className={`min-h-[80px] border-r border-b border-slate-100 p-2 flex flex-col ${
                    !date ? "bg-slate-50/50" : isToday(date) ? "bg-teal-50" : "bg-white"
                  } hover:bg-slate-50/80 transition`}
                >
                  {date && (
                    <>
                      <div className={`text-sm font-medium text-right mb-1 ${isToday(date) ? "text-teal-700" : "text-slate-500"}`}>
                        {date.getDate()}
                      </div>
                      <div className="space-y-1 flex-1 overflow-hidden">
                        {dayEvents.slice(0, 3).map((event) => (
                          <div
                            key={event.id}
                            className={`text-xs p-1.5 rounded border cursor-pointer truncate ${getEventChipClass(event.type)}`}
                            title={event.title}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-slate-400 px-1">+{dayEvents.length - 3} more</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = new Date(currentDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekDays = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
    const segments = [
      { label: "MORNING", rowBg: "bg-[#E0FFE0]" },
      { label: "AFTERNOON", rowBg: "bg-[#E0E0FF]" },
      { label: "EVENING", rowBg: "bg-[#FFE0E0]" },
    ];

    return (
      <div className="flex flex-col min-h-[480px] bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-soft">
        <div className="grid grid-cols-8 border-b border-slate-200 bg-teal-50/70">
          <div className="p-3 border-r border-slate-200" />
          {weekDays.map((day, dayIndex) => {
            const d = new Date(weekStart);
            d.setDate(d.getDate() + dayIndex);
            const isToday =
              d.getDate() === new Date().getDate() &&
              d.getMonth() === new Date().getMonth() &&
              d.getFullYear() === new Date().getFullYear();
            return (
              <div
                key={day}
                className={`p-3 text-center border-r border-slate-200 last:border-r-0 ${isToday ? "bg-teal-100" : ""}`}
              >
                <div className="text-xs font-bold uppercase tracking-wider text-teal-800">{day}</div>
                <div className={`text-sm font-semibold mt-0.5 ${isToday ? "text-teal-700" : "text-slate-600"}`}>
                  {d.getDate()}
                </div>
              </div>
            );
          })}
        </div>
        {segments.map((seg, segIndex) => (
          <div key={seg.label} className={`grid grid-cols-8 flex-1 min-h-[120px] border-b border-slate-200 last:border-b-0 ${seg.rowBg}`}>
            <div className="flex items-center justify-center border-r border-slate-200 py-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 -rotate-90 whitespace-nowrap origin-center">
                {seg.label}
              </span>
            </div>
            {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
              <div
                key={dayIndex}
                className="border-r border-white/80 last:border-r-0 p-2 overflow-y-auto space-y-1.5"
              >
                {getEventsForWeekCell(dayIndex, segIndex).map((event) => (
                  <div
                    key={event.id}
                    className={`text-xs p-1.5 rounded border truncate ${getEventChipClass(event.type)}`}
                    title={event.title}
                  >
                    {event.title}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const renderAgendaView = () => {
    return (
      <div className="space-y-4">
        {sortedAgendaEvents.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500">
            No upcoming events
          </div>
        ) : (
          sortedAgendaEvents.map((event) => {
            const eventDate = new Date(event.date);
            const isPast = eventDate < new Date() && event.status !== "live";
            return (
              <div
                key={event.id}
                className={`bg-white border rounded-xl p-4 hover:shadow-md transition card-flashy ${
                  isPast ? "border-slate-200 opacity-60" : "border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-2 rounded-lg ${
                      event.type === "meeting" ? "bg-pink-100" :
                      event.type === "assignment" || event.type === "quiz" ? "bg-blue-100" :
                      event.type === "live_class" ? "bg-teal-100" : "bg-slate-100"
                    }`}>
                      {getEventTypeIcon(event.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900">{event.title}</h3>
                        {getEventTypeBadge(event.type)}
                        {getStatusBadge(event.status)}
                      </div>
                      {event.courseTitle && (
                        <p className="text-sm text-slate-600 mb-2">Course: {event.courseTitle}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-1">
                          <CalIcon className="w-4 h-4" />
                          <span>{eventDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                        </div>
                        {event.startTime && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{event.startTime}{event.endTime ? ` - ${event.endTime}` : ""}</span>
                          </div>
                        )}
                        {event.instructorName && (
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{event.instructorName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {event.type === "meeting" && event.meetingLink && event.status === "live" && (
                    <a
                      href={event.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-medium"
                    >
                      Join
                    </a>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header - same as other dashboard pages */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Calendar</h1>
          <p className="text-slate-600 text-sm">Live classes, assignment deadlines, quiz schedules, and meetings</p>
        </div>
        {mounted && canCreateMeeting && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-medium flex items-center gap-2 shadow-soft hover:shadow-medium"
          >
            <Plus className="w-5 h-5" />
            Create Meet
          </button>
        )}
      </div>

      {/* Compact nav bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateDate("prev")}
            className="p-2 rounded-lg hover:bg-white border border-slate-200 transition text-slate-600"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigateDate("next")}
            className="p-2 rounded-lg hover:bg-white border border-slate-200 transition text-slate-600"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={goToToday}
            className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white border border-slate-200 rounded-lg transition"
          >
            Today
          </button>
        </div>
        <div className="flex items-center gap-1">
          {(["month", "week", "agenda"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                viewMode === mode ? "bg-teal-600 text-white" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {mode === "month" && <Grid className="w-4 h-4 inline mr-1 align-middle" />}
              {mode === "agenda" && <List className="w-4 h-4 inline mr-1 align-middle" />}
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === "month" && renderMonthView()}
      {viewMode === "week" && renderWeekView()}
      {viewMode === "agenda" && renderAgendaView()}

      {/* Create Meeting Modal */}
      {showCreateModal && (
        <CreateMeetingModal
          userRole={user?.role}
          canCreateLiveClass={!!canCreateLiveClass}
          onClose={() => setShowCreateModal(false)}
          onSave={(meeting) => {
            setEvents([...events, meeting]);
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
}

function CreateMeetingModal({
  userRole,
  canCreateLiveClass,
  onClose,
  onSave,
}: {
  userRole?: string;
  canCreateLiveClass: boolean;
  onClose: () => void;
  onSave: (meeting: CalendarEvent) => void;
}) {
  const [form, setForm] = useState({
    title: "",
    courseId: "",
    date: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "10:00",
    type: "meeting" as "live_class" | "meeting",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const [startHour, startMin] = form.startTime.split(":").map(Number);
    const meetingDate = new Date(form.date);
    meetingDate.setHours(startHour, startMin);

    const meeting: CalendarEvent = {
      id: `meeting-${Date.now()}`,
      title: form.title,
      date: meetingDate,
      startTime: form.startTime,
      endTime: form.endTime,
      type: form.type,
      status: "upcoming",
      meetingLink: `https://teams.microsoft.com/l/meetup-join/${Math.random().toString(36).substring(7)}`,
    };
    onSave(meeting);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 card-flashy">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900">Create Meeting</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Meeting Title</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="e.g., Team Standup"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Course (Optional)</label>
            <select
              value={form.courseId}
              onChange={(e) => setForm({ ...form, courseId: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Select a course</option>
              <option value="1">Full Stack Development</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Date</label>
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Start Time</label>
              <input
                type="time"
                required
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">End Time</label>
              <input
                type="time"
                required
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Meeting Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as "live_class" | "meeting" })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {canCreateLiveClass && <option value="live_class">Live Class</option>}
              <option value="meeting">Meeting</option>
            </select>
            {!canCreateLiveClass && (userRole === "manager" || userRole === "admin") && (
              <p className="text-xs text-slate-500 mt-1">Managers and admins can create meetings only. Live classes are for instructors.</p>
            )}
          </div>
          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-medium"
            >
              Create Meeting
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
