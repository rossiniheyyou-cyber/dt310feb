/**
 * Example: Quiz Integration with Backend
 * 
 * This file demonstrates how to integrate the quiz functionality with the backend API.
 * The current quiz system uses local state and mock data. To integrate with the backend:
 * 
 * 1. Fetch quiz questions from the lesson's AI-generated content
 * 2. Submit answers to the backend to update readiness score
 * 3. Store results in backend for progress tracking
 */

import { getLessonContent, submitQuiz, type LessonQuizQuestion } from '@/lib/api/lessons';

/**
 * Example: Fetch quiz for a lesson
 * 
 * Usage in QuizTakingScreen or QuizLandingScreen:
 * ```tsx
 * const [quizData, setQuizData] = useState<LessonQuizQuestion[] | null>(null);
 * 
 * useEffect(() => {
 *   const fetchQuiz = async () => {
 *     try {
 *       const content = await getLessonContent(lessonId);
 *       if (content.aiQuizJson) {
 *         setQuizData(content.aiQuizJson);
 *       }
 *     } catch (error) {
 *       console.error('Failed to fetch quiz:', error);
 *     }
 *   };
 *   fetchQuiz();
 * }, [lessonId]);
 * ```
 */

/**
 * Example: Submit quiz answers to backend
 * 
 * The backend expects answers as an array of indices (0-3) or an object map.
 * 
 * Usage in QuizTakingScreen handleSubmit:
 * ```tsx
 * const handleSubmit = async () => {
 *   try {
 *     // Convert UI answers to backend format
 *     // answers is Record<string, string[]> where keys are question IDs
 *     // Backend expects array of answer indices (0-3)
 *     const answersArray = quiz.questions.map((q, index) => {
 *       const selected = answers[q.id] ?? [];
 *       // For single-choice, get the selected option index
 *       // For multi-choice, you might need to adjust logic
 *       const optionIndex = q.options.findIndex(opt => selected.includes(opt.id));
 *       return optionIndex >= 0 ? optionIndex : -1; // -1 for unanswered
 *     });
 * 
 *     // Submit to backend
 *     const result = await submitQuiz(lessonId, answersArray);
 * 
 *     // Navigate to result page with backend data
 *     router.push(
 *       `/dashboard/learner/quiz/${quiz.id}/result?` +
 *       `score=${result.percentage}&` +
 *       `correct=${result.correctCount}&` +
 *       `total=${result.total}&` +
 *       `readinessScore=${result.readinessScore}`
 *     );
 *   } catch (error) {
 *     console.error('Failed to submit quiz:', error);
 *     // Show error to user
 *   }
 * };
 * ```
 */

/**
 * Backend Quiz Data Structure
 * 
 * The backend stores quiz questions in this format:
 * {
 *   questionText: string;
 *   options: string[];  // Array of 4 option strings
 *   correctAnswerIndex: number;  // Index 0-3 of the correct answer
 * }
 * 
 * Frontend needs to adapt this to the current QuizQuestion interface:
 * {
 *   id: string;
 *   question: string;
 *   type: 'single' | 'multi';
 *   options: Array<{ id: string; text: string; isCorrect: boolean }>;
 *   points: number;
 * }
 */

/**
 * Adapter function to convert backend quiz to frontend format
 */
export function adaptBackendQuizToFrontend(
  backendQuiz: LessonQuizQuestion[],
  lessonId: string
): any {
  return {
    id: `lesson-${lessonId}-quiz`,
    title: 'Lesson Quiz',
    description: 'Test your understanding of the lesson material',
    type: 'assessment' as const,
    timeLimitMinutes: 15,
    passingScore: 70,
    questions: backendQuiz.map((q, index) => ({
      id: `q${index + 1}`,
      question: q.questionText,
      type: 'single' as const, // Backend quizzes are single-choice
      points: 1,
      options: q.options.map((optText, optIndex) => ({
        id: `q${index + 1}-opt${optIndex + 1}`,
        text: optText,
        isCorrect: optIndex === q.correctAnswerIndex,
      })),
    })),
  };
}

/**
 * Adapter function to convert frontend answers to backend format
 */
export function adaptFrontendAnswersToBackend(
  answers: Record<string, string[]>,
  quiz: any
): number[] {
  return quiz.questions.map((q: any) => {
    const selectedIds = answers[q.id] ?? [];
    if (selectedIds.length === 0) return -1; // Unanswered
    
    // Find the index of the selected option
    const selectedId = selectedIds[0]; // Take first for single-choice
    const optionIndex = q.options.findIndex((opt: any) => opt.id === selectedId);
    return optionIndex >= 0 ? optionIndex : -1;
  });
}

/**
 * Complete Integration Example Component
 * 
 * This shows how a complete quiz flow would work with the backend:
 */
/*
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getLessonContent, submitQuiz } from "@/lib/api/lessons";
import { adaptBackendQuizToFrontend, adaptFrontendAnswersToBackend } from "./quizAdapters";
import QuizTakingScreen from "@/components/learner/quiz/QuizTakingScreen";

export default function LessonQuizPage() {
  const router = useRouter();
  const params = useParams();
  const lessonId = params.id as string;
  
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const content = await getLessonContent(lessonId);
        
        if (!content.aiQuizJson || content.aiQuizJson.length === 0) {
          setError("No quiz available for this lesson");
          return;
        }
        
        // Convert backend format to frontend format
        const adaptedQuiz = adaptBackendQuizToFrontend(content.aiQuizJson, lessonId);
        setQuiz(adaptedQuiz);
      } catch (err: any) {
        console.error("Failed to fetch quiz:", err);
        setError(err.response?.data?.message || "Failed to load quiz");
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuiz();
  }, [lessonId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-slate-600">Loading quiz...</div>
    </div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-red-600">{error}</div>
    </div>;
  }

  if (!quiz) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-slate-600">No quiz available</div>
    </div>;
  }

  return <QuizTakingScreen quiz={quiz} />;
}
*/

export {};
