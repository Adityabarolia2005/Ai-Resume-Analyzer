# Bootcamp OS

Bootcamp project and task management application with an Express/MongoDB API and a React + Vite + Tailwind frontend.

## Features

- Email-verified registration, cookie-based JWT login and logout.
- Forgot-password and reset-password flow with hashed, expiring tokens.
- Owner-controlled project creation, editing and cascading deletion.
- Project members with `member` and `project_admin` roles.
- Task creation, assignment, project task lists and personal assigned-task queue.
- Task status workflow: `todo`, `in_progress`, and `done`.
- Assigned users can update their own task status; project owners/admins can manage status too.
- Responsive React dashboard styled with Tailwind CSS.

## Run locally

1. Copy `.env.example` to `.env` and fill in MongoDB, JWT and email settings.
2. Install and start the API from the repository root:

```bash
npm install
npm run dev
```

3. In a second terminal, start the frontend:

```bash
cd frontend
npm install
npm run dev
```

The API runs on `http://localhost:3000` and the frontend on `http://localhost:5173`.

## Main API routes

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`
- `POST /api/v1/project/createProject`
- `DELETE /api/v1/project/:projectId`
- `POST /api/v1/project/:projectId/tasks`
- `GET /api/v1/project/tasks/assigned`
- `PATCH /api/v1/project/:projectId/task/:taskId/status`
## AI Resume Analyzer

The frontend is in `frontend/` and runs as a polished ResumeIQ analyzer. It supports resume text paste and `.txt`/`.md` uploads, then generates an ATS-style score, detected skills, strengths, and improvement actions in the browser.

The backend also exposes `POST /api/v1/resume/analyze` with `{ "resumeText": "...", "jobDescription": "..." }`. If `OPENAI_API_KEY` is configured, it calls the OpenAI Responses API and returns structured JSON. Without a key, it uses the same deterministic fallback logic so the demo still works.

### Interview explanation (simple)

“I built ResumeIQ with React on the frontend and Node.js with Express on the backend. A user uploads or pastes a resume. The backend keeps the OpenAI key private, sends the resume text to the Responses API, and asks for structured JSON containing a score, skills, and recommendations. The React UI renders that response as a report with an ATS score, skill chips, strengths, and next steps. I also added a local fallback so the product can still demo without an API key. The main security decision was never exposing the OpenAI key in React.”

### Run it

```bash
npm install
npm run dev
cd frontend
npm install
npm run dev
```

For AI-backed analysis, copy `.env.example` to `.env` and add `OPENAI_API_KEY`.
