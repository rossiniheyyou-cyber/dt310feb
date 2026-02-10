# Role-Based AI Bots Implementation

## Overview
Implemented three role-specific AI bots for the DigitalT3 LMS, each tailored to the unique needs of different user roles:

1. **Instructor Co-Teacher** - Reduces administrative friction
2. **Manager Performance Strategist** - Provides team performance insights
3. **Admin System Architect** - Handles system administration and automation

## Implementation Details

### Backend Changes

#### 1. AI Service (`version_1/lms_backend/src/services/ai.js`)
- Enhanced `chat()` method to support role-based system prompts
- Added support for `userRole` parameter: `'instructor' | 'manager' | 'admin' | 'learner'`
- Role-specific system prompts:
  - **Instructor**: Focuses on content generation, grading, at-risk student detection, and communication automation
  - **Manager**: Emphasizes team progress tracking, skill gap analysis, automated nudges, and resource allocation
  - **Admin**: Concentrates on user management, compliance monitoring, troubleshooting, and system optimization
- Context injection for each role:
  - Instructor: Courses, student stats, at-risk students
  - Manager: Team progress, skill gaps, compliance status
  - Admin: System statistics, user counts, course counts

#### 2. AI Routes (`version_1/lms_backend/src/routes/ai.js`)
- Updated `/api/ai/chat` endpoint to:
  - Detect user role from `req.user.role` (set by auth middleware)
  - Auto-select appropriate bot type based on role
  - Fetch role-specific context from database:
    - **Instructor**: Their courses, student enrollment counts, at-risk students (placeholder)
    - **Manager**: Team progress metrics, average readiness scores, skill gaps (placeholder)
    - **Admin**: System-wide statistics (total users, courses, lessons, active learners)
  - Return `userRole` in response for frontend use

### Frontend Changes

#### 1. API Client (`version_keerthana/lib/api/ai.ts`)
- Extended `AIChatType` to include: `'instructor' | 'manager' | 'admin'`
- Added new functions:
  - `chatWithInstructorBot()` - For instructor Co-Teacher
  - `chatWithManagerBot()` - For manager Performance Strategist
  - `chatWithAdminBot()` - For admin System Architect
- Updated `AIChatResponse` to include optional `userRole` field

#### 2. Role-Specific Components

**Instructor Co-Teacher Modal** (`version_keerthana/components/instructor/InstructorCoTeacherModal.tsx`)
- Modal component with indigo/purple theme
- Suggested prompts: "Generate a quiz", "Show me students who are struggling", "Create a course summary"
- Integrated into Instructor Dashboard

**Manager Performance Strategist** (`version_keerthana/components/manager/ManagerPerformanceBot.tsx`)
- Modal component with blue/cyan theme
- Suggested prompts: "Show me team compliance training status", "Identify skill gaps", "Where is our training budget most effective?"
- Integrated into Manager Dashboard

**Admin System Architect** (`version_keerthana/components/admin/AdminSystemArchitectBot.tsx`)
- Modal component with slate/gray theme
- Suggested prompts: "Show me system statistics", "Generate a compliance report", "Help me troubleshoot integration issues"
- Integrated into Admin Dashboard

#### 3. Dashboard Integrations

**Instructor Dashboard** (`version_keerthana/app/dashboard/instructor/page.tsx`)
- Added prominent "Co-Teacher AI" card at the top
- Button opens `InstructorCoTeacherModal`
- Styled with indigo gradient

**Manager Dashboard** (`version_keerthana/app/dashboard/manager/page.tsx`)
- Added "Performance Strategist" card
- Button opens `ManagerPerformanceBot` modal
- Styled with blue gradient

**Admin Dashboard** (`version_keerthana/app/dashboard/admin/page.tsx`)
- Added "System Architect" card
- Button opens `AdminSystemArchitectBot` modal
- Styled with slate gradient

## Role-Specific Capabilities

### Instructor Co-Teacher
- **Content Generation**: Create course summaries, quizzes, or full modules from prompts
- **Grading & Feedback**: Assist in grading assessments and provide personalized feedback
- **Predictive Support**: Flag at-risk students who are falling behind
- **Communication**: Automate responses to routine student queries

### Manager Performance Strategist
- **Team Progress Tracking**: At-a-glance status of team compliance training
- **Skill Gap Analysis**: Identify high-potential employees and suggest upskilling modules
- **Automated Nudges**: Suggest intelligent nudges for employees who haven't started training
- **Resource Allocation**: Analyze engagement data to show budget effectiveness

### Admin System Architect
- **User Management**: Automate enrollments, manage user roles, set up permissions
- **Compliance Monitoring**: Track regulatory standards and generate audit reports
- **Troubleshooting**: Act as technical FAQ for LMS integration issues
- **System Optimization**: Suggest improvements based on system-wide analytics

## Technical Notes

### Context Fetching
- Backend automatically fetches relevant context based on user role
- Database queries are wrapped in try-catch to prevent failures from blocking AI responses
- Placeholder implementations for:
  - At-risk student detection (instructor)
  - Skill gap analysis (manager)
  - Enrollment tracking (instructor)

### Error Handling
- All AI errors return user-friendly fallback messages
- Role-specific error messages (e.g., "Co-Teacher is currently unavailable")
- Graceful degradation if context fetching fails

### Security
- User role is extracted from authenticated JWT token (`req.user.role`)
- No role can access another role's bot functionality
- All requests require authentication via `auth` middleware

## Future Enhancements

1. **At-Risk Student Detection**: Implement actual algorithm to identify struggling students
2. **Skill Gap Analysis**: Build ML-based skill gap identification
3. **Enrollment Tracking**: Add proper enrollment relationship tracking
4. **Compliance Reports**: Generate actual compliance reports from database
5. **Automated Nudges**: Implement actual notification system for managers
6. **Content Generation Actions**: Make content generation actually create courses/quizzes in DB

## Testing

To test each bot:
1. Log in as the respective role (instructor/manager/admin)
2. Navigate to the dashboard
3. Click the AI bot card/button
4. Try suggested prompts or ask custom questions
5. Verify responses are role-appropriate and context-aware

## Files Modified/Created

### Backend
- `version_1/lms_backend/src/services/ai.js` - Enhanced with role-based prompts
- `version_1/lms_backend/src/routes/ai.js` - Added role detection and context fetching

### Frontend
- `version_keerthana/lib/api/ai.ts` - Extended API client
- `version_keerthana/components/instructor/InstructorCoTeacherModal.tsx` - New component
- `version_keerthana/components/manager/ManagerPerformanceBot.tsx` - New component
- `version_keerthana/components/admin/AdminSystemArchitectBot.tsx` - New component
- `version_keerthana/app/dashboard/instructor/page.tsx` - Integrated Co-Teacher
- `version_keerthana/app/dashboard/manager/page.tsx` - Integrated Performance Strategist
- `version_keerthana/app/dashboard/admin/page.tsx` - Integrated System Architect
