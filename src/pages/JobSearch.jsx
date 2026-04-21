import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { jobService } from '../services/api'

const JobSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [filters, setFilters] = useState({
    location: '',
    category: '',
    minSalary: '',
    maxSalary: '',
    experience: ''
  })

  useEffect(() => {
    console.log('JobSearch component mounted')
    console.log('Current searchParams:', searchParams.toString())
    fetchJobs()
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      applyFilters()
    }, 300) 
    return () => clearTimeout(timeoutId)
  }, [searchQuery, filters])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      console.log('=== FETCHING JOBS ===')
      console.log('API URL:', import.meta.env.VITE_API_URL || 'http://localhost:8080')
      
      const response = await jobService.getAllJobs()
      console.log('Response:', response)
      console.log('Response data:', response.data)
      console.log('Is array:', Array.isArray(response.data))
      
      if (Array.isArray(response.data)) {
        console.log('Setting jobs:', response.data.length)
        setJobs(response.data)
      } else {
        console.error('Expected array but got:', typeof response.data)
        setJobs([])
      }
    } catch (error) {
      console.error('=== ERROR FETCHING JOBS ===')
      console.error('Error:', error)
      console.error('Error message:', error.message)
      console.error('Error response:', error.response?.status, error.response?.data)
      setJobs([])
    } finally {
      setLoading(false)
      console.log('=== DONE FETCHING ===')
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setSearchParams({ search: searchQuery })
    } else {
      setSearchParams({})
    }
  }

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const applyFilters = async () => {
    try {
      setLoading(true)
      const response = await jobService.searchJobs({
        title: searchQuery,
        location: filters.location,
        category: filters.category,
        minSalary: filters.minSalary,
        maxSalary: filters.maxSalary,
        experience: filters.experience
      })
      setJobs(response.data)
    } catch (error) {
      console.error('Error filtering jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatSalary = (min, max) => {
    return `₹${(min / 100000).toFixed(1)} - ₹${(max / 100000).toFixed(1)} LPA`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Find Your Dream Job</h1>
          <form onSubmit={handleSearch} className="relative">
            <div className="flex shadow-lg rounded-lg overflow-hidden">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by job title, skills, or company..."
                  className="block w-full pl-12 pr-4 py-4 text-lg border-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-8 py-4 bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
              >
                Search Jobs
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4 self-start">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Filters</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <select
                    name="location"
                    value={filters.location}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Locations</option>
                    <option value="Bangalore">Bangalore</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Chennai">Chennai</option>
                    <option value="Pune">Pune</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    name="category"
                    value={filters.category}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Categories</option>
                    <option value="Software Development">Software Development</option>
                    <option value="Data Science">Data Science</option>
                    <option value="DevOps">DevOps</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                  <select
                    name="experience"
                    value={filters.experience}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Any Experience</option>
                    <option value="0">Fresher (0 years)</option>
                    <option value="1">1+ Years</option>
                    <option value="3">3+ Years</option>
                    <option value="5">5+ Years</option>
                    <option value="8">8+ Years</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      name="minSalary"
                      value={filters.minSalary}
                      onChange={handleFilterChange}
                      placeholder="Min"
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="number"
                      name="maxSalary"
                      value={filters.maxSalary}
                      onChange={handleFilterChange}
                      placeholder="Max"
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="text-xs text-gray-500 text-center">
                  Filters apply automatically
                </div>
              </div>
            </div>
          </div>

          {/* Job Listings */}
          <div className="lg:w-3/4">
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-600">
                Showing <span className="font-semibold text-gray-900">{jobs.length}</span> jobs
                {searchQuery && ` for "${searchQuery}"`}
              </p>
              <select className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500">
                <option>Sort by: Relevance</option>
                <option>Sort by: Newest</option>
                <option>Sort by: Salary (High-Low)</option>
                <option>Sort by: Salary (Low-High)</option>
              </select>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div key={job.jobId} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-xl">
                          {job.title.charAt(0)}
                        </div>
                        <div>
                          <Link to={`/jobs/${job.jobId}`} className="text-xl font-semibold text-gray-900 hover:text-blue-600">
                            {job.title}
                          </Link>
                          <p className="text-gray-600">{job.companyName || 'Company Name'}</p>
                          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {job.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {job.type}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {formatSalary(job.minSalary, job.maxSalary)}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {job.skills?.slice(0, 4).map((skill, idx) => (
                              <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Link
                        to={`/jobs/${job.jobId}`}
                        className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                      >
                        View Details
                      </Link>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
                      <span>Posted {job.postedAt ? new Date(job.postedAt).toLocaleDateString() : 'Recently'}</span>
                      <span>{job.experienceRequired}+ years experience</span>
                    </div>
                  </div>
                ))}

                {jobs.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900">No jobs found</h3>
                    <p className="text-gray-500">Try adjusting your search or filters</p>
                    <button 
                      onClick={fetchJobs}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Retry Loading Jobs
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default JobSearch
