/**
 * Learning path preferences - persisted per user (localStorage)
 * Used for AI skill gap onboarding: goal, known skills, recommended path
 */

import { getCurrentUser } from '@/lib/currentUser';

const STORAGE_KEY_BASE = 'digitalt3-learning-path-preferences';

function getStorageKey(): string {
  const user = getCurrentUser();
  const email = user?.email ? String(user.email).trim().toLowerCase() : '';
  return email ? `${STORAGE_KEY_BASE}:${email}` : STORAGE_KEY_BASE;
}

export interface LastQuizResult {
  lessonTitle: string;
  percentage: number;
  difficulty?: string;
}

export interface LearningPathPreferences {
  goal: string;
  knownSkills: string[];
  recommendedPathSlug: string;
  skillGaps: string[];
  personalizedMessage: string;
  suggestedStartPhase: string;
  completedOnboarding: boolean;
  lastQuizResult?: LastQuizResult;
  updatedAt: string;
}

const defaultPrefs: LearningPathPreferences = {
  goal: '',
  knownSkills: [],
  recommendedPathSlug: 'fullstack',
  skillGaps: [],
  personalizedMessage: '',
  suggestedStartPhase: '',
  completedOnboarding: false,
  updatedAt: new Date().toISOString(),
};

export function getLearningPathPreferences(): LearningPathPreferences {
  if (typeof window === 'undefined') return defaultPrefs;
  try {
    const stored = localStorage.getItem(getStorageKey());
    if (stored) {
      const parsed = JSON.parse(stored) as LearningPathPreferences;
      return { ...defaultPrefs, ...parsed };
    }
  } catch {}
  return defaultPrefs;
}

/** Call after quiz submission to enable dynamic pathing (skip/remedial suggestions) */
export function recordQuizResult(result: LastQuizResult) {
  setLearningPathPreferences({ lastQuizResult: result });
}

export function setLearningPathPreferences(prefs: Partial<LearningPathPreferences>) {
  if (typeof window === 'undefined') return;
  try {
    const current = getLearningPathPreferences();
    const updated: LearningPathPreferences = {
      ...current,
      ...prefs,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(getStorageKey(), JSON.stringify(updated));
  } catch {}
}
