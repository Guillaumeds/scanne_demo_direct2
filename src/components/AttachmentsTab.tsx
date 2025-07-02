'use client'

import { useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { format } from 'date-fns'
import {
  BlocAttachment,
  AttachmentCategory,
  AttachmentUpload,
  ATTACHMENT_CATEGORIES,
  getFileIcon,
  formatFileSize,
  validateFileUpload
} from '@/types/attachments'
import CategorySelector from './CategorySelector'

interface DrawnArea {
  id: string
  type: string
  coordinates: [number, number][]
  area: number
  fieldIds: string[]
}

interface AttachmentsTabProps {
  bloc: DrawnArea
}

export default function AttachmentsTab({ bloc }: AttachmentsTabProps) {
  const [attachments, setAttachments] = useState<BlocAttachment[]>([])
  const [selectedCategory, setSelectedCategory] = useState<AttachmentCategory | 'all'>('all')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showCategorySelector, setShowCategorySelector] = useState(false)
  const [selectedUploadCategory, setSelectedUploadCategory] = useState<AttachmentCategory>('other')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'category' | 'size'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc') // Default to earliest to oldest

  // Load attachments from storage or start with empty array
  useEffect(() => {
    // In a real application, this would load from a database or API
    setAttachments([])
  }, [])

  // Filter and sort attachments
  const filteredAttachments = attachments
    .filter(attachment => {
      const matchesCategory = selectedCategory === 'all' || attachment.category === selectedCategory
      const matchesSearch = searchTerm === '' ||
        attachment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attachment.description?.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesCategory && matchesSearch
    })
    .sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime()
          break
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'category':
          comparison = a.category.localeCompare(b.category)
          break
        case 'size':
          comparison = a.fileSize - b.fileSize
          break
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

  const handleDeleteAttachment = (id: string) => {
    if (confirm('Are you sure you want to delete this attachment?')) {
      setAttachments(prev => prev.filter(attachment => attachment.id !== id))
    }
  }

  const handleDownload = (attachment: BlocAttachment) => {
    // In a real app, this would trigger a download from the server
    console.log('Downloading:', attachment.name)
    alert(`Download would start for: ${attachment.name}`)
  }

  const getCategoryStats = () => {
    return ATTACHMENT_CATEGORIES.map(category => {
      const count = attachments.filter(a => a.category === category.id).length
      const totalSize = attachments
        .filter(a => a.category === category.id)
        .reduce((sum, a) => sum + a.fileSize, 0)
      return {
        ...category,
        count,
        totalSize
      }
    }).filter(cat => cat.count > 0)
  }

  return (
    <div className="flex h-full bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <span className="text-2xl mr-3">📎</span>
            Attachments
          </h2>
        </div>



        {/* Category Overview */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Categories</h3>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>All Categories</span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {attachments.length}
                </span>
              </div>
            </button>
            {getCategoryStats().map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategory(category.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="mr-2">{category.icon}</span>
                    <span>{category.name}</span>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {category.count}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>


      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Controls */}
          <div className="flex justify-between items-center mb-6">
            {/* Upload Button */}
            <button
              type="button"
              onClick={() => setShowUploadModal(true)}
              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Upload files"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </button>

            {/* Modern Sort Icons */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setSortBy('date')}
                className={`p-2 rounded-md transition-colors ${
                  sortBy === 'date' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Sort by date"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setSortBy('name')}
                className={`p-2 rounded-md transition-colors ${
                  sortBy === 'name' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Sort by name"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M3 12h12M3 18h6"/>
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setSortBy('size')}
                className={`p-2 rounded-md transition-colors ${
                  sortBy === 'size' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Sort by size"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z"/>
                  <path d="M16 12H8"/>
                </svg>
              </button>
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              <button
                type="button"
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="p-2 rounded-md text-gray-500 hover:text-gray-700 transition-colors"
                title={sortOrder === 'asc' ? 'Sort ascending' : 'Sort descending'}
              >
                {sortOrder === 'asc' ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 14l5-5 5 5"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 10l5 5 5-5"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Attachments List */}
          <div className="space-y-4">
            {filteredAttachments.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <div className="text-4xl mb-4">📎</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No attachments found</h3>
                <p className="text-gray-600 mb-4">
                  {selectedCategory === 'all' && searchTerm === ''
                    ? 'Start by uploading your first file'
                    : 'No files match the current filters'
                  }
                </p>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(true)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Upload Files
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAttachments.map((attachment) => {
                  const categoryInfo = ATTACHMENT_CATEGORIES.find(c => c.id === attachment.category)
                  return (
                    <div key={attachment.id} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        {/* Left side - Icon and content */}
                        <div className="flex items-start space-x-3 flex-1 min-w-0">
                          {/* File type icon */}
                          <div className="text-xl mt-0.5 flex-shrink-0">
                            {getFileIcon(attachment.mimeType, attachment.extension)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            {/* Title (Description) and Category */}
                            <div className="flex items-start justify-between mb-1">
                              <h3 className="font-medium text-gray-900 text-sm leading-tight">
                                {attachment.description || 'No description'}
                              </h3>
                            </div>

                            {/* Filename */}
                            <p className="text-xs text-gray-600 mb-2 truncate">
                              {attachment.name}
                            </p>

                            {/* File info */}
                            <div className="flex items-center space-x-3 text-xs text-gray-500">
                              <span>{formatFileSize(attachment.fileSize)}</span>
                              <span>{format(new Date(attachment.uploadDate), 'MMM dd')}</span>
                              <span>by {attachment.uploadedBy}</span>
                            </div>
                          </div>
                        </div>

                        {/* Right side - Actions */}
                        <div className="flex items-center space-x-1 ml-3 flex-shrink-0">
                          {attachment.thumbnailUrl && (
                            <button
                              type="button"
                              onClick={() => window.open(attachment.url, '_blank')}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Preview"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                              </svg>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDownload(attachment)}
                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Download"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                              <polyline points="7,10 12,15 17,10"></polyline>
                              <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteAttachment(attachment.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3,6 5,6 21,6"></polyline>
                              <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <FileUploadModal
          onClose={() => setShowUploadModal(false)}
          onUpload={(newAttachments) => {
            setAttachments(prev => [...prev, ...newAttachments])
            setShowUploadModal(false)
          }}
        />
      )}
    </div>
  )
}

// File Upload Modal Component
function FileUploadModal({ 
  onClose, 
  onUpload 
}: {
  onClose: () => void
  onUpload: (attachments: BlocAttachment[]) => void
}) {
  const [selectedCategory, setSelectedCategory] = useState<AttachmentCategory>('other')
  const [description, setDescription] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [errors, setErrors] = useState<string[]>([])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles, rejectedFiles) => {
      setErrors([])
      
      // Validate files
      const validFiles: File[] = []
      const newErrors: string[] = []
      
      acceptedFiles.forEach(file => {
        const validation = validateFileUpload(file, selectedCategory)
        if (validation.valid) {
          validFiles.push(file)
        } else {
          newErrors.push(`${file.name}: ${validation.error}`)
        }
      })
      
      rejectedFiles.forEach(({ file, errors }) => {
        newErrors.push(`${file.name}: ${errors.map(e => e.message).join(', ')}`)
      })
      
      setUploadedFiles(prev => [...prev, ...validFiles])
      setErrors(newErrors)
    },
    multiple: true
  })

  const handleUpload = () => {
    if (uploadedFiles.length === 0) return

    const newAttachments: BlocAttachment[] = uploadedFiles.map(file => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: file.name,
      originalName: file.name,
      category: selectedCategory,
      fileType: file.type,
      fileSize: file.size,
      uploadDate: new Date().toISOString(),
      description: description || undefined,
      tags: [], // No tags functionality
      mimeType: file.type,
      extension: '.' + file.name.split('.').pop()?.toLowerCase(),
      url: URL.createObjectURL(file), // Mock URL for demo
      thumbnailUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      uploadedBy: 'user',
      lastModified: new Date().toISOString()
    }))

    onUpload(newAttachments)
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const categoryInfo = ATTACHMENT_CATEGORIES.find(c => c.id === selectedCategory)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Upload Files</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as AttachmentCategory)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {ATTACHMENT_CATEGORIES.map(category => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
            {categoryInfo && (
              <p className="text-xs text-gray-600 mt-1">
                {categoryInfo.description} • Max size: {categoryInfo.maxSize}MB • 
                Accepted: {categoryInfo.acceptedTypes.join(', ')}
              </p>
            )}
          </div>

          {/* Drag and Drop Area */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="text-4xl mb-4">📤</div>
            {isDragActive ? (
              <p className="text-green-600 font-medium">Drop the files here...</p>
            ) : (
              <div>
                <p className="text-gray-600 font-medium mb-2">
                  Drag and drop files here, or click to select
                </p>
                <p className="text-sm text-gray-500">
                  Multiple files supported
                </p>
              </div>
            )}
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-800 mb-2">Upload Errors:</h4>
              <ul className="text-sm text-red-700 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Files to Upload ({uploadedFiles.length})</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getFileIcon(file.type, '.' + file.name.split('.').pop())}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{file.name}</div>
                        <div className="text-xs text-gray-600">{formatFileSize(file.size)}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Brief description of the files..."
            />
          </div>


        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleUpload}
            disabled={uploadedFiles.length === 0}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            Upload {uploadedFiles.length > 0 && `(${uploadedFiles.length})`}
          </button>
        </div>
      </div>
    </div>
  )
}
