import apiClient from "./client";

export interface EnrollmentItem {
  courseId: string;
  enrolledAt: string;
}

export interface MyEnrollmentsResponse {
  enrollments: EnrollmentItem[];
}

export const enrollInCourseApi = async (courseId: string): Promise<{ message: string; enrollment?: EnrollmentItem }> => {
  const response = await apiClient.post<{ message: string; enrollment?: EnrollmentItem }>(`/enrollments/courses/${courseId}`);
  return response.data;
};

export const getMyEnrollments = async (): Promise<MyEnrollmentsResponse> => {
  const response = await apiClient.get<MyEnrollmentsResponse>("/enrollments/me");
  return response.data;
};

