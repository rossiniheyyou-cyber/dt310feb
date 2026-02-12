/**
 * Media API Service
 * Handles S3 file upload/download via presigned URLs
 */

import apiClient from './client';

// Type definitions
export interface MediaUploadRequest {
  contentTypeCategory: 'lesson_video' | 'assignment_submission' | 'resource_file';
  fileName: string;
  contentType?: string;
  courseId?: number;
  lessonId?: number;
  assignmentId?: number;
  resourceId?: number;
}

export interface MediaUploadResponse {
  fileKey: string;
  uploadUrl: string;
  expiresIn: number;
}

export interface MediaDownloadRequest {
  fileKey: string;
}

export interface MediaDownloadResponse {
  fileKey: string;
  downloadUrl: string;
  expiresIn: number;
  metadata?: {
    id: number;
    contentType: string | null;
    originalFileName: string | null;
    contentTypeCategory: string;
  };
}

/**
 * Get presigned upload URL for S3
 * Requires Instructor/Admin role
 */
export const getUploadUrl = async (data: MediaUploadRequest): Promise<MediaUploadResponse> => {
  const response = await apiClient.post<MediaUploadResponse>('/media/upload-url', data);
  return response.data;
};

/**
 * Get presigned download URL for S3 content
 * Requires authentication and access to content
 */
export const getDownloadUrl = async (fileKey: string): Promise<MediaDownloadResponse> => {
  const response = await apiClient.post<MediaDownloadResponse>('/media/download-url', { fileKey });
  return response.data;
};

/**
 * Get presigned download URL by content ID
 * Alternative endpoint using media metadata ID
 */
export const getDownloadUrlById = async (contentId: number): Promise<MediaDownloadResponse> => {
  const response = await apiClient.get<MediaDownloadResponse>(`/media/download-url/${contentId}`);
  return response.data;
};

/**
 * Upload file to S3 using presigned URL
 * This is a helper that combines getting the URL and uploading
 */
export const uploadFileToS3 = async (
  file: File,
  uploadData: MediaUploadRequest
): Promise<{ fileKey: string; success: boolean }> => {
  try {
    // Get presigned upload URL
    const { uploadUrl, fileKey } = await getUploadUrl(uploadData);

    // Upload file directly to S3
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': uploadData.contentType || file.type,
      },
    });

    if (!uploadResponse.ok) {
      throw new Error(`S3 upload failed: ${uploadResponse.statusText}`);
    }

    return { fileKey, success: true };
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
};
