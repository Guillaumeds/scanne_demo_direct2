'use client'

import { FieldData } from '@/types/field'

interface FieldListProps {
  fields: FieldData[]
  selectedField: string | null
  onFieldSelect: (fieldId: string) => void
  onFieldHover?: (fieldId: string | null) => void
}

export default function FieldList({ 
  fields, 
  selectedField, 
  onFieldSelect, 
  onFieldHover 
}: FieldListProps) {
  const activeFields = fields.filter(f => f.status === 'Active')
  const inactiveFields = fields.filter(f => f.status === 'Inactive')

  const FieldItem = ({ field }: { field: FieldData }) => (
    <div
      key={field.field_id}
      className={`p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
        selectedField === field.field_id ? 'bg-blue-50 border-blue-200' : ''
      }`}
      onClick={() => onFieldSelect(field.field_id)}
      onMouseEnter={() => onFieldHover?.(field.field_id)}
      onMouseLeave={() => onFieldHover?.(null)}
    >
      <div className="flex justify-between items-start mb-1">
        <h4 className="font-medium text-sm">{field.field_name}</h4>
        <span className={`text-xs px-2 py-1 rounded-full ${
          field.status === 'Active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-600'
        }`}>
          {field.status}
        </span>
      </div>
      <p className="text-xs text-gray-600 mb-1">{field.crop_type}</p>
      <p className="text-xs text-gray-500">{field.area_hectares} ha</p>
    </div>
  )

  return (
    <div className="w-80 bg-white shadow-lg h-full overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-bold text-gray-800">Farm Fields</h2>
        <p className="text-sm text-gray-600">
          {fields.length} total • {activeFields.length} active • {inactiveFields.length} inactive
        </p>
      </div>

      {/* Field List */}
      <div className="flex-1 overflow-y-auto">
        {/* Active Fields */}
        {activeFields.length > 0 && (
          <div>
            <div className="p-3 bg-green-50 border-b border-green-200">
              <h3 className="text-sm font-semibold text-green-800">
                Active Fields ({activeFields.length})
              </h3>
            </div>
            {activeFields.map(field => (
              <FieldItem key={field.field_id} field={field} />
            ))}
          </div>
        )}

        {/* Inactive Fields */}
        {inactiveFields.length > 0 && (
          <div>
            <div className="p-3 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700">
                Inactive Fields ({inactiveFields.length})
              </h3>
            </div>
            {inactiveFields.map(field => (
              <FieldItem key={field.field_id} field={field} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {fields.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <p className="text-sm">No fields loaded</p>
            <p className="text-xs mt-1">Check your CSV file</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-500 text-center">
          Click a field to select • Hover to highlight
        </p>
      </div>
    </div>
  )
}
