/**
 * API for AI-generated assignment feedback (instructor review).
 * Used when instructor opens a learner's submission and requests AI feedback.
 */

import apiClient from './client';

export interface AssignmentFeedbackRequest {
  assignmentTitle: string;
  assignmentDescription?: string;
  submissionContent?: string;
}

export interface AssignmentFeedbackResponse {
  feedback: string;
}

export async function generateAssignmentFeedback(
  data: AssignmentFeedbackRequest
): Promise<AssignmentFeedbackResponse> {
  const response = await apiClient.post<AssignmentFeedbackResponse>(
    '/ai/assignment-feedback',
    data
  );
  return response.data;
}
