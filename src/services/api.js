import axios from 'axios'
import {
  API_CONFIG,
  ENDPOINTS,
  ERROR_MESSAGES,
  HTTP_STATUS
} from '../config/api.config'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If no response (network issue), reject with specific message
    if (!error.response) {
      console.error('Network error - no response:', error.message)
      return Promise.reject(new Error(ERROR_MESSAGES.NETWORK_ERROR))
    }

    const { status, data } = error.response
    console.log(`API Error: ${status}`, data)
    
    switch (status) {
      case HTTP_STATUS.UNAUTHORIZED: {
        // Only wipe credentials when the /auth/* endpoints themselves reject
        // the token. A 401 from any other service (e.g. Eureka registration
        // lag right after login) must NOT log the user out and kick them
        // back to /login.
        const url = error.config?.url || ''
        if (url.includes('/auth/')) {
          localStorage.removeItem('token')
          localStorage.removeItem('userId')
          localStorage.removeItem('role')
          localStorage.removeItem('userRole')
          localStorage.removeItem('user')
        }
        return Promise.reject(error)
      }
      case HTTP_STATUS.FORBIDDEN:
        console.error(ERROR_MESSAGES.FORBIDDEN)
        break
      case HTTP_STATUS.NOT_FOUND:
        console.error(ERROR_MESSAGES.NOT_FOUND)
        break
      case HTTP_STATUS.INTERNAL_ERROR:
        console.error(ERROR_MESSAGES.SERVER_ERROR)
        break
      default:
        break
    }
    return Promise.reject(error)
  }
)

// ============================================================================
// Auth Service
// ============================================================================
export const authService = {
  login: (credentials) => api.post(ENDPOINTS.AUTH.LOGIN, credentials),

  register: (userData) => api.post(ENDPOINTS.AUTH.REGISTER, userData),

  logout: () => {
    const token = localStorage.getItem('token')
    return api.post(ENDPOINTS.AUTH.LOGOUT, null, {
      headers: { Authorization: `Bearer ${token}` }
    })
  },

  validateToken: (token) => api.get(ENDPOINTS.AUTH.VALIDATE, {
    headers: { Authorization: `Bearer ${token}` }
  }),

  refreshToken: (refreshToken) => api.post(ENDPOINTS.AUTH.REFRESH, { refreshToken }),

  githubAuth: () => {
    window.location.href = `${API_CONFIG.BASE_URL}${ENDPOINTS.AUTH.GITHUB_OAUTH}`
  }
}

// ============================================================================
// Profile Service
// ============================================================================
export const profileService = {
  // Candidate profiles
  getCandidateProfile: (userId) => api.get(ENDPOINTS.PROFILES.GET_CANDIDATE(userId)),

  updateCandidateProfile: (userId, data) =>
    api.put(ENDPOINTS.PROFILES.UPDATE_CANDIDATE(userId), data),

  deleteCandidateProfile: (userId) =>
    api.delete(ENDPOINTS.PROFILES.DELETE_CANDIDATE(userId)),

  getAllCandidates: () => api.get(ENDPOINTS.PROFILES.GET_ALL_CANDIDATES),

  // Recruiter profiles
  getRecruiterProfile: (userId) => api.get(ENDPOINTS.PROFILES.GET_RECRUITER(userId)),

  updateRecruiterProfile: (userId, data) =>
    api.put(ENDPOINTS.PROFILES.UPDATE_RECRUITER(userId), data),

  deleteRecruiterProfile: (userId) =>
    api.delete(ENDPOINTS.PROFILES.DELETE_RECRUITER(userId)),

  getAllRecruiters: () => api.get(ENDPOINTS.PROFILES.GET_ALL_RECRUITERS),

  // Legacy/Simplified endpoints
  getProfile: () => api.get(ENDPOINTS.PROFILES.ME),

  updateProfile: (data) => api.put(ENDPOINTS.PROFILES.ME, data),

  uploadResume: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(ENDPOINTS.PROFILES.RESUME, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  parseResume: (file) => {
    const formData = new FormData()
    formData.append('resume', file)
    return api.post(ENDPOINTS.PROFILES.PARSE_RESUME, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  // Saved jobs
  getSavedJobs: () => api.get(ENDPOINTS.PROFILES.SAVED_JOBS),

  saveJob: (jobId) => api.post(ENDPOINTS.PROFILES.SAVE_JOB(jobId)),

  unsaveJob: (jobId) => api.delete(ENDPOINTS.PROFILES.UNSAVE_JOB(jobId))
}

// ============================================================================
// Job Service
// ============================================================================
export const jobService = {
  getAllJobs: () => api.get(ENDPOINTS.JOBS.LIST),

  getJobById: (id) => api.get(ENDPOINTS.JOBS.GET_BY_ID(id)),

  createJob: (jobData) => api.post(ENDPOINTS.JOBS.CREATE, jobData),

  updateJob: (id, jobData) => api.put(ENDPOINTS.JOBS.UPDATE(id), jobData),

  deleteJob: (id) => api.delete(ENDPOINTS.JOBS.DELETE(id)),

  changeJobStatus: (id, status) =>
    api.patch(ENDPOINTS.JOBS.CHANGE_STATUS(id), null, { params: { status } }),

  searchJobs: (params) => api.get(ENDPOINTS.JOBS.SEARCH, { params }),

  getJobsByCategory: (category) => api.get(ENDPOINTS.JOBS.BY_CATEGORY(category)),

  getJobsByLocation: (location) => api.get(ENDPOINTS.JOBS.BY_LOCATION(location)),

  getJobsByRecruiter: (recruiterId) => api.get(ENDPOINTS.JOBS.BY_RECRUITER(recruiterId))
}

// ============================================================================
// Application Service
// ============================================================================
export const applicationService = {
  submitApplication: (applicationData) =>
    api.post(ENDPOINTS.APPLICATIONS.SUBMIT, applicationData),

  getApplicationById: (id) => api.get(ENDPOINTS.APPLICATIONS.GET_BY_ID(id)),

  getByCandidate: (candidateId) =>
    api.get(ENDPOINTS.APPLICATIONS.GET_BY_CANDIDATE(candidateId)),

  getByJob: (jobId) => api.get(ENDPOINTS.APPLICATIONS.GET_BY_JOB(jobId)),

  updateStatus: (applicationId, status) =>
    api.put(ENDPOINTS.APPLICATIONS.UPDATE_STATUS(applicationId), { status }),

  withdrawApplication: (applicationId) =>
    api.put(ENDPOINTS.APPLICATIONS.WITHDRAW(applicationId)),

  shortlistCandidate: (applicationId) =>
    api.post(ENDPOINTS.APPLICATIONS.SHORTLIST(applicationId)),

  rejectCandidate: (applicationId) =>
    api.post(ENDPOINTS.APPLICATIONS.REJECT(applicationId)),

  advanceCandidate: (applicationId) =>
    api.post(ENDPOINTS.APPLICATIONS.ADVANCE(applicationId)),

  getApplicationCountByJob: (jobId) =>
    api.get(ENDPOINTS.APPLICATIONS.COUNT_BY_JOB(jobId)),

  // Legacy endpoints
  getMyApplications: () => api.get('/applications/candidate/me'),

  getRecruiterApplications: () => api.get(ENDPOINTS.APPLICATIONS.GET_RECRUITER_APPLICATIONS),

  applyForJob: (jobId, coverLetter) =>
    api.post(ENDPOINTS.APPLICATIONS.SUBMIT, { jobId, coverLetter })
}

// ============================================================================
// Interview Service
// ============================================================================
export const interviewService = {
  scheduleInterview: (data) => api.post(ENDPOINTS.INTERVIEWS.SCHEDULE, data),

  getInterviewById: (id) => api.get(ENDPOINTS.INTERVIEWS.GET_BY_ID(id)),

  confirmInterview: (id) => api.put(ENDPOINTS.INTERVIEWS.CONFIRM(id)),

  rescheduleInterview: (id, data) =>
    api.put(ENDPOINTS.INTERVIEWS.RESCHEDULE(id), data),

  cancelInterview: (id) => api.put(ENDPOINTS.INTERVIEWS.CANCEL(id)),

  getInterviewsByCandidate: (candidateId) =>
    api.get(ENDPOINTS.INTERVIEWS.GET_BY_CANDIDATE(candidateId)),

  getInterviewsByRecruiter: (recruiterId) =>
    api.get(ENDPOINTS.INTERVIEWS.GET_BY_RECRUITER(recruiterId)),

  getInterviewsByApplication: (applicationId) =>
    api.get(ENDPOINTS.INTERVIEWS.GET_BY_APPLICATION(applicationId)),

  // Legacy endpoint
  getMyInterviews: () => api.get(ENDPOINTS.INTERVIEWS.MY_INTERVIEWS)
}

// ============================================================================
// Analytics Service
// ============================================================================
export const analyticsService = {
  getCandidateStats: () => api.get(ENDPOINTS.ANALYTICS.CANDIDATE_STATS),

  getRecruiterStats: (recruiterId) => api.get(ENDPOINTS.ANALYTICS.RECRUITER_STATS(recruiterId)),

  getJobStats: (jobId) => api.get(ENDPOINTS.ANALYTICS.JOB_STATS(jobId))
}

// ============================================================================
// Notification Service
// ============================================================================
export const notificationService = {
  getNotifications: () => api.get(ENDPOINTS.NOTIFICATIONS.LIST),

  // Backend expects PUT /notifications/{id}/read
  markAsRead: (id) => api.put(`/notifications/${id}/read`)
}

// ============================================================================
// Subscription Service
// ============================================================================
export const subscriptionService = {
  getCurrentPlan: (recruiterId) => api.get(`${ENDPOINTS.SUBSCRIPTIONS.CURRENT_PLAN}?recruiterId=${recruiterId}`),

  getAvailablePlans: () => api.get(ENDPOINTS.SUBSCRIPTIONS.AVAILABLE_PLANS),

  upgradePlan: (recruiterId, plan) => api.post(`${ENDPOINTS.SUBSCRIPTIONS.UPGRADE}?recruiterId=${recruiterId}&plan=${plan}`),

  cancelSubscription: () => api.post(ENDPOINTS.SUBSCRIPTIONS.CANCEL),

  getInvoices: (recruiterId) => api.get(`/subscriptions/invoices/${recruiterId}`)
}

export default api
