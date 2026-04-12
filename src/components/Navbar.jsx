import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { user, logout, isAuthenticated, isCandidate, isRecruiter } = useAuth()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 ml-2">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">Hire</span>
              <span className="text-2xl font-bold text-gray-900">Connect</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center justify-center gap-6 flex-1">
            <Link to="/jobs" className="text-gray-700 hover:text-blue-600 font-medium px-3 py-2">
              Find Jobs
            </Link>
            <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium px-3 py-2">
              For Employers
            </Link>
            <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium px-3 py-2">
              About
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center justify-end gap-3 flex-shrink-0">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <button className="relative p-2 text-gray-500 hover:text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* User Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                  >
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="font-medium">{user?.email?.split('@')[0]}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  <div className={`absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 transition-all duration-200 z-50 ${dropdownOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                    <Link to="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                      Your Profile
                    </Link>
                    {isCandidate && (
                      <Link to="/candidate/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                        My Applications
                      </Link>
                    )}
                    {isRecruiter && (
                      <Link to="/recruiter/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                        My Job Postings
                      </Link>
                    )}
                    <Link to="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                      Account Settings
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2 text-blue-600 font-semibold hover:text-blue-700 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 hover:shadow-md min-w-[90px] text-center"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg min-w-[90px] text-center"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
