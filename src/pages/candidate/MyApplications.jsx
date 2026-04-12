import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { applicationService } from '../../services/api'

const MyApplications = () => {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const response = await applicationService.getMyApplications()
      setApplications(response.data)
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = async (applicationId) => {
    if (!confirm('Are you sure you want to withdraw this application?')) {
      return
    }

    try {
      await applicationService.withdrawApplication(applicationId)
      alert('Application withdrawn successfully')
      fetchApplications()
    } catch (error) {
      console.error('Error withdrawing application:', error)
      alert('Failed to withdraw application')
    }
  }

  const getStatusBadgeClass = (status) => {
    const classes = {
      APPLIED: 'bg-blue-100 text-blue-700',
      SHORTLISTED: 'bg-green-100 text-green-700',
      INTERVIEW_SCHEDULED: 'bg-purple-100 text-purple-700',
      OFFERED: 'bg-emerald-100 text-emerald-700',
      REJECTED: 'bg-red-100 text-red-700',
      WITHDRAWN: 'bg-gray-100 text-gray-700'
    }
    return classes[status] || 'bg-gray-100 text-gray-700'
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPLIED':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'SHORTLISTED':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case 'INTERVIEW_SCHEDULED':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )
      case 'OFFERED':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'REJECTED':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
    }
  }

  const filteredApplications = applications.filter(app => {
    if (filter === 'ALL') return true
    return app.status === filter
  })

  const filterOptions = [
    { value: 'ALL', label: 'All Applications' },
    { value: 'APPLIED', label: 'Applied' },
    { value: 'SHORTLISTED', label: 'Shortlisted' },
    { value: 'INTERVIEW_SCHEDULED', label: 'Interview Scheduled' },
    { value: 'OFFERED', label: 'Offered' },
    { value: 'REJECTED', label: 'Rejected' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-600">Track and manage your job applications</p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <p className="text-2xl font-bold text-blue-600">{applications.length}</p>
            <p className="text-sm text-gray-600">Total Applied</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <p className="text-2xl font-bold text-green-600">
              {applications.filter(a => a.status === 'SHORTLISTED').length}
            </p>
            <p className="text-sm text-gray-600">Shortlisted</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <p className="text-2xl font-bold text-purple-600">
              {applications.filter(a => a.status === 'INTERVIEW_SCHEDULED').length}
            </p>
            <p className="text-sm text-gray-600">Interviews</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <p className="text-2xl font-bold text-emerald-600">
              {applications.filter(a => a.status === 'OFFERED').length}
            </p>
            <p className="text-sm text-gray-600">Offers</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex flex-wrap gap-2 p-4">
              {filterOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                  {option.value !== 'ALL' && (
                    <span className="ml-2 px-2 py-0.5 bg-white bg-opacity-20 rounded-full text-xs">
                      {applications.filter(a => a.status === option.value).length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Applications List */}
          <div className="divide-y divide-gray-100">
            {filteredApplications.length > 0 ? (
              filteredApplications.map((application) => (
                <div key={application.applicationId} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-xl">
                        {application.jobTitle?.charAt(0) || 'J'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {application.jobTitle || 'Job Title'}
                        </h3>
                        <p className="text-gray-600">{application.companyName || 'Company Name'}</p>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {application.location || 'Location'}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Applied {application.appliedAt ? new Date(application.appliedAt).toLocaleDateString() : 'Recently'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(application.status)}`}>
                        {getStatusIcon(application.status)}
                        {application.status?.replace(/_/g, ' ')}
                      </span>
                      {application.status === 'APPLIED' && (
                        <button
                          onClick={() => handleWithdraw(application.applicationId)}
                          className="text-sm text-red-600 hover:text-red-700 font-medium"
                        >
                          Withdraw
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Application Timeline */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        ['APPLIED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'OFFERED'].includes(application.status)
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="h-0.5 w-12 bg-gray-200"></div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        ['SHORTLISTED', 'INTERVIEW_SCHEDULED', 'OFFERED'].includes(application.status)
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="h-0.5 w-12 bg-gray-200"></div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        ['INTERVIEW_SCHEDULED', 'OFFERED'].includes(application.status)
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="h-0.5 w-12 bg-gray-200"></div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        application.status === 'OFFERED'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="w-8 text-center">Applied</span>
                      <span className="w-12"></span>
                      <span className="w-8 text-center">Shortlisted</span>
                      <span className="w-12"></span>
                      <span className="w-8 text-center">Interview</span>
                      <span className="w-12"></span>
                      <span className="w-8 text-center">Offer</span>
                    </div>
                  </div>

                  {/* Cover Letter Preview */}
                  {application.coverLetter && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-1">Your Cover Letter:</p>
                      <p className="text-sm text-gray-600 line-clamp-3">{application.coverLetter}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {filter === 'ALL' ? 'No applications yet' : `No ${filter.toLowerCase().replace(/_/g, ' ')} applications`}
                </h3>
                <p className="text-gray-500 mb-4">
                  {filter === 'ALL'
                    ? 'Start applying to jobs and track your progress here'
                    : 'Try selecting a different filter'}
                </p>
                {filter === 'ALL' && (
                  <Link
                    to="/jobs"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Browse Jobs
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyApplications
