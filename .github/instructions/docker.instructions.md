---
description: 'Dockerfile and Docker best practices'
applyTo: 'docker/**'
---

# Docker / Dockerfile Standards

## Multi-Stage Builds

- Use multi-stage builds to minimize final image size.
- Separate the build stage from the runtime stage.
- Only copy artifacts needed at runtime into the final stage.

## Base Image Versions

- Pin base image versions explicitly — do **not** use `:latest` for production images.
- Example: `FROM eclipse-temurin:17-jre-jammy` instead of `FROM eclipse-temurin:latest`.

## Non-Root Users

- Run container processes as a non-root user.
- Create a dedicated application user in the Dockerfile and switch to it with `USER`.

## Image Naming

- Follow the naming convention: `threeriversbank/{backend|frontend}:latest`.
- Tag release images with a version in addition to `latest`.

## Backend (Java)

- Use a Java 17+ JRE runtime image (not JDK) in the final stage.
- H2 in-memory database is embedded — no external database container needed for the backend.

## Frontend (Nginx)

- Serve the Vite static build output via Nginx in the final stage.
- Copy only the `dist/` directory into the Nginx image.

## Health Checks

- Add a `HEALTHCHECK` instruction to every service image.
- Backend health check should target `/actuator/health`.
- Frontend health check should verify the Nginx process is responding.

## Secrets

- Never embed secrets, credentials, or API keys in Dockerfile instructions or image layers.
- Use environment variables (injected at runtime) or a secrets manager for sensitive values.
