'use client'

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Upload, 
  File, 
  Image, 
  FileText, 
  Download,
  X,
  Eye,
  Paperclip,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

interface AttachedFile {
  id: string
  name: string
  size: number
  type: string
  url?: string
  uploadProgress?: number
  uploadStatus: 'uploading' | 'completed' | 'error'
  uploadedAt: Date
  uploadedBy: string
}

interface FileUploaderProps {
  initialFiles?: AttachedFile[]
  onFilesChange?: (files: AttachedFile[]) => void
  maxFileSize?: number // in MB
  allowedTypes?: string[]
  maxFiles?: number
  className?: string
}

export default function FileUploader({ 
  initialFiles = [], 
  onFilesChange,
  maxFileSize = 10, // 10MB default
  allowedTypes = ['image/*', 'application/pdf', 'text/*', '.doc', '.docx', '.xls', '.xlsx'],
  maxFiles = 10,
  className = "" 
}: FileUploaderProps) {
  const [files, setFiles] = useState<AttachedFile[]>(initialFiles)
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set())

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image
    if (type.includes('pdf')) return FileText
    if (type.includes('text') || type.includes('document')) return FileText
    return File
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size exceeds ${maxFileSize}MB limit`
    }

    // Check file type
    const isAllowed = allowedTypes.some(type => {
      if (type.includes('*')) {
        return file.type.startsWith(type.replace('*', ''))
      }
      return file.type === type || file.name.toLowerCase().endsWith(type)
    })

    if (!isAllowed) {
      return 'File type not allowed'
    }

    return null
  }

  const simulateUpload = (fileId: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 30
        if (progress >= 100) {
          progress = 100
          clearInterval(interval)
          // Simulate success/failure
          if (Math.random() > 0.1) { // 90% success rate
            resolve(`/uploads/${fileId}`) // Mock URL
          } else {
            reject(new Error('Upload failed'))
          }
        }
        
        setFiles(prev => prev.map(file => 
          file.id === fileId 
            ? { ...file, uploadProgress: progress }
            : file
        ))
      }, 200)
    })
  }

  const handleFileUpload = async (selectedFiles: FileList) => {
    const fileArray = Array.from(selectedFiles)
    
    // Check max files limit
    if (files.length + fileArray.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`)
      return
    }

    const newFiles: AttachedFile[] = []
    
    for (const file of fileArray) {
      const validationError = validateFile(file)
      if (validationError) {
        alert(`${file.name}: ${validationError}`)
        continue
      }

      const fileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const attachedFile: AttachedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadProgress: 0,
        uploadStatus: 'uploading',
        uploadedAt: new Date(),
        uploadedBy: 'Current User' // In real app, get from auth context
      }

      newFiles.push(attachedFile)
      setUploadingFiles(prev => new Set([...prev, fileId]))

      // Start upload simulation
      try {
        const url = await simulateUpload(fileId)
        setFiles(prev => prev.map(f => 
          f.id === fileId 
            ? { ...f, url, uploadStatus: 'completed' as const, uploadProgress: 100 }
            : f
        ))
      } catch (error) {
        setFiles(prev => prev.map(f => 
          f.id === fileId 
            ? { ...f, uploadStatus: 'error' as const }
            : f
        ))
      } finally {
        setUploadingFiles(prev => {
          const newSet = new Set(prev)
          newSet.delete(fileId)
          return newSet
        })
      }
    }

    const updatedFiles = [...files, ...newFiles]
    setFiles(updatedFiles)
    onFilesChange?.(updatedFiles)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 0) {
      handleFileUpload(droppedFiles)
    }
  }, [files])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (selectedFiles) {
      handleFileUpload(selectedFiles)
    }
    // Reset input value to allow selecting the same file again
    e.target.value = ''
  }

  const handleDeleteFile = (id: string) => {
    const updatedFiles = files.filter(file => file.id !== id)
    setFiles(updatedFiles)
    onFilesChange?.(updatedFiles)
  }

  const handleDownload = (file: AttachedFile) => {
    if (file.url) {
      // In a real app, this would trigger actual download
      console.log('Downloading:', file.name)
      alert(`Download started: ${file.name}`)
    }
  }

  const completedFiles = files.filter(f => f.uploadStatus === 'completed')
  const uploadingCount = uploadingFiles.size
  const errorFiles = files.filter(f => f.uploadStatus === 'error')

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Paperclip className="h-5 w-5 text-primary" />
            Attachments
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {completedFiles.length} file{completedFiles.length !== 1 ? 's' : ''}
              </Badge>
              {uploadingCount > 0 && (
                <Badge variant="outline" className="text-xs">
                  {uploadingCount} uploading
                </Badge>
              )}
              {errorFiles.length > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {errorFiles.length} error{errorFiles.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragOver 
              ? 'border-primary bg-primary/5' 
              : 'border-slate-300 hover:border-slate-400'
          }`}
        >
          <Upload className="h-12 w-12 mx-auto mb-4 text-slate-400" />
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">
              Drop files here or click to upload
            </p>
            <p className="text-xs text-slate-500">
              Max {maxFileSize}MB per file • Up to {maxFiles} files
            </p>
            <p className="text-xs text-slate-500">
              Supports: Images, PDFs, Documents
            </p>
          </div>
          <input
            type="file"
            multiple
            onChange={handleFileSelect}
            accept={allowedTypes.join(',')}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Button className="mt-4" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Choose Files
          </Button>
        </div>

        {/* Files List */}
        <div className="space-y-2">
          <AnimatePresence>
              {files.map((file) => {
                const FileIcon = getFileIcon(file.type)
                return (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-3 p-3 border rounded-lg bg-white"
                  >
                    <FileIcon className="h-8 w-8 text-slate-500 flex-shrink-0" />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-slate-900 truncate">
                          {file.name}
                        </h4>
                        <div className="flex items-center gap-1 ml-2">
                          {file.uploadStatus === 'completed' && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                          {file.uploadStatus === 'error' && (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-500">
                          {formatFileSize(file.size)}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Intl.DateTimeFormat('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }).format(file.uploadedAt)}
                        </span>
                      </div>
                      
                      {file.uploadStatus === 'uploading' && (
                        <Progress 
                          value={file.uploadProgress || 0} 
                          className="mt-2 h-1"
                        />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {file.uploadStatus === 'completed' && (
                        <>
                          <Button
                            onClick={() => handleDownload(file)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        onClick={() => handleDeleteFile(file.id)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-slate-400 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  )
}
