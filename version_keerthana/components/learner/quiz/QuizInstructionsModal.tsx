"use client";

import { useState } from "react";
import { X, AlertCircle } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  rules: string[];
};

export default function QuizInstructionsModal({
  isOpen,
  onClose,
  onConfirm,
  rules,
}: Props) {
  const [agreed, setAgreed] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (agreed) {
      onConfirm();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">
              Quiz Instructions
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-700">Rules</h3>
          <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600">
            {rules.map((rule, i) => (
              <li key={i}>{rule}</li>
            ))}
          </ul>

          <h3 className="text-sm font-semibold text-slate-700 mt-4">
            Navigation
          </h3>
          <p className="text-sm text-slate-600">
            Use Previous and Next buttons to move between questions. Your answers
            are saved automatically when you navigate. You can return to any
            question before submitting.
          </p>

          <h3 className="text-sm font-semibold text-slate-700 mt-4">
            Auto-submit
          </h3>
          <p className="text-sm text-slate-600">
            The quiz will automatically submit when the time limit expires.
            Ensure you complete all questions before the timer runs out.
          </p>

          <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-amber-800">
                Integrity Notice
              </h3>
              <p className="text-sm text-amber-700 mt-1">
                This quiz is intended to assess your knowledge. Complete it
                independently without external assistance. Violations may result
                in consequences per your organization&apos;s policy.
              </p>
            </div>
          </div>

          <label className="flex items-start gap-3 cursor-pointer mt-4">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <span className="text-sm text-slate-600">
              I have read and understood the instructions. I agree to complete
              this quiz with integrity.
            </span>
          </label>
        </div>

        <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!agreed}
            className="px-4 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
