import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  jobService,
  applicationService,
  analyticsService,
  subscriptionService,
  profileService
} from '../../services/api'

const RecruiterDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    activeJobs: 0,
    newApplications: 0,
    expiringSoon: 0,
    interviewsScheduled: 0,
    shortlisted: 0,
    rejected: 0,
    totalCandidates: 0
  })
  const [recentApplications, setRecentApplications] = useState([])
  const [activeJobs, setActiveJobs] = useState([])
  const [candidatePipeline, setCandidatePipeline] = useState([
    { stage: 'Applied', count: 0, color: 'blue' },
    { stage: 'Screening', count: 0, color: 'indigo' },
    { stage: 'Interview', count: 0, color: 'purple' },
    { stage: 'Offer', count: 0, color: 'emerald' }
  ])
  const [currentPlan, setCurrentPlan] = useState('FREE')
  const [daysRemaining, setDaysRemaining] = useState(0)
  const [planLimits, setPlanLimits] = useState({ jobLimit: 3, featuredJobs: 0 })
  const [loading, setLoading] = useState(true)
  const [activityFeed, setActivityFeed] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    if (!user?.userId) {
      console.log('User not available yet, skipping fetch')
      setLoading(false)
      return
    }

    try {
      setLoading(true)

      // Fetch applications
      const appsResponse = await applicationService.getRecruiterApplications()
      const allApps = Array.isArray(appsResponse.data) ? appsResponse.data : []
      setRecentApplications(allApps.slice(0, 5))

      // Calculate pipeline stats (backend uses APPLIED, not PENDING)
      const pipeline = {
        Applied: allApps.filter(a => a.status === 'APPLIED' || a.status === 'PENDING').length,
        Screening: allApps.filter(a => a.status === 'SHORTLISTED').length,
        Interview: allApps.filter(a => a.status === 'INTERVIEW_SCHEDULED').length,
        Offer: allApps.filter(a => a.status === 'OFFERED').length
      }
      setCandidatePipeline([
        { stage: 'Applied', count: pipeline.Applied, color: 'blue' },
        { stage: 'Screening', count: pipeline.Screening, color: 'indigo' },
        { stage: 'Interview', count: pipeline.Interview, color: 'purple' },
        { stage: 'Offer', count: pipeline.Offer, color: 'emerald' }
      ])

      // Fetch jobs
      const jobsResponse = await jobService.getJobsByRecruiter(user?.userId)
      const jobs = Array.isArray(jobsResponse.data) ? jobsResponse.data : []
      setActiveJobs(jobs.slice(0, 3))

      // Calculate jobs expiring soon
      const expiringSoon = jobs.filter(job => {
        if (!job.expiryDate) return false
        const expiry = new Date(job.expiryDate)
        const now = new Date()
        const daysDiff = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))
        return daysDiff <= 7 && daysDiff >= 0
      }).length

      // Generate activity feed
      const activities = []
      allApps.slice(0, 5).forEach((app, idx) => {
        activities.push({
          id: app.applicationId,
          type: 'application',
          title: `${app.candidateName || 'Candidate'} applied for ${app.jobTitle || 'position'}`,
          timestamp: app.appliedAt,
          icon: 'user-plus'
        })
      })
      activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      setActivityFeed(activities.slice(0, 5))

      // Fetch analytics
      const analyticsResponse = await analyticsService.getRecruiterStats(user?.userId)
      const analyticsData = analyticsResponse.data || {}
      setStats({
        activeJobs: jobs.length,
        newApplications: allApps.filter(a => a.status === 'APPLIED' || a.status === 'PENDING').length,
        expiringSoon: expiringSoon,
        interviewsScheduled: allApps.filter(a => a.status === 'INTERVIEW_SCHEDULED').length,
        shortlisted: allApps.filter(a => a.status === 'SHORTLISTED').length,
        rejected: allApps.filter(a => a.status === 'REJECTED').length,
        totalCandidates: allApps.length
      })

      // Fetch subscription
      try {
        const subscriptionResponse = await subscriptionService.getCurrentPlan(user?.userId)
        if (subscriptionResponse.data) {
          const plan = subscriptionResponse.data.plan || 'FREE'
          setCurrentPlan(plan)
          if (subscriptionResponse.data.endDate) {
            const end = new Date(subscriptionResponse.data.endDate)
            const now = new Date()
            const days = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
            setDaysRemaining(Math.max(0, days))
          }
          // Set limits based on plan (match backend SubscriptionPlan enum)
          const planUpper = plan.toUpperCase()
          if (planUpper === 'FREE') {
            setPlanLimits({ jobLimit: 3, featuredJobs: 0 })
          } else if (planUpper === 'STARTER' || planUpper === 'PROFESSIONAL') {
            setPlanLimits({ jobLimit: 5, featuredJobs: 1 })
          } else if (planUpper === 'PRO' || planUpper === 'GROWTH') {
            setPlanLimits({ jobLimit: 20, featuredJobs: 5 })
          } else if (planUpper === 'ENTERPRISE') {
            setPlanLimits({ jobLimit: Infinity, featuredJobs: 20 })
          }
        }
      } catch (subError) {
        setCurrentPlan('FREE')
        setPlanLimits({ jobLimit: 3, featuredJobs: 0 })
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadgeClass = (status) => {
    const classes = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      SHORTLISTED: 'bg-blue-100 text-blue-800 border-blue-200',
      REJECTED: 'bg-red-100 text-red-800 border-red-200',
      INTERVIEW_SCHEDULED: 'bg-purple-100 text-purple-800 border-purple-200',
      OFFERED: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    }
    return classes[status] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getStatusLabel = (status) => {
    const labels = {
      PENDING: 'New',
      SHORTLISTED: 'Shortlisted',
      REJECTED: 'Rejected',
      INTERVIEW_SCHEDULED: 'Interview',
      OFFERED: 'Offer Sent'
    }
    return labels[status] || status
  }

  const getActivityIcon = (type) => {
    const icons = {
      'user-plus': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
      'calendar': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      'message': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      )
    }
    return icons[type] || icons['user-plus']
  }

  const formatTimeAgo = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffSecs < 60) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user?.userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Please sign in</h3>
          <p className="text-gray-500 mb-4">You need to be logged in to view the dashboard.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.email?.split('@')[0]}!
              </h1>
              <p className="text-gray-600 mt-1">
                Here's what's happening with your hiring today.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/recruiter/analytics"
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                View Reports
              </Link>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-600">Active Jobs</p>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.activeJobs}</p>
            <div className="flex items-center mt-2 text-sm">
              <span className="text-orange-600 font-medium">{stats.expiringSoon}</span>
              <span className="text-gray-500 ml-1">expiring soon</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-600">Total Candidates</p>
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalCandidates}</p>
            <div className="flex items-center mt-2 text-sm">
              <span className="text-green-600 font-medium">{stats.newApplications}</span>
              <span className="text-gray-500 ml-1">new today</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-600">Interviews</p>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.interviewsScheduled}</p>
            <div className="flex items-center mt-2 text-sm">
              <span className="text-blue-600 font-medium">{stats.shortlisted}</span>
              <span className="text-gray-500 ml-1">shortlisted</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-600">Offers Sent</p>
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>

            <p className="text-2xl font-bold text-gray-900">
              {recentApplications.filter(a => a.status === 'OFFERED').length}
            </p>

            <div className="flex items-center mt-2 text-sm">
              <span className="text-gray-500">offers made</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-2 space-y-8">
            {/* Candidate Pipeline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Candidate Pipeline</h2>
                  <p className="text-sm text-gray-500">Track candidates through your hiring stages</p>
                </div>
                <Link
                  to="/recruiter/applications"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View All Candidates →
                </Link>
              </div>

              {/* Pipeline Visualization */}
              <div className="flex items-center justify-between mb-8">
                {candidatePipeline.map((stage, index) => (
                  <div key={stage.stage} className="flex-1 flex items-center">
                    <div className="flex-1 text-center">
                      <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2 ${
                        stage.count > 0 ? `bg-${stage.color}-100` : 'bg-gray-100'
                      }`}>
                        <span className={`text-lg font-bold ${
                          stage.count > 0 ? `text-${stage.color}-600` : 'text-gray-400'
                        }`}>
                          {stage.count}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-gray-600">{stage.stage}</p>
                    </div>
                    {index < candidatePipeline.length - 1 && (
                      <div className="flex-1 h-0.5 bg-gray-200 mx-2"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Conversion Funnel */}
              <div className="space-y-3">
                {candidatePipeline.map((stage) => (
                  <div key={stage.stage} className="flex items-center">
                    <span className="w-24 text-sm text-gray-600">{stage.stage}</span>
                    <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden">
                      <div
                        className={`h-full bg-${stage.color}-500 rounded-lg transition-all duration-500`}
                        style={{ width: `${Math.min(100, (stage.count / Math.max(stats.totalCandidates, 1)) * 100)}%` }}
                      ></div>
                    </div>
                    <span className="w-12 text-right text-sm font-medium text-gray-900">{stage.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Applications */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Recent Applications</h2>
                    <p className="text-sm text-gray-500">Latest candidates who applied to your jobs</p>
                  </div>
                  <Link
                    to="/recruiter/applications"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View All
                  </Link>
                </div>
              </div>

              {recentApplications.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {recentApplications.map((app) => (
                    <div
                      key={app.applicationId}
                      className="p-5 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/recruiter/applications?application=${app.applicationId}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {app.candidateName?.charAt(0).toUpperCase() || 'C'}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900">{app.candidateName || 'Anonymous Candidate'}</h3>
                              <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusBadgeClass(app.status)}`}>
                                {getStatusLabel(app.status)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">Applied for {app.jobTitle || 'Unknown Position'}</p>
                            {app.skills && app.skills.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {app.skills.slice(0, 3).map((skill, idx) => (
                                  <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                    {skill}
                                  </span>
                                ))}
                                {app.skills.length > 3 && (
                                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                    +{app.skills.length - 3}
                                  </span>
                                )}
                              </div>
                            )}
                            <p className="text-xs text-gray-400 mt-2">
                              Applied {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'recently'}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={async (e) => {
                              e.stopPropagation()

                              try {
                                let resumePath =
                                  app.resumeUrl ||
                                  app.resume ||
                                  app.resumePath ||
                                  app.resumeFileUrl ||
                                  null

                                if (!resumePath && app.candidateId) {
                                  const profileResponse = await profileService.getCandidateProfile(
                                    app.candidateId
                                  )

                                  const profile = profileResponse.data || {}

                                  resumePath =
                                    profile.resumeUrl ||
                                    profile.resume ||
                                    profile.resumePath ||
                                    profile.resumeFileUrl ||
                                    null
                                }

                                if (!resumePath) {
                                  alert('This candidate has not uploaded a resume yet.')
                                  return
                                }

                                const resumeUrl = resumePath.startsWith('http')
                                  ? resumePath
                                  : `http://localhost:8080${
                                      resumePath.startsWith('/') ? '' : '/'
                                    }${resumePath}`

                                window.open(resumeUrl, '_blank')
                              } catch (error) {
                                console.error('Error opening resume:', error)
                                alert('Unable to open resume. Please check whether the resume path is being returned from the backend.')
                              }
                            }}
                            className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            View Resume
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-gray-900 font-medium mb-1">No applications yet</h3>
                  <p className="text-sm text-gray-500">Start by posting a job to receive applications</p>
                  <Link
                    to="/recruiter/jobs/new"
                    className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Post Your First Job
                  </Link>
                </div>
              )}
            </div>

            {/* Active Jobs Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Active Job Postings</h2>
                    <p className="text-sm text-gray-500">Your currently live job listings</p>
                  </div>
                  <Link
                    to="/recruiter/jobs"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Manage Jobs
                  </Link>
                </div>
              </div>

              {activeJobs.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {activeJobs.map((job) => (
                    <div
                      key={job.jobId}
                      className="p-5 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/recruiter/jobs?job=${job.jobId}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">{job.title || 'Untitled Position'}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {job.location || 'Remote'}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {job.salaryRange || 'Salary not disclosed'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-3">
                            {job.isFeatured && (
                              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                                Featured
                              </span>
                            )}
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              job.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {job.status || 'Draft'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">{job.applicationCount || 0}</p>
                          <p className="text-sm text-gray-500">applications</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-gray-900 font-medium mb-1">No active jobs</h3>
                  <p className="text-sm text-gray-500">Post your first job to attract candidates</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Subscription Card */}
            <div className={`rounded-xl shadow-md p-6 text-white ${
              currentPlan === 'FREE' 
                ? 'bg-gradient-to-br from-gray-500 to-gray-600' 
                : 'bg-gradient-to-br from-blue-500 to-blue-700'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium opacity-90">Current Plan</p>
                  <p className="text-3xl font-bold">{currentPlan}</p>
                </div>
                <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
              </div>

              {currentPlan === 'FREE' ? (
                <div className="space-y-3">
                  <p className="text-sm opacity-90">Limited to {planLimits.jobLimit} active jobs</p>
                  <div className="flex items-center justify-between text-sm">
                    <span>Active jobs:</span>
                    <span className="font-semibold">{stats.activeJobs}/{planLimits.jobLimit}</span>
                  </div>
                  <div className="h-2 bg-white bg-opacity-20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (stats.activeJobs / planLimits.jobLimit) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm opacity-90">Premium features unlocked</p>
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{planLimits.jobLimit === Infinity ? 'Unlimited' : planLimits.jobLimit} job postings</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{planLimits.featuredJobs} featured jobs</span>
                  </div>
                  {daysRemaining > 0 && (
                    <p className="text-sm mt-2">{daysRemaining} days remaining</p>
                  )}
                </div>
              )}

              <Link
                to="/recruiter/upgrade"
                className="mt-5 block w-full py-2.5 text-center bg-white text-blue-600 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors"
              >
                {currentPlan === 'FREE' ? 'Upgrade Plan' : 'Manage Subscription'}
              </Link>
            </div>

            {/* Activity Feed */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Activity Feed</h2>
                <span className="text-xs text-gray-500">Recent updates</span>
              </div>
              <div className="space-y-4">
                {activityFeed.length > 0 ? (
                  activityFeed.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                        {getActivityIcon(activity.icon)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 leading-snug">{activity.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(activity.timestamp)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-gray-500">No recent activity</p>
                  </div>
                )}
              </div>
              {activityFeed.length > 0 && (
                <Link
                  to="/recruiter/applications"
                  className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium mt-4 pt-4 border-t border-gray-100"
                >
                  View all activity
                </Link>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  to="/recruiter/applications"
                  className="flex items-center p-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors group"
                >
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-indigo-200 transition-colors">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Review Applications</p>
                    <p className="text-xs text-gray-500">{stats.newApplications} awaiting review</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>

                <Link
                  to="/recruiter/jobs"
                  className="flex items-center p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors group"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-green-200 transition-colors">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Manage Jobs</p>
                    <p className="text-xs text-gray-500">{stats.activeJobs} active postings</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>

                <Link
                  to="/recruiter/analytics"
                  className="flex items-center p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors group"
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-purple-200 transition-colors">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">View Analytics</p>
                    <p className="text-xs text-gray-500">Insights & reports</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>

                <Link
                  to="/recruiter/invoices"
                  className="flex items-center p-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors group"
                >
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-orange-200 transition-colors">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Invoices</p>
                    <p className="text-xs text-gray-500">Billing history</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Tips Card */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Pro Tip</h3>
                  <p className="text-sm text-gray-600">
                    Jobs with detailed descriptions receive 3x more applications. Add salary ranges and company benefits to attract top talent.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RecruiterDashboard