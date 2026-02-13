# Backend Integration - Quick Start Guide

## What Was Completed ✅

### 1. Core Infrastructure
- ✅ Created `.env.local` with `NEXT_PUBLIC_API_URL` configuration
- ✅ Added `axios` dependency to package.json
- ✅ Built centralized API client with JWT token management
- ✅ Implemented automatic authentication handling

### 2. Authentication (Fully Integrated)
- ✅ Login page now calls `POST /auth/login`
- ✅ Signup page now calls `POST /auth/register`
- ✅ JWT tokens stored securely in localStorage
- ✅ Role-based routing after authentication
- ✅ Error handling and loading states

### 3. API Service Modules
- ✅ `lib/api/client.ts` - HTTP client with interceptors
- ✅ `lib/api/auth.ts` - Authentication service
- ✅ `lib/api/courses.ts` - Courses CRUD operations
- ✅ `lib/api/lessons.ts` - Lessons CRUD + quiz operations
- ✅ `lib/api/adapters.ts` - Data transformation helpers
- ✅ `lib/api/quizIntegrationExample.ts` - Quiz integration guide

## How to Test Right Now 🚀

### Step 1: Start the Backend
```bash
cd version_1/lms_backend
npm install  # If not already done
npm run dev
```
Backend should start on: http://localhost:4000

### Step 2: Install Frontend Dependencies
```bash
cd version_keerthana
npm install  # This will install axios
```

### Step 3: Start the Frontend
```bash
npm run dev
```
Frontend should start on: http://localhost:3000

### Step 4: Test Authentication
1. Open browser to http://localhost:3000/auth/signup
2. Create a new account:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
3. You should be redirected to `/dashboard/learner`
4. Open DevTools > Network tab to see API calls
5. Check Application > localStorage for `auth_token`

### Step 5: Test Login
1. Navigate to http://localhost:3000/auth/login
2. Login with the account you just created
3. Should redirect to dashboard based on your role

## What Each Component Does

### Authentication Flow
```
User enters credentials
        ↓
Frontend calls /auth/login or /auth/register
        ↓
Backend validates & returns JWT + user data
        ↓
Frontend stores token in localStorage
        ↓
User redirected to role-based dashboard
```

### API Request Flow
```
Component needs data
        ↓
Calls API service function (e.g., getCourses())
        ↓
API client adds JWT token automatically
        ↓
Backend validates token & processes request
        ↓
Data returned to component
        ↓
Component renders UI
```

## Backend API Endpoints Available

### Authentication
- `POST /auth/register` - Create account
- `POST /auth/login` - Login
- `GET /auth/me` - Get current user

### Courses
- `GET /courses` - List all courses (paginated)
- `GET /courses/:id` - Get single course
- `POST /courses` - Create course (admin/instructor only)
- `PATCH /courses/:id` - Update course
- `DELETE /courses/:id` - Delete course

### Lessons
- `GET /lessons` - List all lessons (paginated)
- `GET /lessons/:id` - Get single lesson
- `GET /lessons/by-course/:courseId` - Get lessons for a course
- `POST /lessons` - Create lesson (admin/instructor)
- `PATCH /lessons/:id` - Update lesson
- `DELETE /lessons/:id` - Delete lesson
- `GET /lessons/:id/content` - Get AI summary & quiz
- `POST /lessons/:id/submit-quiz` - Submit quiz answers

### Health Check
- `GET /` - Backend health status
- `GET /api/health` - Simple health ping

## View API Documentation

Open in browser while backend is running:
- Swagger UI: http://localhost:4000/docs
- OpenAPI JSON: http://localhost:4000/openapi.json

## Next Steps for Full Integration

### Phase 1: Dashboard Data (Next Priority)
The dashboard components currently use mock data. To integrate:

1. **Update ContinueLearning Component**:
   ```tsx
   // Import API functions
   import { getCourses } from '@/lib/api/courses';
   
   // Fetch real courses
   const [courses, setCourses] = useState([]);
   useEffect(() => {
     getCourses({ status: 'published' }).then(res => setCourses(res.items));
   }, []);
   ```

2. **Update Course Listing Pages**:
   - Use `fetchLearnerCourses()` from adapters.ts
   - Replace mock data imports with API calls
   - Handle loading and error states

3. **Update Progress Tracking**:
   - Currently uses localStorage
   - Can be synced with backend user progress
   - Readiness score is already tracked in backend

### Phase 2: Course Detail Pages
1. Fetch course details using `getCourse(id)`
2. Fetch lessons using `getLessonsByCourse(courseId)`
3. Update video player to use presigned URLs

### Phase 3: Quiz Integration
1. Use quiz integration example in `quizIntegrationExample.ts`
2. Fetch quiz from `getLessonContent(lessonId)`
3. Submit answers with `submitQuiz(lessonId, answers)`
4. Display readiness score updates

### Phase 4: Admin/Instructor Features
1. Course creation/editing
2. Lesson management
3. AI content generation
4. User management

## Common Issues & Solutions

### "Cannot connect to server"
**Problem**: Frontend can't reach backend
**Solution**: 
1. Check backend is running: `cd version_1/lms_backend && npm run dev`
2. Verify port 4000 is not blocked
3. Check `.env.local` has correct URL

### "401 Unauthorized" errors
**Problem**: Token invalid or missing
**Solution**:
1. Check DevTools > Application > localStorage for `auth_token`
2. Try logging out and back in
3. Clear localStorage and re-authenticate

### CORS errors
**Problem**: Cross-origin request blocked
**Solution**: Backend has CORS enabled (`ALLOWED_ORIGINS=*`). Check backend logs for details.

### "Database not available"
**Problem**: Backend can't connect to MySQL
**Solution**: 
- Option 1: Start MySQL and configure `.env` in backend
- Option 2: Set `DB_PROVIDER=disabled` in backend `.env` for testing

## File Changes Summary

### New Files Created
```
version_keerthana/
├── .env.local                          # Environment config
├── INTEGRATION_GUIDE.md                # Detailed integration docs
├── QUICK_START.md                      # This file
└── lib/api/
    ├── client.ts                       # HTTP client
    ├── auth.ts                         # Auth service
    ├── courses.ts                      # Courses service
    ├── lessons.ts                      # Lessons service
    ├── adapters.ts                     # Data adapters
    └── quizIntegrationExample.ts       # Quiz integration guide
```

### Modified Files
```
version_keerthana/
├── package.json                        # Added axios
├── app/auth/login/page.tsx            # Integrated with backend
└── app/auth/signup/page.tsx           # Integrated with backend
```

### Preserved (Unchanged)
- ✅ All UI components and styling
- ✅ All Tailwind CSS classes
- ✅ All fonts and design system
- ✅ All layouts and navigation
- ✅ All existing functionality

## Testing Checklist

Use this checklist to verify the integration:

- [ ] Backend starts successfully on port 4000
- [ ] Frontend starts successfully on port 3000
- [ ] Can create a new account via signup page
- [ ] Receives JWT token after signup
- [ ] Redirects to appropriate dashboard after signup
- [ ] Can logout (clear localStorage)
- [ ] Can login with created account
- [ ] JWT token persists in localStorage
- [ ] API requests include Authorization header
- [ ] Can view Swagger docs at /docs
- [ ] Network tab shows successful API calls
- [ ] Error handling works for invalid credentials

## Getting Help

### Backend Issues
- Check: `version_1/lms_backend/README.md`
- Logs: Look at terminal where backend is running
- API Docs: http://localhost:4000/docs

### Frontend Issues
- Check: Browser DevTools Console
- Network Tab: See API request/response details
- localStorage: Check for auth_token

### Integration Issues
- Check: `INTEGRATION_GUIDE.md` for detailed documentation
- Check: `lib/api/quizIntegrationExample.ts` for code examples

## What's Different From Before

### Before Integration
- Login used localStorage mock auth
- No actual API calls
- Role routing based on email pattern
- No token management

### After Integration
- Login calls real backend API
- JWT token authentication
- Role from backend user object
- Automatic token injection in requests
- Error handling and loading states

## Architecture Diagram

```
┌─────────────────────┐
│   User Interface    │
│  (React/Next.js)    │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│   API Services      │
│  (auth, courses,    │
│   lessons)          │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│   API Client        │
│  (axios + JWT)      │
└──────────┬──────────┘
           │
           ↓ HTTP/REST
┌─────────────────────┐
│   Express Backend   │
│  (version_1)        │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│   MySQL Database    │
│  (TypeORM)          │
└─────────────────────┘
```

---

**Status**: ✅ Phase 1 Complete (Authentication & API Infrastructure)
**Next**: Phase 2 - Dashboard Data Integration
**Updated**: 2026-02-02
