# Code Review: Full Codebase Review
**Date**: 2026-02-09  
**Reviewer**: Architecture Review Agent  
**Ready for Production**: No  
**Critical Issues**: 3  

## Overview
Comprehensive review of the Three Rivers Bank Credit Card Website covering backend (Spring Boot), frontend (React), infrastructure (Docker, Nginx, CI/CD), and security posture. The application is a read-only credit card comparison platform with BIAN API integration.

---

## Priority 1 (Must Fix) ⛔

### 1.1 Missing Security Headers in Nginx Configuration
**File**: `docker/nginx.conf`  
**Risk**: Medium-High  
**Issue**: Missing `Strict-Transport-Security` (HSTS), `Content-Security-Policy` (CSP), and `Referrer-Policy` headers. Without these, the application is vulnerable to protocol downgrade attacks, XSS via inline scripts, and referrer information leakage.

**Fix Applied**: Added HSTS, CSP, and Referrer-Policy headers to nginx.conf.

### 1.2 Docker Containers Running as Root
**File**: `docker/backend.Dockerfile`, `docker/frontend.Dockerfile`  
**Risk**: High  
**Issue**: Both Docker images run processes as root user. If a container is compromised, the attacker has root-level access within the container, increasing blast radius.

**Fix Applied**: Added non-root user creation and `USER` directives to both Dockerfiles.

### 1.3 Cache TTL Not Implemented
**File**: `backend/src/main/java/com/threeriversbank/config/CacheConfig.java`  
**Risk**: Medium  
**Issue**: CacheConfig only enables caching with comments mentioning TTL values (5min for transactions, 1hr for billing), but no actual TTL is configured. This means cached data never expires, leading to stale data served indefinitely.

**Fix Applied**: Implemented CaffeineCacheManager with proper TTL configuration.

---

## Priority 2 (Should Fix) ⚠️

### 2.1 Overly Permissive CORS Configuration
**File**: `backend/src/main/java/com/threeriversbank/config/CorsConfig.java`  
**Risk**: Medium  
**Issue**: `allowedHeaders("*")` permits any header. While `allowedOrigins` is limited to localhost, this should use environment-configurable origins for production deployment. The combination of `allowCredentials(true)` with wildcard headers is a security concern.

**Recommendation**: Use `@Value` to inject allowed origins from configuration.

### 2.2 No Input Validation on Controller Endpoints
**File**: `backend/src/main/java/com/threeriversbank/controller/CreditCardController.java`  
**Risk**: Medium  
**Issue**: Path variable `id` and request parameters `cardType` are not validated. While Spring Data JPA provides some protection against SQL injection, explicit validation prevents invalid data from reaching the service layer.

**Recommendation**: Add `@Validated` and `@Positive` annotations to path variables.

### 2.3 Generic Exception Handling
**File**: `backend/src/main/java/com/threeriversbank/service/CreditCardService.java`  
**Risk**: Medium  
**Issue**: Service throws `RuntimeException` for not-found cases instead of a custom exception. No `@ControllerAdvice` exists to handle exceptions gracefully, leading to stack traces in API responses.

**Recommendation**: Create `CardNotFoundException` extending `ResponseStatusException` and add `@ControllerAdvice` for consistent error responses.

### 2.4 H2 Console Enabled Without Profile Guard
**File**: `backend/src/main/resources/application.yml`  
**Risk**: Medium  
**Issue**: H2 console is enabled unconditionally. In production, this exposes database contents at `/h2-console`.

**Recommendation**: Move H2 console enablement to a `dev` profile only.

### 2.5 Frontend API Base URL Defaults to HTTP
**File**: `frontend/src/services/api.js`  
**Risk**: Medium  
**Issue**: API base URL falls back to `http://localhost:8080` which uses unencrypted HTTP. The `.env` file is committed to the repository.

**Recommendation**: Add `frontend/.env` to `.gitignore` and provide `.env.example` instead.

---

## Priority 3 (Nice to Have) 💡

### 3.1 Non-Functional UI Elements
**Files**: `frontend/src/pages/CardDetailsPage.jsx`, `frontend/src/components/layout/Footer.jsx`  
**Issue**: "Apply Now" button has no click handler. Footer links use `href="#"` placeholders.

**Recommendation**: Either implement handlers or remove non-functional elements to avoid user confusion.

### 3.2 Incomplete .gitignore
**File**: `.gitignore`  
**Issue**: Missing common entries for Java build artifacts (`target/`), IDE files (`.idea/`, `.vscode/`), environment files, and OS artifacts.

**Fix Applied**: Updated .gitignore with comprehensive entries.

### 3.3 Missing .env.example for Frontend
**File**: `frontend/.env.example` (missing)  
**Issue**: No template for environment variables. Developers must discover required variables from source code.

**Fix Applied**: Created `frontend/.env.example` with documented variables.

### 3.4 Swagger UI Exposed
**File**: `backend/src/main/resources/application.yml`  
**Issue**: Swagger UI is available at `/swagger-ui.html` with no access control. While acceptable for development, should be disabled in production.

**Recommendation**: Use Spring profiles to conditionally enable Swagger.

---

## Architecture Assessment

### Strengths ✅
1. **Clean layered architecture**: Controller → Service → Repository pattern well-implemented
2. **Circuit breaker pattern**: Resilience4j properly configured for BIAN API calls
3. **DTO separation**: Entities and DTOs properly separated preventing JPA entity exposure
4. **Responsive design**: Frontend handles multiple viewport sizes
5. **E2E test coverage**: Playwright tests cover main user flows across browsers
6. **Multi-stage Docker builds**: Efficient container images with separate build/runtime stages
7. **Material-UI accessibility**: Baseline WCAG compliance from component library

### Areas for Improvement 🔧
1. **Error handling**: No global exception handler; errors return raw stack traces
2. **API documentation**: Swagger annotations present but incomplete
3. **Test coverage**: Only 2 backend test classes; missing service layer tests
4. **Monitoring**: Health endpoint exists but no metrics or structured logging
5. **Environment management**: No Spring profiles for dev/staging/production
6. **Database migrations**: Using `ddl-auto: create` instead of Flyway/Liquibase

### Security Posture 🔒
- **Authentication**: None required (read-only demo) ✅ Appropriate for scope
- **CORS**: Limited to localhost origins ✅ Adequate for development
- **Headers**: Partial security headers ⚠️ Fixed in this review
- **Dependencies**: Modern versions, no known CVEs at time of review ✅
- **Secrets**: No hardcoded secrets (H2 uses default sa/empty) ✅
- **Docker**: Running as root ⚠️ Fixed in this review

---

## Accessibility Quick Check

### Keyboard Navigation ✅
- Material-UI components provide keyboard support by default
- React Router links are keyboard accessible
- Tab order follows visual layout

### Screen Reader Support ⚠️
- Material-UI provides ARIA attributes automatically
- Missing: Custom `aria-label` on comparison table toggle buttons
- Missing: `alt` text verification on card images (if any added later)

### Visual Accessibility ✅
- Theme uses high-contrast navy (#003366) and teal (#008080) colors
- Text on colored backgrounds meets WCAG AA contrast ratios
- Responsive design adapts to zoom levels

---

## Summary of Changes Made
| Change | File | Type |
|--------|------|------|
| Added HSTS, CSP, Referrer-Policy headers | `docker/nginx.conf` | Security |
| Added non-root user | `docker/backend.Dockerfile` | Security |
| Added non-root user | `docker/frontend.Dockerfile` | Security |
| Implemented cache TTL with Caffeine | `backend/.../CacheConfig.java` | Bug Fix |
| Updated .gitignore | `.gitignore` | Maintenance |
| Created .env.example | `frontend/.env.example` | Documentation |
| Created ADR-001 (Database) | `docs/architecture/ADR-001-...` | Documentation |
| Created ADR-002 (BIAN API) | `docs/architecture/ADR-002-...` | Documentation |
| Created ADR-003 (Frontend) | `docs/architecture/ADR-003-...` | Documentation |
| Created this review report | `docs/code-review/...` | Documentation |
