"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Loader2, TrendingUp } from "lucide-react";
import { chatWithManagerBot } from "@/lib/api/ai";

interface ManagerPerformanceBotProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ManagerPerformanceBot({
  isOpen,
  onClose,
}: ManagerPerformanceBotProps) {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setMessages([]);
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const response = await chatWithManagerBot(trimmed);
      setMessages((prev) => [...prev, { role: "assistant", text: response.response }]);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.fallback ||
        err.response?.data?.message ||
        "The Performance Strategist is currently unavailable. Please try again in a few minutes.";
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-cyan-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">Performance Strategist</h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Team performance insights & skill gap analysis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-200 text-slate-500 transition"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-4 min-h-[300px] bg-slate-50"
        >
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                <TrendingUp size={32} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                Your Performance Strategist
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                Get insights on team progress, skill gaps, compliance status, and resource
                allocation.
              </p>
              <div className="text-xs text-slate-500 space-y-1">
                <p>Try asking:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>"Show me team compliance training status"</li>
                  <li>"Identify skill gaps in my team"</li>
                  <li>"Which employees need upskilling?"</li>
                  <li>"Where is our training budget most effective?"</li>
                </ul>
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-3 ${
                  m.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-slate-200 text-slate-800"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{m.text}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-lg px-4 py-3 flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-blue-600" />
                <span className="text-sm text-slate-600">Analyzing performance data...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200 bg-white">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about team progress, skill gaps, or compliance..."
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              aria-label="Send"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
