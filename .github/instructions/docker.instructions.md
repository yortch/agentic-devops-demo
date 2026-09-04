---
applyTo: "**/Dockerfile,**/docker-compose*.yml,docker/**"
description: "Docker and container standards for Three Rivers Bank"
---

# Docker Instructions

## Multi-Stage Builds
- Use multi-stage builds to produce smaller production images.
- Keep build dependencies (e.g., Maven, Node.js) in build stages only; copy only the final artifact to the runtime stage.

## Backend Image
- Use a Java 17+ base image (e.g., `eclipse-temurin:17-jre`) for the runtime stage.
- H2 is embedded — no external database container is needed.
- Backend Dockerfile: `docker/backend.Dockerfile`.

## Frontend Image
- Use Nginx to serve the static Vite build output in the runtime stage.
- Frontend Dockerfile: `docker/frontend.Dockerfile`.

## Image Naming
- Name images following the convention: `threeriversbank/{backend|frontend}:latest`.
- For CI/CD, also tag with branch name and commit SHA.

## Security
- **Never include secrets, credentials, API keys, or passwords** in Dockerfiles or docker-compose files.
- Use environment variables or secrets management (e.g., GitHub Actions secrets, Azure Key Vault) for sensitive values.
- Production environment variables: `BIAN_API_URL`, `H2_CONSOLE_ENABLED=false`, `LOGGING_LEVEL=INFO`.
