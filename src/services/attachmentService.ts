/**
 * Attachment Service
 * Handles CRUD operations and persistence for attachments
 */

import { BlocAttachment } from '@/types/attachments'

export class AttachmentService {
  private static STORAGE_KEY = 'scanne_attachments'
  
  /**
   * Get all attachments for a specific bloc
   */
  static async getAttachmentsForBloc(blocId: string): Promise<BlocAttachment[]> {
    const attachments = this.getAllAttachments()
    return attachments.filter(attachment => {
      // Attachments are linked to crop cycles, which are linked to blocs
      // For now, we'll filter by checking if the attachment belongs to any cycle of this bloc
      return true // TODO: Implement proper filtering when crop cycle linking is complete
    }).sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
  }
  
  /**
   * Get all attachments for a specific crop cycle
   */
  static async getAttachmentsForCycle(cycleId: string): Promise<BlocAttachment[]> {
    const attachments = this.getAllAttachments()
    return attachments.filter(attachment => attachment.cropCycleId === cycleId)
      .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
  }
  
  /**
   * Create a new attachment
   */
  static async createAttachment(attachment: BlocAttachment): Promise<BlocAttachment> {
    const attachments = this.getAllAttachments()
    
    // Ensure unique ID
    const newAttachment: BlocAttachment = {
      ...attachment,
      id: attachment.id || `attachment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      lastModified: new Date().toISOString()
    }
    
    attachments.push(newAttachment)
    this.saveAttachments(attachments)
    
    return newAttachment
  }
  
  /**
   * Update an existing attachment
   */
  static async updateAttachment(attachmentId: string, updates: Partial<BlocAttachment>): Promise<BlocAttachment> {
    const attachments = this.getAllAttachments()
    const index = attachments.findIndex(a => a.id === attachmentId)

    if (index === -1) {
      throw new Error(`Attachment not found: ${attachmentId}`)
    }
    
    const updatedAttachment: BlocAttachment = {
      ...attachments[index],
      ...updates,
      lastModified: new Date().toISOString()
    }
    
    attachments[index] = updatedAttachment
    this.saveAttachments(attachments)
    
    return updatedAttachment
  }
  
  /**
   * Delete an attachment
   */
  static async deleteAttachment(attachmentId: string): Promise<void> {
    const attachments = this.getAllAttachments()
    const filteredAttachments = attachments.filter(a => a.id !== attachmentId)
    this.saveAttachments(filteredAttachments)
  }
  
  /**
   * Get attachment by ID
   */
  static async getAttachmentById(attachmentId: string): Promise<BlocAttachment | null> {
    const attachments = this.getAllAttachments()
    return attachments.find(a => a.id === attachmentId) || null
  }
  
  /**
   * Auto-save attachment (creates if new, updates if existing)
   */
  static async autoSaveAttachment(attachment: BlocAttachment): Promise<BlocAttachment> {
    const existingAttachment = await this.getAttachmentById(attachment.id)
    
    if (existingAttachment) {
      return this.updateAttachment(attachment.id, attachment)
    } else {
      return this.createAttachment(attachment)
    }
  }
  
  // Private helper methods
  private static getAllAttachments(): BlocAttachment[] {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error loading attachments:', error)
      return []
    }
  }
  
  private static saveAttachments(attachments: BlocAttachment[]): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(attachments))
    } catch (error) {
      console.error('Error saving attachments:', error)
    }
  }
}
