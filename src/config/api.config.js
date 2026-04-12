/**
 * HireConnect API Configuration
 * Central source of truth for all backend API endpoints
 * Base URL: http://localhost:8080 (API Gateway)
 */

// API Base Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  TIMEOUT: 30000,
  VERSION: 'v1'
}

// Service Endpoints
export const ENDPOINTS = {
  // Auth Service
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VALIDATE: '/auth/validate',
    GITHUB_OAUTH: '/oauth2/authorization/github'
  },

  // Profile Service
  PROFILES: {
    // Candidate profiles
    GET_CANDIDATE: (userId) => `/profiles/candidates/${userId}`,
    UPDATE_CANDIDATE: (userId) => `/profiles/candidates/${userId}`,
    DELETE_CANDIDATE: (userId) => `/profiles/candidates/${userId}`,
    GET_ALL_CANDIDATES: '/profiles/candidates',

    // Recruiter profiles
    GET_RECRUITER: (userId) => `/profiles/recruiters/${userId}`,
    UPDATE_RECRUITER: (userId) => `/profiles/recruiters/${userId}`,
    DELETE_RECRUITER: (userId) => `/profiles/recruiters/${userId}`,
    GET_ALL_RECRUITERS: '/profiles/recruiters',

    // Legacy endpoints (for compatibility)
    ME: '/profiles/me',
    RESUME: '/profiles/resume',
    SAVED_JOBS: '/profiles/saved-jobs',
    SAVE_JOB: (jobId) => `/profiles/saved-jobs/${jobId}`,
    UNSAVE_JOB: (jobId) => `/profiles/saved-jobs/${jobId}`
  },

  // Job Service
  JOBS: {
    LIST: '/jobs',
    CREATE: '/jobs',
    GET_BY_ID: (id) => `/jobs/${id}`,
    UPDATE: (id) => `/jobs/${id}`,
    DELETE: (id) => `/jobs/${id}`,
    CHANGE_STATUS: (id) => `/jobs/${id}/status`,
    SEARCH: '/jobs/search',
    BY_CATEGORY: (category) => `/jobs/category/${category}`,
    BY_LOCATION: (location) => `/jobs/location/${location}`,
    BY_RECRUITER: (recruiterId) => `/jobs/recruiter/${recruiterId}`
  },

  // Application Service
  APPLICATIONS: {
    SUBMIT: '/applications',
    GET_BY_ID: (id) => `/applications/${id}`,
    GET_BY_CANDIDATE: (candidateId) => `/applications/candidate/${candidateId}`,
    GET_BY_JOB: (jobId) => `/applications/job/${jobId}`,
    UPDATE_STATUS: (id) => `/applications/${id}/status`,
    WITHDRAW: (id) => `/applications/${id}/withdraw`,
    SHORTLIST: (id) => `/applications/${id}/shortlist`,
    REJECT: (id) => `/applications/${id}/reject`,
    ADVANCE: (id) => `/applications/${id}/advance`,
    COUNT_BY_JOB: (jobId) => `/applications/job/${jobId}/count`,

    // Legacy/recruiter endpoints
    GET_RECRUITER_APPLICATIONS: '/applications/recruiter'
  },

  // Interview Service
  INTERVIEWS: {
    SCHEDULE: '/interviews',
    GET_BY_ID: (id) => `/interviews/${id}`,
    CONFIRM: (id) => `/interviews/${id}/confirm`,
    RESCHEDULE: (id) => `/interviews/${id}/reschedule`,
    CANCEL: (id) => `/interviews/${id}/cancel`,
    GET_BY_CANDIDATE: (candidateId) => `/interviews/candidate/${candidateId}`,
    GET_BY_RECRUITER: (recruiterId) => `/interviews/recruiter/${recruiterId}`,
    GET_BY_APPLICATION: (applicationId) => `/interviews/application/${applicationId}`,

    // Legacy endpoints
    MY_INTERVIEWS: '/interviews/my-interviews'
  },

  // Analytics Service
  ANALYTICS: {
    CANDIDATE_STATS: '/analytics/candidate',
    RECRUITER_STATS: '/analytics/recruiter',
    JOB_STATS: (jobId) => `/analytics/jobs/${jobId}`
  },

  // Notification Service
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: (id) => `/notifications/${id}/read`
  },

  // Subscription Service
  SUBSCRIPTIONS: {
    CURRENT_PLAN: '/subscriptions/current',
    AVAILABLE_PLANS: '/subscriptions/plans',
    UPGRADE: '/subscriptions/upgrade',
    CANCEL: '/subscriptions/cancel',
    INVOICES: '/subscriptions/invoices'
  }
}

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500
}

// Application Status Enum (matches backend)
export const APPLICATION_STATUS = {
  APPLIED: 'APPLIED',
  SHORTLISTED: 'SHORTLISTED',
  INTERVIEW_SCHEDULED: 'INTERVIEW_SCHEDULED',
  OFFERED: 'OFFERED',
  REJECTED: 'REJECTED',
  WITHDRAW: 'WITHDRAW'
}

// Job Status Enum (matches backend)
export const JOB_STATUS = {
  OPEN: 'OPEN',
  PAUSED: 'PAUSED',
  CLOSED: 'CLOSED',
  DELETED: 'DELETED'
}

// Job Type Enum (matches backend)
export const JOB_TYPE = {
  FULL_TIME: 'FULL_TIME',
  PART_TIME: 'PART_TIME',
  INTERNSHIP: 'INTERNSHIP',
  CONTRACT: 'CONTRACT',
  REMOTE: 'REMOTE',
  HYBRID: 'HYBRID',
  APPRENTICESHIP: 'APPRENTICESHIP'
}

// User Roles
export const USER_ROLES = {
  CANDIDATE: 'CANDIDATE',
  RECRUITER: 'RECRUITER',
  ADMIN: 'ADMIN'
}

// Default Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 0,
  DEFAULT_SIZE: 20,
  MAX_SIZE: 100
}

// Request Headers
export const HEADERS = {
  CONTENT_TYPE: 'Content-Type',
  AUTHORIZATION: 'Authorization',
  ACCEPT: 'Accept',
  MULTIPART: 'multipart/form-data',
  JSON: 'application/json'
}

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Session expired. Please login again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.'
}
