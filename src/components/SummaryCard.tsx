import type { ReactNode } from 'react'

interface Props {
  title: string
  value: string
  icon: ReactNode
  description?: string
  trend?: 'up' | 'down' | 'neutral'
}

export function SummaryCard({ title, value, icon, description }: Props) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-500 text-sm font-medium">{title}</span>
        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
          {icon}
        </div>
      </div>
      <div className="flex items-end gap-2">
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      </div>
      {description && (
        <p className="text-sm text-gray-400 mt-1">{description}</p>
      )}
    </div>
  )
}