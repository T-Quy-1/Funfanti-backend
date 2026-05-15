# Funfanti Backend: Developer Collaboration Plan

To ensure maximum efficiency and minimal merge conflicts, the project has been divided into two independent tracks based on domain boundaries. 

The database schema (`schema.prisma`) and module skeletons are already established, allowing both developers to start immediately.

---

## 👨‍💻 Developer A: Identity & Infrastructure
**Focus:** User lifecycle, security, global utilities, and engagement.
**Working Directories:** `src/common`, `src/auth`, `src/users`

### Phase 1: Foundation (High Priority)
- **Common Services:** Implement the `CloudinaryService` inside the `CommonModule` for handling avatar and media uploads.
- **Authentication:** Implement `AuthService` and `AuthController`. 
  - Hash passwords with `bcrypt`.
  - Implement JWT generation and validation using `@nestjs/jwt` and `@nestjs/passport`.
  - Create a reusable `JwtAuthGuard` and a `@CurrentUser()` custom decorator.

### Phase 2: User Profiles
- **User Profile:** Implement endpoints to fetch/update profiles (`GET /users/me`, `PUT /users/me`).
- **Avatar Upload:** Integrate `CloudinaryService` into the profile update flow.
- **Preferences:** Implement UI and lock-screen preference updates (`PUT /users/me/preferences`).

### Phase 3: Engagement & Scheduling
- **Bookmarks:** Implement endpoints to retrieve saved question sets (`GET /users/me/bookmarks`). *(Coordinate with Dev B for the POST endpoint)*.
- **Notification Schedules:** Set up `@nestjs/schedule` or `BullMQ` to poll the `NotificationSchedule` table and trigger lock-screen events.

---

## 👩‍💻 Developer B: Core Gameplay & Content
**Focus:** Content delivery, quiz mechanics, scoring, and analytics.
**Working Directories:** `src/question-sets`, `src/quiz-sessions`

### Phase 1: Content Discovery (High Priority)
- **Question Sets (Discovery):** Implement `GET /question-sets` with Prisma filtering (topic, `isFeatured`) and sorting.
- **Question Set Details:** Implement `GET /question-sets/:id` fetching metadata and tags.
- **Payload Aggregation:** Implement `GET /question-sets/:id/questions`. 
  - *Crucial task:* Use Prisma's `include` to fetch the `Question` and its nested `AnswerChoices` in a single query to ensure offline-style mobile performance.

### Phase 2: Quiz Mechanics & Scoring
- **Session Tracking:** Implement `POST /quiz-sessions/:id/submit`. 
  - Calculate scores based on the submitted `QuestionResponses`.
  - Update the `QuizSession` total time and status (`COMPLETED`).
- **Bookmark Creation:** Implement `POST /question-sets/:id/bookmark`.

### Phase 3: Analytics (MVP)
- **User Activity:** Implement endpoints or extend the session submission response to return comparative analytics (e.g., "You scored 8/10 in 15 seconds").

---

## 🤝 Integration & Collaboration Rules

1. **Unblocking Dev B Early:** 
   - Dev B does not need to wait for Dev A to finish Authentication. 
   - Dev B can build the QuestionSet and QuizSession endpoints using a hardcoded `userId` (e.g., passing `?devUserId=123` or mocking the `req.user`). 
   - Once Dev A finishes the `JwtAuthGuard`, Dev B simply adds `@UseGuards(JwtAuthGuard)` to their controllers and uses the real `req.user.id`.
2. **Database Schema Changes:** 
   - The ERD is mostly final, but if schema changes are needed, communicate them before running `npx prisma migrate dev`.
3. **Swagger Documentation:** 
   - Both developers are responsible for decorating their respective DTOs (Data Transfer Objects) and Controllers with `@nestjs/swagger` decorators as they build.
