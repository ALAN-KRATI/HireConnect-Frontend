import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { jobService, applicationService } from '../../services/api'
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

      const response = await jobService.getJobsByRecruiter(user.userId)
      const recruiterJobs = response.data || []

      const jobsWithCounts = await Promise.all(
        recruiterJobs.map(async (job) => {
          try {
            const countResponse = await applicationService.getApplicationCountByJob(
              job.jobId
            )

            return {
              ...job,
              applicationCount: countResponse.data || 0
            }
          } catch (error) {
            console.error(
              `Error fetching application count for job ${job.jobId}:`,
              error
            )

            return {
              ...job,
              applicationCount: 0
            }
          }
        })
      )

      setJobs(jobsWithCounts)
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      await jobService.changeJobStatus(jobId, newStatus)
      setJobs(
        jobs.map((job) =>
          job.jobId === jobId ? { ...job, status: newStatus } : job
        )
      )
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
      setJobs(jobs.filter((job) => job.jobId !== jobToDelete.jobId))
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

  const filteredJobs = jobs.filter((job) => {
    const matchesFilter = filter === 'ALL' || job.status === filter
    const matchesSearch =
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesFilter && matchesSearch
  })

  const stats = {
    total: jobs.length,
    open: jobs.filter((j) => j.status === 'OPEN').length,
    closed: jobs.filter((j) => j.status === 'CLOSED').length,
    applications: jobs.reduce(
      (acc, job) => acc + (job.applicationCount || 0),
      0
    )
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
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link to="/recruiter/dashboard" className="hover:text-gray-700">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-gray-900">Manage Jobs</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manage Jobs</h1>
              <p className="text-gray-600">
                Post, edit, and manage your job listings
              </p>
            </div>

            <Link
              to="/recruiter/jobs/new"
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              Post New Job
            </Link>
          </div>
        </div>

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
            <p className="text-2xl font-bold text-purple-600">
              {stats.applications}
            </p>
            <p className="text-sm text-gray-600">Total Applications</p>
          </div>
        </div>

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
                {filteredJobs.map((job) => (
                  <tr key={job.jobId} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {job.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {job.location}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {job.applicationCount} applications
                      </div>
                      <Link
                        to={`/recruiter/applications?jobId=${job.jobId}`}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        View Applications
                      </Link>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(
                          job.status
                        )}`}
                      >
                        {job.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-500">
                      {job.createdAt
                        ? new Date(job.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </td>

                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button
                        onClick={() => navigate(`/recruiter/jobs/edit/${job.jobId}`)}
                        className="px-3 py-1 text-sm rounded border border-blue-600 text-blue-600 hover:bg-blue-50"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => confirmDelete(job)}
                        className="px-3 py-1 text-sm rounded border border-red-600 text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManageJobs;
