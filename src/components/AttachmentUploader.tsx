'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Paperclip, X, Upload, File, Image, FileText, Video, Music } from 'lucide-react'

interface AttachmentFile {
  id: string
  file: File
  name: string
  size: number
  type: string
  preview?: string
}

interface AttachmentUploaderProps {
  onFilesChange: (files: AttachmentFile[]) => void
  maxFiles?: number
  maxSize?: number // in MB
  acceptedTypes?: string[]
  disabled?: boolean
  className?: string
}

export default function AttachmentUploader({
  onFilesChange,
  maxFiles = 10,
  maxSize = 50, // 50MB default
  acceptedTypes = [], // Empty array means accept all types
  disabled = false,
  className = ''
}: AttachmentUploaderProps) {
  const [attachedFiles, setAttachedFiles] = useState<AttachmentFile[]>([])
  const [errors, setErrors] = useState<string[]>([])

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setErrors([])
    const newErrors: string[] = []

    // Handle rejected files
    rejectedFiles.forEach(({ file, errors }) => {
      errors.forEach((error: any) => {
        if (error.code === 'file-too-large') {
          newErrors.push(`${file.name}: File too large (max ${maxSize}MB)`)
        } else if (error.code === 'file-invalid-type') {
          newErrors.push(`${file.name}: File type not supported`)
        } else {
          newErrors.push(`${file.name}: ${error.message}`)
        }
      })
    })

    // Check total file count
    if (attachedFiles.length + acceptedFiles.length > maxFiles) {
      newErrors.push(`Maximum ${maxFiles} files allowed`)
      setErrors(newErrors)
      return
    }

    // Process accepted files
    const newFiles: AttachmentFile[] = acceptedFiles.map(file => ({
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }))

    const updatedFiles = [...attachedFiles, ...newFiles]
    setAttachedFiles(updatedFiles)
    onFilesChange(updatedFiles)

    if (newErrors.length > 0) {
      setErrors(newErrors)
    }
  }, [attachedFiles, maxFiles, maxSize, onFilesChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled,
    maxSize: maxSize * 1024 * 1024, // Convert MB to bytes
    accept: acceptedTypes.length > 0 ? acceptedTypes.reduce((acc, type) => {
      acc[type] = []
      return acc
    }, {} as Record<string, string[]>) : undefined,
    multiple: true
  })

  const removeFile = (fileId: string) => {
    const updatedFiles = attachedFiles.filter(f => f.id !== fileId)
    setAttachedFiles(updatedFiles)
    onFilesChange(updatedFiles)
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="w-4 h-4" />
    if (mimeType.startsWith('video/')) return <Video className="w-4 h-4" />
    if (mimeType.startsWith('audio/')) return <Music className="w-4 h-4" />
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) {
      return <FileText className="w-4 h-4" />
    }
    return <File className="w-4 h-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        {isDragActive ? (
          <p className="text-blue-600">Drop files here...</p>
        ) : (
          <div>
            <p className="text-gray-600 mb-1">
              Drag & drop files here, or <span className="text-blue-600 font-medium">browse</span>
            </p>
            <p className="text-xs text-gray-500">
              Max {maxFiles} files, {maxSize}MB each
              {acceptedTypes.length > 0 && ` • ${acceptedTypes.join(', ')}`}
            </p>
          </div>
        )}
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="text-sm text-red-800">
            {errors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </div>
        </div>
      )}

      {/* Attached Files List */}
      {attachedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 flex items-center">
            <Paperclip className="w-4 h-4 mr-1" />
            Attached Files ({attachedFiles.length})
          </h4>
          <div className="space-y-2">
            {attachedFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="text-gray-500">
                    {getFileIcon(file.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                  {file.preview && (
                    <img 
                      src={file.preview} 
                      alt={file.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(file.id)}
                  className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                  disabled={disabled}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export type { AttachmentFile }
