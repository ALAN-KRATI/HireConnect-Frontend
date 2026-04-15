import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { profileService } from '../services/api'
import ResumeUpload from '../components/ResumeUpload'

const Profile = () => {
  const { user, isCandidate, isRecruiter } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [showResumeUpload, setShowResumeUpload] = useState(false)
  const [formData, setFormData] = useState({})

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await profileService.getProfile()
      setProfile(response.data)
      setFormData(response.data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await profileService.updateProfile(formData)
      setProfile(formData)
      setEditing(false)
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile')
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      await profileService.uploadResume(file)
      alert('Resume uploaded successfully!')
      fetchProfile()
    } catch (error) {
      console.error('Error uploading resume:', error)
      alert('Failed to upload resume')
    }
  }

  const handleResumeParsed = (parsedData) => {
    setFormData(prev => ({
      ...prev,
      fullName: parsedData.fullName || prev.fullName,
      skills: parsedData.skills || prev.skills,
      experience: parsedData.experience?.length || prev.experience
    }))
    setEditing(true)
    alert('Resume parsed! Please review the extracted information and save your changes.')
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <h1 className="text-2xl font-bold text-white">My Profile</h1>
            <p className="text-blue-100">
              {isCandidate
                ? 'Manage and update your profile details to improve your chances of getting hired.'
                : 'Manage and update your company profile to attract the best candidates.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {/* Basic Information */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-900">Basic Information</h2>
                {!editing && (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName || ''}
                    onChange={handleChange}
                    disabled={!editing}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                  />
                </div>

                {isCandidate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                    <select
                      name="experience"
                      value={formData.experience || ''}
                      onChange={handleChange}
                      disabled={!editing}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                    >
                      <option value="">Select Experience</option>
                      <option value="0">Fresher</option>
                      <option value="1">1+ Years</option>
                      <option value="3">3+ Years</option>
                      <option value="5">5+ Years</option>
                      <option value="8">8+ Years</option>
                      <option value="10">10+ Years</option>
                    </select>
                  </div>
                )}

                {isRecruiter && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName || ''}
                      onChange={handleChange}
                      disabled={!editing}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location || ''}
                    onChange={handleChange}
                    disabled={!editing}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">🇮🇳 +91</span>
                    </div>
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile || ''}
                      onChange={handleChange}
                      disabled={!editing}
                      className="w-full pl-20 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {isCandidate && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Resume & Skills</h2>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Resume</label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-gray-600">{profile?.resumeName || 'No resume uploaded'}</span>
                      </div>
                    </div>
                    <label className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                      Upload
                      <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} className="hidden" />
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowResumeUpload(true)}
                      className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Auto-Fill
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Use "Auto-Fill" to parse your resume and automatically populate your profile
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                  <input
                    type="text"
                    name="skills"
                    value={typeof formData.skills === 'string' ? formData.skills : (formData.skills?.join(', ') || '')}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value.split(',').map(s => s.trim()) })}
                    disabled={!editing}
                    placeholder="Java, Spring Boot, Hibernate, SQL"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate skills with commas</p>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Online Profile (LinkedIn)</label>
                  <input
                    type="url"
                    name="linkedIn"
                    value={formData.linkedIn || ''}
                    onChange={handleChange}
                    disabled={!editing}
                    placeholder="linkedin.com/in/username"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                  />
                </div>
              </div>
            )}

            {isRecruiter && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Company Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website Link</label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website || ''}
                      onChange={handleChange}
                      disabled={!editing}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                    <select
                      name="industry"
                      value={formData.industry || ''}
                      onChange={handleChange}
                      disabled={!editing}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                    >
                      <option value="">Select Industry</option>
                      <option value="IT">Information Technology</option>
                      <option value="Finance">Finance</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Education">Education</option>
                      <option value="Manufacturing">Manufacturing</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
                    <select
                      name="companySize"
                      value={formData.companySize || ''}
                      onChange={handleChange}
                      disabled={!editing}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                    >
                      <option value="">Select Size</option>
                      <option value="1-10">1-10 Employees</option>
                      <option value="11-50">11-50 Employees</option>
                      <option value="51-200">51-200 Employees</option>
                      <option value="201-500">201-500 Employees</option>
                      <option value="500+">500+ Employees</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Description</label>
                  <textarea
                    name="description"
                    value={formData.description || ''}
                    onChange={handleChange}
                    disabled={!editing}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                  />
                </div>
              </div>
            )}

            {editing && (
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false)
                    setFormData(profile)
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {showResumeUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <ResumeUpload 
            onParsedData={handleResumeParsed}
            onClose={() => setShowResumeUpload(false)}
          />
        </div>
      )}
    </div>
  )
}

export default Profile
