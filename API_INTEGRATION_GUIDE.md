# HireConnect Frontend - API Integration Guide

## Architecture Overview

The HireConnect frontend communicates with the backend through an **API Gateway** (port 8080) which routes requests to the appropriate microservices.

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   Frontend      │ ───▶ │   API Gateway    │ ───▶ │  Microservices  │
│  (Port 5173)    │      │   (Port 8080)    │      │  (Various)      │
└─────────────────┘      └──────────────────┘      └─────────────────┘
```

## Centralized Configuration

All API configuration is centralized in `src/config/api.config.js`:
- **Base URL**: `http://localhost:8080`
- **Endpoints**: All service endpoints defined in `ENDPOINTS` object
- **Enums**: Application status, job status, job types matching backend
- **Error Messages**: Standardized error messages

## Service Mapping

| Frontend Service | Backend Microservice | Base Path |
|-----------------|---------------------|-----------|
| authService | auth-service | `/auth/**` |
| profileService | profile-service | `/profiles/**` |
| jobService | job-service | `/jobs/**` |
| applicationService | application-service | `/applications/**` |
| interviewService | interview-service | `/interviews/**` |
| analyticsService | analytics-service | `/analytics/**` |
| notificationService | notification-service | `/notifications/**` |
| subscriptionService | subscription-service | `/subscriptions/**` |

## Key API Endpoints

### Authentication
```javascript
POST   /auth/login
POST   /auth/register
POST   /auth/logout
POST   /auth/refresh
GET    /auth/validate
GET    /oauth2/authorization/github  // GitHub OAuth
```

### Jobs
```javascript
GET    /jobs                    // List all jobs
GET    /jobs/search             // Search with filters
POST   /jobs                    // Create job (recruiter)
GET    /jobs/{id}               // Get job details
PUT    /jobs/{id}               // Update job
PATCH  /jobs/{id}/status        // Change job status
DELETE /jobs/{id}               // Delete job
```

### Applications
```javascript
POST   /applications                    // Submit application
GET    /applications/candidate/{id}     // Get by candidate
GET    /applications/job/{id}           // Get by job (recruiter)
PUT    /applications/{id}/status        // Update status
PUT    /applications/{id}/withdraw      // Withdraw application
POST   /applications/{id}/shortlist     // Shortlist candidate
POST   /applications/{id}/reject        // Reject candidate
```

### Profiles
```javascript
GET    /profiles/candidates/{id}        // Get candidate profile
PUT    /profiles/candidates/{id}        // Update candidate
GET    /profiles/recruiters/{id}        // Get recruiter profile
PUT    /profiles/recruiters/{id}        // Update recruiter
POST   /profiles/resume                 // Upload resume
```

### Interviews
```javascript
POST   /interviews                      // Schedule interview
PUT    /interviews/{id}/confirm         // Confirm interview
PUT    /interviews/{id}/reschedule      // Reschedule
PUT    /interviews/{id}/cancel          // Cancel
```

## Enums (Backend-Frontend Sync)

### Application Status
```javascript
APPLIED, SHORTLISTED, INTERVIEW_SCHEDULED, OFFERED, REJECTED, WITHDRAW
```

### Job Status
```javascript
OPEN, PAUSED, CLOSED, DELETED
```

### Job Type
```javascript
FULL_TIME, PART_TIME, INTERNSHIP, CONTRACT, REMOTE, HYBRID, APPRENTICESHIP
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:8080` | API Gateway base URL |
| `VITE_APP_NAME` | `HireConnect` | Application name |
| `VITE_APP_VERSION` | `1.0.0` | Application version |

## CORS Configuration

The API Gateway has CORS configured for the frontend:
```properties
spring.cloud.gateway.globalcors.cors-configurations.[/**].allowed-origins=http://localhost:5173
spring.cloud.gateway.globalcors.cors-configurations.[/**].allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.cloud.gateway.globalcors.cors-configurations.[/**].allowed-headers=*
spring.cloud.gateway.globalcors.cors-configurations.[/**].allow-credentials=true
```

## JWT Authentication

All protected endpoints require a Bearer token:
```javascript
Authorization: Bearer <jwt_token>
```

The token is automatically added to requests by the Axios interceptor in `api.js`.

## Error Handling

Standard HTTP status codes are used:
- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized (redirects to login)
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Build Commands

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Lint check
npm run lint

# Preview production build
npm run preview
```

## Verification Checklist

- [x] All backend services compile successfully
- [x] Frontend builds without errors
- [x] API endpoints centralized in `api.config.js`
- [x] Service layer methods match backend controllers
- [x] Enums synchronized with backend
- [x] CORS configured for localhost:5173
- [x] JWT authentication implemented
- [x] Error handling in place
