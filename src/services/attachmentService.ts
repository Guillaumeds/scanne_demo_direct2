/**
 * Attachment Service
 * Database-only implementation for attachment operations
 * Replaces localStorage with Supabase database calls and file storage
 */

import { BlocAttachment } from '@/types/attachments'
import { CropCycleCalculationService } from './cropCycleCalculationService'
import { supabase } from '@/lib/supabase'

export class AttachmentService {
  
  /**
   * Get all attachments for a specific bloc
   */
  static async getAttachmentsForBloc(blocId: string): Promise<BlocAttachment[]> {
    try {
      const { data, error } = await supabase
        .from('attachments')
        .select(`
          *,
          crop_cycles!inner(bloc_id)
        `)
        .eq('crop_cycles.bloc_id', blocId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data || []).map(this.transformDbToLocal)
    } catch (error) {
      console.error('Error loading attachments for bloc:', error)
      return []
    }
  }

  /**
   * Get all attachments for a specific crop cycle
   */
  static async getAttachmentsForCycle(cycleId: string): Promise<BlocAttachment[]> {
    try {
      const { data, error } = await supabase
        .from('attachments')
        .select('*')
        .eq('crop_cycle_id', cycleId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data || []).map(this.transformDbToLocal)
    } catch (error) {
      console.error('Error loading attachments for cycle:', error)
      return []
    }
  }

  /**
   * Get all attachments for an activity
   */
  static async getAttachmentsForActivity(activityId: string): Promise<BlocAttachment[]> {
    try {
      const { data, error } = await supabase
        .from('attachments')
        .select('*')
        .eq('activity_id', activityId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data || []).map(this.transformDbToLocal)
    } catch (error) {
      console.error('Error loading attachments for activity:', error)
      return []
    }
  }

  /**
   * Get all attachments for an observation
   */
  static async getAttachmentsForObservation(observationId: string): Promise<BlocAttachment[]> {
    try {
      const { data, error } = await supabase
        .from('attachments')
        .select('*')
        .eq('observation_id', observationId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data || []).map(this.transformDbToLocal)
    } catch (error) {
      console.error('Error loading attachments for observation:', error)
      return []
    }
  }

  /**
   * Create a new attachment
   */
  static async createAttachment(attachment: BlocAttachment, file?: File): Promise<BlocAttachment> {
    try {
      let fileUrl = null
      let filePath = null

      // Upload file if provided
      if (file) {
        filePath = this.generateStoragePath(file.name, attachment.cropCycleId, attachment.activityId, attachment.observationId)
        fileUrl = await this.uploadFile(file, filePath)
      }

      // Create attachment record in database
      const { data, error } = await supabase
        .from('attachments')
        .insert({
          name: attachment.name,
          description: attachment.description,
          type: attachment.type,
          crop_cycle_id: attachment.cropCycleId,
          activity_id: attachment.activityId,
          observation_id: attachment.observationId,
          file_url: fileUrl,
          file_path: filePath,
          file_size: file?.size,
          file_type: file?.type,
          tags: attachment.tags,
          metadata: attachment.metadata
        })
        .select()
        .single()

      if (error) throw error

      const newAttachment = this.transformDbToLocal(data)

      // Recalculate crop cycle totals if attachment affects totals (rare case) using database function
      if (attachment.cropCycleId) {
        await CropCycleCalculationService.triggerRecalculation(attachment.cropCycleId)
      }

      return newAttachment
    } catch (error) {
      console.error('Error creating attachment:', error)
      throw error
    }
  }
  
  /**
   * Update an existing attachment
   */
  static async updateAttachment(attachmentId: string, updates: Partial<BlocAttachment>): Promise<BlocAttachment> {
    try {
      // Transform local updates to database format
      const dbUpdates = this.transformLocalToDb(updates)

      const { data, error } = await supabase
        .from('attachments')
        .update({
          ...dbUpdates,
          updated_at: new Date().toISOString()
        })
        .eq('id', attachmentId)
        .select()
        .single()

      if (error) throw error

      const updatedAttachment = this.transformDbToLocal(data)

      // Recalculate crop cycle totals if attachment affects totals (rare case) using database function
      if (updatedAttachment.cropCycleId) {
        await CropCycleCalculationService.triggerRecalculation(updatedAttachment.cropCycleId)
      }

      return updatedAttachment
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
      // Get attachment to find crop cycle ID and file path before deletion
      const attachment = await this.getAttachmentById(attachmentId)
      const cropCycleId = attachment?.cropCycleId
      const filePath = attachment?.filePath

      // Delete file from storage if exists
      if (filePath) {
        await supabase.storage
          .from('attachments')
          .remove([filePath])
      }

      // Delete attachment from database
      const { error } = await supabase
        .from('attachments')
        .delete()
        .eq('id', attachmentId)

      if (error) throw error

      // Recalculate crop cycle totals after deletion (rare case) using database function
      if (cropCycleId) {
        await CropCycleCalculationService.triggerRecalculation(cropCycleId)
      }
    } catch (error) {
      console.error('Error deleting attachment:', error)
      throw error
    }
  }

  /**
   * Get attachment by ID
   */
  static async getAttachmentById(attachmentId: string): Promise<BlocAttachment | null> {
    try {
      const { data, error } = await supabase
        .from('attachments')
        .select('*')
        .eq('id', attachmentId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null // No rows returned
        throw error
      }

      return this.transformDbToLocal(data)
    } catch (error) {
      console.error('Error getting attachment by ID:', error)
      return null
    }
  }

  /**
   * Auto-save attachment (creates if new, updates if existing)
   */
  static async autoSaveAttachment(attachment: BlocAttachment, file?: File): Promise<BlocAttachment> {
    const existingAttachment = await this.getAttachmentById(attachment.id)

    if (existingAttachment) {
      return this.updateAttachment(attachment.id, attachment)
    } else {
      return this.createAttachment(attachment, file)
    }
  }

  /**
   * Upload file to Supabase storage
   */
  private static async uploadFile(file: File, storagePath: string): Promise<string> {
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
  private static generateStoragePath(originalName: string, cropCycleId?: string, activityId?: string, observationId?: string): string {
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substr(2, 9)
    const extension = originalName.split('.').pop()

    let folder = 'general'
    if (cropCycleId) folder = `crop-cycles/${cropCycleId}`
    if (activityId) folder = `activities/${activityId}`
    if (observationId) folder = `observations/${observationId}`

    return `${folder}/${timestamp}_${randomId}.${extension}`
  }

  /**
   * Transform database record to local BlocAttachment type
   */
  private static transformDbToLocal(dbRecord: any): BlocAttachment {
    return {
      id: dbRecord.id,
      name: dbRecord.name,
      description: dbRecord.description,
      type: dbRecord.type,
      cropCycleId: dbRecord.crop_cycle_id,
      activityId: dbRecord.activity_id,
      observationId: dbRecord.observation_id,
      fileUrl: dbRecord.file_url,
      filePath: dbRecord.file_path,
      fileSize: dbRecord.file_size,
      fileType: dbRecord.file_type,
      uploadDate: dbRecord.created_at,
      lastModified: dbRecord.updated_at,
      tags: dbRecord.tags || [],
      metadata: dbRecord.metadata || {},
      uploadedBy: dbRecord.created_by || 'system'
    }
  }

  /**
   * Transform local BlocAttachment updates to database format
   */
  private static transformLocalToDb(localUpdates: Partial<BlocAttachment>): any {
    const dbUpdates: any = {}

    if (localUpdates.name) dbUpdates.name = localUpdates.name
    if (localUpdates.description) dbUpdates.description = localUpdates.description
    if (localUpdates.type) dbUpdates.type = localUpdates.type
    if (localUpdates.cropCycleId) dbUpdates.crop_cycle_id = localUpdates.cropCycleId
    if (localUpdates.activityId) dbUpdates.activity_id = localUpdates.activityId
    if (localUpdates.observationId) dbUpdates.observation_id = localUpdates.observationId
    if (localUpdates.tags) dbUpdates.tags = localUpdates.tags
    if (localUpdates.metadata) dbUpdates.metadata = localUpdates.metadata

    return dbUpdates
  }
}
