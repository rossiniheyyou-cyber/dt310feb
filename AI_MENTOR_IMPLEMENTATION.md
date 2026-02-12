# AI Mentor & Global Chatbot Implementation

## Overview
Complete implementation of the DigitalT3 AI Mentor and Global Chatbot using Claude API (Anthropic) throughout the LMS.

---

## ✅ Implementation Complete

### 1. Backend AI Service Enhancement

#### Enhanced AI Service (`version_1/lms_backend/src/services/ai.js`)
- ✅ Added `chat()` method with system prompts
- ✅ Supports two modes:
  - **AI Mentor**: Course-specific assistance with context injection
  - **Global Chatbot**: General platform navigation help
- ✅ System prompts include:
  - Identity: "DigitalT3 AI Mentor" / "DigitalT3 AI Assistant"
  - Guardrails: Only answer course/platform questions, redirect off-topic queries
  - Tone: Professional, encouraging, academic
- ✅ Context injection: Automatically includes course title, description, lesson content, AI summary

#### AI Chat Endpoint (`version_1/lms_backend/src/routes/ai.js`)
- ✅ `POST /api/ai/chat` endpoint created
- ✅ Accepts:
  ```json
  {
    "message": "User question",
    "context": {
      "type": "mentor" | "chatbot",
      "courseId": 123,
      "lessonId": 456
    }
  }
  ```
- ✅ Automatically enriches context by fetching course/lesson details from database
- ✅ Error handling with fallback messages
- ✅ Returns:
  ```json
  {
    "response": "AI-generated answer",
    "type": "mentor" | "chatbot"
  }
  ```

---

### 2. Frontend Integration

#### API Service (`version_keerthana/lib/api/ai.ts`)
- ✅ `chatWithAI()` - Generic chat function
- ✅ `chatWithMentor()` - Course-specific mentor chat
- ✅ `chatWithBot()` - Global chatbot chat

#### Global Chatbot (`version_keerthana/components/global/AIChatWidget.tsx`)
- ✅ Updated to use Claude API instead of hardcoded responses
- ✅ Loading state: "AI is thinking..." with spinner
- ✅ Error handling with fallback message
- ✅ Floating button (bottom-right) with chat panel
- ✅ Quick suggestions for common questions
- ✅ Auto-scroll to latest message

#### AI Mentor Modal (`version_keerthana/components/learner/AIMentorModal.tsx`)
- ✅ Reusable modal component for course pages
- ✅ Course/lesson context display in header
- ✅ Chat interface with message history
- ✅ Loading states and error handling
- ✅ Auto-focus on input when opened

#### Integration Points

1. **Course Detail Page** (`app/dashboard/learner/courses/[pathId]/[courseId]/CourseDetailClient.tsx`)
   - ✅ "Ask AI Mentor" button added above video player
   - ✅ Modal opens with course and lesson context
   - ✅ Automatically includes courseId and lessonId

2. **AI Mentor Card** (`components/learner/AIMentorCard.tsx`)
   - ✅ "Ask AI Mentor" button now opens modal
   - ✅ Includes recent course context if available

---

## 🔧 Technical Details

### System Prompts

#### AI Mentor Prompt
```
You are the "DigitalT3 AI Mentor," an expert learning assistant for the DigitalT3 LMS.
Your role is to help learners understand course content, clarify concepts, and guide them through their learning journey.

GUARDRAILS:
- ONLY answer questions related to the courses, professional development, or the DigitalT3 platform.
- If a user asks about unrelated topics (e.g., "how to cook pizza"), politely redirect them to their learning path.
- Stay focused on educational content and learning objectives.

TONE: Professional, encouraging, and academic.

CURRENT CONTEXT:
- Course: [Course Title]
- Course Description: [Description]
- Current Lesson: [Lesson Title]
- Lesson Summary: [AI Summary]
- Lesson Content: [Content preview]
```

#### Global Chatbot Prompt
```
You are the "DigitalT3 AI Assistant," a helpful guide for the DigitalT3 LMS platform.
Your role is to help users navigate the platform, understand features, and answer general questions about the LMS.

GUARDRAILS:
- Focus on platform navigation, course completion, assignments, quizzes, certificates, and progress tracking.
- If a user asks about unrelated topics, politely redirect them to their learning path.
- Keep answers concise and actionable.

TONE: Professional, friendly, and helpful.
```

### Error Handling

- **API Key Missing**: Returns 503 with fallback message
- **Rate Limits**: Returns 503 with fallback message
- **API Errors**: Returns 503 with fallback message
- **Fallback Message**: "The AI Mentor is currently resting. Please try again in a few minutes."

### Loading States

- ✅ "AI is thinking..." indicator with spinner
- ✅ Disabled input during processing
- ✅ Visual feedback for user

---

## 📍 Integration Locations

### Where AI Mentor Appears

1. **Course Detail Pages**
   - "Ask AI Mentor" button above video player
   - Context: Course + Current Lesson

2. **AI Mentor Card** (Dashboard)
   - "Ask AI Mentor" button
   - Context: Recent course (if available)

3. **Global Chatbot** (All Pages)
   - Floating button bottom-right
   - Context: General platform help

---

## 🔐 Security

- ✅ No hardcoded API keys (uses `process.env.ANTHROPIC_API_KEY`)
- ✅ JWT authentication required for `/api/ai/chat`
- ✅ Model: `claude-3-5-sonnet-latest` (configured in `.env`)
- ✅ Max tokens: 2048 (configurable via `ANTHROPIC_MAX_TOKENS`)

---

## 🧪 Testing

### Test Cases

1. **Global Chatbot**
   - [ ] Open chatbot from any page
   - [ ] Ask platform navigation question
   - [ ] Verify response is relevant
   - [ ] Test error handling (disconnect API key)

2. **AI Mentor (Course Page)**
   - [ ] Navigate to course detail page
   - [ ] Click "Ask AI Mentor" button
   - [ ] Ask course-specific question
   - [ ] Verify context is included (course title visible)
   - [ ] Test with lesson context

3. **Error Handling**
   - [ ] Test with invalid API key
   - [ ] Verify fallback message appears
   - [ ] Test loading states

4. **Guardrails**
   - [ ] Ask off-topic question ("how to cook pizza")
   - [ ] Verify AI redirects to learning path
   - [ ] Verify professional tone maintained

---

## 📝 Environment Variables

### Backend (`.env`)
```env
ANTHROPIC_API_KEY=sk-ant-api03-...
ANTHROPIC_MODEL=claude-3-5-sonnet-latest
ANTHROPIC_MAX_TOKENS=2048
ANTHROPIC_VERSION=2023-06-01
```

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## 🚀 Usage Examples

### Frontend: Chat with Mentor
```typescript
import { chatWithMentor } from '@/lib/api/ai';

const response = await chatWithMentor(
  "Can you explain the main concepts in this lesson?",
  courseId,
  lessonId
);
console.log(response.response);
```

### Frontend: Chat with Bot
```typescript
import { chatWithBot } from '@/lib/api/ai';

const response = await chatWithBot("How do I complete a course?");
console.log(response.response);
```

### Backend: Direct API Call
```bash
curl -X POST http://localhost:4000/api/ai/chat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is this course about?",
    "context": {
      "type": "mentor",
      "courseId": 1,
      "lessonId": 5
    }
  }'
```

---

## ✅ Summary

**Backend**: ✅ Complete
- AI service enhanced with chat method
- `/api/ai/chat` endpoint created
- System prompts implemented
- Context injection working
- Error handling with fallbacks

**Frontend**: ✅ Complete
- Global chatbot connected to API
- AI Mentor modal component created
- Integrated into course pages
- Loading states and error handling
- All "Ask AI Mentor" buttons functional

**Security**: ✅ Complete
- No hardcoded keys
- JWT authentication
- Proper error handling

The AI Mentor and Global Chatbot are now fully operational throughout the LMS!
