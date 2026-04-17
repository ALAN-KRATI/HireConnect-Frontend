import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { applicationService, jobService, interviewService } from '../../services/api'

const ManageApplications = () => {
  const [searchParams] = useSearchParams()
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
    mode: 'ONLINE',
    meetLink: '',
    location: '',
    notes: ''
  })

  useEffect(() => {
    fetchJobs()
  }, [])

  useEffect(() => {
    fetchApplications()
  }, [selectedJob, statusFilter])

  const fetchJobs = async () => {
    try {
      const response = await jobService.getAllJobs()
      setJobs(response.data || [])
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
      mode: 'ONLINE',
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
        meetLink: interviewForm.mode === 'ONLINE' ? interviewForm.meetLink : null,
        location: interviewForm.mode === 'IN_PERSON' ? interviewForm.location : null,
        notes: interviewForm.notes
      }

      await interviewService.scheduleInterview(interviewData)
      await applicationService.advanceCandidate(selectedApplication.applicationId)

      alert('Interview scheduled successfully!')
      setShowInterviewModal(false)
      fetchApplications()
    } catch (error) {
      console.error('Error scheduling interview:', error)
      alert('Failed to schedule interview. Backend is throwing hands again 😭')
    }
  }

  const handleShortlist = async (applicationId) => {
    try {
      await applicationService.shortlistCandidate(applicationId)
      fetchApplications()
    } catch (error) {
      console.error('Error shortlisting candidate:', error)
    }
  }

  const handleReject = async (applicationId) => {
    try {
      await applicationService.rejectCandidate(applicationId)
      fetchApplications()
    } catch (error) {
      console.error('Error rejecting candidate:', error)
    }
  }

  const getStatusBadgeClass = (status) => {
    const classes = {
      APPLIED: 'bg-blue-100 text-blue-700',
      SHORTLISTED: 'bg-green-100 text-green-700',
      INTERVIEW_SCHEDULED: 'bg-purple-100 text-purple-700',
      OFFERED: 'bg-emerald-100 text-emerald-700',
      REJECTED: 'bg-red-100 text-red-700'
    }

    return classes[status] || 'bg-gray-100 text-gray-700'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-b-2 border-blue-600 animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-wrap gap-4">
          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="ALL">All Jobs</option>
            {jobs.map(job => (
              <option key={job.jobId} value={job.jobId}>
                {job.title}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="ALL">All Status</option>
            <option value="APPLIED">Applied</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Candidate</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Job</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>

            <tbody>
              {applications.map(app => (
                <tr key={app.applicationId} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {app.candidateName || 'Candidate'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {app.candidateEmail}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-gray-800">
                    {app.jobTitle}
                  </td>

                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(app.status)}`}>
                      {app.status?.replace(/_/g, ' ')}
                    </span>
                  </td>

                  <td className="px-6 py-4 flex gap-2 flex-wrap">
                    {app.status === 'APPLIED' && (
                      <>
                        <button
                          onClick={() => handleShortlist(app.applicationId)}
                          className="px-3 py-1 text-sm rounded border border-green-600 text-green-600 hover:bg-green-50"
                        >
                          Shortlist
                        </button>

                        <button
                          onClick={() => handleReject(app.applicationId)}
                          className="px-3 py-1 text-sm rounded border border-red-600 text-red-600 hover:bg-red-50"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {app.status === 'SHORTLISTED' && (
                      <button
                        onClick={() => openInterviewModal(app)}
                        className="px-3 py-1 text-sm rounded border border-purple-600 text-purple-600 hover:bg-purple-50"
                      >
                        Schedule Interview
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showInterviewModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">
                  Schedule Interview
                </h2>
                <p className="text-gray-500 mt-1">
                  For {selectedApplication?.candidateName}
                </p>
              </div>

              <form onSubmit={handleScheduleInterview} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={interviewForm.scheduledAt}
                    onChange={(e) =>
                      setInterviewForm({
                        ...interviewForm,
                        scheduledAt: e.target.value
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Interview Mode
                  </label>
                  <select
                    value={interviewForm.mode}
                    onChange={(e) =>
                      setInterviewForm({
                        ...interviewForm,
                        mode: e.target.value
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="ONLINE">Video Call</option>
                    <option value="IN_PERSON">In-Person</option>
                  </select>
                </div>

                {interviewForm.mode === 'ONLINE' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meeting Link
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://meet.google.com/..."
                      value={interviewForm.meetLink}
                      onChange={(e) =>
                        setInterviewForm({
                          ...interviewForm,
                          meetLink: e.target.value
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                )}

                {interviewForm.mode === 'IN_PERSON' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Office address / conference room"
                      value={interviewForm.location}
                      onChange={(e) =>
                        setInterviewForm({
                          ...interviewForm,
                          location: e.target.value
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    rows="3"
                    value={interviewForm.notes}
                    onChange={(e) =>
                      setInterviewForm({
                        ...interviewForm,
                        notes: e.target.value
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Optional notes for the candidate..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowInterviewModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    Schedule
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ManageApplications