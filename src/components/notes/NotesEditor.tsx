'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  FileText, 
  Plus, 
  Edit3, 
  Save, 
  X, 
  Clock,
  User,
  Hash
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

interface Note {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
  author: string
  tags: string[]
  priority: 'supervisor' | 'field-manager' | 'farm-manager'
}

interface NotesEditorProps {
  initialNotes?: Note[]
  onNotesChange?: (notes: Note[]) => void
  className?: string
}

export default function NotesEditor({ 
  initialNotes = [], 
  onNotesChange,
  className = "" 
}: NotesEditorProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    tags: '',
    priority: 'field-manager' as const
  })

  const handleCreateNote = () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return

    const note: Note = {
      id: `note-${Date.now()}`,
      title: newNote.title.trim(),
      content: newNote.content.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
      author: 'Current User', // In real app, get from auth context
      tags: newNote.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      priority: newNote.priority
    }

    const updatedNotes = [...notes, note]
    setNotes(updatedNotes)
    onNotesChange?.(updatedNotes)
    
    // Reset form
    setNewNote({ title: '', content: '', tags: '', priority: 'field-manager' })
    setIsCreating(false)
  }

  const handleUpdateNote = (id: string, updates: Partial<Note>) => {
    const updatedNotes = notes.map(note => 
      note.id === id 
        ? { ...note, ...updates, updatedAt: new Date() }
        : note
    )
    setNotes(updatedNotes)
    onNotesChange?.(updatedNotes)
    setEditingId(null)
  }

  const handleDeleteNote = (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id)
    setNotes(updatedNotes)
    onNotesChange?.(updatedNotes)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'farm-manager': return 'bg-red-100 text-red-700 border-red-200'
      case 'field-manager': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'supervisor': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Operation Notes
            <Badge variant="secondary" className="text-xs">
              {notes.length} note{notes.length !== 1 ? 's' : ''}
            </Badge>
          </CardTitle>
          <Button
            onClick={() => setIsCreating(true)}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Note
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Create New Note Form */}
        <AnimatePresence>
          {isCreating && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 p-4 border rounded-lg bg-slate-50"
            >
              <div className="flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">New Note</span>
              </div>
              
              <input
                type="text"
                placeholder="Note title..."
                value={newNote.title}
                onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              
              <Textarea
                placeholder="Write your note content here..."
                value={newNote.content}
                onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                className="min-h-20 text-sm"
              />
              
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Tags (comma separated)"
                  value={newNote.tags}
                  onChange={(e) => setNewNote(prev => ({ ...prev, tags: e.target.value }))}
                  className="flex-1 px-3 py-1 border rounded text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <select
                  value={newNote.priority}
                  onChange={(e) => setNewNote(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="px-2 py-1 border rounded text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="supervisor">Supervisor</option>
                  <option value="field-manager">Field Manager</option>
                  <option value="farm-manager">Farm Manager</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleCreateNote}
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Save className="h-3 w-3" />
                  Save
                </Button>
                <Button
                  onClick={() => setIsCreating(false)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notes List */}
        <div className="space-y-3">
          {notes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No notes yet</p>
              <p className="text-xs">Add your first note to get started</p>
            </div>
          ) : (
            notes.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border rounded-lg bg-white hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-slate-900">{note.title}</h4>
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(note.priority)}>
                      {note.priority === 'farm-manager' ? 'Farm Manager' :
                       note.priority === 'field-manager' ? 'Field Manager' : 'Supervisor'}
                    </Badge>
                    <Button
                      onClick={() => handleDeleteNote(note.id)}
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-slate-400 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <p className="text-sm text-slate-600 mb-3 whitespace-pre-wrap">
                  {note.content}
                </p>
                
                {note.tags.length > 0 && (
                  <div className="flex items-center gap-1 mb-3">
                    <Hash className="h-3 w-3 text-slate-400" />
                    {note.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {note.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(note.updatedAt)}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
