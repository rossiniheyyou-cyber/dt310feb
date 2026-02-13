/**
 * Learning Path API - AI-generated skill gap analysis and path generation
 */

import apiClient from './client';

export interface SkillGapResponse {
  recommendedPathSlug: string;
  skillGaps: string[];
  suggestedStartPhase: string;
  personalizedMessage: string;
}

export interface GeneratePathResponse {
  pathSlug: string;
  phases: Array<{
    id: string;
    name: string;
    courses: Array<{
      id: string;
      title: string;
      status: 'required' | 'skip' | 'remedial';
      reason?: string;
    }>;
  }>;
  dynamicSuggestions: Array<{
    type: 'skip' | 'remedial';
    courseId: string;
    message: string;
  }>;
}

export const analyzeSkillGap = async (
  goal: string,
  knownSkills: string[] = []
): Promise<SkillGapResponse> => {
  const response = await apiClient.post<SkillGapResponse>('/learning-path/skill-gap', {
    goal,
    knownSkills,
  });
  return response.data;
};

export const generateLearningPath = async (params: {
  goal: string;
  knownSkills: string[];
  pathSlug: string;
  pathStructure: Record<string, unknown>;
  quizPerformance?: {
    lessonTitle?: string;
    percentage?: number;
    difficulty?: string;
  };
}): Promise<GeneratePathResponse> => {
  const response = await apiClient.post<GeneratePathResponse>('/learning-path/generate', params);
  return response.data;
};
