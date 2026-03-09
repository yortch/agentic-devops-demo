# ADR-001: H2 In-Memory Database as Primary Data Source

## Status
Accepted

## Context
Three Rivers Bank Credit Card Website needs a database to store credit card product catalog data including card details, features, fee schedules, and interest rates. The application is a read-only demo platform with no user authentication or payment processing.

## Decision
Use H2 in-memory database as the primary and authoritative data source for the credit card catalog.

## Decision Drivers
- **Read-only product catalog**: No write operations from end users
- **Demo/prototype scope**: Application is a demonstration platform
- **Simplified deployment**: No external database dependency required
- **Fast startup**: In-memory database initializes instantly with seed data

## Options Considered

### Option 1: H2 In-Memory (Selected)
- **Pros**: Zero configuration, embedded, fast, perfect for demos
- **Cons**: Data lost on restart, not suitable for production workloads, limited concurrent connections

### Option 2: PostgreSQL
- **Pros**: Production-grade, ACID compliance, scalable
- **Cons**: Requires external infrastructure, overkill for read-only demo

### Option 3: SQLite
- **Pros**: File-based persistence, embedded
- **Cons**: Limited Spring Boot support, single-writer limitation

## Consequences
- Data is seeded from `data.sql` on every application start
- No data persistence between restarts
- H2 console available at `/h2-console` for development debugging
- **Migration path**: When moving to production, switch to PostgreSQL with Spring profiles

## Risks
- **H2 console in production**: Must be disabled via Spring profiles for any production deployment
- **Schema drift**: `ddl-auto: create` regenerates schema each start; use Flyway/Liquibase for production
- **Concurrent access**: H2 in-memory mode has connection pool limitations

## Related
- ADR-002: BIAN API Integration Pattern
- `backend/src/main/resources/data.sql` - Seed data
- `backend/src/main/resources/application.yml` - Database configuration
