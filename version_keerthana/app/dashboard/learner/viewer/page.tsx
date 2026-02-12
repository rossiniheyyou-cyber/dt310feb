"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";

function ViewerContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url") ?? "";
  const name = searchParams.get("name") ?? "Resource";
  const type = (searchParams.get("type") ?? "pdf") as "pdf" | "ppt";

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const fullUrl = useMemo(() => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    if (mounted && typeof window !== "undefined") return window.location.origin + url;
    return url;
  }, [url, mounted]);

  const embedUrl = useMemo(() => {
    if (!fullUrl) return "";
    if (type === "pdf") return fullUrl;
    if (type === "ppt") return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(fullUrl)}`;
    return fullUrl;
  }, [fullUrl, type]);

  const downloadUrl = fullUrl || (mounted && typeof window !== "undefined" && url ? window.location.origin + url : url);

  if (!url) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col">
        <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-4">
          <Link href="/dashboard/learner/courses" className="flex items-center gap-2 text-slate-600 hover:text-teal-600">
            <ArrowLeft size={20} />
            Back
          </Link>
          <span className="text-slate-500">No resource specified</span>
        </div>
        <div className="flex-1 p-8 text-center text-slate-600">
          <p>Missing file URL. Go back to the course and open a resource from there.</p>
        </div>
      </div>
    );
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col">
        <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <div className="h-8 w-24 bg-slate-200 rounded animate-pulse" />
          <span className="font-medium text-slate-800 truncate max-w-[200px]">{name}</span>
          <div className="h-8 w-20 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <p className="text-slate-500">Loading viewer…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between gap-4">
        <Link
          href="/dashboard/learner/courses"
          className="flex items-center gap-2 text-slate-600 hover:text-teal-600 font-medium shrink-0"
        >
          <ArrowLeft size={20} />
          Back to courses
        </Link>
        <span className="font-medium text-slate-800 truncate flex-1 text-center" title={name}>
          {name}
        </span>
        <a
          href={downloadUrl}
          download
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition shrink-0"
        >
          <Download size={18} />
          Download
        </a>
      </div>
      <div className="flex-1 p-4 min-h-0">
        {type === "pdf" && (
          <iframe
            src={embedUrl}
            className="w-full h-full min-h-[calc(100vh-5rem)] rounded-lg bg-white border border-slate-200 shadow-sm"
            title={name}
          />
        )}
        {(type === "ppt" || type === "pptx") && (
          <>
            <iframe
              src={embedUrl}
              className="w-full h-full min-h-[calc(100vh-5rem)] rounded-lg bg-white border border-slate-200 shadow-sm"
              title={name}
            />
            <p className="text-xs text-slate-500 mt-2 text-center">
              If the slides don’t load (e.g. on localhost), use the Download button above to open them on your device.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function ViewerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-100 flex items-center justify-center">
          <p className="text-slate-500">Loading…</p>
        </div>
      }
    >
      <ViewerContent />
    </Suspense>
  );
}
