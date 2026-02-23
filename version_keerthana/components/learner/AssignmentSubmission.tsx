"use client";

import { useState } from "react";
import { Upload, Save, Send, CheckCircle, Loader2 } from "lucide-react";
import type { Assignment } from "@/data/assignments";
import { submitAssessment } from "@/lib/api/learnerAssignments";

type Props = {
  assignment?: Assignment;
  onSubmitted?: () => void;
};

export default function AssignmentSubmission({ assignment, onSubmitted }: Props) {
  const [link, setLink] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (list?.length) setFiles(Array.from(list));
  };

  const handleSaveDraft = () => {
    setSaved(true);
    setIsDraft(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSubmit = async () => {
    if (!assignment?.id || assignment.type === "Quiz") {
      setSubmitted(true);
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const content = [link.trim(), notes.trim()].filter(Boolean).join("\n\n");
      await submitAssessment({
        assessmentId: assignment.id,
        content: content || undefined,
      });
      setSubmitted(true);
      onSubmitted?.();
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : (err as Error)?.message;
      setSubmitError(msg || "Submission failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const alreadySubmitted = assignment?.status === "Submitted" || assignment?.status === "Reviewed";

  if (submitted || alreadySubmitted) {
    return (
      <div className="card bg-teal-50/50 border-teal-200">
        <div className="flex items-center gap-3 text-teal-700">
          <CheckCircle className="h-8 w-8 flex-shrink-0" />
          <div>
            <h3 className="font-semibold">Submission Confirmed</h3>
            <p className="text-sm mt-1 text-teal-600">
              Your assignment has been submitted successfully. You will receive
              feedback once it has been reviewed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isQuiz = assignment?.type === "Quiz";

  return (
    <div className="card">
      <h3 className="section-title">Submit Assignment</h3>

      {!isQuiz && (
        <>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Link (GitHub, Figma, etc.)
              </label>
              <input
                type="url"
                placeholder="https://github.com/..."
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 w-full text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                File Upload
              </label>
              <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-teal-300 transition">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept="*/*"
                  multiple
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="h-8 w-8 text-slate-400" />
                  <span className="text-sm text-slate-600">
                    {files.length
                      ? `${files.length} file(s): ${files.map((f) => f.name).join(", ")}`
                      : "Click to upload or drag and drop (multiple allowed)"}
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Notes (optional)
              </label>
              <textarea
                placeholder="Add any notes for the reviewer..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="border border-slate-300 rounded-lg px-3 py-2 w-full text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={handleSaveDraft}
              className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition"
            >
              <Save className="h-4 w-4" />
              {saved ? "Saved" : "Save Draft"}
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {submitting ? "Submitting…" : "Submit"}
            </button>
          </div>
          {submitError && (
            <p className="mt-2 text-sm text-red-600">{submitError}</p>
          )}
        </>
      )}

      {isQuiz && (
        <div className="space-y-4">
          <p className="text-slate-600">
            This is a timed quiz. Click below to start when you are ready.
          </p>
          {assignment?.timeLimitMinutes && (
            <p className="text-sm text-slate-500">
              Time limit: {assignment.timeLimitMinutes} minutes • Attempts:{" "}
              {assignment.attemptLimit ?? "Unlimited"}
            </p>
          )}
          <button
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition"
          >
            Start Quiz
          </button>
        </div>
      )}
    </div>
  );
}
