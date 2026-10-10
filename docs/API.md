# REST API Reference

The API is implemented by the Express routers in `server/routes/` and mounted under `/api`. Responses use JSON unless an endpoint accepts a file upload. Replace `{id}` with a MongoDB document ID.

## Base URLs

- Local: `http://localhost:5000`
- Production: `https://cognevance-online-course-management-qgtp.onrender.com`

The frontend's Vercel URL is not available in the repository; add it to the project README after copying it from the Vercel deployment page.

## Authentication

For protected endpoints, send the JWT returned by `POST /api/auth/login`:

```http
Authorization: Bearer <token>
```

Roles in the table reflect checks in the route handlers. `Public` means no token is required; `User` means any authenticated account; `Admin` and `Student` are role-restricted.

## Authentication and Profile

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Public | Register an account (`name`, `email`, `password`, optional `role`). |
| POST | `/api/auth/login` | Public | Authenticate and return a JWT and user. |
| GET | `/api/auth/me` | User | Get the authenticated user's profile. |
| PUT | `/api/auth/me` | User | Update profile; accepts multipart form data and optional PDF/Word `resume` upload (5 MB limit). |

## Courses and Progress

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/api/courses` | Public | List courses. |
| GET | `/api/courses/{id}` | Public | Get a course. |
| POST | `/api/courses` | Admin | Create a course. |
| PUT | `/api/courses/{id}` | Admin | Update a course. |
| DELETE | `/api/courses/{id}` | Admin | Delete a course. |
| POST | `/api/courses/upload` | Admin | Upload a course file using multipart field `file`; returns its URL. |
| POST | `/api/courses/{id}/enroll` | User | Enroll the current user. |
| GET | `/api/courses/user/enrolled` | User | List the current user's enrolled courses. |
| GET | `/api/courses/{id}/progress` | User | Get current user's progress for a course. |
| PUT | `/api/courses/{id}/progress` | User | Update progress (`completedModules`, `totalModules`). |

## Exams, Questions, and Submissions

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/api/exams` | Public | List published exams. |
| GET | `/api/exams/{id}` | Public | Get an exam and its questions. |
| GET | `/api/exams/admin/all` | Admin | List all exams, including unpublished exams. |
| POST | `/api/exams` | Admin | Create an exam. |
| PUT | `/api/exams/{id}` | Admin | Update an exam. |
| DELETE | `/api/exams/{id}` | Admin | Delete an exam and its questions. |
| PUT | `/api/exams/{id}/publish` | Admin | Publish or unpublish (`isPublished`). |
| POST | `/api/exams/{id}/questions` | Admin | Add a question to an exam. |
| GET | `/api/exams/{id}/questions` | User | List an exam's questions. |
| POST | `/api/exams/compile` | User | Run code with `language`, `code`, optional `input` and `runOnly`; returns compile/runtime output. |
| POST | `/api/exams/{id}/submit` | User | Submit `answers` and `timeTaken`; scores the submission. |
| GET | `/api/exams/user/submissions` | User | List the current user's submissions. |
| GET | `/api/exams/submission/{id}` | Owner | Get a submission and its answer details. |

## Dashboards

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/api/dashboard/admin` | Admin | Admin summary statistics and recent activity. |
| GET | `/api/dashboard/student` | User | Student course, exam, progress, and application statistics. |

## Placement Drives and Applications

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/api/drives` | Public | List active placement drives. |
| GET | `/api/drives/{id}` | Public | Get a drive. |
| POST | `/api/drives` | Admin | Create a drive. |
| PUT | `/api/drives/{id}` | Admin | Update a drive. |
| DELETE | `/api/drives/{id}` | Admin | Delete a drive. |
| POST | `/api/drives/{id}/apply` | Student | Apply to a drive; accepts applicant fields and optional PDF/Word `resume` upload. |
| GET | `/api/drives/{id}/applications` | Admin | List applications for a drive. |
| GET | `/api/drives/applications/my` | Student | List the current student's applications. |
| PUT | `/api/drives/applications/{id}/status` | Admin | Update an application `status`. |

## Leaderboard

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/api/leaderboard` | Public | Get the top 50 student rankings. |
| GET | `/api/leaderboard/my-rank` | User | Get the current user's rank and statistics. |
| GET | `/api/leaderboard/top-performers?limit=10` | Public | Get top performers; `limit` defaults to 10. |

## Notifications

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/api/notifications` | User | List the current user's notifications and unread count. |
| GET | `/api/notifications/unread/count` | User | Get unread count. |
| PUT | `/api/notifications/{id}/read` | User | Mark a notification as read. |
| PUT | `/api/notifications/read/all` | User | Mark all of the current user's notifications as read. |
| DELETE | `/api/notifications/{id}` | User | Delete a notification. |
| POST | `/api/notifications/admin/send` | Admin | Create a notification (`userId`, `title`, `message`, optional `type`, `link`). |

## FAQ Chatbot

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/api/chatbot/faqs?category=course` | Public | List active FAQs, optionally filtered by category. |
| GET | `/api/chatbot/search?q=course` | Public | Search FAQ question and answer text. |
| POST | `/api/chatbot/ask` | Public | Answer a question (`question`) from FAQ matches or a canned response. |
| POST | `/api/chatbot/faqs` | Admin | Create an FAQ. |
| PUT | `/api/chatbot/faqs/{id}` | Admin | Update an FAQ. |
| DELETE | `/api/chatbot/faqs/{id}` | Admin | Delete an FAQ. |

## Error Responses

Protected routes return `401` when a token is missing and `403` for an invalid token or insufficient role. Resource handlers commonly return `400` for invalid input, `404` for missing records, and `500` for server errors. Error bodies use a JSON `message` field.

For exact validation and response fields, see the route implementation under `server/routes/` and the Mongoose models under `server/models/`.