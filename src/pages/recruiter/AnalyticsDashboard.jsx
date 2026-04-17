import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsService } from '../../services/api';

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30days');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const recruiterId = localStorage.getItem('userId');
      const response = await analyticsService.getRecruiterStats(recruiterId);

      console.log('Analytics response:', response.data);
      setAnalytics(response.data);
      setError(null);
    } catch (err) {
      console.error('Analytics error:', err);
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon }) => (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Track your recruitment performance and hiring pipeline
            </p>
          </div>

          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border rounded-lg px-4 py-2"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="year">This Year</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Jobs Posted"
            value={analytics?.totalJobs ?? 0}
            icon={<span className="text-2xl">💼</span>}
          />

          <StatCard
            title="Total Applications"
            value={analytics?.totalApplications ?? 0}
            icon={<span className="text-2xl">📄</span>}
          />

          <StatCard
            title="Interviews Scheduled"
            value={analytics?.interviewScheduledCount ?? 0}
            icon={<span className="text-2xl">📅</span>}
          />

          <StatCard
            title="Success Rate"
            value={`${analytics?.successRate ?? 0}%`}
            icon={<span className="text-2xl">📈</span>}
          />
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Candidate Pipeline</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold">{analytics?.totalApplications ?? 0}</p>
                <p className="text-gray-600 mt-1">New Applications</p>
              </div>

              <div className="bg-indigo-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold">{analytics?.shortlistedCount ?? 0}</p>
                <p className="text-gray-600 mt-1">Shortlisted</p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold">{analytics?.interviewScheduledCount ?? 0}</p>
                <p className="text-gray-600 mt-1">Interview</p>
              </div>

              <div className="bg-emerald-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold">{analytics?.offeredCount ?? 0}</p>
                <p className="text-gray-600 mt-1">Offered</p>
              </div>
            </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <h2 className="text-xl font-bold mb-2">Recruitment Insights</h2>
          <p className="text-blue-100 mb-4">
            You currently have {analytics?.totalApplications ?? 0} applications,
            {` ${analytics?.shortlistedCount ?? 0}`} shortlisted candidates, and
            {` ${analytics?.interviewScheduledCount ?? 0}`} interviews scheduled.
          </p>

          <Link
            to="/recruiter/applications"
            className="inline-block bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg hover:bg-blue-50"
          >
            Review Applications
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;