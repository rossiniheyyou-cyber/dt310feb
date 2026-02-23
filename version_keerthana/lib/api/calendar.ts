/**
 * Calendar API - events, reminders, assessments with due dates
 */

import apiClient from './client';

export type CalendarEventType = 'reminder' | 'meeting' | 'live_class' | 'assignment' | 'quiz';

export interface CalendarEventItem {
  id: string;
  title: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  type: CalendarEventType;
  status: string;
  courseId?: string;
  courseTitle?: string;
  meetingLink?: string;
}

export interface CalendarEventsResponse {
  events: CalendarEventItem[];
}

export const getCalendarEvents = async (): Promise<CalendarEventsResponse> => {
  const response = await apiClient.get<CalendarEventsResponse>('/calendar/events');
  const data = response.data;
  if (data.events) {
    data.events = data.events.map((e) => ({
      ...e,
      date: new Date(e.date),
    }));
  }
  return data;
};

export interface CreateCalendarEventParams {
  title: string;
  eventType?: 'reminder' | 'meeting' | 'live_class';
  eventDate: string;
  startTime?: string;
  endTime?: string;
  meetingLink?: string;
  courseId?: string;
  courseTitle?: string;
}

export const createCalendarEvent = async (
  params: CreateCalendarEventParams
): Promise<{ id: number }> => {
  const response = await apiClient.post('/calendar/events', params);
  return response.data;
};

export interface UpdateCalendarEventParams {
  title?: string;
  eventType?: 'reminder' | 'meeting' | 'live_class';
  eventDate?: string;
  startTime?: string;
  endTime?: string;
  meetingLink?: string;
  courseId?: string;
  courseTitle?: string;
}

export const updateCalendarEvent = async (
  eventId: string,
  params: UpdateCalendarEventParams
): Promise<{ id: number }> => {
  const id = eventId.replace(/^ev-/, '');
  const response = await apiClient.patch(`/calendar/events/${id}`, params);
  return response.data;
};

export const deleteCalendarEvent = async (eventId: string): Promise<void> => {
  const id = eventId.replace(/^ev-/, '');
  await apiClient.delete(`/calendar/events/${id}`);
};

export interface CreateAssessmentParams {
  title: string;
  courseId?: string;
  courseTitle?: string;
  pathSlug?: string;
  module?: string;
  moduleId?: string;
  type?: 'assignment' | 'quiz';
  dueDateISO?: string;
  passMark?: number;
  totalPoints?: number;
  description?: string;
  status?: 'draft' | 'published';
}

export const createAssessment = async (
  params: CreateAssessmentParams
): Promise<{ id: number }> => {
  const response = await apiClient.post('/calendar/assessments', params);
  return response.data;
};

export interface UpdateAssessmentParams {
  title?: string;
  courseId?: string;
  courseTitle?: string;
  pathSlug?: string;
  module?: string;
  moduleId?: string;
  type?: 'assignment' | 'quiz';
  dueDateISO?: string;
  passMark?: number;
  totalPoints?: number;
  status?: 'draft' | 'published';
}

export const updateAssessment = async (
  assessmentId: string,
  params: UpdateAssessmentParams
): Promise<{ id: number }> => {
  const id = assessmentId.replace(/^a-/, '');
  const response = await apiClient.patch(`/calendar/assessments/${id}`, params);
  return response.data;
};

export const deleteAssessment = async (assessmentId: string): Promise<void> => {
  const id = assessmentId.replace(/^a-/, '');
  await apiClient.delete(`/calendar/assessments/${id}`);
};
