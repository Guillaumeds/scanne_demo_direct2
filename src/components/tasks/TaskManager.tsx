'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DatePicker } from '@/components/ui/date-picker'
import { 
  CheckSquare, 
  Plus, 
  Calendar,
  User,
  Flag,
  Clock,
  X,
  GripVertical
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: 'normal' | 'high' | 'critical'
  dueDate?: Date
  assignee?: string
  createdAt: Date
  completedAt?: Date
}

interface TaskManagerProps {
  initialTasks?: Task[]
  onTasksChange?: (tasks: Task[]) => void
  className?: string
}

export default function TaskManager({ 
  initialTasks = [], 
  onTasksChange,
  className = "" 
}: TaskManagerProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [isCreating, setIsCreating] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'normal' as const,
    dueDate: undefined as Date | undefined,
    assignee: ''
  })
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')

  const handleCreateTask = () => {
    if (!newTask.title.trim()) return

    const task: Task = {
      id: `task-${Date.now()}`,
      title: newTask.title.trim(),
      description: newTask.description.trim() || undefined,
      completed: false,
      priority: newTask.priority,
      dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined,
      assignee: newTask.assignee.trim() || undefined,
      createdAt: new Date()
    }

    const updatedTasks = [...tasks, task]
    setTasks(updatedTasks)
    onTasksChange?.(updatedTasks)
    
    // Reset form
    setNewTask({ title: '', description: '', priority: 'normal', dueDate: undefined, assignee: '' })
    setIsCreating(false)
  }

  const handleToggleTask = (id: string) => {
    const updatedTasks = tasks.map(task => 
      task.id === id 
        ? { 
            ...task, 
            completed: !task.completed,
            completedAt: !task.completed ? new Date() : undefined
          }
        : task
    )
    setTasks(updatedTasks)
    onTasksChange?.(updatedTasks)
  }

  const handleDeleteTask = (id: string) => {
    const updatedTasks = tasks.filter(task => task.id !== id)
    setTasks(updatedTasks)
    onTasksChange?.(updatedTasks)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-500'
      case 'high': return 'text-orange-500'
      case 'normal': return 'text-green-500'
      default: return 'text-gray-500'
    }
  }

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'normal': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date)
  }

  const isOverdue = (dueDate: Date) => {
    return new Date() > dueDate
  }

  const filteredTasks = tasks.filter(task => {
    switch (filter) {
      case 'pending': return !task.completed
      case 'completed': return task.completed
      default: return true
    }
  })

  const completedCount = tasks.filter(task => task.completed).length
  const pendingCount = tasks.filter(task => !task.completed).length

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-primary" />
            Operation Tasks
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {pendingCount} pending
              </Badge>
              <Badge variant="outline" className="text-xs">
                {completedCount} done
              </Badge>
            </div>
          </CardTitle>
          <Button
            onClick={() => setIsCreating(true)}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        </div>
        
        {/* Filter Buttons */}
        <div className="flex items-center gap-2">
          {(['all', 'pending', 'completed'] as const).map((filterType) => (
            <Button
              key={filterType}
              onClick={() => setFilter(filterType)}
              variant={filter === filterType ? 'default' : 'outline'}
              size="sm"
              className="text-xs"
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Create New Task Form */}
        <AnimatePresence>
          {isCreating && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 p-4 border rounded-lg bg-slate-50"
            >
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">New Task</span>
              </div>
              
              <Input
                placeholder="Task title..."
                value={newTask.title}
                onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                className="text-sm"
              />
              
              <Input
                placeholder="Description (optional)..."
                value={newTask.description}
                onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                className="text-sm"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
                
                <DatePicker
                  date={newTask.dueDate}
                  onDateChange={(date) => setNewTask(prev => ({ ...prev, dueDate: date }))}
                  placeholder="Select due date"
                  className="text-sm"
                />
                
                <Input
                  placeholder="Assignee"
                  value={newTask.assignee}
                  onChange={(e) => setNewTask(prev => ({ ...prev, assignee: e.target.value }))}
                  className="text-sm"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleCreateTask}
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Create Task
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

        {/* Tasks List */}
        <div className="space-y-2">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">
                {filter === 'all' ? 'No tasks yet' : 
                 filter === 'pending' ? 'No pending tasks' : 'No completed tasks'}
              </p>
              <p className="text-xs">
                {filter === 'all' ? 'Add your first task to get started' : ''}
              </p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-start gap-3 p-3 border rounded-lg bg-white hover:shadow-sm transition-all ${
                  task.completed ? 'opacity-75' : ''
                }`}
              >
                <div className="flex items-center gap-2 mt-0.5">
                  <GripVertical className="h-4 w-4 text-slate-300 cursor-grab" />
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => handleToggleTask(task.id)}
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`font-medium text-sm ${
                        task.completed ? 'line-through text-slate-500' : 'text-slate-900'
                      }`}>
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-xs text-slate-600 mt-1">{task.description}</p>
                      )}
                    </div>
                    
                    <Button
                      onClick={() => handleDeleteTask(task.id)}
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-slate-400 hover:text-red-500 ml-2"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1">
                      <Flag className={`h-3 w-3 ${getPriorityColor(task.priority)}`} />
                      <Badge className={getPriorityBadgeColor(task.priority)}>
                        {task.priority === 'normal' ? 'Normal' :
                         task.priority === 'high' ? 'High' : 'Critical'}
                      </Badge>
                    </div>
                    
                    {task.dueDate && (
                      <div className={`flex items-center gap-1 text-xs ${
                        isOverdue(task.dueDate) && !task.completed ? 'text-red-600' : 'text-slate-500'
                      }`}>
                        <Calendar className="h-3 w-3" />
                        {formatDate(task.dueDate)}
                        {isOverdue(task.dueDate) && !task.completed && (
                          <span className="text-red-600 font-medium">Overdue</span>
                        )}
                      </div>
                    )}
                    
                    {task.assignee && (
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <User className="h-3 w-3" />
                        {task.assignee}
                      </div>
                    )}
                    
                    {task.completed && task.completedAt && (
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <Clock className="h-3 w-3" />
                        Completed {formatDate(task.completedAt)}
                      </div>
                    )}
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
