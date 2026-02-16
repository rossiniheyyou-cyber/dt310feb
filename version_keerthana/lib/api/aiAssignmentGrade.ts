/**
 * API for learner assignment grading (pass/fail for course assessments).
 */

import apiClient from "./client";

export type AiAssignmentGradeParams = {
  assignmentTitle: string;
  problemStatement: string;
  submissionContent: string;
};

export type AiAssignmentGradeResponse = {
  passed: boolean;
  feedback: string;
};

export async function gradeLearnerAssignment(
  params: AiAssignmentGradeParams
): Promise<AiAssignmentGradeResponse> {
  const response = await apiClient.post<AiAssignmentGradeResponse>(
    "/ai/assignment-grade",
    params
  );
  return response.data;
}
