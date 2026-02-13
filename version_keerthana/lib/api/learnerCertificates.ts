/**
 * Learner Certificates API - real-time from CourseCompletion
 */

import apiClient from './client';

export interface Certificate {
  pathSlug: string;
  courseId: string;
  courseTitle: string;
  pathTitle: string;
  earnedAt: string | null;
}

export interface LearnerCertificatesResponse {
  certificates: Certificate[];
}

export const getLearnerCertificates = async (): Promise<Certificate[]> => {
  const response = await apiClient.get<LearnerCertificatesResponse>('/learner/certificates');
  return response.data.certificates;
};
