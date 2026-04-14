import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { applicationService, jobService, interviewService } from '../../services/api'

const ManageApplications = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [applications, setApplications] = useState([])
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState(searchParams.get('jobId') || 'ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showInterviewModal, setShowInterviewModal] = useState(false)
  const [interviewForm, setInterviewForm] = useState({
    scheduledAt: '',
    mode: 'VIDEO',
    meetLink: '',
    location: '',
    notes: ''
  })

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
        response = await applicationService.getByJob(selectedJob)
      } else {
        response = await applicationService.getRecruiterApplications()
      }
      let apps = response.data || []
      if (statusFilter !== 'ALL') {
        apps = apps.filter(app => app.status === statusFilter)
      }
      setApplications(apps)
    } catch (error) {
      console.error('Error fetching applications:', error)
      setApplications([])
    } finally {
      setLoading(false)
    }
  }

  const openInterviewModal = (application) => {
    setSelectedApplication(application)
    setShowInterviewModal(true)
    setInterviewForm({
      scheduledAt: '',
      mode: 'VIDEO',
      meetLink: '',
      location: '',
      notes: ''
    })
  }

  const handleScheduleInterview = async (e) => {
    e.preventDefault()
    if (!selectedApplication) return

    try {
      const interviewData = {
        applicationId: selectedApplication.applicationId,
        candidateId: selectedApplication.candidateId,
        recruiterId: selectedApplication.recruiterId,
        scheduledAt: new Date(interviewForm.scheduledAt).toISOString(),
        mode: interviewForm.mode,
        meetLink: interviewForm.meetLink,
        location: interviewForm.location,
        notes: interviewForm.notes
      }

      await interviewService.scheduleInterview(interviewData)
      await applicationService.advanceCandidate(selectedApplication.applicationId)
      
      alert('Interview scheduled successfully!')
      setShowInterviewModal(false)
      fetchApplications()
    } catch (error) {
      console.error('Error scheduling interview:', error)
      alert('Failed to schedule interview. Please try again.')
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

  const handleShortlist = async (applicationId) => {
    if (!confirm('Are you sure you want to shortlist this candidate?')) return
    try {
      await applicationService.shortlistCandidate(applicationId)
      fetchApplications()
      alert('Candidate shortlisted successfully!')
    } catch (error) {
      console.error('Error shortlisting candidate:', error)
      alert('Failed to shortlist candidate')
    }
  }

  const handleReject = async (applicationId) => {
    if (!confirm('Are you sure you want to reject this candidate?')) return
    try {
      await applicationService.rejectCandidate(applicationId)
      fetchApplications()
      alert('Candidate rejected successfully!')
    } catch (error) {
      console.error('Error rejecting candidate:', error)
      alert('Failed to reject candidate')
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
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-600">Total</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
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
            <p className="text-sm text-gray-600">Offered</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            <p className="text-sm text-gray-600">Rejected</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
          <div className="flex flex-wrap gap-4">
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">All Jobs</option>
                {jobs.map(job => (
                  <option key={job.jobId} value={job.jobId}>{job.title}</option>
                ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">All Status</option>
              <option value="APPLIED">Applied</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
              <option value="OFFERED">Offered</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {applications.map((app) => (
                  <tr key={app.applicationId} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{app.candidateName || 'Candidate'}</div>
                        <div className="text-sm text-gray-500">{app.candidateEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{app.jobTitle || 'Job'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(app.status)}`}>
                        {app.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                     <td className="px-6 py-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => viewApplicationDetail(app)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium px-2 py-1 border border-blue-600 rounded hover:bg-blue-50 transition-colors"
                        >
                          View
                        </button>
                        
                        {app.status === 'APPLIED' && (
                          <>
                            <button
                              onClick={() => handleShortlist(app.applicationId)}
                              className="text-green-600 hover:text-green-700 text-sm font-medium px-2 py-1 border border-green-600 rounded hover:bg-green-50 transition-colors"
                            >
                              Shortlist
                            </button>
                            <button
                              onClick={() => handleReject(app.applicationId)}
                              className="text-red-600 hover:text-red-700 text-sm font-medium px-2 py-1 border border-red-600 rounded hover:bg-red-50 transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        
                        {app.status === 'SHORTLISTED' && (
                          <>
                            <button
                              onClick={() => openInterviewModal(app)}
                              className="text-purple-600 hover:text-purple-700 text-sm font-medium px-2 py-1 border border-purple-600 rounded hover:bg-purple-50 transition-colors"
                            >
                              Schedule Interview
                            </button>
                            <button
                              onClick={() => handleReject(app.applicationId)}
                              className="text-red-600 hover:text-red-700 text-sm font-medium px-2 py-1 border border-red-600 rounded hover:bg-red-50 transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        
                        {(app.status === 'INTERVIEW_SCHEDULED' || app.status === 'OFFERED') && (
                          <button
                            onClick={() => handleReject(app.applicationId)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium px-2 py-1 border border-red-600 rounded hover:bg-red-50 transition-colors"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Schedule Interview Modal */}
      {showInterviewModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Schedule Interview</h2>
              <p className="text-gray-600 mt-1">with {selectedApplication.candidateName}</p>
            </div>

            <form onSubmit={handleScheduleInterview} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={interviewForm.scheduledAt}
                  onChange={(e) => setInterviewForm({...interviewForm, scheduledAt: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mode *</label>
                <select
                  value={interviewForm.mode}
                  onChange={(e) => setInterviewForm({...interviewForm, mode: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="VIDEO">Video Call</option>
                  <option value="PHONE">Phone</option>
                  <option value="IN_PERSON">In-Person</option>
                </select>
              </div>

              {interviewForm.mode === 'VIDEO' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link</label>
                  <input
                    type="url"
                    value={interviewForm.meetLink}
                    onChange={(e) => setInterviewForm({...interviewForm, meetLink: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowInterviewModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageApplications
