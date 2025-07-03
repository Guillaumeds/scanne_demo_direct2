'use client'

import { useState, useEffect } from 'react'
import { Save, RefreshCw, AlertCircle, CheckCircle, Settings, Palette, Database, Shield, Plus, Trash2, Edit3 } from 'lucide-react'
import IconPicker from '@/components/admin/IconPicker'
import { supabase } from '@/lib/supabase'
import * as LucideIcons from 'lucide-react'
import { SystemConfigService } from '@/lib/admin-database'

interface SystemConfig {
  id?: string
  config_key: string
  config_group: string
  config_value: any
  description: string
}

interface ConfigGroup {
  name: string
  icon: React.ReactNode
  description: string
  configs: SystemConfig[]
}

export default function AdminConfigPage() {
  const [configGroups, setConfigGroups] = useState<ConfigGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [activeGroup, setActiveGroup] = useState('general')
  const [showIconPicker, setShowIconPicker] = useState<{ configKey: string, currentIcon: string } | null>(null)

  useEffect(() => {
    loadSystemConfigs()
  }, [])

  const loadSystemConfigs = async () => {
    try {
      setLoading(true)

      // Load existing configs using service
      const configs = await SystemConfigService.getAllConfigs()

      // Initialize default configs if none exist
      if (!configs || configs.length === 0) {
        await SystemConfigService.initializeDefaultConfigs()
        return loadSystemConfigs() // Reload after initialization
      }

      // Group configs by category
      const grouped = groupConfigsByCategory(configs)
      setConfigGroups(grouped)
    } catch (error) {
      console.error('Error loading system configs:', error)
      setMessage({ type: 'error', text: 'Failed to load system configurations' })
    } finally {
      setLoading(false)
    }
  }



  const groupConfigsByCategory = (configs: SystemConfig[]): ConfigGroup[] => {
    const groups: { [key: string]: ConfigGroup } = {
      general: {
        name: 'General Settings',
        icon: <Settings className="w-5 h-5" />,
        description: 'Basic application settings and defaults',
        configs: []
      },
      categories: {
        name: 'Category Management',
        icon: <Palette className="w-5 h-5" />,
        description: 'Manage categories for activities, observations, and attachments',
        configs: []
      },
      mapping: {
        name: 'Map Configuration',
        icon: <Database className="w-5 h-5" />,
        description: 'Map display settings and field styling',
        configs: []
      },
      security: {
        name: 'Security & Access',
        icon: <Shield className="w-5 h-5" />,
        description: 'User access and security settings',
        configs: []
      }
    }

    configs.forEach(config => {
      if (groups[config.config_group]) {
        groups[config.config_group].configs.push(config)
      }
    })

    return Object.values(groups)
  }

  const handleSaveConfig = async (configKey: string, newValue: any) => {
    try {
      setSaving(true)

      await SystemConfigService.updateConfig(configKey, newValue)

      // Update local state
      setConfigGroups(prev => prev.map(group => ({
        ...group,
        configs: group.configs.map(config =>
          config.config_key === configKey
            ? { ...config, config_value: newValue }
            : config
        )
      })))

      setMessage({ type: 'success', text: 'Configuration saved successfully' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Error saving config:', error)
      setMessage({ type: 'error', text: 'Failed to save configuration' })
    } finally {
      setSaving(false)
    }
  }

  const handleIconSelect = (icon: string) => {
    if (!showIconPicker) return
    
    // Update the category with new icon
    const { configKey } = showIconPicker
    const group = configGroups.find(g => g.configs.some(c => c.config_key === configKey))
    const config = group?.configs.find(c => c.config_key === configKey)
    
    if (config && config.config_value.categories) {
      const updatedCategories = config.config_value.categories.map((cat: any) => 
        cat.id === showIconPicker.configKey.split('_')[1] 
          ? { ...cat, icon }
          : cat
      )
      
      handleSaveConfig(configKey, { ...config.config_value, categories: updatedCategories })
    }
    
    setShowIconPicker(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading system configurations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-lg border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
            <Settings className="w-6 h-6 text-blue-600" />
            <span>System Configuration</span>
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage application settings and categories
          </p>
        </div>

        <nav className="p-4 space-y-2">
          {configGroups.map((group) => (
            <button
              key={group.name}
              type="button"
              onClick={() => setActiveGroup(group.name.toLowerCase().replace(/\s+/g, '_'))}
              className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                activeGroup === group.name.toLowerCase().replace(/\s+/g, '_')
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                {group.icon}
                <div>
                  <div className="font-medium">{group.name}</div>
                  <div className="text-xs text-gray-500">{group.description}</div>
                </div>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Status Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Configuration Content */}
          {configGroups.map((group) => {
            const groupKey = group.name.toLowerCase().replace(/\s+/g, '_')
            if (activeGroup !== groupKey) return null

            return (
              <div key={group.name} className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      {group.icon}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                        <p className="text-sm text-gray-600">{group.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    {group.configs.map((config) => (
                      <ConfigField
                        key={config.config_key}
                        config={config}
                        onSave={handleSaveConfig}
                        onIconPicker={(configKey, currentIcon) => setShowIconPicker({ configKey, currentIcon })}
                        saving={saving}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Icon Picker Modal */}
      {showIconPicker && (
        <IconPicker
          onSelect={handleIconSelect}
          onClose={() => setShowIconPicker(null)}
          currentIcon={showIconPicker.currentIcon}
        />
      )}
    </div>
  )
}

function ConfigField({ config, onSave, onIconPicker, saving }: {
  config: SystemConfig
  onSave: (configKey: string, newValue: any) => void
  onIconPicker: (configKey: string, currentIcon: string) => void
  saving: boolean
}) {
  const [localValue, setLocalValue] = useState(config.config_value)
  const [hasChanges, setHasChanges] = useState(false)

  const handleChange = (newValue: any) => {
    setLocalValue(newValue)
    setHasChanges(true)
  }

  const handleSave = () => {
    onSave(config.config_key, localValue)
    setHasChanges(false)
  }

  const renderField = () => {
    // Simple value fields
    if (config.config_value.value !== undefined) {
      return (
        <div className="space-y-3">
          <input
            type="text"
            value={localValue.value || ''}
            onChange={(e) => handleChange({ ...localValue, value: e.target.value })}
            placeholder="Enter value"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {localValue.symbol && (
            <input
              type="text"
              placeholder="Symbol (e.g., Rs, $)"
              value={localValue.symbol || ''}
              onChange={(e) => handleChange({ ...localValue, symbol: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          )}
        </div>
      )
    }

    // Coordinate fields
    if (config.config_value.lat !== undefined) {
      return (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
            <input
              type="number"
              step="0.0001"
              value={localValue.lat || ''}
              onChange={(e) => handleChange({ ...localValue, lat: parseFloat(e.target.value) })}
              placeholder="Latitude"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
            <input
              type="number"
              step="0.0001"
              value={localValue.lng || ''}
              onChange={(e) => handleChange({ ...localValue, lng: parseFloat(e.target.value) })}
              placeholder="Longitude"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )
    }

    // Color fields
    if (config.config_key.includes('colors')) {
      return (
        <div className="space-y-3">
          {Object.entries(localValue).map(([key, value]) => (
            <div key={key} className="flex items-center space-x-3">
              <label className="w-24 text-sm font-medium text-gray-700 capitalize">
                {key.replace('_', ' ')}
              </label>
              <input
                type="color"
                value={value as string}
                onChange={(e) => handleChange({ ...localValue, [key]: e.target.value })}
                title={`Color for ${key.replace('_', ' ')}`}
                className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={value as string}
                onChange={(e) => handleChange({ ...localValue, [key]: e.target.value })}
                placeholder="Hex color code"
                className="flex-1 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          ))}
        </div>
      )
    }

    // Category management
    if (config.config_value.categories) {
      return <CategoryManager config={config} localValue={localValue} onChange={handleChange} onIconPicker={onIconPicker} />
    }

    // Default JSON editor
    return (
      <textarea
        value={JSON.stringify(localValue, null, 2)}
        onChange={(e) => {
          try {
            const parsed = JSON.parse(e.target.value)
            handleChange(parsed)
          } catch (error) {
            // Invalid JSON, don't update
          }
        }}
        rows={6}
        placeholder="JSON configuration"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-medium text-gray-900">{config.config_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
          <p className="text-sm text-gray-600">{config.description}</p>
        </div>
        {hasChanges && (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>
        )}
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        {renderField()}
      </div>
    </div>
  )
}

function CategoryManager({ config, localValue, onChange, onIconPicker }: {
  config: SystemConfig
  localValue: any
  onChange: (newValue: any) => void
  onIconPicker: (configKey: string, currentIcon: string) => void
}) {
  const [editingCategory, setEditingCategory] = useState<string | null>(null)

  const renderIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName]
    if (!IconComponent) return <div className="w-5 h-5 bg-gray-200 rounded" />
    return <IconComponent className="w-5 h-5" />
  }

  const addCategory = () => {
    const newCategory = {
      id: `category_${Date.now()}`,
      name: 'New Category',
      icon: 'Circle',
      color: '#64748b'
    }

    const updatedCategories = [...localValue.categories, newCategory]
    onChange({ ...localValue, categories: updatedCategories })
    setEditingCategory(newCategory.id)
  }

  const updateCategory = (categoryId: string, updates: any) => {
    const updatedCategories = localValue.categories.map((cat: any) =>
      cat.id === categoryId ? { ...cat, ...updates } : cat
    )
    onChange({ ...localValue, categories: updatedCategories })
  }

  const deleteCategory = (categoryId: string) => {
    const updatedCategories = localValue.categories.filter((cat: any) => cat.id !== categoryId)
    onChange({ ...localValue, categories: updatedCategories })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h5 className="font-medium text-gray-900">Categories</h5>
        <button
          type="button"
          onClick={addCategory}
          className="flex items-center space-x-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      <div className="space-y-3">
        {localValue.categories.map((category: any) => (
          <div key={category.id} className="p-4 border border-gray-200 rounded-lg">
            {editingCategory === category.id ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={category.name}
                    onChange={(e) => updateCategory(category.id, { name: e.target.value })}
                    placeholder="Category name"
                    className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    value={category.id}
                    onChange={(e) => updateCategory(category.id, { id: e.target.value })}
                    placeholder="Category ID"
                    className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => onIconPicker(`${config.config_key}_${category.id}`, category.icon)}
                    className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    {renderIcon(category.icon)}
                    <span>Change Icon</span>
                  </button>
                  <input
                    type="color"
                    value={category.color}
                    onChange={(e) => updateCategory(category.id, { color: e.target.value })}
                    title="Category color"
                    className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={category.color}
                    onChange={(e) => updateCategory(category.id, { color: e.target.value })}
                    placeholder="Color code"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setEditingCategory(null)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-current" style={{ color: category.color }}>
                    {renderIcon(category.icon)}
                  </div>
                  <div>
                    <div className="font-medium">{category.name}</div>
                    <div className="text-sm text-gray-500">ID: {category.id}</div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setEditingCategory(category.id)}
                    title="Edit category"
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteCategory(category.id)}
                    title="Delete category"
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
