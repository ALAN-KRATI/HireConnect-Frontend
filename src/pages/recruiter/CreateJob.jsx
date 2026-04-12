import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { jobService } from '../../services/api'

const CreateJob = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    type: 'FULL_TIME',
    category: '',
    experienceRequired: '',
    minSalary: '',
    maxSalary: '',
    skills: [],
    requirements: [''],
    benefits: [''],
    deadline: ''
  })
  const [skillInput, setSkillInput] = useState('')
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' })
    }
  }

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] })
      setSkillInput('')
    }
  }

  const removeSkill = (skillToRemove) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skillToRemove) })
  }

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addSkill()
    }
  }

  const addRequirement = () => {
    setFormData({ ...formData, requirements: [...formData.requirements, ''] })
  }

  const updateRequirement = (index, value) => {
    const newRequirements = [...formData.requirements]
    newRequirements[index] = value
    setFormData({ ...formData, requirements: newRequirements })
  }

  const removeRequirement = (index) => {
    if (formData.requirements.length > 1) {
      setFormData({
        ...formData,
        requirements: formData.requirements.filter((_, i) => i !== index)
      })
    }
  }

  const validateStep = () => {
    const newErrors = {}
    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = 'Job title is required'
      if (!formData.description.trim()) newErrors.description = 'Description is required'
      if (!formData.category) newErrors.category = 'Category is required'
    } else if (step === 2) {
      if (!formData.location.trim()) newErrors.location = 'Location is required'
      if (!formData.experienceRequired) newErrors.experienceRequired = 'Experience is required'
      if (!formData.minSalary) newErrors.minSalary = 'Minimum salary is required'
      if (!formData.maxSalary) newErrors.maxSalary = 'Maximum salary is required'
      if (Number(formData.minSalary) >= Number(formData.maxSalary)) {
        newErrors.maxSalary = 'Maximum salary must be greater than minimum'
      }
    } else if (step === 3) {
      if (formData.skills.length === 0) newErrors.skills = 'At least one skill is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateStep()) return

    setLoading(true)
    try {
      const jobData = {
        ...formData,
        experienceRequired: Number(formData.experienceRequired),
        minSalary: Number(formData.minSalary),
        maxSalary: Number(formData.maxSalary),
        requirements: formData.requirements.filter(r => r.trim())
      }
      await jobService.createJob(jobData)
      alert('Job posted successfully!')
      navigate('/recruiter/jobs')
    } catch (error) {
      console.error('Error creating job:', error)
      alert('Failed to create job. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    'Software Development',
    'Data Science',
    'DevOps',
    'Design',
    'Marketing',
    'Sales',
    'Human Resources',
    'Finance',
    'Operations'
  ]

  const jobTypes = [
    { value: 'FULL_TIME', label: 'Full Time' },
    { value: 'PART_TIME', label: 'Part Time' },
    { value: 'CONTRACT', label: 'Contract' },
    { value: 'INTERNSHIP', label: 'Internship' },
    { value: 'REMOTE', label: 'Remote' }
  ]

  const experienceOptions = [
    { value: 0, label: 'Fresher (0 years)' },
    { value: 1, label: '1+ Years' },
    { value: 2, label: '2+ Years' },
    { value: 3, label: '3+ Years' },
    { value: 5, label: '5+ Years' },
    { value: 8, label: '8+ Years' },
    { value: 10, label: '10+ Years' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link to="/recruiter/dashboard" className="hover:text-gray-700">Dashboard</Link>
            <span>/</span>
            <Link to="/recruiter/jobs" className="hover:text-gray-700">Manage Jobs</Link>
            <span>/</span>
            <span className="text-gray-900">Post New Job</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Post a New Job</h1>
          <p className="text-gray-600">Create a job posting to attract qualified candidates</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center">
            {[1, 2, 3, 4].map((s, idx) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step > s ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    s
                  )}
                </div>
                {idx < 3 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    step > s ? 'bg-blue-600' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className={step >= 1 ? 'text-blue-600 font-medium' : 'text-gray-500'}>Basic Info</span>
            <span className={step >= 2 ? 'text-blue-600 font-medium' : 'text-gray-500'}>Details</span>
            <span className={step >= 3 ? 'text-blue-600 font-medium' : 'text-gray-500'}>Skills</span>
            <span className={step >= 4 ? 'text-blue-600 font-medium' : 'text-gray-500'}>Review</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 md:p-8">
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Basic Information</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Senior Java Developer"
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Type *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {jobTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={6}
                    placeholder="Describe the role, responsibilities, and what you're looking for..."
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>
              </div>
            )}

            {/* Step 2: Job Details */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Job Details</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., Bangalore, Mumbai, Remote"
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.location ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience Required *</label>
                  <select
                    name="experienceRequired"
                    value={formData.experienceRequired}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.experienceRequired ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Experience</option>
                    {experienceOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  {errors.experienceRequired && <p className="text-red-500 text-sm mt-1">{errors.experienceRequired}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Salary (Annual) *</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
                      <input
                        type="number"
                        name="minSalary"
                        value={formData.minSalary}
                        onChange={handleChange}
                        placeholder="500000"
                        className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                          errors.minSalary ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.minSalary && <p className="text-red-500 text-sm mt-1">{errors.minSalary}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Salary (Annual) *</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
                      <input
                        type="number"
                        name="maxSalary"
                        value={formData.maxSalary}
                        onChange={handleChange}
                        placeholder="1500000"
                        className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                          errors.maxSalary ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.maxSalary && <p className="text-red-500 text-sm mt-1">{errors.maxSalary}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Application Deadline</label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
                  {formData.requirements.map((req, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={req}
                        onChange={(e) => updateRequirement(index, e.target.value)}
                        placeholder={`Requirement ${index + 1}`}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeRequirement(index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addRequirement}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1 mt-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Requirement
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Skills */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Required Skills</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Add Skills *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={handleSkillKeyDown}
                      placeholder="e.g., Java, Python, React"
                      className={`flex-1 border rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.skills ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                      Add
                    </button>
                  </div>
                  {errors.skills && <p className="text-red-500 text-sm mt-1">{errors.skills}</p>}
                  <p className="text-gray-500 text-sm mt-1">Press Enter or click Add to add a skill</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Selected Skills</label>
                  {formData.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm italic">No skills added yet</p>
                  )}
                </div>

                {/* Quick Add Suggestions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quick Add</label>
                  <div className="flex flex-wrap gap-2">
                    {['Java', 'Python', 'JavaScript', 'React', 'Spring Boot', 'SQL', 'AWS', 'Docker', 'Kubernetes', 'Node.js']
                      .filter(s => !formData.skills.includes(s))
                      .map(skill => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => setFormData({ ...formData, skills: [...formData.skills, skill] })}
                          className="px-3 py-1 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                        >
                          + {skill}
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Review Job Posting</h2>

                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Job Title</p>
                    <p className="font-semibold text-gray-900">{formData.title}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Category</p>
                      <p className="font-semibold text-gray-900">{formData.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Type</p>
                      <p className="font-semibold text-gray-900">{formData.type.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-semibold text-gray-900">{formData.location}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Experience</p>
                      <p className="font-semibold text-gray-900">{formData.experienceRequired}+ years</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Salary Range</p>
                      <p className="font-semibold text-gray-900">
                        ₹{(formData.minSalary / 100000).toFixed(1)} - ₹{(formData.maxSalary / 100000).toFixed(1)} LPA
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="text-gray-700 whitespace-pre-line">{formData.description}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Required Skills</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {formData.skills.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium"
              >
                Back
              </button>
            ) : (
              <Link
                to="/recruiter/jobs"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium"
              >
                Cancel
              </Link>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Posting...
                  </>
                ) : (
                  'Post Job'
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateJob
