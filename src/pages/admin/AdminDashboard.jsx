import { useState, useEffect } from 'react'
import api from '../../services/api'
import { Users, Building2, Briefcase, BarChart3, Shield, Activity } from 'lucide-react'

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [recentUsers, setRecentUsers] = useState([])
  const [recentJobs, setRecentJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true)
        const [statsRes, usersRes, jobsRes] = await Promise.all([
          api.get('/api/admin/stats'),
          api.get('/api/admin/users/recent'),
          api.get('/api/admin/jobs/recent')
        ])
        
        setStats(statsRes.data)
        setRecentUsers(usersRes.data.users || [])
        setRecentJobs(jobsRes.data.jobs || [])
      } catch (err) {
        console.error('Failed to fetch admin data:', err)
        setError('Failed to load admin data')
      } finally {
        setLoading(false)
      }
    }

    fetchAdminData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-red-600 text-xl font-semibold mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">System overview and management</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Users className="h-6 w-6 text-blue-600" />}
            title="Total Users"
            value={stats?.totalUsers || 0}
            change={stats?.userGrowth}
          />
          <StatCard
            icon={<Building2 className="h-6 w-6 text-green-600" />}
            title="Companies"
            value={stats?.totalCompanies || 0}
          />
          <StatCard
            icon={<Briefcase className="h-6 w-6 text-purple-600" />}
            title="Active Jobs"
            value={stats?.activeJobs || 0}
          />
          <StatCard
            icon={<Activity className="h-6 w-6 text-orange-600" />}
            title="Daily Applications"
            value={stats?.dailyApplications || 0}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-blue-600" />
              Recent Users
            </h2>
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                      {user.name?.charAt(0) || user.email.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{user.name || user.email}</p>
                      <p className="text-xs text-gray-500">{user.role}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
              Recent Jobs
            </h2>
            <div className="space-y-4">
              {recentJobs.map((job) => (
                <div key={job.id} className="py-3 border-b last:border-0">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-medium text-gray-900">{job.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      job.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      job.status === 'EXPIRED' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{job.company}</p>
                  <p className="text-xs text-gray-400 mt-1">{job.applicationsCount || 0} applications</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <ActionCard
            title="User Management"
            description="Manage users, ban accounts, view activity"
            buttonText="Manage Users"
            href="/admin/users"
          />
          <ActionCard
            title="Job Moderation"
            description="Review, approve, or reject job postings"
            buttonText="Moderate Jobs"
            href="/admin/jobs"
          />
          <ActionCard
            title="System Settings"
            description="Configure platform settings and limits"
            buttonText="Settings"
            href="/admin/settings"
          />
        </div>
      </div>
    </div>
  )
}

const StatCard = ({ icon, title, value, change }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <div className="flex items-center">
      <div className="p-3 rounded-full bg-gray-100">{icon}</div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
        {change !== undefined && (
          <p className={`text-xs ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? '+' : ''}{change}% from last month
          </p>
        )}
      </div>
    </div>
  </div>
)

const ActionCard = ({ title, description, buttonText, href }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-500 mb-4">{description}</p>
    <button
      onClick={() => window.location.href = href}
      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
    >
      {buttonText}
    </button>
  </div>
)

export default AdminDashboard