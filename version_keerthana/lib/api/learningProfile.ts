/**
 * Learning Profile API - goal, target role, known skills (persisted on backend)
 */

import apiClient from './client';

export interface LearningProfile {
  goal: string;
  targetRole: string;
  knownSkills: string[];
  completedOnboarding: boolean;
  recommendedPathSlug?: string;
  skillGaps?: string[];
  personalizedMessage?: string;
}

export const getLearningProfile = async (): Promise<LearningProfile> => {
  const response = await apiClient.get<LearningProfile>('/learning-profile');
  return response.data;
};

export const updateLearningProfile = async (
  data: Partial<LearningProfile>
): Promise<LearningProfile> => {
  const response = await apiClient.patch<LearningProfile>('/learning-profile', data);
  return response.data;
};
