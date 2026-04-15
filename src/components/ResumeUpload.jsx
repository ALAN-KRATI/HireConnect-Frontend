import { useState, useRef } from 'react'
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import api from '../services/api'

const ResumeUpload = ({ onParsedData, onClose }) => {
  const [file, setFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [parsedData, setParsedData] = useState(null)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const acceptedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain'
  ]

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0])
    }
  }

  const validateAndSetFile = (selectedFile) => {
    setError(null)
    setParsedData(null)
    
    if (!acceptedTypes.includes(selectedFile.type)) {
      setError('Please upload a PDF, DOCX, DOC, or TXT file')
      return
    }
    
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }
    
    setFile(selectedFile)
  }

  const parseResume = async () => {
    if (!file) return
    
    setUploading(true)
    setProgress(0)
    setError(null)
    
    const formData = new FormData()
    formData.append('resume', file)
    
    try {
      const response = await api.post('/api/profile/resume/parse', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          setProgress(percentCompleted)
        }
      })
      
      setParsedData(response.data)
    } catch (err) {
      console.error('Resume parsing failed:', err)
      setError(err.response?.data?.message || 'Failed to parse resume. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleApply = () => {
    if (parsedData && onParsedData) {
      onParsedData(parsedData)
    }
    if (onClose) {
      onClose()
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    setParsedData(null)
    setError(null)
    setProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Upload Resume</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </div>

      {!file && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            Drag and drop your resume here
          </p>
          <p className="text-sm text-gray-500 mb-4">
            or click to browse files
          </p>
          <p className="text-xs text-gray-400">
            Supported formats: PDF, DOCX, DOC, TXT (Max 10MB)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            onChange={handleChange}
            className="hidden"
            id="resume-upload"
          />
          <label
            htmlFor="resume-upload"
            className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer transition-colors"
          >
            Select File
          </label>
        </div>
      )}

      {file && !uploading && !parsedData && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-10 w-10 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={handleRemoveFile}
              className="text-red-500 hover:text-red-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {uploading && (
        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <div className="flex items-center mb-2">
            <Loader2 className="h-5 w-5 text-blue-600 animate-spin mr-2" />
            <span className="text-blue-900 font-medium">Parsing resume...</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-blue-700 mt-2">{progress}% complete</p>
        </div>
      )}

      {parsedData && (
        <div className="bg-green-50 rounded-lg p-4 mb-4">
          <div className="flex items-center mb-3">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-900 font-medium">Resume parsed successfully!</span>
          </div>
          
          <div className="space-y-3">
            {parsedData.fullName && (
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Name</label>
                <p className="text-sm text-gray-900">{parsedData.fullName}</p>
              </div>
            )}
            
            {parsedData.email && (
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Email</label>
                <p className="text-sm text-gray-900">{parsedData.email}</p>
              </div>
            )}
            
            {parsedData.phone && (
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Phone</label>
                <p className="text-sm text-gray-900">{parsedData.phone}</p>
              </div>
            )}
            
            {parsedData.skills && parsedData.skills.length > 0 && (
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Skills</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {parsedData.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {parsedData.experience && parsedData.experience.length > 0 && (
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Experience</label>
                <div className="mt-1 space-y-2">
                  {parsedData.experience.slice(0, 2).map((exp, idx) => (
                    <div key={idx} className="text-sm text-gray-700">
                      • {exp.title} at {exp.company}
                    </div>
                  ))}
                  {parsedData.experience.length > 2 && (
                    <p className="text-xs text-gray-500">
                      +{parsedData.experience.length - 2} more positions
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 rounded-lg p-4 mb-4 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-red-900 text-sm">{error}</p>
        </div>
      )}

      <div className="flex gap-3 mt-6">
        {file && !uploading && !parsedData && (
          <button
            onClick={parseResume}
            disabled={uploading}
            className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Parse Resume
          </button>
        )}
        
        {parsedData && (
          <button
            onClick={handleApply}
            className="flex-1 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Apply Parsed Data
          </button>
        )}
        
        <button
          onClick={onClose}
          className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
        >
          {parsedData ? 'Close' : 'Cancel'}
        </button>
      </div>
    </div>
  )
}

export default ResumeUpload