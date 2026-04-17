import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { interviewService } from '../../services/api.js'

const MyInterviews = () => {
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInterviews()
  }, [])

  const fetchInterviews = async () => {
    try {
      setLoading(true)
      const response = await interviewService.getMyInterviews()
      setInterviews(response.data)
    } catch (error) {
      console.error('Error fetching interviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async (interviewId) => {
    try {
      await interviewService.confirmInterview(interviewId)
      alert('Interview confirmed successfully')
      fetchInterviews()
    } catch (error) {
      console.error('Error confirming interview:', error)
      alert('Failed to confirm interview')
    }
  }

  const getStatusBadgeClass = (status) => {
    const classes = {
      SCHEDULED: 'bg-blue-100 text-blue-700',
      CONFIRMED: 'bg-green-100 text-green-700',
      RESCHEDULED: 'bg-yellow-100 text-yellow-700',
      CANCELLED: 'bg-red-100 text-red-700',
      COMPLETED: 'bg-gray-100 text-gray-700'
    }
    return classes[status] || 'bg-gray-100 text-gray-700'
  }

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'N/A'
    const date = new Date(dateTime)
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Interviews</h1>
          <p className="mt-2 text-gray-600">Track and manage your upcoming interviews</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <p className="text-3xl font-bold text-blue-600">{interviews.filter(i => i.status === 'SCHEDULED').length}</p>
            <p className="text-sm text-gray-600">Scheduled</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <p className="text-3xl font-bold text-green-600">{interviews.filter(i => i.status === 'CONFIRMED').length}</p>
            <p className="text-sm text-gray-600">Confirmed</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <p className="text-3xl font-bold text-yellow-600">{interviews.filter(i => i.status === 'RESCHEDULED').length}</p>
            <p className="text-sm text-gray-600">Rescheduled</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <p className="text-3xl font-bold text-gray-600">{interviews.length}</p>
            <p className="text-sm text-gray-600">Total</p>
          </div>
        </div>

        {/* Interviews List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Upcoming Interviews</h2>
          </div>

          {interviews.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No interviews scheduled</h3>
              <p className="text-gray-500 mb-4">Apply for jobs and get shortlisted to receive interview invites</p>
              <Link
                to="/jobs"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Jobs
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {interviews.map((interview) => (
                <div key={interview.interviewId} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">Interview Scheduled</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(interview.status)}`}>
                            {interview.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Scheduled for {formatDateTime(interview.scheduledAt)}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            {interview.mode || 'Video Call'}
                          </span>
                          {interview.meetLink && (
                            <a
                              href={interview.meetLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700"
                            >
                              Join Meeting
                            </a>
                          )}
                        </div>
                        {interview.notes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                            <span className="font-medium">Notes:</span> {interview.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {interview.status === 'SCHEDULED' && (
                        <button
                          onClick={() => handleConfirm(interview.interviewId)}
                          className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Confirm
                        </button>
                      )}
                      <Link
                        to={`/applications`}
                        className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors text-center"
                      >
                        View Application
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MyInterviews
