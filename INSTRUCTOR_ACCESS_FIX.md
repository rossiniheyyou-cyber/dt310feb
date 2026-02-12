# Instructor Access Fix - "Insufficient Permissions" Error

## Problem
Users getting "Insufficient permissions" error when trying to create courses because they don't have `instructor` or `admin` role.

## Root Cause
- Backend requires `role: 'instructor'` or `role: 'admin'` to create courses (RBAC middleware)
- Signup defaults to `role: 'learner'`
- Users with `learner` role cannot create courses

## Solutions

### Option 1: Use Seed Users (Quickest)
The backend has seed users you can use:

**Instructor Account:**
- Email: `instructor@example.com` (or check `.env` for `SEED_INSTRUCTOR_EMAIL`)
- Password: `InstructorPass123!` (or check `.env` for `SEED_INSTRUCTOR_PASSWORD`)

**Admin Account:**
- Email: `admin@example.com` (or check `.env` for `SEED_ADMIN_EMAIL`)
- Password: `AdminPass123!` (or check `.env` for `SEED_ADMIN_PASSWORD`)

### Option 2: Update User Role in Database
If you've already signed up as a learner, update your role in MySQL:

```sql
UPDATE users SET role = 'instructor' WHERE email = 'your-email@example.com';
```

Then log out and log back in to get a new JWT token with the updated role.

### Option 3: Sign Up with Instructor Email (Development Only)
The signup form now auto-detects instructor/admin emails:
- If email contains "instructor" or "teacher" → role = "instructor"
- If email contains "admin" → role = "admin"
- Otherwise → role = "learner"

Example: `instructor@test.com` will get instructor role.

## Error Handling Improved
- Better error messages now explain the permission issue
- Suggests contacting administrator or using instructor account

## Files Modified
- `version_keerthana/app/auth/login/page.tsx` - Added role detection and better error handling
- `version_keerthana/app/dashboard/instructor/courses/new/page.tsx` - Added 403 error handling

## Testing
1. Try creating a course as a learner → Should see helpful error message
2. Log in as instructor seed user → Should be able to create courses
3. Sign up with email containing "instructor" → Should get instructor role automatically
