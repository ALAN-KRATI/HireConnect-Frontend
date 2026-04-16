import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { jobService } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const ManageJobs = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [jobToDelete, setJobToDelete] = useState(null)

  useEffect(() => {
    if (user?.userId) fetchJobs()
  }, [user?.userId])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      // Recruiter's own jobs only; calling /jobs would leak every recruiter's postings.
      const response = await jobService.getJobsByRecruiter(user.userId)
      setJobs(response.data || [])
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      await jobService.changeJobStatus(jobId, newStatus)
      setJobs(jobs.map(job =>
        job.jobId === jobId ? { ...job, status: newStatus } : job
      ))
    } catch (error) {
      console.error('Error updating job status:', error)
      alert('Failed to update job status')
    }
  }

  const confirmDelete = (job) => {
    setJobToDelete(job)
    setShowDeleteModal(true)
  }

  const handleDelete = async () => {
    if (!jobToDelete) return

    try {
      await jobService.deleteJob(jobToDelete.jobId)
      setJobs(jobs.filter(job => job.jobId !== jobToDelete.jobId))
      setShowDeleteModal(false)
      setJobToDelete(null)
    } catch (error) {
      console.error('Error deleting job:', error)
      alert('Failed to delete job')
    }
  }

  const formatSalary = (min, max) => {
    return `₹${(min / 100000).toFixed(1)} - ₹${(max / 100000).toFixed(1)} LPA`
  }

  const getStatusBadgeClass = (status) => {
    const classes = {
      OPEN: 'bg-green-100 text-green-700',
      CLOSED: 'bg-red-100 text-red-700',
      DRAFT: 'bg-gray-100 text-gray-700',
      PAUSED: 'bg-yellow-100 text-yellow-700'
    }
    return classes[status] || 'bg-gray-100 text-gray-700'
  }

  const filteredJobs = jobs.filter(job => {
    const matchesFilter = filter === 'ALL' || job.status === filter
    const matchesSearch =
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const stats = {
    total: jobs.length,
    open: jobs.filter(j => j.status === 'OPEN').length,
    closed: jobs.filter(j => j.status === 'CLOSED').length,
    applications: jobs.reduce((acc, job) => acc + (job.applicationCount || 0), 0)
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
            <span className="text-gray-900">Manage Jobs</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manage Jobs</h1>
              <p className="text-gray-600">Post, edit, and manage your job listings</p>
            </div>
            <Link
              to="/recruiter/jobs/new"
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Post New Job
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-sm text-gray-600">Total Jobs</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <p className="text-2xl font-bold text-green-600">{stats.open}</p>
            <p className="text-sm text-gray-600">Active Jobs</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <p className="text-2xl font-bold text-red-600">{stats.closed}</p>
            <p className="text-sm text-gray-600">Closed Jobs</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <p className="text-2xl font-bold text-purple-600">{stats.applications}</p>
            <p className="text-sm text-gray-600">Total Applications</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search jobs by title or location..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {['ALL', 'OPEN', 'CLOSED'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'ALL' ? 'All Jobs' : status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Jobs Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applications
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Posted Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredJobs.length > 0 ? (
                  filteredJobs.map((job) => (
                    <tr key={job.jobId} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold mr-4">
                            {job.title?.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{job.title}</div>
                            <div className="text-sm text-gray-500">{job.location} • {formatSalary(job.minSalary, job.maxSalary)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {job.applicationCount || 0} applications
                        </div>
                        <Link
                          to={`/recruiter/applications?jobId=${job.jobId}`}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          View applications
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={job.status}
                          onChange={(e) => handleStatusChange(job.jobId, e.target.value)}
                          className={`text-sm font-medium px-3 py-1 rounded-full border-0 cursor-pointer ${getStatusBadgeClass(job.status)}`}
                        >
                          <option value="OPEN">Open</option>
                          <option value="CLOSED">Closed</option>
                          <option value="PAUSED">Paused</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {job.postedAt ? new Date(job.postedAt).toLocaleDateString() : 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {job.expiresAt && `Expires: ${new Date(job.expiresAt).toLocaleDateString()}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/jobs/${job.jobId}`}
                            className="text-gray-400 hover:text-blue-600 p-2"
                            title="Preview"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                          <Link
                            to={`/recruiter/jobs/edit/${job.jobId}`}
                            className="text-gray-400 hover:text-blue-600 p-2"
                            title="Edit"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                          <button
                            onClick={() => confirmDelete(job)}
                            className="text-gray-400 hover:text-red-600 p-2"
                            title="Delete"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {searchTerm ? 'No matching jobs found' : 'No jobs posted yet'}
                      </h3>
                      <p className="text-gray-500 mb-4">
                        {searchTerm
                          ? 'Try adjusting your search term'
                          : 'Start posting jobs to attract candidates'}
                      </p>
                      {!searchTerm && (
                        <Link
                          to="/recruiter/jobs/new"
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Post Your First Job
                        </Link>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Delete Job?</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{jobToDelete?.title}"? This action cannot be undone and all applications will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageJobs
