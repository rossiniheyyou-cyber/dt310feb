# Product Backlog — DigitalT3 Learning Insights Platform

*User-value focused. Answers "What will the product do?" — not how we build it or which tech we use.*

---

## How to Use in Excel

Suggested columns:

| Column        | Content                                      |
|---------------|----------------------------------------------|
| Epic ID       | E1, E2, E3 …                                 |
| Epic Name     | Name of the epic                             |
| Story ID      | E1-S1, E1-S2 …                               |
| Story         | User story title                             |
| Priority      | P1 (Must) / P2 (Should) / P3 (Could)         |
| Acceptance Criteria | Bullet list below each story          |

Copy the sections below into rows; one row per story, with acceptance criteria in one cell or in a separate sheet linked by Story ID.

---

## Epic 1: User Identity & Access

*Users can create an account, sign in securely, and reach the right experience for their role.*

| Story ID | User Story | Priority |
|----------|------------|----------|
| E1-S1 | As a **new user**, I can **create an account with my name, email, and password** so that I can access the platform. | P1 |
| **Acceptance criteria** | • I can enter name, email, and password on a signup page.<br>• I see a clear error if email is already in use or password is too short.<br>• After successful signup I am signed in and taken to the right dashboard for my role.<br>• I am not shown technical or system errors; only user-friendly messages. |
| E1-S2 | As a **registered user**, I can **sign in with my email and password** so that I can use the platform. | P1 |
| **Acceptance criteria** | • I can enter email and password on a login page.<br>• I see a clear error if my credentials are wrong.<br>• After successful login I am taken to my role’s dashboard (Learner, Instructor, Admin, or Manager).<br>• I stay signed in until I sign out or my session expires. |
| E1-S3 | As a **signed-in user**, I can **sign out** so that no one else can use my account on this device. | P1 |
| **Acceptance criteria** | • I have a visible way to sign out (e.g. menu or button).<br>• After signing out I am taken to a public or login page and cannot access protected areas without signing in again. |
| E1-S4 | As a **signed-in user**, I can **see who I am** (e.g. name) in the interface so that I know I’m in the right account. | P2 |
| **Acceptance criteria** | • My display name (or email) appears in a consistent place (e.g. header or profile area).<br>• It reflects the name I used when I signed up or that an admin set. |

---

## Epic 2: Learning Content & Courses

*Learners can discover, start, and follow courses and see what they contain.*

| Story ID | User Story | Priority |
|----------|------------|----------|
| E2-S1 | As a **learner**, I can **see a list of courses I can take** so that I can choose what to learn. | P1 |
| **Acceptance criteria** | • I see course titles and short descriptions (and optionally instructor, duration, or tags).<br>• The list only shows courses that are available to me (e.g. published).<br>• I can tell which courses I have started and which I have not. |
| E2-S2 | As a **learner**, I can **open a course and see its contents** (e.g. lessons, order) so that I know what I will learn. | P1 |
| **Acceptance criteria** | • I can open a course and see a clear list of lessons or modules in order.<br>• I can see my progress in that course (e.g. completed vs remaining).<br>• I can start or continue from where I left off. |
| E2-S3 | As a **learner**, I can **view a lesson** (text, and optionally video) so that I can learn the material. | P1 |
| **Acceptance criteria** | • I can open a lesson and read its content.<br>• If the lesson has a video, I can play it in the browser without leaving the platform.<br>• I can move to the next or previous lesson from within the course. |
| E2-S4 | As a **learner**, I can **search or filter courses** (e.g. by keyword or topic) so that I can find relevant content quickly. | P2 |
| **Acceptance criteria** | • I have a way to search or filter the course list.<br>• Results update to match my search or filters.<br>• I see a clear state when no courses match (e.g. “No courses found”). |
| E2-S5 | As a **learner**, I can **see learning paths or groupings of courses** (if offered) so that I can follow a structured journey. | P2 |
| **Acceptance criteria** | • I can see learning paths (or course groups) and their descriptions.<br>• I can open a path and see which courses it includes and my progress across them.<br>• I can start a path or continue from where I left off. |

---

## Epic 3: Assessments & Quizzes

*Learners can take quizzes, see results, and understand how they did.*

| Story ID | User Story | Priority |
|----------|------------|----------|
| E3-S1 | As a **learner**, I can **take a quiz** linked to a lesson or course so that I can check my understanding. | P1 |
| **Acceptance criteria** | • I can start a quiz from the lesson or course (e.g. “Take quiz” button).<br>• I see questions one at a time or in a clear list, and can select answers.<br>• I can submit the quiz when I am done.<br>• I see my score and whether I passed (if a passing threshold exists). |
| E3-S2 | As a **learner**, I can **see my quiz result** (score and pass/fail) so that I know how I performed. | P1 |
| **Acceptance criteria** | • After submitting I see my score (e.g. percentage or points).<br>• I see pass/fail if the quiz has a passing rule.<br>• I can return to the course or lesson or see what to do next. |
| E3-S3 | As a **learner**, I can **review which answers were correct or wrong** (if the product supports it) so that I can learn from mistakes. | P2 |
| **Acceptance criteria** | • I have a way to review my quiz (e.g. “Review” or “See answers”).<br>• I can see which questions I got right or wrong and what the correct answer was.<br>• This is available after I submit, without retaking the quiz. |
| E3-S4 | As a **learner**, I can **see my readiness or skill score** (if the product shows it) so that I know my overall standing. | P2 |
| **Acceptance criteria** | • I have a place (e.g. dashboard or profile) where a readiness or skill score is shown.<br>• The score updates when I complete quizzes or activities as designed.<br>• The meaning is explained (e.g. label or short description). |

---

## Epic 4: Progress & Dashboard

*Learners and managers see progress and next steps; the experience is role-appropriate.*

| Story ID | User Story | Priority |
|----------|------------|----------|
| E4-S1 | As a **learner**, I can **see my dashboard** with my progress and next steps so that I know what to do next. | P1 |
| **Acceptance criteria** | • After login I land on a learner dashboard (or home).<br>• I see at least: courses in progress, progress (e.g. % or completed/total), and a clear “continue” or “next” action.<br>• I can open any in-progress course or start a new one from the dashboard. |
| E4-S2 | As a **learner**, I can **see my progress in a course** (e.g. completed lessons, percentage) so that I know how much is left. | P1 |
| **Acceptance criteria** | • Within a course I see how many lessons I’ve completed and how many remain.<br>• I see an overall course progress (e.g. percentage or bar).<br>• Progress updates when I complete a lesson or quiz. |
| E4-S3 | As a **learner**, I can **see my recent activity** (e.g. last course or lesson) so that I can resume quickly. | P2 |
| **Acceptance criteria** | • My dashboard or home shows recent activity (e.g. “Last viewed” or “Continue learning”).<br>• I can open that content in one click.<br>• The list reflects my actual recent activity. |
| E4-S4 | As a **manager**, I can **see a manager dashboard** with high-level learning metrics so that I can track team or org learning. | P2 |
| **Acceptance criteria** | • After login as manager I see a manager-specific dashboard.<br>• I see aggregate metrics (e.g. completion rates, courses in progress, learners active).<br>• I can drill into learners or courses if the product supports it. |
| E4-S5 | As an **instructor**, I can **see an instructor dashboard** with my courses and content so that I can manage what I teach. | P2 |
| **Acceptance criteria** | • After login as instructor I see an instructor dashboard.<br>• I see the courses I created or manage.<br>• I can open a course to edit or view content and, if supported, learner progress. |

---

## Epic 5: Content Management (Instructors & Admins)

*Instructors and admins can create and manage courses and lessons.*

| Story ID | User Story | Priority |
|----------|------------|----------|
| E5-S1 | As an **instructor or admin**, I can **create a course** (title, description) so that learners can take it. | P1 |
| **Acceptance criteria** | • I have a way to create a new course (e.g. “New course” button).<br>• I can enter at least title and description.<br>• After saving, the course appears in my list and can be edited or published. |
| E5-S2 | As an **instructor or admin**, I can **add lessons to a course** (title, content, order) so that the course has clear steps. | P1 |
| **Acceptance criteria** | • I can add lessons to a course and set their order.<br>• For each lesson I can enter title and content (text).<br>• I can reorder lessons and the order is saved. |
| E5-S3 | As an **instructor or admin**, I can **publish or unpublish a course** so that learners only see courses I intend to offer. | P1 |
| **Acceptance criteria** | • I can set a course to published or draft (or equivalent).<br>• Only published courses appear in the learner course list.<br>• I can change the status back to draft to hide it from learners. |
| E5-S4 | As an **instructor or admin**, I can **upload a video** for a lesson so that the lesson includes video content. | P1 |
| **Acceptance criteria** | • I have an option to attach or upload a video to a lesson.<br>• I can choose a file and upload it; I see success or a clear error.<br>• Learners can play that video when they open the lesson. |
| E5-S5 | As an **instructor or admin**, I can **edit or delete a course or lesson** so that I can fix mistakes or remove outdated content. | P2 |
| **Acceptance criteria** | • I can edit title, description, and content of courses and lessons.<br>• I can delete a lesson or course (with a confirmation step).<br>• Deleting does not break the rest of the platform (e.g. links or progress handling). |
| E5-S6 | As an **instructor or admin**, I can **generate a quiz from lesson content** (e.g. via AI or template) so that learners can be assessed. | P2 |
| **Acceptance criteria** | • I have a way to generate a quiz for a lesson (e.g. “Generate quiz” or “Add quiz”).<br>• The quiz has a reasonable number of questions and answer options.<br>• Learners can take that quiz and see their score. |

---

## Epic 6: Assignments & Submissions

*Learners can complete assignments; instructors can see submissions.*

| Story ID | User Story | Priority |
|----------|------------|----------|
| E6-S1 | As a **learner**, I can **see my assignments** (due date, course, status) so that I know what to complete. | P1 |
| **Acceptance criteria** | • I have a list or view of assignments assigned to me.<br>• I see at least: assignment title, course, and due date (if applicable).<br>• I can tell which are not started, in progress, or submitted. |
| E6-S2 | As a **learner**, I can **submit an assignment** (e.g. upload a file or enter text) so that my work is recorded. | P1 |
| **Acceptance criteria** | • I can open an assignment and submit (e.g. upload file or type response).<br>• I see confirmation that my submission was received.<br>• I cannot accidentally submit twice without a clear flow (e.g. replace or resubmit). |
| E6-S3 | As an **instructor or admin**, I can **create an assignment** for a course and set requirements so that learners know what to do. | P2 |
| **Acceptance criteria** | • I can create an assignment and link it to a course.<br>• I can set title, instructions, and optionally due date and submission type (e.g. file upload).<br>• The assignment appears for learners in that course. |
| E6-S4 | As an **instructor or admin**, I can **view learner submissions** for an assignment so that I can grade or review. | P2 |
| **Acceptance criteria** | • I can open an assignment and see a list of submissions (or “no submissions yet”).<br>• I can open each submission (e.g. view file or text).<br>• I can record feedback or grade if the product supports it. |

---

## Epic 7: Certificates & Achievements

*Learners can earn and view certificates or achievements.*

| Story ID | User Story | Priority |
|----------|------------|----------|
| E7-S1 | As a **learner**, I can **see my certificates** (or completed achievements) so that I can prove or celebrate completion. | P2 |
| **Acceptance criteria** | • I have a place (e.g. “Certificates” or “Achievements”) where I see what I’ve earned.<br>• Each item shows what it was for (e.g. course name) and when I earned it.<br>• I can open or download a certificate if the product supports it. |
| E7-S2 | As a **learner**, I can **receive a certificate** when I complete a course or path so that my achievement is recognized. | P2 |
| **Acceptance criteria** | • When I complete a course (or path) that grants a certificate, I receive it automatically.<br>• I see a notification or can find it in my certificates list.<br>• The certificate clearly states the course or program name. |
| E7-S3 | As an **admin or instructor**, I can **define when a certificate is awarded** (e.g. on course completion) so that rules are clear. | P3 |
| **Acceptance criteria** | • I can configure at least one rule for awarding a certificate (e.g. “When course X is completed”).<br>• When a learner meets the rule, they receive the certificate.<br>• I can see which learners have been awarded which certificates if the product supports it. |

---

## Epic 8: Administration & Users

*Admins can manage users and platform settings.*

| Story ID | User Story | Priority |
|----------|------------|----------|
| E8-S1 | As an **admin**, I can **see a list of users** (learners, instructors) so that I can manage accounts. | P2 |
| **Acceptance criteria** | • I have a user list or admin view showing users (e.g. name, email, role).<br>• I can search or filter by role or name.<br>• I can open a user to see details or edit (if supported). |
| E8-S2 | As an **admin**, I can **change a user’s role** (e.g. learner to instructor) so that permissions are correct. | P2 |
| **Acceptance criteria** | • I can edit a user and set their role (e.g. Learner, Instructor, Admin, Manager).<br>• After saving, the user’s next login reflects the new role (e.g. correct dashboard).<br>• I cannot remove the last admin (or there is a safeguard). |
| E8-S3 | As an **admin**, I can **view reports** (e.g. completion, activity) so that I can monitor platform usage. | P2 |
| **Acceptance criteria** | • I have a reports or analytics area.<br>• I can see at least high-level metrics (e.g. completions, active learners, popular courses).<br>• Data is accurate and up to date for the defined period. |
| E8-S4 | As an **admin**, I can **access admin-only settings** (e.g. branding, defaults) so that I can configure the platform. | P3 |
| **Acceptance criteria** | • I have a settings or configuration area that only admins can access.<br>• I can change at least one platform-wide setting (e.g. default role, or feature flags).<br>• Changes are saved and applied across the product as designed. |

---

## Epic 9: Media & Resources

*Learners and instructors can use and manage files and media securely.*

| Story ID | User Story | Priority |
|----------|------------|----------|
| E9-S1 | As an **instructor or admin**, I can **upload a file** (e.g. video or document) for a lesson or resource so that content is rich. | P1 |
| **Acceptance criteria** | • I can start an upload (e.g. “Upload” button) and select a file.<br>• I see progress or confirmation; if it fails, I see a clear message.<br>• The file is then available where I attached it (e.g. in the lesson). |
| E9-S2 | As a **learner**, I can **view or play media** (e.g. video) that my instructor added so that I can learn from it. | P1 |
| **Acceptance criteria** | • When a lesson or resource has video (or other media), I can play or view it in the browser.<br>• Playback works without leaving the platform or exposing internal system details.<br>• If the media is unavailable, I see a friendly message. |
| E9-S3 | As a **learner**, I can **upload a file** when submitting an assignment so that I can submit documents or deliverables. | P1 |
| **Acceptance criteria** | • When an assignment allows file upload, I can select and upload a file.<br>• I see confirmation that my file was submitted.<br>• File type and size limits are clear when they apply. |
| E9-S4 | As an **instructor or admin**, I can **manage or remove uploaded files** (e.g. replace a lesson video) so that content stays correct. | P2 |
| **Acceptance criteria** | • I can remove or replace a file I uploaded (e.g. for a lesson).<br>• After removal, learners no longer see the old file.<br>• I do not see raw system paths or internal IDs; only user-friendly labels. |

---

## Epic 10: Help, Settings & Profile

*Users can manage their profile and get basic help.*

| Story ID | User Story | Priority |
|----------|------------|----------|
| E10-S1 | As a **signed-in user**, I can **update my profile** (e.g. name, email) so that my information is correct. | P2 |
| **Acceptance criteria** | • I have a profile or account settings page.<br>• I can change at least my display name; email change is supported or clearly not supported (e.g. “Contact admin”).<br>• I see confirmation when I save; changes appear in the UI (e.g. header). |
| E10-S2 | As a **signed-in user**, I can **change my password** so that I can keep my account secure. | P2 |
| **Acceptance criteria** | • I have a way to change my password (e.g. “Change password” in settings).<br>• I must enter my current password and the new one (and confirm).<br>• I see success or clear validation errors (e.g. “Current password incorrect”). |
| E10-S3 | As a **user**, I can **see help or guidance** (e.g. how to start a course, where to find certificates) so that I can use the platform. | P3 |
| **Acceptance criteria** | • I can find help (e.g. help link, tooltips, or short guides).<br>• Help covers at least: how to take a course, how to take a quiz, and where to find my progress or certificates.<br>• Help is easy to find from the main areas (e.g. dashboard, header). |

---

## Priority Legend

| Priority | Meaning |
|----------|--------|
| **P1** | Must have — core value; release is incomplete without it. |
| **P2** | Should have — important for a good experience; plan for near-term releases. |
| **P3** | Could have — nice to have; schedule when capacity allows. |

---

## Excel-Friendly Summary (Copy-Paste)

Use one row per story. Example:

| Epic ID | Epic Name | Story ID | User Story | Priority | Acceptance Criteria |
|---------|------------|----------|-------------|----------|---------------------|
| E1 | User Identity & Access | E1-S1 | As a new user, I can create an account with my name, email, and password so that I can access the platform. | P1 | • I can enter name, email, and password on a signup page. • I see a clear error if email is already in use or password is too short. • After successful signup I am signed in and taken to the right dashboard for my role. • I am not shown technical or system errors; only user-friendly messages. |
| E1 | User Identity & Access | E1-S2 | As a registered user, I can sign in with my email and password so that I can use the platform. | P1 | • I can enter email and password on a login page. • I see a clear error if my credentials are wrong. • After successful login I am taken to my role’s dashboard. • I stay signed in until I sign out or my session expires. |
| … | … | … | … | … | … |

Repeat for each story above; acceptance criteria can stay in one cell or be split into multiple rows per criterion.

---

*Backlog is user-value focused: it describes what the product will do for users, not implementation or technology choices.*
