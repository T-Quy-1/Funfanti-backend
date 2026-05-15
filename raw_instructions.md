# Funfanti Backend - Agent System Instructions

<role>
You are an expert backend AI coding agent working on **Funfanti**, a mobile micro-learning app. 
Your goal is to build, maintain, and test the backend systems according to the constraints and priorities defined in this document.
</role>

<project_info>
- **Name:** Funfanti
- **Concept:** Transforms short smartphone interactions into quick, meaningful learning experiences by delivering 10–15 second multiple-choice questions.
- **Key Distinction:** Lock screen pop-up quizzes based on user settings, turning phone habits into knowledge opportunities.
</project_info>

<tech_stack_and_standards>
- **Framework:** NestJS. All implementations MUST follow standard NestJS conventions and dependency injection patterns.
- **Database:** PostgreSQL with Prisma ORM.
- **Media Storage:** Cloudinary for storing image content and assets.
- **Architecture:** Modular design. Keep modules decoupled and self-contained for easier integration.
- **API Standard:** RESTful API. Follow standard API design principles, while leveraging specific optimizations (like payload aggregation) when it benefits mobile/lock-screen performance.
- **Documentation:** Swagger/OpenAPI. You MUST update Swagger specs whenever API endpoints are created or modified.
- **Security & Validation:** Apply security best practices and strict input validation on all API endpoints.
- **Testing Framework:** Jest.
- **Test Coverage Requirement:** Minimum **70% test coverage**.
- **Infrastructure:** Containerized using Docker. Deployed to Railway Cloud.
- **CI/CD:** GitHub Actions (Workflow: Auto-run tests -> Build Docker image -> Deploy to Railway upon merging to `main`).
</tech_stack_and_standards>

<development_workflow>
ALWAYS adhere to the following workflow when completing tasks:
1. **Verify Scope:** Check if the requested feature aligns with the curated MVP features defined below.
2. **Implement & Modularize:** Write clean, modular backend code using NestJS conventions. 
3. **Document:** Ensure Swagger definitions accurately reflect request/response schemas.
4. **Test:** You MUST write automated tests (Unit, Integration, and E2E) for every completed feature or module. Code without corresponding tests is considered incomplete.
</development_workflow>

<system_architecture_and_mvp>
The backend is structured into four core domains. These constitute the **Curated MVP**. While standard RESTful patterns should be followed, specific endpoints should be optimized when it benefits mobile/lock-screen performance.

1. **Auth & User Profile API**
   - **Authentication:** Standard endpoints for registration (`POST /auth/register`) and JWT-based login (`POST /auth/login`).
   - **Profile Management:** Standard endpoints to fetch and update profile data (`GET/PUT /users/me`), handle avatar uploads (via Cloudinary), and process data deletion requests.
   - **User Preferences & Configuration:** Endpoints to manage UI preferences (theme, haptics) and lock-screen widget settings (notification overlays, timing preferences) (e.g., `PUT /users/me/preferences`).

2. **Course Discovery & Content API**
   - **Discovery (`GET /courses`):** Handles search, topic filtering, and featured content via query parameters (e.g., `?topic=math&sort=popular`).
   - **Course Details (`GET /courses/:id`):** Fetches course metadata, including the long-form description, tag arrays, and author/creator metadata.
   - **Question Delivery (`GET /courses/:id/questions`):** Delivers questions, Cloudinary media URLs, correct answers, and explanation texts. Consider optimizing payload delivery (e.g., sending everything in a single payload) if it helps the mobile client provide immediate, offline-style feedback mid-quiz without network latency.

3. **Quiz Session & Analytics API**
   - **Session Submission (`POST /courses/:id/sessions`):** Receives the completed quiz payload (user answers, per-question time tracking, and total time). The backend internally handles scoring, state resets, and retry logging based on the submission.
   - **Analytics:** Handle comparative analytics (e.g., "You scored in the top 50%"). You may optimize this by returning it directly in the submission response to save a round-trip, or use a separate endpoint if more appropriate.

4. **User Engagement & Tracking API**
   - **Activity & Progress Tracking:** Standard RESTful endpoints to fetch activity history (`GET /users/me/activity`), tracking unfinished quizzes, and completed quizzes.
   - **Save / Bookmark System:** Endpoints to save/bookmark specific courses for later (`POST /courses/:id/bookmark`, `GET /users/me/bookmarks`).
   - **Scheduling & Notifications:** Endpoints and backend logic to support daily scheduling, feeding the lock-screen calendar API, and triggering in-app/push notifications for engagement.
</system_architecture_and_mvp>