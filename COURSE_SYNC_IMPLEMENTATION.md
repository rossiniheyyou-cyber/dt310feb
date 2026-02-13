# Course Sync Implementation - Instructor to Learner

## Problem
Courses created by instructors were only saved to localStorage (CanonicalStore) and not visible to learners, who fetch courses from the backend API.

## Solution Implemented

### 1. Instructor Course Creation (`app/dashboard/instructor/courses/new/page.tsx`)
- **Before**: Only saved to `useCanonicalStore` (localStorage)
- **After**: 
  - Creates course in backend API via `createCourse()`
  - Also saves to canonical store for frontend features (roles, phase, pathSlug, modules)
  - Uses backend course ID to keep them in sync

### 2. Instructor Course Publishing (`app/dashboard/instructor/courses/[id]/page.tsx`)
- **Before**: Only updated canonical store
- **After**:
  - Updates canonical store (for immediate UI update)
  - Syncs to backend API via `updateCourseAPI()` with `status: "published"`
  - If course doesn't exist in backend, creates it
  - Refreshes canonical store after sync

### 3. Backend Sync (`lib/canonicalStore.ts`)
- Added `syncCoursesFromBackend()` function that:
  - Fetches all published courses from backend API
  - Merges with existing canonical courses
  - Preserves canonical-specific fields (roles, phase, pathSlug, modules)
  - Updates course metadata (title, description, status) from backend

### 4. Automatic Sync (`context/CanonicalStoreContext.tsx`)
- On app mount, automatically syncs courses from backend
- Runs in background, doesn't block UI
- Refreshes state after sync completes

## How It Works

### Course Creation Flow:
1. Instructor fills form → clicks "Create Course"
2. Frontend calls `createCourse()` API → Course saved to backend database
3. Backend returns course with ID
4. Frontend saves to canonical store using backend ID
5. Course appears in instructor's course list

### Course Publishing Flow:
1. Instructor clicks "Publish" on a draft course
2. Frontend updates canonical store (status → "published")
3. Frontend calls `updateCourseAPI()` → Backend updates course status
4. Canonical store syncs with backend
5. Course now appears for learners (who fetch published courses)

### Learner View Flow:
1. Learner visits "My Courses" or learning path
2. Component calls `getPublishedCoursesForPath()` from canonical store
3. Canonical store has synced data from backend (on app load)
4. Learner sees all published courses created by instructors

## Data Flow

```
Instructor Creates Course
    ↓
Backend API (/api/courses POST)
    ↓
MySQL Database (courses table)
    ↓
Canonical Store Sync (on app load)
    ↓
Learner Views Courses
```

## Key Features

1. **Dual Storage**: Courses saved to both backend (for learners) and canonical store (for instructor features)
2. **ID Synchronization**: Uses backend course ID in canonical store to keep them linked
3. **Automatic Sync**: Backend courses automatically appear in canonical store on app load
4. **Field Preservation**: Canonical-specific fields (roles, phase, modules) preserved when syncing
5. **Real-time Updates**: Publishing immediately syncs to backend

## Testing

To verify it works:
1. **As Instructor**: Create a new course → Should see it in your course list
2. **As Instructor**: Publish the course → Should see status change to "Published"
3. **As Learner**: Visit "My Courses" → Should see the published course
4. **Check Backend**: Course should exist in MySQL `courses` table with `status = 'published'`

## Files Modified

- `version_keerthana/app/dashboard/instructor/courses/new/page.tsx` - Added backend API call
- `version_keerthana/app/dashboard/instructor/courses/[id]/page.tsx` - Added backend sync on publish
- `version_keerthana/lib/canonicalStore.ts` - Added backend sync function
- `version_keerthana/context/CanonicalStoreContext.tsx` - Added auto-sync on mount

## Notes

- Courses created before this update won't automatically sync (they're only in localStorage)
- To sync existing courses: Instructors need to republish them or manually sync
- Backend course schema is simpler (title, description, status, tags) than canonical format
- Canonical store preserves extra fields (roles, phase, modules) that backend doesn't have
