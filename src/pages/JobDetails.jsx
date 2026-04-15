import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { jobService, applicationService, profileService } from '../services/api'
import { useAuth } from '../context/AuthContext'

const JobDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, isCandidate, user } = useAuth()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorToast, setShowErrorToast] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [hasApplied, setHasApplied] = useState(false)

  useEffect(() => {
    fetchJobDetails()
    if (isAuthenticated && isCandidate) {
      checkIfApplied()
    }
  }, [id, isAuthenticated, isCandidate])

  const fetchJobDetails = async () => {
    try {
      setLoading(true)
      const response = await jobService.getJobById(id)
      setJob(response.data)
    } catch (error) {
      console.error('Error fetching job details:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkIfApplied = async () => {
    try {
      const response = await applicationService.getMyApplications()
      const applications = response.data || []
      const applied = applications.some(app => app.jobId === Number(id))
      setHasApplied(applied)
    } catch (error) {
      console.error('Error checking application status:', error)
    }
  }

  const handleApply = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/jobs/${id}` } })
      return
    }

    if (!isCandidate) {
      alert('Only candidates can apply for jobs')
      return
    }

    setShowApplyModal(true)
  }

  const submitApplication = async () => {
    try {
      setApplying(true)
      const applicationData = {
        jobId: Number(id),
        recruiterId: job.postedBy,
        coverLetter: coverLetter
      }
      console.log('Submitting application:', applicationData)
      await applicationService.submitApplication(applicationData)
      setShowApplyModal(false)
      setCoverLetter('')
      setShowSuccessModal(true)
    } catch (error) {
      console.error('Error applying:', error)
      setErrorMessage(error.response?.data?.message || 'Failed to submit application')
      setShowErrorToast(true)
      setTimeout(() => setShowErrorToast(false), 5000)
    } finally {
      setApplying(false)
    }
  }

  const handleSaveJob = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    try {
      if (saved) {
        await profileService.unsaveJob(id)
        setSaved(false)
      } else {
        await profileService.saveJob(id)
        setSaved(true)
      }
    } catch (error) {
      console.error('Error saving job:', error)
    }
  }

  const formatSalary = (min, max) => {
    return `₹${(min / 100000).toFixed(1)} - ₹${(max / 100000).toFixed(1)} LPA`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Job not found</h2>
          <Link to="/jobs" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
            Browse other jobs
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link to="/jobs" className="text-gray-500 hover:text-gray-700">← Back to Search Results</Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Job Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-3xl">
                    {job.title.charAt(0)}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                    <p className="text-lg text-gray-600">{job.companyName || 'Company Name'}</p>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full mt-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Verified Company
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  {isCandidate && (
                    <>
                      <button
                        onClick={handleSaveJob}
                        className={`px-4 py-2 border rounded-lg font-medium transition-colors flex items-center gap-2 ${
                          saved
                            ? 'border-blue-600 text-blue-600 bg-blue-50'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <svg className="w-5 h-5" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        {saved ? 'Saved' : 'Save Job'}
                      </button>
                      {hasApplied ? (
                        <Link
                          to="/candidate/applications"
                          className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          Applied
                        </Link>
                      ) : (
                        <button
                          onClick={handleApply}
                          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Apply Now
                        </button>
                      )}
                    </>
                  )}
                  {isRecruiter && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Recruiter View</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-gray-500 text-sm mb-1">Expected Salary</p>
                  <p className="font-semibold text-gray-900">{formatSalary(job.minSalary, job.maxSalary)}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500 text-sm mb-1">Experience</p>
                  <p className="font-semibold text-gray-900">{job.experienceRequired} - {job.experienceRequired + 3} Years</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500 text-sm mb-1">Location</p>
                  <p className="font-semibold text-gray-900">{job.location}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500 text-sm mb-1">Job Type</p>
                  <p className="font-semibold text-gray-900">{job.type}</p>
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Job Description</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{job.description}</p>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Requirements</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>{job.experienceRequired}+ years of hands-on experience</li>
                <li>Strong knowledge of {job.skills?.join(', ')}</li>
                <li>Good understanding of software development lifecycle</li>
                <li>Excellent problem-solving skills</li>
                <li>Strong communication and teamwork abilities</li>
              </ul>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills?.map((skill, idx) => (
                  <span key={idx} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Job Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Job Overview</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500">Job Title</p>
                    <p className="font-medium text-gray-900">{job.title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500">Company</p>
                    <p className="font-medium text-gray-900">{job.companyName || 'Company Name'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500">Experience</p>
                    <p className="font-medium text-gray-900">{job.experienceRequired}+ Years</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium text-gray-900">{job.location} ({job.type})</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500">Salary</p>
                    <p className="font-medium text-gray-900">{formatSalary(job.minSalary, job.maxSalary)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500">Posted On</p>
                    <p className="font-medium text-gray-900">
                      {job.postedAt ? new Date(job.postedAt).toLocaleDateString() : 'Recently'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* About Company */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">About Company</h2>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold">
                  {job.companyName?.charAt(0) || 'C'}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{job.companyName || 'Company Name'}</p>
                  <p className="text-sm text-gray-500">Technology Services</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-3">
                Leading global IT services and consulting company providing innovative solutions.
              </p>
              <Link to="/" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View Company Profile →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 99999
          }}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl w-full overflow-y-auto"
            style={{ maxWidth: '600px', maxHeight: '90vh' }}
          >
            {/* Header */}
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-2xl">
                  {job.title.charAt(0)}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">Apply for {job.title}</h2>
                  <p className="text-gray-600">{job.companyName || 'Company Name'}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>{job.location}</span>
                    <span>•</span>
                    <span>{job.type}</span>
                    <span>•</span>
                    <span>{formatSalary(job.minSalary, job.maxSalary)}</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowApplyModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6 space-y-6">
              {/* Personal Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Name</p>
                    <p className="font-medium text-gray-900">{user?.email?.split('@')[0] || 'Applicant'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{user?.email || 'Not available'}</p>
                  </div>
                </div>
              </div>

              {/* Cover Letter */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Cover Letter <span className="text-gray-500 font-normal">(Optional)</span>
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={6}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Tell the employer why you're interested in this position and what makes you a great fit. Highlight your relevant experience and skills..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Pro tip: Mention specific achievements or projects that demonstrate your expertise in {job.skills?.slice(0, 3).join(', ') || 'the required skills'}.
                </p>
              </div>

              {/* Resume Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">Resume</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Your profile resume will be attached to this application. Make sure it's up to date in your profile.
                    </p>
                    <Link 
                      to="/profile" 
                      className="text-sm text-blue-600 hover:text-blue-800 mt-2 inline-block"
                      onClick={() => setShowApplyModal(false)}
                    >
                      Update Resume →
                    </Link>
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>
                  By submitting this application, you agree to share your profile information with the employer. 
                  You can withdraw your application anytime from your dashboard.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-6 flex gap-3">
              <button
                onClick={() => setShowApplyModal(false)}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={submitApplication}
                disabled={applying}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
              >
                {applying ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>Submit Application</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Your application for <span className="font-semibold">{job?.title}</span> has been sent to the employer. 
              You can track its status in your dashboard.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowSuccessModal(false)
                  navigate('/candidate/applications')
                }}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                View My Applications
              </button>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Continue Browsing Jobs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {showErrorToast && (
        <div className="fixed bottom-6 right-6 z-[9999]">
          <div className="bg-red-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-in-right">
            <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-semibold">Application Failed</p>
              <p className="text-sm opacity-90">{errorMessage}</p>
            </div>
            <button 
              onClick={() => setShowErrorToast(false)}
              className="ml-4 text-white opacity-70 hover:opacity-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default JobDetails
