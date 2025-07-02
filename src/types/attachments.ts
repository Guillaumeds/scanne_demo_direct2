/**
 * Types for bloc attachments management
 */

export type AttachmentCategory = 
  | 'certification'
  | 'pest-evidence'
  | 'soil-analysis'
  | 'harvest-records'
  | 'financial-documents'
  | 'compliance'
  | 'maintenance-records'
  | 'weather-data'
  | 'photos'
  | 'other'

export interface BlocAttachment {
  id: string
  name: string
  originalName: string
  category: AttachmentCategory
  fileType: string
  fileSize: number
  uploadDate: string
  description?: string
  tags: string[]

  // Crop cycle linking - MANDATORY
  cropCycleId: string
  cropCycleType: 'plantation' | 'ratoon'

  // File metadata
  mimeType: string
  extension: string

  // Storage info (would be actual URLs in production)
  url: string
  thumbnailUrl?: string

  // Metadata
  uploadedBy: string
  lastModified: string
}

export interface AttachmentUpload {
  file: File
  category: AttachmentCategory
  description?: string
  tags: string[]
}

export const ATTACHMENT_CATEGORIES: {
  id: AttachmentCategory
  name: string
  description: string
  icon: string
  color: string
  acceptedTypes: string[]
  maxSize: number // in MB
}[] = [
  {
    id: 'certification',
    name: 'Certification',
    description: 'Organic, quality, and compliance certificates',
    icon: '🏆',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    acceptedTypes: ['.pdf', '.jpg', '.jpeg', '.png'],
    maxSize: 10
  },
  {
    id: 'pest-evidence',
    name: 'Pest Evidence',
    description: 'Photos and reports of pest issues',
    icon: '🐛',
    color: 'bg-red-100 text-red-800 border-red-200',
    acceptedTypes: ['.jpg', '.jpeg', '.png', '.pdf'],
    maxSize: 5
  },
  {
    id: 'soil-analysis',
    name: 'Soil Analysis',
    description: 'Laboratory soil test results and reports',
    icon: '🧪',
    color: 'bg-green-100 text-green-800 border-green-200',
    acceptedTypes: ['.pdf', '.xlsx', '.csv'],
    maxSize: 15
  },
  {
    id: 'harvest-records',
    name: 'Harvest Records',
    description: 'Yield data, quality reports, and harvest documentation',
    icon: '📊',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    acceptedTypes: ['.pdf', '.xlsx', '.csv', '.jpg', '.jpeg', '.png'],
    maxSize: 20
  },
  {
    id: 'financial-documents',
    name: 'Financial Documents',
    description: 'Invoices, receipts, and cost tracking',
    icon: '💰',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    acceptedTypes: ['.pdf', '.xlsx', '.csv'],
    maxSize: 10
  },
  {
    id: 'compliance',
    name: 'Compliance',
    description: 'Regulatory compliance documents and permits',
    icon: '📋',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    acceptedTypes: ['.pdf', '.jpg', '.jpeg', '.png'],
    maxSize: 10
  },
  {
    id: 'maintenance-records',
    name: 'Maintenance Records',
    description: 'Equipment and infrastructure maintenance logs',
    icon: '🔧',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    acceptedTypes: ['.pdf', '.jpg', '.jpeg', '.png', '.xlsx'],
    maxSize: 5
  },
  {
    id: 'weather-data',
    name: 'Weather Data',
    description: 'Weather reports and climate monitoring data',
    icon: '🌤️',
    color: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    acceptedTypes: ['.pdf', '.csv', '.xlsx', '.jpg', '.jpeg', '.png'],
    maxSize: 5
  },
  {
    id: 'photos',
    name: 'Photos',
    description: 'General photos of the bloc and activities',
    icon: '📸',
    color: 'bg-pink-100 text-pink-800 border-pink-200',
    acceptedTypes: ['.jpg', '.jpeg', '.png', '.webp'],
    maxSize: 5
  },
  {
    id: 'other',
    name: 'Other',
    description: 'Miscellaneous documents and files',
    icon: '📄',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    acceptedTypes: ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png'],
    maxSize: 10
  }
]

/**
 * Get file icon based on file type
 */
export function getFileIcon(mimeType: string, extension: string): string {
  if (mimeType.startsWith('image/')) return '🖼️'
  if (mimeType === 'application/pdf') return '📄'
  if (mimeType.includes('spreadsheet') || extension === '.xlsx' || extension === '.csv') return '📊'
  if (mimeType.includes('document') || extension === '.doc' || extension === '.docx') return '📝'
  if (mimeType.startsWith('video/')) return '🎥'
  if (mimeType.startsWith('audio/')) return '🎵'
  return '📎'
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Validate file upload
 */
export function validateFileUpload(
  file: File, 
  category: AttachmentCategory
): { valid: boolean; error?: string } {
  const categoryInfo = ATTACHMENT_CATEGORIES.find(c => c.id === category)
  
  if (!categoryInfo) {
    return { valid: false, error: 'Invalid category' }
  }
  
  // Check file size
  const fileSizeMB = file.size / (1024 * 1024)
  if (fileSizeMB > categoryInfo.maxSize) {
    return { 
      valid: false, 
      error: `File size (${formatFileSize(file.size)}) exceeds maximum allowed size (${categoryInfo.maxSize}MB)` 
    }
  }
  
  // Check file type
  const extension = '.' + file.name.split('.').pop()?.toLowerCase()
  if (!categoryInfo.acceptedTypes.includes(extension)) {
    return { 
      valid: false, 
      error: `File type ${extension} is not allowed for ${categoryInfo.name}. Allowed types: ${categoryInfo.acceptedTypes.join(', ')}` 
    }
  }
  
  return { valid: true }
}

// Mock data removed - attachments will be loaded from real storage/API

