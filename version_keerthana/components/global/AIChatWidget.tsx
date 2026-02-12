"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { X, Send, Minimize2, Loader2 } from "lucide-react";
import { chatWithBot } from "@/lib/api/ai";
import { getCurrentUser } from "@/lib/currentUser";

// Role-specific quick suggestions
const QUICK_SUGGESTIONS: Record<string, string[]> = {
  learner: [
    "How do I complete a course?",
    "Where are my assignment deadlines?",
    "How do I get certified?",
    "How does quiz grading work?",
    "Where is my progress tracked?",
  ],
  instructor: [
    "How do I create a new course?",
    "How do I grade assignments?",
    "How do I track learner progress?",
    "How do I publish course content?",
    "How do I manage assessments?",
  ],
  manager: [
    "How do I view team progress?",
    "How do I track compliance?",
    "How do I generate reports?",
    "How do I assign courses to learners?",
    "How do I view team performance?",
  ],
  admin: [
    "How do I approve user requests?",
    "How do I manage system settings?",
    "How do I view system activity?",
    "How do I manage courses?",
    "How do I handle user permissions?",
  ],
};

function getRoleFromPath(pathname: string | null): string {
  if (!pathname) return "learner";
  if (pathname.startsWith("/dashboard/instructor")) return "instructor";
  if (pathname.startsWith("/dashboard/learner")) return "learner";
  if (pathname.startsWith("/dashboard/admin")) return "admin";
  if (pathname.startsWith("/dashboard/manager")) return "manager";
  return "learner";
}

function getRoleDisplayName(role: string): string {
  switch (role) {
    case "learner":
      return "AI Learning Assistant";
    case "instructor":
      return "AI Teaching Assistant";
    case "manager":
      return "AI Performance Assistant";
    case "admin":
      return "AI Admin Assistant";
    default:
      return "AI Assistant";
  }
}

function getRoleHelpTopics(role: string): string[] {
  switch (role) {
    case "learner":
      return [
        "• Completing courses",
        "• Assignment deadlines",
        "• Quiz rules and grading",
        "• Certificate eligibility",
        "• Dashboard and navigation",
      ];
    case "instructor":
      return [
        "• Creating and managing courses",
        "• Grading assignments",
        "• Tracking learner progress",
        "• Publishing content",
        "• Assessment management",
      ];
    case "manager":
      return [
        "• Team progress tracking",
        "• Compliance monitoring",
        "• Report generation",
        "• Course assignments",
        "• Performance analytics",
      ];
    case "admin":
      return [
        "• User management",
        "• System configuration",
        "• Activity monitoring",
        "• Course oversight",
        "• Permission management",
      ];
    default:
      return [
        "• Platform navigation",
        "• Feature usage",
        "• Account settings",
        "• Getting started",
      ];
  }
}

export default function AIChatWidget() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const isAuthPage = pathname === "/" || pathname?.startsWith("/auth");
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Get user role from localStorage or pathname
  const [userRole, setUserRole] = useState<string>("learner");

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
    // Get role from localStorage or fallback to pathname
    const currentUser = getCurrentUser();
    if (currentUser?.role) {
      setUserRole(currentUser.role);
    } else {
      setUserRole(getRoleFromPath(pathname));
    }
  }, [pathname]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    
    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const response = await chatWithBot(trimmed);
      setMessages((prev) => [...prev, { role: "assistant", text: response.response }]);
    } catch (err: any) {
      const errorMessage = err.response?.data?.fallback || 
                          err.response?.data?.message || 
                          "The AI Mentor is currently resting. Please try again in a few minutes.";
      setError(errorMessage);
      setMessages((prev) => [...prev, { role: "assistant", text: errorMessage }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  // Don't render on auth pages or until mounted to prevent hydration mismatch
  if (isAuthPage || !mounted) return null;

  return (
    <>
      {/* Toggle button - fixed bottom-right, icon only, no box/circle */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-40 p-0 m-0 bg-transparent border-0 outline-none focus:outline-none hover:opacity-90 transition flex items-center justify-center cursor-pointer [&_img]:block [&_img]:bg-transparent"
        aria-label={open ? "Close chat" : "Open help chat"}
      >
        {open ? (
          <Minimize2 size={32} className="text-slate-600" />
        ) : (
          <img src="/chatbot-icon.png" alt="AI Assistant" width={128} height={128} className="block w-32 h-32 object-contain object-center bg-transparent drop-shadow-lg" style={{ minWidth: 128, minHeight: 128 }} />
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-40 w-[380px] max-w-[calc(100vw-3rem)] bg-white border border-slate-200 rounded-xl shadow-xl flex flex-col overflow-hidden"
          style={{ maxHeight: "min(500px, 70vh)" }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2">
              <Image src="/chatbot-icon.png" alt="" width={20} height={20} className="object-contain" />
              <span className="font-semibold text-slate-800">{getRoleDisplayName(userRole)}</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
            {messages.length === 0 && (
              <div className="text-center py-4">
                <p className="text-sm text-slate-600 mb-3">Need help? Ask about:</p>
                <ul className="text-xs text-slate-500 space-y-1">
                  {getRoleHelpTopics(userRole).map((topic, idx) => (
                    <li key={idx}>{topic}</li>
                  ))}
                </ul>
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "bg-teal-600 text-white"
                      : "bg-slate-100 text-slate-800"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 rounded-lg px-3 py-2 text-sm text-slate-500 flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" />
                  <span>AI is thinking...</span>
                </div>
              </div>
            )}
            {error && !loading && (
              <div className="flex justify-start">
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm text-amber-800">
                  {error}
                </div>
              </div>
            )}
          </div>

          {messages.length === 0 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {(QUICK_SUGGESTIONS[userRole] || QUICK_SUGGESTIONS.learner).slice(0, 3).map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(s)}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                type="submit"
                className="p-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition shrink-0"
                aria-label="Send"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
