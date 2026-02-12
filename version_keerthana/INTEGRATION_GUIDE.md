# Backend Integration Summary

## Overview
This document describes the integration between Keerthana's frontend (@version_keerthana) and the Express backend (@version_1/lms_backend).

## Configuration

### Environment Variables
- **File**: `.env.local`
- **Variable**: `NEXT_PUBLIC_API_URL=http://localhost:4000`

### Dependencies Added
- `axios`: ^1.6.0 (HTTP client for API calls)

## API Structure

### Base URL
```
http://localhost:4000
```

### API Modules Created

#### 1. **API Client** (`lib/api/client.ts`)
- Centralized axios instance
- Automatic JWT token injection from localStorage
- Request/response interceptors for error handling
- Auto-redirects to login on 401 Unauthorized

#### 2. **Auth Service** (`lib/api/auth.ts`)
Endpoints:
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/me` - Get current user profile

Functions:
- `login(credentials)` - Authenticates user, stores token
- `register(data)` - Creates new user account
- `getCurrentUser()` - Fetches current user from backend
- `logout()` - Clears all auth data
- `isAuthenticated()` - Checks if user has valid token
- `getUserRole()` - Gets user role from stored data
- `getDashboardRoute(role)` - Returns appropriate dashboard path

#### 3. **Courses Service** (`lib/api/courses.ts`)
Endpoints:
- `GET /courses` - List courses (paginated, with search & filters)
- `GET /courses/:id` - Get single course
- `POST /courses` - Create course (admin/instructor)
- `PATCH /courses/:id` - Update course (admin/instructor)
- `DELETE /courses/:id` - Delete course (admin/instructor)

Functions:
- `getCourses(params)` - Fetch paginated courses
- `getCourse(id)` - Get single course details
- `createCourse(data)` - Create new course
- `updateCourse(id, data)` - Update existing course
- `deleteCourse(id)` - Soft-delete course

#### 4. **Lessons Service** (`lib/api/lessons.ts`)
Endpoints:
- `GET /lessons` - List lessons (paginated, with filters)
- `GET /lessons/:id` - Get single lesson
- `GET /lessons/by-course/:courseId` - Get lessons for a course
- `POST /lessons` - Create lesson (admin/instructor)
- `PATCH /lessons/:id` - Update lesson (admin/instructor)
- `DELETE /lessons/:id` - Delete lesson (admin/instructor)
- `GET /lessons/:id/content` - Get AI summary & quiz
- `POST /lessons/:id/submit-quiz` - Submit quiz answers
- `POST /lessons/:id/generate-ai` - Generate AI content (admin/instructor)
- `POST /lessons/:id/video-view-url` - Get presigned video URL

Functions:
- `getLessons(params)` - Fetch paginated lessons
- `getLessonsByCourse(courseId, params)` - Get lessons for specific course
- `getLesson(id)` - Get single lesson
- `createLesson(data)` - Create new lesson
- `updateLesson(id, data)` - Update lesson
- `deleteLesson(id)` - Delete lesson
- `getLessonContent(id)` - Get AI-generated content
- `submitQuiz(id, answers)` - Submit quiz and update readiness score
- `generateAIContent(id)` - Trigger AI content generation
- `getLessonVideoViewUrl(id)` - Get presigned S3 URL for video

#### 5. **Data Adapters** (`lib/api/adapters.ts`)
Helper functions to bridge backend data to frontend format:
- `fetchLearnerCourses()` - Fetches and transforms courses
- `fetchCourseLessons(courseId)` - Fetches lessons for a course
- `fetchCourseWithLessons(courseId)` - Fetches course + lessons together
- `checkBackendHealth()` - Health check for backend availability

## Updated Components

### Authentication Pages

#### Login Page (`app/auth/login/page.tsx`)
**Changes**:
- Calls real `POST /auth/login` endpoint
- Stores JWT token in localStorage
- Stores user data in localStorage
- Role-based routing after successful login
- Error handling for network issues and invalid credentials
- Loading states during API calls

#### Signup Page (`app/auth/signup/page.tsx`)
**Changes**:
- Calls real `POST /auth/register` endpoint
- Validates password length (min 8 characters)
- Handles email already registered errors
- Stores JWT token and user data on success
- Role-based routing after registration
- Loading states and error handling

## Data Flow

### Authentication Flow
1. User enters credentials on login/signup page
2. Frontend calls backend API (`/auth/login` or `/auth/register`)
3. Backend validates and returns JWT token + user object
4. Frontend stores token in localStorage as `auth_token`
5. Frontend stores user info in localStorage as `digitalt3-current-user`
6. User is redirected to appropriate dashboard based on role

### API Request Flow
1. Component calls API service function (e.g., `getCourses()`)
2. API service uses axios client to make HTTP request
3. API client automatically adds JWT token to Authorization header
4. Backend validates token and processes request
5. Response data is returned to component
6. Component updates UI with data

### Token Management
- **Storage**: localStorage (`auth_token`)
- **Injection**: Automatic via axios interceptor
- **Format**: `Bearer <token>`
- **Expiration Handling**: 401 responses clear token and redirect to login

## Backend Requirements

### Starting the Backend
```bash
cd version_1/lms_backend
npm install
npm run dev
```

### Environment Setup
The backend requires:
- MySQL database running (or DB_PROVIDER=disabled for testing)
- `.env` file with configuration
- JWT_SECRET set

### Database Schema
The backend uses TypeORM with entities:
- **User**: id, email, name, role, passwordHash, readinessScore
- **Course**: id, title, description, status, tags
- **Lesson**: id, courseId, title, content, videoUrl, duration, aiSummary, aiQuizJson, order, status

## Testing the Integration

### 1. Start Backend
```bash
cd version_1/lms_backend
npm run dev
```
Backend should start on http://localhost:4000

### 2. Start Frontend
```bash
cd version_keerthana
npm install  # Install new axios dependency
npm run dev
```
Frontend should start on http://localhost:3000

### 3. Test Authentication
1. Navigate to http://localhost:3000/auth/signup
2. Create a new account (email, name, password)
3. Should redirect to learner dashboard on success
4. Try logging out and logging back in

### 4. Test API Calls
Check browser DevTools Network tab:
- Login should POST to `/auth/login`
- Subsequent requests should include `Authorization: Bearer <token>`
- Check for any 401/403 errors

## Migration Notes

### What Was Kept
- All of Keerthana's UI components (unchanged)
- All CSS/Tailwind styling (unchanged)
- Component structure and layouts (unchanged)
- Learning paths and progress tracking (local state, for now)

### What Was Changed
- Login page: Now calls real backend instead of mock auth
- Signup page: Now calls real backend instead of mock signup
- Added API client infrastructure for all future integrations

### What's Next (To Do)
1. **Dashboard Integration**: Update dashboard components to fetch real course data
2. **Course Pages**: Replace mock course data with API calls
3. **Quiz Functionality**: Connect quiz submissions to backend
4. **Progress Tracking**: Sync local progress with backend user data
5. **Admin/Instructor Dashboards**: Connect to course/lesson management APIs
6. **Error Boundaries**: Add proper error handling throughout app

## Common Issues & Solutions

### Issue: "Cannot connect to server"
**Solution**: Ensure backend is running on port 4000
```bash
cd version_1/lms_backend
npm run dev
```

### Issue: CORS errors
**Solution**: Backend has CORS enabled with `ALLOWED_ORIGINS=*`. Check backend logs.

### Issue: 401 Unauthorized after login
**Solution**: Token might not be stored correctly. Check:
1. DevTools > Application > localStorage > `auth_token`
2. Network tab > Request Headers > Authorization header

### Issue: "Database not available"
**Solution**: Either:
- Start MySQL and configure .env in backend
- Set `DB_PROVIDER=disabled` in backend .env for testing without DB

## API Documentation

The backend provides Swagger documentation at:
- http://localhost:4000/docs
- http://localhost:4000/api-docs
- http://localhost:4000/openapi.json (JSON spec)

## Security Considerations

1. **JWT Tokens**: Stored in localStorage (consider httpOnly cookies for production)
2. **Password Requirements**: Min 8 characters (enforced on both frontend and backend)
3. **Role-Based Access**: Backend enforces permissions (admin/instructor for write operations)
4. **Token Expiration**: Backend sets JWT expiration (check backend JWT_SECRET config)

## Future Enhancements

1. **Refresh Tokens**: Implement token refresh mechanism
2. **Remember Me**: Optional persistent login
3. **Password Reset**: Add forgot password flow
4. **Email Verification**: Verify email addresses after signup
5. **Profile Management**: Allow users to update their profiles
6. **Real-time Updates**: Consider WebSocket for live progress updates

## File Structure

```
version_keerthana/
├── .env.local                          # Environment configuration
├── lib/
│   └── api/
│       ├── client.ts                   # Axios client with interceptors
│       ├── auth.ts                     # Authentication service
│       ├── courses.ts                  # Courses service
│       ├── lessons.ts                  # Lessons service
│       └── adapters.ts                 # Data transformation helpers
├── app/
│   └── auth/
│       ├── login/page.tsx              # Updated login page
│       └── signup/page.tsx             # Updated signup page
└── package.json                        # Added axios dependency
```

## Contact & Support

For questions about:
- **Frontend**: Check Keerthana's component documentation
- **Backend**: Check version_1/lms_backend/README.md
- **API Endpoints**: Visit http://localhost:4000/docs

---

**Last Updated**: 2026-02-02
**Integration Status**: Phase 1 Complete (Authentication)
**Next Phase**: Dashboard & Course Data Integration
