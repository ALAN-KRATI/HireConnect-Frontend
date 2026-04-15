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
      const recruiterId = localStorage.getItem('userId');
      const response = await analyticsService.getRecruiterStats(recruiterId);
      setAnalytics(response.data);
    } catch (err) {
      console.error('Analytics error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, trend, trendValue }) => (
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
      {trend && (
        <div className="mt-4 flex items-center">
          <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? '+' : '-'}{trendValue}%
          </span>
          <span className="text-sm text-gray-500 ml-2">vs last month</span>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            Error: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">Track your recruitment performance and subscription metrics</p>
          </div>
          <div className="mt-4 md:mt-0">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="block w-full md:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg border"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Jobs Posted"
            value={analytics?.totalJobsPosted ?? '-'}
            trend={analytics?.jobsTrend}
            trendValue={analytics?.jobsTrendValue}
            icon={
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
          />
          <StatCard
            title="Total Applications"
            value={analytics?.totalApplications ?? '-'}
            trend={analytics?.applicationsTrend}
            trendValue={analytics?.applicationsTrendValue}
            icon={
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />
          <StatCard
            title="Interviews Scheduled"
            value={analytics?.interviewsScheduled ?? '-'}
            trend={analytics?.interviewsTrend}
            trendValue={analytics?.interviewsTrendValue}
            icon={
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
          <StatCard
            title="Success Rate"
            value={analytics?.successRate !== undefined ? `${analytics.successRate}%` : '-'}
            trend={analytics?.successRateTrend}
            trendValue={analytics?.successRateTrendValue}
            icon={
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          />
        </div>

        {/* Candidate Pipeline */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Candidate Pipeline</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'New Applications', value: analytics?.pipeline?.new ?? '-', color: 'blue' },
              { label: 'Shortlisted', value: analytics?.pipeline?.shortlisted ?? '-', color: 'indigo' },
              { label: 'Interview', value: analytics?.pipeline?.interview ?? '-', color: 'purple' },
              { label: 'Offered', value: analytics?.pipeline?.offered ?? '-', color: 'emerald' },
              { label: 'Hired', value: analytics?.pipeline?.hired ?? '-', color: 'green' }
            ].map((stage) => (
              <div key={stage.label} className={`p-4 bg-${stage.color}-50 rounded-lg text-center`}>
                <p className="text-2xl font-bold text-gray-900">{stage.value}</p>
                <p className="text-sm text-gray-600">{stage.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {analytics?.recentActivity?.length > 0 ? (
              analytics.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <span className="text-2xl">{activity.icon || '📋'}</span>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">{activity.text || '-'}</p>
                    <p className="text-sm text-gray-500 mt-1">{activity.time || '-'}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Insights */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Recruitment Insights</h3>
              <p className="text-blue-100">
                You have {analytics?.pipeline?.new ?? 0} new applications waiting for review. 
                Your average time to hire is {analytics?.avgTimeToHire ?? '-'} days.
              </p>
            </div>
            <Link 
              to="/recruiter/applications"
              className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Review Applications
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
