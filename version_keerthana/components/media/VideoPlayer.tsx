"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { getDownloadUrl } from "@/lib/api/media";

// Dynamically import ReactPlayer to avoid SSR issues
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

interface VideoPlayerProps {
  fileKey: string;
  className?: string;
  controls?: boolean;
  onError?: (error: string) => void;
}

/**
 * Placeholder video player component
 * Fetches presigned URL from backend and plays video using ReactPlayer
 */
export default function VideoPlayer({
  fileKey,
  className = "",
  controls = true,
  onError,
}: VideoPlayerProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideoUrl = async () => {
      if (!fileKey) {
        setError("No file key provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getDownloadUrl(fileKey);
        setVideoUrl(response.downloadUrl);
        setError(null);
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || err.message || "Failed to load video";
        setError(errorMessage);
        onError?.(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchVideoUrl();
  }, [fileKey, onError]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-slate-100 rounded-lg ${className}`}>
        <div className="text-slate-600">Loading video...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-red-50 rounded-lg p-4 ${className}`}>
        <div className="text-red-600 text-sm">{error}</div>
      </div>
    );
  }

  if (!videoUrl) {
    return (
      <div className={`flex items-center justify-center bg-slate-100 rounded-lg ${className}`}>
        <div className="text-slate-600">No video URL available</div>
      </div>
    );
  }

  return (
    <div className={`bg-black rounded-lg overflow-hidden ${className}`}>
      <ReactPlayer
        url={videoUrl}
        controls={controls}
        width="100%"
        height="100%"
        config={{
          file: {
            attributes: {
              controlsList: "nodownload", // Optional: prevent download
            },
          },
        }}
      />
    </div>
  );
}
