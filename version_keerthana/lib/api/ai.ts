/**
 * AI API Service
 * Handles AI Mentor, Chatbot, and Role-specific AI interactions
 */

import apiClient from './client';

// Type definitions
export type AIChatType = 'mentor' | 'chatbot' | 'instructor' | 'manager' | 'admin';

export interface AIChatRequest {
  message: string;
  context?: {
    type?: AIChatType;
    courseId?: number;
    lessonId?: number;
  };
}

export interface AIChatResponse {
  response: string;
  type: AIChatType;
  userRole?: 'instructor' | 'manager' | 'admin' | 'learner';
}

/**
 * Chat with AI (supports role-based bots)
 */
export const chatWithAI = async (request: AIChatRequest): Promise<AIChatResponse> => {
  const response = await apiClient.post<AIChatResponse>('/ai/chat', {
    message: request.message,
    context: request.context || { type: 'chatbot' },
  });
  return response.data;
};

/**
 * Chat with AI Mentor (course-specific for learners)
 */
export const chatWithMentor = async (
  message: string,
  courseId?: number,
  lessonId?: number
): Promise<AIChatResponse> => {
  return chatWithAI({
    message,
    context: {
      type: 'mentor',
      courseId,
      lessonId,
    },
  });
};

/**
 * Chat with Global Chatbot (general platform help)
 */
export const chatWithBot = async (message: string): Promise<AIChatResponse> => {
  return chatWithAI({
    message,
    context: {
      type: 'chatbot',
    },
  });
};

/**
 * Chat with Instructor Co-Teacher bot
 */
export const chatWithInstructorBot = async (
  message: string,
  courseId?: number,
  lessonId?: number
): Promise<AIChatResponse> => {
  return chatWithAI({
    message,
    context: {
      type: 'instructor',
      courseId,
      lessonId,
    },
  });
};

/**
 * Chat with Manager Performance Strategist bot
 */
export const chatWithManagerBot = async (message: string): Promise<AIChatResponse> => {
  return chatWithAI({
    message,
    context: {
      type: 'manager',
    },
  });
};

/**
 * Chat with Admin System Architect bot
 */
export const chatWithAdminBot = async (message: string): Promise<AIChatResponse> => {
  return chatWithAI({
    message,
    context: {
      type: 'admin',
    },
  });
};
