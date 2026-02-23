/**
 * Learner Assignments & Assessments API - real-time from backend
 */

import apiClient from './client';

export interface QuizAssessment {
  id: string;
  title: string;
  course: string;
  courseId: string;
  pathSlug: string;
  module: string;
  moduleId: string;
  role: string;
  type: string;
  dueDate: string;
  dueDateISO: string;
  status: string;
  score: number | null;
  attemptsCount: number;
  lastAttemptAt: string | null;
}

export interface AssignmentsAssessmentsSummary {
  totalAssignments: number;
  completedAssignments: number;
  pendingAssignments: number;
  overdueAssignments: number;
  totalQuizzes: number;
  completedQuizzes: number;
  pendingQuizzes: number;
}

export interface LearnerAssignmentsAssessmentsResponse {
  assignments: unknown[];
  quizzes: QuizAssessment[];
  summary: AssignmentsAssessmentsSummary;
}

export const getLearnerAssignmentsAssessments = async (): Promise<LearnerAssignmentsAssessmentsResponse> => {
  const response = await apiClient.get<LearnerAssignmentsAssessmentsResponse>('/learner/assignments-assessments');
  return response.data;
};

export interface SubmitAssessmentParams {
  assessmentId: string;
  content?: string;
  fileKey?: string;
}

export const submitAssessment = async (params: SubmitAssessmentParams): Promise<void> => {
  await apiClient.post('/learner/assignments-assessments/submit', params);
};
