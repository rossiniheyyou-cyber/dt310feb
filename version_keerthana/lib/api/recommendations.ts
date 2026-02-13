/**
 * API for AI-Powered Supplemental Learning (YouTube recommendations).
 * Used on the learner course player page only.
 */

import apiClient from './client';

export interface YoutubeVideoSummary {
  id: string;
  title: string;
  thumbnail: string;
}

export interface YoutubeKeywordResponse {
  searchString: string;
}

export interface YoutubeRecommendationsResponse {
  videos: YoutubeVideoSummary[];
}

/**
 * Get a single YouTube search string from Claude using course and lesson context.
 */
export async function getYoutubeKeyword(
  courseTitle: string,
  lessonName: string
): Promise<YoutubeKeywordResponse> {
  const response = await apiClient.post<YoutubeKeywordResponse>(
    '/recommendations/youtube-keyword',
    { courseTitle, lessonName }
  );
  return response.data;
}

/**
 * Fetch top 3 YouTube results for the given search string.
 */
export async function getYoutubeRecommendations(
  searchString: string
): Promise<YoutubeRecommendationsResponse> {
  const response = await apiClient.get<YoutubeRecommendationsResponse>(
    '/recommendations/youtube',
    { params: { q: searchString } }
  );
  return response.data;
}
