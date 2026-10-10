# Cognevance Online Course Management System

A full-stack learning portal with course enrollment and progress tracking, exams and coding submissions, placement drives, learner profiles, notifications, a FAQ chatbot, and role-based admin tools.

## Project Links

- Source code: [GitHub repository](https://github.com/SUSHANTHPVS/cognevance_Online-Course-Management-System)
- Backend: [Render API](https://cognevance-online-course-management-qgtp.onrender.com)
- Frontend: [Vercel deployment](https://cognevance-online-course-management-nine.vercel.app/)
- Plain-text deployment links: [DEPLOYMENT_LINKS.txt](DEPLOYMENT_LINKS.txt)
- Screenshots/demo: add screenshots or a demo recording under `docs/screenshots/` and link them here. The screenshot shared during development shows a broken course image and is not a suitable project demo.
- REST API reference: [docs/API.md](docs/API.md)

## Technology

- Frontend: React, Vite, React Router, Tailwind CSS
- Backend: Node.js, Express, JWT authentication
- Database: MongoDB with Mongoose schemas
- Coding execution: Docker-based execution images for supported languages
- Hosting: Vercel frontend and Render backend

## Features

- Student and administrator accounts
- Course catalog, enrollment, modules, and progress tracking
- Exams, questions, coding exercises, submissions, and score history
- Placement drives and student applications
- Student and administrator dashboards, leaderboard, and notifications
- FAQ search and chatbot responses

## Run Locally

Prerequisites: Node.js, npm, MongoDB, and Docker for the sandboxed code runner.

1. Install dependencies from the repository root:

   ```sh
   npm run install:all
   ```

2. Create `server/.env` locally. Do not commit this file:

   ```dotenv
   MONGO_URI=<MongoDB connection string>
   JWT_SECRET=<long random secret>
   PORT=5000
   ```

3. Start the API from the repository root:

   ```sh
   npm run start:server
   ```

4. In another terminal, start the client:

   ```sh
   npm run dev --prefix client
   ```

   Vite serves the client at `http://localhost:5173`. The development API defaults to `http://localhost:5000`. For a separately hosted frontend, set `VITE_API_URL` to the backend origin before building.

## Database Schema

Mongoose creates the collections from the models in `server/models/`. MongoDB IDs are ObjectIds; timestamps are enabled on all listed models.

| Model | Main fields and relationships |
| --- | --- |
| User | `name`, unique `email`, hashed `password`, `role` (`admin` or `student`), profile/contact fields, `resume` |
| Course | `title`, `description`, `instructor` -> User, `thumbnail`, `duration`, `level`, modules/resources, `enrolledUsers` -> User[] |
| Progress | `userId` -> User, `courseId` -> Course, `completedModules`, `totalModules`, `percentageCompleted`; unique user/course pair |
| Exam | `title`, `createdBy` -> User, duration and marks, `questions` -> Question[], category/difficulty, `isPublished` |
| Question | `examId` -> Exam, question text/type, options, answer, marks, sequence, coding input/output/languages |
| Submission | `userId` -> User, `examId` -> Exam, per-question answers, score/percentage/status/time; unique user/exam pair |
| Drive | Company and job details, eligibility, dates, contact details, `createdBy` -> User, `isActive` |
| DriveApplication | `driveId` -> Drive, `userId` -> User, applicant details, resume, status; unique drive/user pair |
| Notification | `userId` -> User, title/message/type, read state, optional link |
| ChatbotFAQ | Question/answer, category, display order, active state |

See the corresponding source schemas in [server/models](server/models).

## Deployment

- **Render backend:** the repository includes `render.yaml`. Configure `MONGO_URI` and a strong `JWT_SECRET` in Render's environment settings. Render supplies `PORT`.
- **Vercel frontend:** set the project root to `client`, build command to `npm run build`, output directory to `dist`, and `VITE_API_URL` to the Render backend origin. Redeploy after changing frontend environment variables.
- Never put database credentials or JWT secrets in Vercel, frontend code, screenshots, or source control. Rotate credentials that have been shared.

## Documentation

- [REST API reference](docs/API.md)
- [Railway deployment notes](README_DEPLOY_RAILWAY.md)