import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { jobService } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { useFormValidation } from '../../hooks/useFormValidation'
import { validationSchemas } from '../../utils/validation'
import { FormField, ValidatedInput, ValidatedTextarea, ValidatedSelect, ErrorMessage } from '../../components/common/FormComponents'

const CreateJob = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
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

  const {
    errors,
    touched,
    handleBlur,
    handleChange,
    handleSubmit,
    setFieldError,
    resetValidation
  } = useFormValidation(validationSchemas.createJob)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    handleChange(name, value, { ...formData, [name]: value })
  }

  const handleInputBlur = (e) => {
    const { name, value } = e.target
    handleBlur(name, value, formData)
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
    let stepFields = []

    if (step === 1) {
      stepFields = ['title', 'description', 'category']
    } else if (step === 2) {
      stepFields = ['location', 'experienceRequired', 'minSalary', 'maxSalary']
    } else if (step === 3) {
      stepFields = ['skills']
    }

    // Validate only the fields for this step
    let hasErrors = false
    stepFields.forEach(field => {
      const fieldValidators = validationSchemas.createJob[field]
      if (!fieldValidators) return

      for (const validator of fieldValidators) {
        const error = validator(formData[field], formData)
        if (error) {
          setFieldError(field, error)
          hasErrors = true
          break
        }
      }
    })

    return !hasErrors
  }

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const jobData = {
        ...data,
        experienceRequired: Number(data.experienceRequired),
        minSalary: Number(data.minSalary),
        maxSalary: Number(data.maxSalary),
        requirements: data.requirements.filter(r => r.trim()),
        postedBy: user?.userId
      }
      await jobService.createJob(jobData)
      alert('Job posted successfully!')
      navigate('/recruiter/jobs')
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create job. Please try again.'
      setFieldError('general', errorMessage)
      throw err // Re-throw to be handled by the hook
    }
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    await handleSubmit(formData, onSubmit)
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

                <FormField
                  label="Job Title"
                  error={touched.title && errors.title}
                  required
                >
                  <ValidatedInput
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    error={touched.title && errors.title}
                    placeholder="e.g., Senior Java Developer"
                  />
                </FormField>

                <FormField
                  label="Job Category"
                  error={touched.category && errors.category}
                  required
                >
                  <ValidatedSelect
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    error={touched.category && errors.category}
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </ValidatedSelect>
                </FormField>

                <FormField
                  label="Job Type"
                  required
                >
                  <ValidatedSelect
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                  >
                    {jobTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </ValidatedSelect>
                </FormField>

                <FormField
                  label="Job Description"
                  error={touched.description && errors.description}
                  required
                  helpText="Describe the role, responsibilities, and requirements (minimum 20 characters)"
                >
                  <ValidatedTextarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    error={touched.description && errors.description}
                    rows={6}
                    placeholder="Describe the role, responsibilities, and what you're looking for..."
                  />
                </FormField>
              </div>
            )}

            {/* Step 2: Job Details */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Job Details</h2>

                <FormField
                  label="Location"
                  error={touched.location && errors.location}
                  required
                >
                  <ValidatedInput
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    error={touched.location && errors.location}
                    placeholder="e.g., Bangalore, Mumbai, Remote"
                  />
                </FormField>

                <FormField
                  label="Experience Required"
                  error={touched.experienceRequired && errors.experienceRequired}
                  required
                >
                  <ValidatedSelect
                    name="experienceRequired"
                    value={formData.experienceRequired}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    error={touched.experienceRequired && errors.experienceRequired}
                  >
                    <option value="">Select Experience</option>
                    {experienceOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </ValidatedSelect>
                </FormField>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="Minimum Salary (Annual)"
                    error={touched.minSalary && errors.minSalary}
                    required
                  >
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
                      <ValidatedInput
                        type="number"
                        name="minSalary"
                        value={formData.minSalary}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        error={touched.minSalary && errors.minSalary}
                        className="pl-8"
                        placeholder="500000"
                      />
                    </div>
                  </FormField>

                  <FormField
                    label="Maximum Salary (Annual)"
                    error={touched.maxSalary && errors.maxSalary}
                    required
                  >
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
                      <ValidatedInput
                        type="number"
                        name="maxSalary"
                        value={formData.maxSalary}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        error={touched.maxSalary && errors.maxSalary}
                        className="pl-8"
                        placeholder="1500000"
                      />
                    </div>
                  </FormField>
                </div>

                <FormField
                  label="Application Deadline"
                >
                  <ValidatedInput
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleInputChange}
                  />
                </FormField>

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

                <FormField
                  label="Add Skills"
                  error={touched.skills && errors.skills}
                  required
                >
                  <div className="flex gap-2">
                    <ValidatedInput
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={handleSkillKeyDown}
                      error={touched.skills && errors.skills}
                      placeholder="e.g., Java, Python, React"
                      className="flex-1"
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                      Add
                    </button>
                  </div>
                  <p className="text-gray-500 text-sm mt-1">Press Enter or click Add to add a skill</p>
                </FormField>

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
