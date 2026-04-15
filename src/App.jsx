import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import RecruiterNavbar from './components/RecruiterNavbar'
import { useAuth } from './context/AuthContext'
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
import PaymentPage from './pages/recruiter/PaymentPage'
import PaymentSuccess from './pages/recruiter/PaymentSuccess'
import PaymentCancel from './pages/recruiter/PaymentCancel'
import InvoicesPage from './pages/recruiter/InvoicesPage'
import AnalyticsDashboard from './pages/recruiter/AnalyticsDashboard'
import SubscriptionPage from './pages/recruiter/SubscriptionPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'

function DynamicNavbar() {
  const location = useLocation()
  const { user } = useAuth()
  
  // Check if we're on a recruiter route
  const isRecruiterRoute = location.pathname.startsWith('/recruiter')
  const isRecruiter = user?.role === 'RECRUITER'
  
  // Show RecruiterNavbar for recruiter routes OR when user is a recruiter
  if (isRecruiterRoute || isRecruiter) {
    return <RecruiterNavbar />
  }
  
  // Show generic Navbar for all other routes (landing page, public pages, candidate routes)
  return <Navbar />
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <DynamicNavbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />
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
            <Route path="/recruiter/upgrade" element={
              <ProtectedRoute allowedRoles={['RECRUITER']}>
                <PaymentPage />
              </ProtectedRoute>
            } />
            <Route path="/recruiter/subscription" element={
              <ProtectedRoute allowedRoles={['RECRUITER']}>
                <SubscriptionPage />
              </ProtectedRoute>
            } />
            <Route path="/recruiter/invoices" element={
              <ProtectedRoute allowedRoles={['RECRUITER']}>
                <InvoicesPage />
              </ProtectedRoute>
            } />
            <Route path="/recruiter/analytics" element={
              <ProtectedRoute allowedRoles={['RECRUITER']}>
                <AnalyticsDashboard />
              </ProtectedRoute>
            } />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/cancel" element={<PaymentCancel />} />

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

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
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
