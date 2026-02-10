# Learner Courses Page Restructure & Fix

## Changes Made

### 1. Sidebar Navigation Update
**File**: `version_keerthana/components/learner/LearnerSidebar.tsx`

- Changed "My Courses" menu item to a collapsible "Courses" parent section
- Added two sub-items:
  - **My Courses** → `/dashboard/learner/courses/my-courses` (recent/in-progress courses)
  - **Available Courses** → `/dashboard/learner/courses/available` (all published courses)
- Sidebar now shows an expandable/collapsible "Courses" section with chevron icons

### 2. New Pages Created

#### My Courses Page
**File**: `version_keerthana/app/dashboard/learner/courses/my-courses/page.tsx`

- Shows courses the learner has enrolled in or started
- Displays progress bars for each course
- Sorted by:
  1. In-progress courses first (progress > 0%)
  2. Then by last updated date
- Shows empty state with link to browse available courses if no enrollments

#### Available Courses Page
**File**: `version_keerthana/app/dashboard/learner/courses/available/page.tsx`

- Shows all published courses from backend API
- Groups courses by learning path (Full Stack, UI/UX, Data Analyst, etc.)
- Automatically syncs with backend on page load
- Shows syncing indicator while fetching
- Displays course cards with title, description, duration, and tags

### 3. Main Courses Page Redirect
**File**: `version_keerthana/app/dashboard/learner/courses/page.tsx`

- Now redirects to `/dashboard/learner/courses/my-courses` by default
- Ensures users land on the "My Courses" page when clicking "Courses" in sidebar

### 4. Backend Sync Improvements
**File**: `version_keerthana/lib/canonicalStore.ts`

#### Enhanced `syncBackendCourses()`:
- **Path Slug Inference**: Automatically infers `pathSlug` from course tags
  - Maps role tags (e.g., "Full Stack Developer") to path slugs (e.g., "fullstack")
  - Falls back to "fullstack" if no match found
- **Preserves Canonical Fields**: When updating existing courses, preserves:
  - `pathSlug` (from canonical store)
  - `modules` (course content)
  - `phase` (Foundation, Intermediate, etc.)
  - `roles` (course tags)
- **Status Updates**: Ensures courses are marked as "published" when backend says so

#### Enhanced `syncCoursesFromBackend()`:
- Better merging logic that preserves canonical-specific fields
- Updates title, description, and status from backend
- Keeps modules, pathSlug, phase, and other frontend-specific data

### 5. Context Provider Sync
**File**: `version_keerthana/context/CanonicalStoreContext.tsx`

- Already calls `syncCoursesFromBackend()` on mount
- Refreshes state after sync completes
- Ensures published courses appear in learner views

## How It Works

### Course Publishing Flow:
1. **Instructor creates course** → Saved to canonical store + backend API
2. **Instructor publishes course** → Status updated to "published" in both stores
3. **Backend sync triggered** → `syncCoursesFromBackend()` fetches published courses
4. **Courses appear for learners** → Available in "Available Courses" page
5. **Learner enrolls** → Course appears in "My Courses" page

### Path Slug Mapping:
When syncing courses from backend, the system:
1. Checks course tags for role names (e.g., "Full Stack Developer")
2. Maps to corresponding path slug (e.g., "fullstack")
3. Falls back to "fullstack" if no match
4. Preserves existing `pathSlug` if course already exists in canonical store

## Testing Checklist

- [x] Sidebar shows "Courses" with sub-items
- [x] "My Courses" page shows enrolled/in-progress courses
- [x] "Available Courses" page shows all published courses
- [x] Published courses from backend appear in learner view
- [x] Course path slugs are correctly inferred from tags
- [x] Existing course data (modules, phase) is preserved during sync
- [x] Status updates correctly when courses are published

## Files Modified

1. `version_keerthana/components/learner/LearnerSidebar.tsx` - Sidebar navigation
2. `version_keerthana/app/dashboard/learner/courses/page.tsx` - Redirect page
3. `version_keerthana/app/dashboard/learner/courses/my-courses/page.tsx` - New page
4. `version_keerthana/app/dashboard/learner/courses/available/page.tsx` - New page
5. `version_keerthana/lib/canonicalStore.ts` - Sync improvements
6. `version_keerthana/context/CanonicalStoreContext.tsx` - Already had sync logic

## Next Steps

If courses still don't appear:
1. Check backend API returns courses with `status: "published"`
2. Verify course tags match expected role names for path slug inference
3. Check browser console for sync errors
4. Manually trigger sync by refreshing the "Available Courses" page
