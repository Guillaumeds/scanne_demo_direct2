import { supabase } from '@/lib/supabase'
import { AttachmentData } from '@/types/attachments'

export interface CreateAttachmentRequest {
  name: string
  originalName: string
  category?: string
  fileType: string
  mimeType: string
  extension: string
  fileSize: number
  tags?: string[]
  description?: string
  cropCycleId?: string
  activityId?: string
  observationId?: string
  storagePath: string
  url?: string
  thumbnailUrl?: string
}

export interface UpdateAttachmentRequest {
  name?: string
  category?: string
  tags?: string[]
  description?: string
}

export class SupabaseAttachmentService {
  
  /**
   * Create a new attachment
   */
  static async createAttachment(request: CreateAttachmentRequest): Promise<AttachmentData> {
    try {
      console.log('Creating attachment:', request)

      const { data: attachmentData, error: attachmentError } = await supabase
        .from('attachments')
        .insert({
          name: request.name,
          original_name: request.originalName,
          category: request.category,
          file_type: request.fileType,
          mime_type: request.mimeType,
          extension: request.extension,
          file_size: request.fileSize,
          tags: request.tags,
          description: request.description,
          crop_cycle_id: request.cropCycleId,
          activity_id: request.activityId,
          observation_id: request.observationId,
          storage_path: request.storagePath,
          url: request.url,
          thumbnail_url: request.thumbnailUrl
        })
        .select()
        .single()

      if (attachmentError) {
        console.error('Error creating attachment:', attachmentError)
        throw new Error(`Failed to create attachment: ${attachmentError.message}`)
      }

      return this.transformDatabaseToAttachment(attachmentData)
    } catch (error) {
      console.error('Error in createAttachment:', error)
      throw error
    }
  }

  /**
   * Get attachment by ID
   */
  static async getAttachmentById(attachmentId: string): Promise<AttachmentData> {
    try {
      const { data: attachmentData, error: attachmentError } = await supabase
        .from('attachments')
        .select('*')
        .eq('id', attachmentId)
        .single()

      if (attachmentError) {
        throw new Error(`Failed to get attachment: ${attachmentError.message}`)
      }

      return this.transformDatabaseToAttachment(attachmentData)
    } catch (error) {
      console.error('Error getting attachment by ID:', error)
      throw error
    }
  }

  /**
   * Get all attachments for a crop cycle
   */
  static async getAttachmentsForCropCycle(cropCycleId: string): Promise<AttachmentData[]> {
    try {
      console.log('Loading attachments for crop cycle:', cropCycleId)

      const { data: attachmentsData, error: attachmentsError } = await supabase
        .from('attachments')
        .select('*')
        .eq('crop_cycle_id', cropCycleId)
        .order('created_at', { ascending: false })

      if (attachmentsError) {
        console.error('Error loading attachments:', attachmentsError)
        throw new Error(`Failed to load attachments: ${attachmentsError.message}`)
      }

      if (!attachmentsData || attachmentsData.length === 0) {
        return []
      }

      const attachments = attachmentsData.map(data => this.transformDatabaseToAttachment(data))

      console.log(`Loaded ${attachments.length} attachments from database`)
      return attachments
    } catch (error) {
      console.error('Error loading attachments for crop cycle:', error)
      throw error
    }
  }

  /**
   * Get all attachments for an activity
   */
  static async getAttachmentsForActivity(activityId: string): Promise<AttachmentData[]> {
    try {
      const { data: attachmentsData, error: attachmentsError } = await supabase
        .from('attachments')
        .select('*')
        .eq('activity_id', activityId)
        .order('created_at', { ascending: false })

      if (attachmentsError) {
        throw new Error(`Failed to load attachments: ${attachmentsError.message}`)
      }

      if (!attachmentsData || attachmentsData.length === 0) {
        return []
      }

      return attachmentsData.map(data => this.transformDatabaseToAttachment(data))
    } catch (error) {
      console.error('Error loading attachments for activity:', error)
      throw error
    }
  }

  /**
   * Get all attachments for an observation
   */
  static async getAttachmentsForObservation(observationId: string): Promise<AttachmentData[]> {
    try {
      const { data: attachmentsData, error: attachmentsError } = await supabase
        .from('attachments')
        .select('*')
        .eq('observation_id', observationId)
        .order('created_at', { ascending: false })

      if (attachmentsError) {
        throw new Error(`Failed to load attachments: ${attachmentsError.message}`)
      }

      if (!attachmentsData || attachmentsData.length === 0) {
        return []
      }

      return attachmentsData.map(data => this.transformDatabaseToAttachment(data))
    } catch (error) {
      console.error('Error loading attachments for observation:', error)
      throw error
    }
  }

  /**
   * Update an attachment
   */
  static async updateAttachment(attachmentId: string, updates: UpdateAttachmentRequest): Promise<AttachmentData> {
    try {
      console.log('Updating attachment:', attachmentId, updates)

      const { data: attachmentData, error: attachmentError } = await supabase
        .from('attachments')
        .update({
          name: updates.name,
          category: updates.category,
          tags: updates.tags,
          description: updates.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', attachmentId)
        .select()
        .single()

      if (attachmentError) {
        throw new Error(`Failed to update attachment: ${attachmentError.message}`)
      }

      return this.transformDatabaseToAttachment(attachmentData)
    } catch (error) {
      console.error('Error updating attachment:', error)
      throw error
    }
  }

  /**
   * Delete an attachment
   */
  static async deleteAttachment(attachmentId: string): Promise<void> {
    try {
      // Get attachment data for cleanup
      const { data: attachmentData } = await supabase
        .from('attachments')
        .select('storage_path')
        .eq('id', attachmentId)
        .single()

      // Delete from database
      const { error } = await supabase
        .from('attachments')
        .delete()
        .eq('id', attachmentId)

      if (error) {
        throw new Error(`Failed to delete attachment: ${error.message}`)
      }

      // TODO: Delete file from storage if needed
      // if (attachmentData?.storage_path) {
      //   await supabase.storage
      //     .from('attachments')
      //     .remove([attachmentData.storage_path])
      // }

      console.log('Attachment deleted successfully')
    } catch (error) {
      console.error('Error deleting attachment:', error)
      throw error
    }
  }

  /**
   * Get attachments by category
   */
  static async getAttachmentsByCategory(cropCycleId: string, category: string): Promise<AttachmentData[]> {
    try {
      const { data: attachmentsData, error: attachmentsError } = await supabase
        .from('attachments')
        .select('*')
        .eq('crop_cycle_id', cropCycleId)
        .eq('category', category)
        .order('created_at', { ascending: false })

      if (attachmentsError) {
        throw new Error(`Failed to load attachments: ${attachmentsError.message}`)
      }

      if (!attachmentsData || attachmentsData.length === 0) {
        return []
      }

      return attachmentsData.map(data => this.transformDatabaseToAttachment(data))
    } catch (error) {
      console.error('Error loading attachments by category:', error)
      throw error
    }
  }

  /**
   * Search attachments by tags
   */
  static async searchAttachmentsByTags(cropCycleId: string, tags: string[]): Promise<AttachmentData[]> {
    try {
      const { data: attachmentsData, error: attachmentsError } = await supabase
        .from('attachments')
        .select('*')
        .eq('crop_cycle_id', cropCycleId)
        .overlaps('tags', tags)
        .order('created_at', { ascending: false })

      if (attachmentsError) {
        throw new Error(`Failed to search attachments: ${attachmentsError.message}`)
      }

      if (!attachmentsData || attachmentsData.length === 0) {
        return []
      }

      return attachmentsData.map(data => this.transformDatabaseToAttachment(data))
    } catch (error) {
      console.error('Error searching attachments by tags:', error)
      throw error
    }
  }

  /**
   * Transform database record to AttachmentData format
   */
  private static transformDatabaseToAttachment(data: any): AttachmentData {
    return {
      id: data.id,
      name: data.name,
      originalName: data.original_name,
      category: data.category,
      fileType: data.file_type,
      mimeType: data.mime_type,
      extension: data.extension,
      fileSize: data.file_size,
      tags: data.tags || [],
      description: data.description || '',
      cropCycleId: data.crop_cycle_id,
      activityId: data.activity_id,
      observationId: data.observation_id,
      storagePath: data.storage_path,
      url: data.url,
      thumbnailUrl: data.thumbnail_url,
      uploadedBy: data.uploaded_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  }

  /**
   * Upload file to Supabase storage
   */
  static async uploadFile(file: File, storagePath: string): Promise<string> {
    try {
      const { data, error } = await supabase.storage
        .from('attachments')
        .upload(storagePath, file)

      if (error) {
        throw new Error(`Failed to upload file: ${error.message}`)
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('attachments')
        .getPublicUrl(storagePath)

      return urlData.publicUrl
    } catch (error) {
      console.error('Error uploading file:', error)
      throw error
    }
  }

  /**
   * Generate unique storage path for file
   */
  static generateStoragePath(originalName: string, cropCycleId?: string, activityId?: string, observationId?: string): string {
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substr(2, 9)
    const extension = originalName.split('.').pop()
    
    let folder = 'general'
    if (cropCycleId) folder = `crop-cycles/${cropCycleId}`
    if (activityId) folder = `activities/${activityId}`
    if (observationId) folder = `observations/${observationId}`
    
    return `${folder}/${timestamp}_${randomId}.${extension}`
  }
}
