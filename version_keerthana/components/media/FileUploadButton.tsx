"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { getUploadUrl, uploadFileToS3, type MediaUploadRequest } from "@/lib/api/media";

interface FileUploadButtonProps {
  contentTypeCategory: "lesson_video" | "assignment_submission" | "resource_file";
  courseId?: number;
  lessonId?: number;
  assignmentId?: number;
  resourceId?: number;
  onUploadSuccess?: (fileKey: string) => void;
  onUploadError?: (error: string) => void;
}

/**
 * Placeholder file upload button component
 * For Instructor/Admin use - uploads files to S3 via presigned URLs
 */
export default function FileUploadButton({
  contentTypeCategory,
  courseId,
  lessonId,
  assignmentId,
  resourceId,
  onUploadSuccess,
  onUploadError,
}: FileUploadButtonProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);

    try {
      const uploadData: MediaUploadRequest = {
        contentTypeCategory,
        fileName: file.name,
        contentType: file.type,
        courseId,
        lessonId,
        assignmentId,
        resourceId,
      };

      // Upload file to S3
      const result = await uploadFileToS3(file, uploadData);

      setProgress(100);
      onUploadSuccess?.(result.fileKey);
    } catch (error: any) {
      console.error("Upload failed:", error);
      const errorMessage = error.response?.data?.message || error.message || "Upload failed";
      onUploadError?.(errorMessage);
    } finally {
      setUploading(false);
      setProgress(0);
      // Reset input
      event.target.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <label className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg cursor-pointer hover:bg-teal-700 transition disabled:opacity-50">
        <Upload size={18} />
        <span>{uploading ? "Uploading..." : "Upload File"}</span>
        <input
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          disabled={uploading}
          accept={
            contentTypeCategory === "lesson_video"
              ? "video/*"
              : contentTypeCategory === "assignment_submission"
              ? "*/*"
              : "*/*"
          }
        />
      </label>
      {uploading && (
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="bg-teal-600 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
