# Docker for EduPortal Server

This document explains how to build and run the server container which includes compilers (Java, gcc, g++, Python).

Build and run with docker-compose (recommended for development):

```bash
docker-compose build
docker-compose up
```

This will:
- Build an image from `server/Dockerfile` that installs OpenJDK, gcc, g++, and Python.
- Mount the local `server/` directory into the container so code changes appear immediately.

Notes:
- The container exposes port `5000` and the app runs with `npm start`.
- Keep your `JWT_SECRET` and other env vars secure in production; the compose file uses a placeholder `secret`.
