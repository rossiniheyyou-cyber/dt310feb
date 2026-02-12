/**
 * API for learner AI quiz (10 MCQs, 4 options; difficulty; feedback; logs).
 */

import apiClient from "./client";

export type AiQuizDifficulty = "easy" | "medium" | "hard";

export type AiQuizQuestionForTake = {
  questionText: string;
  options: string[];
};

export type AiQuizGenerateResponse = {
  attemptId: number;
  questions: AiQuizQuestionForTake[];
};

export type AiQuizSubmitResponse = {
  score: number;
  totalQuestions: number;
  feedback: string;
  correctAnswers: number[];
};

export type AiQuizAttemptSummary = {
  id: number;
  courseTitle: string;
  lessonTitle: string | null;
  difficulty: string;
  status: string;
  score: number | null;
  totalQuestions: number;
  createdAt: string;
  completedAt: string | null;
};

export type AiQuizAttemptDetail = AiQuizAttemptSummary & {
  feedbackText: string | null;
  questionsSnapshot: Array<{ questionText: string; options: string[]; correctAnswerIndex: number }>;
  answersSnapshot: number[] | null;
};

export async function generateAiQuiz(params: {
  courseId?: string;
  courseTitle: string;
  lessonTitle?: string;
  difficulty: AiQuizDifficulty;
}): Promise<AiQuizGenerateResponse> {
  const response = await apiClient.post<AiQuizGenerateResponse>("/ai/quiz/generate", params);
  return response.data;
}

export async function submitAiQuiz(attemptId: number, answers: number[]): Promise<AiQuizSubmitResponse> {
  const response = await apiClient.post<AiQuizSubmitResponse>("/ai/quiz/submit", { attemptId, answers });
  return response.data;
}

export async function getAiQuizAttempts(): Promise<{ attempts: AiQuizAttemptSummary[] }> {
  const response = await apiClient.get<{ attempts: AiQuizAttemptSummary[] }>("/ai/quiz/attempts");
  return response.data;
}

export async function getAiQuizAttemptById(id: number): Promise<AiQuizAttemptDetail> {
  const response = await apiClient.get<AiQuizAttemptDetail>(`/ai/quiz/attempts/${id}`);
  return response.data;
}
