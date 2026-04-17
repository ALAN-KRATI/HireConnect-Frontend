import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { applicationService, jobService } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const ApplicationDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [application, setApplication] = useState(null)
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false)

  useEffect(() => {
    fetchApplicationDetails()
  }, [id])

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true)
      const appResponse = await applicationService.getApplicationById(id)
      setApplication(appResponse.data)
      
      // Fetch job details
      if (appResponse.data.jobId) {
        const jobResponse = await jobService.getJobById(appResponse.data.jobId)
        setJob(jobResponse.data)
      }
    } catch (error) {
      console.error('Error fetching application details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = async () => {
    try {
      await applicationService.withdrawApplication(id)
      setShowWithdrawConfirm(false)
      fetchApplicationDetails()
    } catch (error) {
      console.error('Error withdrawing:', error)
    }
  }

  const formatSalary = (min, max) => {
    if (!min || !max) return 'Not specified'
    return `₹${(min / 100000).toFixed(1)} - ₹${(max / 100000).toFixed(1)} LPA`
  }

  const getStatusBadgeClass = (status) => {
    const classes = {
      APPLIED: 'bg-blue-100 text-blue-700 border-blue-200',
      SHORTLISTED: 'bg-green-100 text-green-700 border-green-200',
      INTERVIEW_SCHEDULED: 'bg-purple-100 text-purple-700 border-purple-200',
      OFFERED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      REJECTED: 'bg-red-100 text-red-700 border-red-200',
      WITHDRAWN: 'bg-gray-100 text-gray-700 border-gray-200'
    }
    return classes[status] || 'bg-gray-100 text-gray-700 border-gray-200'
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPLIED':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'SHORTLISTED':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case 'INTERVIEW_SCHEDULED':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )
      case 'OFFERED':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'REJECTED':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
    }
  }

  const getTimelineSteps = () => {
    const steps = [
      { key: 'APPLIED', label: 'Application Submitted', date: application?.appliedAt },
      { key: 'SHORTLISTED', label: 'Shortlisted', date: application?.shortlistedAt },
      { key: 'INTERVIEW_SCHEDULED', label: 'Interview Scheduled', date: application?.interviewScheduledAt },
      { key: 'OFFERED', label: 'Offer Received', date: application?.offeredAt }
    ]
    
    const currentStepIndex = steps.findIndex(step => step.key === application?.status)
    
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentStepIndex,
      current: index === currentStepIndex && application?.status !== 'REJECTED' && application?.status !== 'WITHDRAWN'
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Not Found</h2>
          <p className="text-gray-600 mb-4">The application you're looking for doesn't exist.</p>
          <Link to="/candidate/applications" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Back to My Applications
          </Link>
        </div>
      </div>
    )
  }

  const timelineSteps = getTimelineSteps()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-6 text-sm text-gray-600">
          <Link to="/candidate/dashboard" className="hover:text-gray-900">Dashboard</Link>
          <span>/</span>
          <Link to="/candidate/applications" className="hover:text-gray-900">My Applications</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Application Details</span>
        </nav>

        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="p-8">
            <div className="flex items-start justify-between">
              <div className="flex gap-6">
                <div className="w-20 h-20 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold text-3xl flex-shrink-0">
                  {job?.title?.charAt(0) || application?.jobTitle?.charAt(0) || 'J'}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    {job?.title || application?.jobTitle || 'Job Title'}
                  </h1>
                  <p className="text-lg text-gray-600 mb-3">
                    {job?.companyName || application?.companyName || 'Company Name'}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {job?.location || application?.location || 'Location'}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatSalary(job?.minSalary, job?.maxSalary)}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {job?.type || 'Full Time'}
                    </span>
                  </div>
                </div>
              </div>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${getStatusBadgeClass(application.status)}`}>
                {getStatusIcon(application.status)}
                {application.status?.replace(/_/g, ' ')}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="border-t border-gray-200 px-8 py-4 bg-gray-50 flex flex-wrap gap-3">
            <Link
              to={`/jobs/${job?.jobId || application.jobId}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Original Job Post
            </Link>
            
            {application.status === 'APPLIED' && (
              <button
                onClick={() => setShowWithdrawConfirm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Withdraw Application
              </button>
            )}

            {application.status === 'INTERVIEW_SCHEDULED' && (
              <Link
                to="/candidate/interviews"
                className="inline-flex items-center gap-2 px-4 py-2 border border-purple-600 text-purple-600 text-sm font-medium rounded-lg hover:bg-purple-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                View Interview Details
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Application Timeline */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Application Timeline</h2>
              
              <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                
                {timelineSteps.map((step, index) => (
                  <div key={step.key} className="relative flex gap-4 mb-8 last:mb-0">
                    {/* Status Icon */}
                    <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                      step.completed
                        ? step.current
                          ? 'bg-blue-600 text-white'
                          : 'bg-green-100 text-green-600 border-2 border-green-200'
                        : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                    }`}>
                      {step.completed ? (
                        step.current ? (
                          <span className="text-lg font-bold">{index + 1}</span>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )
                      ) : (
                        <span className="text-lg font-medium">{index + 1}</span>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 pt-2">
                      <h3 className={`font-semibold ${step.completed ? 'text-gray-900' : 'text-gray-400'}`}>
                        {step.label}
                      </h3>
                      {step.date && (
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(step.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      )}
                      {step.current && (
                        <p className="text-sm text-blue-600 mt-1 font-medium">Current Status</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cover Letter */}
            {application.coverLetter && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Your Cover Letter</h2>
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {application.coverLetter}
                  </p>
                </div>
              </div>
            )}

            {/* Additional Notes */}
            {application.notes && (
              <div className="bg-yellow-50 rounded-2xl border border-yellow-200 p-8">
                <h2 className="text-lg font-bold text-yellow-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Recruiter Notes
                </h2>
                <p className="text-yellow-800 leading-relaxed">{application.notes}</p>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Application Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Application Info</h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Application ID</span>
                  <span className="font-mono text-gray-700">#{id.slice(-8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Applied On</span>
                  <span className="text-gray-700">
                    {application.appliedAt ? new Date(application.appliedAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Last Updated</span>
                  <span className="text-gray-700">
                    {application.updatedAt ? new Date(application.updatedAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Job ID</span>
                  <span className="text-gray-700">#{application.jobId}</span>
                </div>
              </div>
            </div>

            {/* Contact Recruiter */}
            <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6">
              <h3 className="font-bold text-blue-900 mb-2">Need Help?</h3>
              <p className="text-blue-700 text-sm mb-4">
                If you have questions about this application, contact the recruiter through your messages.
              </p>
              <button className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Message Recruiter
              </button>
            </div>

            {/* Similar Jobs */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Similar Jobs</h3>
              <p className="text-gray-500 text-sm">
                Looking for more opportunities? Browse similar positions.
              </p>
              <Link
                to="/jobs"
                className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Browse Jobs
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Withdraw Confirmation Modal */}
        {showWithdrawConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Withdraw Application?</h2>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to withdraw your application for <strong>{job?.title || 'this position'}</strong>? 
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowWithdrawConfirm(false)}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleWithdraw}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
                >
                  Yes, Withdraw
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ApplicationDetails