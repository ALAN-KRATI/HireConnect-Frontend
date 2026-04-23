import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { applicationService, jobService, interviewService } from '../../services/api'

const ManageApplications = () => {
  const [searchParams] = useSearchParams()
  const [applications, setApplications] = useState([])
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState(searchParams.get('jobId') || 'ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedApplication, setSelectedApplication] = useState(null)
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

      // attach interview details for interview-scheduled applications
      const appsWithInterviewData = await Promise.all(
        apps.map(async (app) => {
          if (app.status !== 'INTERVIEW_SCHEDULED') return app

          try {
            const interviewResponse = await interviewService.getInterviewsByApplication(
              app.applicationId
            )

            const interview = Array.isArray(interviewResponse.data)
              ? interviewResponse.data[0]
              : interviewResponse.data

            return {
              ...app,
              interview
            }
          } catch (error) {
            console.error(
              `Error fetching interview for application ${app.applicationId}:`,
              error
            )
            return app
          }
        })
      )

      if (statusFilter !== 'ALL') {
        apps = appsWithInterviewData.filter(
          (app) => app.status === statusFilter
        )
      } else {
        apps = appsWithInterviewData
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
        meetLink:
          interviewForm.mode === 'ONLINE' ? interviewForm.meetLink : null,
        location:
          interviewForm.mode === 'IN_PERSON' ? interviewForm.location : null,
        notes: interviewForm.notes
      }

      await interviewService.scheduleInterview(interviewData)
      await applicationService.advanceCandidate(selectedApplication.applicationId)

      alert('Interview scheduled successfully!')
      setShowInterviewModal(false)
      fetchApplications()
    } catch (error) {
      console.error('Error scheduling interview:', error)
      alert('Failed to schedule interview.')
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

  const handleOffer = async (applicationId) => {
    try {
      await applicationService.updateStatus(applicationId, 'OFFERED')
      alert('Candidate offered successfully!')
      fetchApplications()
    } catch (error) {
      console.error('Error offering candidate:', error)
      alert('Failed to offer candidate')
    }
  }

  const handleRejectAfterInterview = async (applicationId) => {
    try {
      await applicationService.updateStatus(applicationId, 'REJECTED')
      alert('Candidate rejected successfully!')
      fetchApplications()
    } catch (error) {
      console.error('Error rejecting candidate after interview:', error)
      alert('Failed to reject candidate')
    }
  }

  const isInterviewCompleted = (app) => {
    if (!app.interview?.scheduledAt) return false

    const interviewTime = new Date(app.interview.scheduledAt)
    const now = new Date()

    return now > interviewTime
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
            {jobs.map((job) => (
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
            <option value="OFFERED">Offered</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                  Candidate
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                  Job
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {applications.map((app) => (
                <tr key={app.applicationId} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {app.candidateName || 'Candidate'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {app.candidateEmail}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-gray-800">{app.jobTitle}</td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(
                        app.status
                      )}`}
                    >
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
                            onClick={() => handleRejectAfterInterview(app.applicationId)}
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

                    {app.status === 'INTERVIEW_SCHEDULED' && (
                      isInterviewCompleted(app) ? (
                        <>
                          <button
                            onClick={() => handleOffer(app.applicationId)}
                            className="px-3 py-1 text-sm rounded border border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                          >
                            Offer
                          </button>

                          <button
                            onClick={() => handleReject(app.applicationId)}
                            className="px-3 py-1 text-sm rounded border border-red-600 text-red-600 hover:bg-red-50"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-sm text-gray-500 italic">
                          Waiting for interview to finish...
                        </span>
                      )
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
              {/* keep your existing modal exactly as it is */}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ManageApplications

