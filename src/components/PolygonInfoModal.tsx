'use client'

interface DrawnArea {
  id: string
  type: string
  coordinates: [number, number][]
  area: number
}

interface PolygonInfoModalProps {
  polygon: DrawnArea | null
  onClose: () => void
  onDelete: (areaId: string) => void
  fields: any[] // Field data for showing field names
}

export default function PolygonInfoModal({ 
  polygon, 
  onClose, 
  onDelete,
  fields 
}: PolygonInfoModalProps) {
  if (!polygon) return null

  const getFieldName = (fieldId: string) => {
    const field = fields.find(f => f.field_id === fieldId)
    return field ? field.field_name : fieldId
  }

  const handleDelete = () => {
    onDelete(polygon.id)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000]">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">
            {polygon.type === 'polygon' ? '⬟ Cultivation Area' : '▭ Rectangle Area'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Area Information */}
          <div className="bg-blue-50 rounded-lg p-3">
            <h3 className="font-semibold text-blue-800 mb-2">Area Details</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Area:</span>
                <span className="font-medium">{polygon.area.toFixed(2)} hectares</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Vertices:</span>
                <span className="font-medium">{polygon.coordinates.length} points</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium capitalize">{polygon.type}</span>
              </div>
            </div>
          </div>

          {/* Field overlap display removed - blocs are now independent of fields */}

          {/* Coordinates Preview */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h3 className="font-semibold text-gray-800 mb-2">Coordinates</h3>
            <div className="text-xs text-gray-600 max-h-24 overflow-y-auto">
              {polygon.coordinates.slice(0, 5).map((coord, index) => (
                <div key={index} className="font-mono">
                  {index + 1}: {coord[1].toFixed(6)}, {coord[0].toFixed(6)}
                </div>
              ))}
              {polygon.coordinates.length > 5 && (
                <div className="text-gray-500 italic">
                  ... and {polygon.coordinates.length - 5} more points
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition-colors"
            >
              Delete Area
            </button>
          </div>

          {/* Tips */}
          <div className="text-xs text-gray-500 bg-yellow-50 rounded p-2">
            <strong>💡 Tip:</strong> You can drag the blue vertex markers on the map to edit this area&apos;s shape.
          </div>
        </div>
      </div>
    </div>
  )
}
