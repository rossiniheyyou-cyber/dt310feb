"use client";

import { AlertCircle } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  answeredCount: number;
  totalCount: number;
  unansweredCount: number;
};

export default function QuizSubmissionModal({
  isOpen,
  onClose,
  onConfirm,
  answeredCount,
  totalCount,
  unansweredCount,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">
            Submit Quiz
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Please review your submission before confirming.
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-slate-600">Answered</span>
            <span className="font-medium text-slate-800">
              {answeredCount} / {totalCount}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-slate-600">Unanswered</span>
            <span className="font-medium text-slate-800">{unansweredCount}</span>
          </div>

          {unansweredCount > 0 && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                You have {unansweredCount} unanswered question
                {unansweredCount > 1 ? "s" : ""}. You can go back to answer them
                or submit as is.
              </p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50"
          >
            Go Back
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700"
          >
            Confirm Submit
          </button>
        </div>
      </div>
    </div>
  );
}
