/**
 * API Data Adapters
 * Transform backend API data to match frontend component interfaces
 */

import { getCourses, Course as APICourse } from './api/courses';
import { getLessons, Lesson as APILesson } from './api/lessons';

/**
 * Fetch all courses from backend and adapt to learner courses format
 * This bridges the backend API structure to the frontend data format
 */
export async function fetchLearnerCourses() {
  try {
    // Fetch all published courses
    const response = await getCourses({
      status: 'published',
      limit: 100, // Get more courses for now
    });

    // Transform to frontend format
    return response.items.map((course, index) => ({
      id: parseInt(course.id),
      title: course.title,
      skill: course.tags[0] || 'General', // Use first tag as skill
      level: course.tags[1] || 'Intermediate', // Use second tag as level
      instructor: course.createdBy?.name || 'Instructor',
      progress: 0, // Will be calculated from progress tracking
      lessonsCompleted: 0,
      totalLessons: 0, // Will be fetched separately if needed
      status: 'Available',
      description: course.description,
      tags: course.tags,
    }));
  } catch (error) {
    console.error('Error fetching learner courses:', error);
    // Return empty array on error, let components handle gracefully
    return [];
  }
}

/**
 * Fetch lessons for a specific course
 */
export async function fetchCourseLessons(courseId: string) {
  try {
    const response = await getLessons({
      courseId,
      sortBy: 'order',
      sortOrder: 'ASC',
      limit: 100,
    });

    return response.items.map((lesson) => ({
      id: parseInt(lesson.id),
      courseId: parseInt(lesson.courseId),
      title: lesson.title,
      content: lesson.content,
      videoUrl: lesson.videoUrl,
      duration: lesson.duration || 0,
      order: lesson.order,
      status: lesson.status,
      hasQuiz: lesson.aiQuizJson && lesson.aiQuizJson.length > 0,
      hasSummary: !!lesson.aiSummary,
    }));
  } catch (error) {
    console.error('Error fetching course lessons:', error);
    return [];
  }
}

/**
 * Fetch a single course with lessons
 */
export async function fetchCourseWithLessons(courseId: string) {
  try {
    const [courseResponse, lessonsResponse] = await Promise.all([
      getCourses({ limit: 1, search: courseId }),
      getLessons({ courseId, sortBy: 'order', sortOrder: 'ASC', limit: 100 }),
    ]);

    const course = courseResponse.items[0];
    if (!course) {
      return null;
    }

    return {
      id: parseInt(course.id),
      title: course.title,
      description: course.description,
      tags: course.tags,
      instructor: course.createdBy?.name || 'Instructor',
      lessons: lessonsResponse.items.map((lesson) => ({
        id: parseInt(lesson.id),
        title: lesson.title,
        content: lesson.content,
        videoUrl: lesson.videoUrl,
        duration: lesson.duration || 0,
        order: lesson.order,
        status: lesson.status,
        hasQuiz: lesson.aiQuizJson && lesson.aiQuizJson.length > 0,
        hasSummary: !!lesson.aiSummary,
      })),
      totalLessons: lessonsResponse.total,
    };
  } catch (error) {
    console.error('Error fetching course with lessons:', error);
    return null;
  }
}

/**
 * Check if backend is available
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}
