import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { applicationService, jobService } from '../../services/api'

const ManageApplications = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [applications, setApplications] = useState([])
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState(searchParams.get('jobId') || 'ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    fetchJobs()
    fetchApplications()
  }, [])

  useEffect(() => {
    fetchApplications()
  }, [selectedJob, statusFilter])

  const fetchJobs = async () => {
    try {
      const response = await jobService.getAllJobs()
      setJobs(response.data)
    } catch (error) {
      console.error('Error fetching jobs:', error)
    }
  }

  const fetchApplications = async () => {
    try {
      setLoading(true)
      let response
      if (selectedJob !== 'ALL') {
        response = await applicationService.getJobApplications(selectedJob)
      } else {
        response = await applicationService.getRecruiterApplications()
      }
      let apps = response.data
      if (statusFilter !== 'ALL') {
        apps = apps.filter(app => app.status === statusFilter)
      }
      setApplications(apps)
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      await applicationService.updateStatus(applicationId, newStatus)
      setApplications(applications.map(app =>
        app.applicationId === applicationId ? { ...app, status: newStatus } : app
      ))
      if (selectedApplication?.applicationId === applicationId) {
        setSelectedApplication({ ...selectedApplication, status: newStatus })
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update application status')
    }
  }

  const viewApplicationDetail = (application) => {
    setSelectedApplication(application)
    setShowDetailModal(true)
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

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'APPLIED').length,
    shortlisted: applications.filter(a => a.status === 'SHORTLISTED').length,
    interviews: applications.filter(a => a.status === 'INTERVIEW_SCHEDULED').length,
    offered: applications.filter(a => a.status === 'OFFERED').length,
    rejected: applications.filter(a => a.status === 'REJECTED').length
  }

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
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link to="/recruiter/dashboard" className="hover:text-gray-700">Dashboard</Link>
            <span>/</span>
            <span className="text-gray-900">Manage Applications</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Applications</h1>
          <p className="text-gray-600">Review and manage candidate applications</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-sm text-gray-600">Total</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <p className="text-2xl font-bold text-green-600">{stats.shortlisted}</p>
            <p className="text-sm text-gray-600">Shortlisted</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <p className="text-2xl font-bold text-purple-600">{stats.interviews}</p>
            <p className="text-sm text-gray-600">Interviews</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <p className="text-2xl font-bold text-emerald-600">{stats.offered}</p>
            <p className="text-sm text-gray-600">Offers</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            <p className="text-sm text-gray-600">Rejected</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Job</label>
              <select
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">All Jobs</option>
                {jobs.map(job => (
                  <option key={job.jobId} value={job.jobId}>{job.title}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="APPLIED">Applied</option>
                <option value="SHORTLISTED">Shortlisted</option>
                <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                <option value="OFFERED">Offered</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Skills Match
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.length > 0 ? (
                  applications.map((app) => (
                    <tr key={app.applicationId} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-3">
                            {app.candidateName?.charAt(0) || 'C'}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{app.candidateName || 'Candidate'}</div>
                            <div className="text-sm text-gray-500">{app.candidateEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{app.jobTitle || 'Job Title'}</div>
                        <div className="text-sm text-gray-500">{app.experienceRequired}+ years exp required</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {app.candidateSkills?.slice(0, 3).map((skill, idx) => (
                            <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              {skill}
                            </span>
                          ))}
                          {app.candidateSkills?.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                              +{app.candidateSkills.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {app.appliedAt && `${Math.floor((Date.now() - new Date(app.appliedAt)) / (1000 * 60 * 60 * 24))} days ago`}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(app.status)}`}>
                          {app.status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => viewApplicationDetail(app)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            View
                          </button>
                          {app.status === 'APPLIED' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(app.applicationId, 'SHORTLISTED')}
                                className="text-green-600 hover:text-green-700 text-sm font-medium"
                              >
                                Shortlist
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(app.applicationId, 'REJECTED')}
                                className="text-red-600 hover:text-red-700 text-sm font-medium"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
                      <p className="text-gray-500">Adjust your filters to see more results</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Application Detail Modal */}
      {showDetailModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Application Details</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Candidate Info */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-2xl">
                  {selectedApplication.candidateName?.charAt(0) || 'C'}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedApplication.candidateName || 'Candidate'}</h3>
                  <p className="text-gray-600">{selectedApplication.candidateEmail}</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${getStatusBadgeClass(selectedApplication.status)}`}>
                    {selectedApplication.status?.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Job Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-500 mb-1">Applied for</p>
                <p className="font-semibold text-gray-900">{selectedApplication.jobTitle || 'Job Title'}</p>
                <p className="text-sm text-gray-600">Applied on {selectedApplication.appliedAt ? new Date(selectedApplication.appliedAt).toLocaleDateString() : 'N/A'}</p>
              </div>

              {/* Skills */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Candidate Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedApplication.candidateSkills?.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Cover Letter */}
              {selectedApplication.coverLetter && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Cover Letter</h4>
                  <div className="bg-gray-50 rounded-lg p-4 text-gray-700 whitespace-pre-line">
                    {selectedApplication.coverLetter}
                  </div>
                </div>
              )}

              {/* Resume */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Resume</h4>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Resume
                </a>
              </div>

              {/* Status Update Actions */}
              <div className="border-t border-gray-100 pt-6">
                <h4 className="font-semibold text-gray-900 mb-3">Update Status</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleStatusUpdate(selectedApplication.applicationId, 'APPLIED')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedApplication.status === 'APPLIED'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Applied
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedApplication.applicationId, 'SHORTLISTED')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedApplication.status === 'SHORTLISTED'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Shortlisted
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedApplication.applicationId, 'INTERVIEW_SCHEDULED')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedApplication.status === 'INTERVIEW_SCHEDULED'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Interview Scheduled
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedApplication.applicationId, 'OFFERED')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedApplication.status === 'OFFERED'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Offered
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedApplication.applicationId, 'REJECTED')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedApplication.status === 'REJECTED'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Rejected
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageApplications
