/**
 * API for instructor-created quizzes (per course) and learner take/submit. All auto-graded.
 */

import apiClient from "./client";

export type QuizSummary = {
  id: number;
  courseId: number;
  title: string;
  createdById: number;
  createdAt: string;
};

export type QuizListResponse = {
  courseId: number;
  courseTitle: string;
  quizzes: QuizSummary[];
};

export type QuizQuestionForTake = {
  questionText: string;
  options: string[];
};

export type QuizForTake = {
  id: number;
  courseId: number;
  title: string;
  questions: QuizQuestionForTake[];
  totalQuestions: number;
};

export type QuizSubmitResponse = {
  score: number;
  totalQuestions: number;
  correctAnswers: number[];
  attemptId: number;
};

export async function listQuizzesByCourse(courseId: number): Promise<QuizListResponse> {
  const response = await apiClient.get<QuizListResponse>(`/courses/${courseId}/quizzes`);
  return response.data;
}

export interface CreateQuizPayload {
  title: string;
  generateWithAi?: boolean;
  topicsPrompt?: string;
  fileContent?: string;
  questions?: Array<{ questionText: string; options: string[]; correctAnswerIndex: number }>;
  numberOfQuestions?: number;
  passMark?: number;
  totalPoints?: number;
}

export async function createQuiz(
  courseId: number,
  payload: CreateQuizPayload
): Promise<{ id: number; courseId: number; title: string; createdAt: string }> {
  const response = await apiClient.post(`/courses/${courseId}/quizzes`, payload);
  return response.data;
}

export async function getQuizForTake(quizId: number): Promise<QuizForTake> {
  const response = await apiClient.get<QuizForTake>(`/quizzes/${quizId}`);
  return response.data;
}

export async function submitQuiz(quizId: number, answers: number[]): Promise<QuizSubmitResponse> {
  const response = await apiClient.post<QuizSubmitResponse>(`/quizzes/${quizId}/submit`, { answers });
  return response.data;
}

export async function getQuizAttempts(quizId: number): Promise<{ attempts: Array<{ id: number; score: number; totalQuestions: number; completedAt: string }> }> {
  const response = await apiClient.get(`/quizzes/${quizId}/attempts`);
  return response.data;
}
