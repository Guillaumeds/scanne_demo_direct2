'use client'

import { ObservationCategory, OBSERVATION_CATEGORIES } from '@/types/observations'
import { AttachmentCategory, ATTACHMENT_CATEGORIES } from '@/types/attachments'

interface CategorySelectorProps {
  type: 'observation' | 'attachment'
  onSelect: (category: ObservationCategory | AttachmentCategory) => void
  onClose: () => void
}

export default function CategorySelector({ type, onSelect, onClose }: CategorySelectorProps) {
  const categories = type === 'observation' ? OBSERVATION_CATEGORIES : ATTACHMENT_CATEGORIES

  const handleCategorySelect = (categoryId: string) => {
    onSelect(categoryId as ObservationCategory | AttachmentCategory)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Select {type === 'observation' ? 'Observation' : 'Attachment'} Category
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Categories Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategorySelect(category.id)}
                className="p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200 text-left group"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-3xl group-hover:scale-110 transition-transform">
                    {category.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 group-hover:text-green-700">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {category.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
