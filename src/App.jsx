import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import OAuthCallback from './pages/OAuthCallback'
import ForEmployers from './pages/ForEmployers'
import About from './pages/About'
import CandidateDashboard from './pages/candidate/CandidateDashboard'
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard'
import JobSearch from './pages/JobSearch'
import JobDetails from './pages/JobDetails'
import MyApplications from './pages/candidate/MyApplications'
import ApplicationDetails from './pages/candidate/ApplicationDetails'
import SavedJobs from './pages/candidate/SavedJobs'
import MyInterviews from './pages/candidate/MyInterviews'
import ManageJobs from './pages/recruiter/ManageJobs'
import ManageApplications from './pages/recruiter/ManageApplications'
import CreateJob from './pages/recruiter/CreateJob'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/callback" element={<OAuthCallback />} />
            <Route path="/employers" element={<ForEmployers />} />
            <Route path="/about" element={<About />} />
            <Route path="/jobs" element={<JobSearch />} />
            <Route path="/jobs/:id" element={<JobDetails />} />

            {/* Candidate Routes */}
            <Route path="/candidate/dashboard" element={
              <ProtectedRoute allowedRoles={['CANDIDATE']}>
                <CandidateDashboard />
              </ProtectedRoute>
            } />
            <Route path="/candidate/applications" element={
              <ProtectedRoute allowedRoles={['CANDIDATE']}>
                <MyApplications />
              </ProtectedRoute>
            } />
            <Route path="/candidate/applications/:id" element={
              <ProtectedRoute allowedRoles={['CANDIDATE']}>
                <ApplicationDetails />
              </ProtectedRoute>
            } />
            <Route path="/candidate/saved" element={
              <ProtectedRoute allowedRoles={['CANDIDATE']}>
                <SavedJobs />
              </ProtectedRoute>
            } />
            <Route path="/candidate/interviews" element={
              <ProtectedRoute allowedRoles={['CANDIDATE']}>
                <MyInterviews />
              </ProtectedRoute>
            } />

            {/* Recruiter Routes */}
            <Route path="/recruiter/dashboard" element={
              <ProtectedRoute allowedRoles={['RECRUITER']}>
                <RecruiterDashboard />
              </ProtectedRoute>
            } />
            <Route path="/recruiter/jobs" element={
              <ProtectedRoute allowedRoles={['RECRUITER']}>
                <ManageJobs />
              </ProtectedRoute>
            } />
            <Route path="/recruiter/jobs/new" element={
              <ProtectedRoute allowedRoles={['RECRUITER']}>
                <CreateJob />
              </ProtectedRoute>
            } />
            <Route path="/recruiter/applications" element={
              <ProtectedRoute allowedRoles={['RECRUITER']}>
                <ManageApplications />
              </ProtectedRoute>
            } />

            {/* Shared Routes */}
            <Route path="/profile" element={
              <ProtectedRoute allowedRoles={['CANDIDATE', 'RECRUITER']}>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute allowedRoles={['CANDIDATE', 'RECRUITER']}>
                <Settings />
              </ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
