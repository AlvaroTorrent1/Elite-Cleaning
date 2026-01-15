'use client'

import { BarChart3 } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function CleaningsChart() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Datos fijos para evitar hydration mismatch
  const chartData = [
    { day: 'Lun', height: 75, count: 7 },
    { day: 'Mar', height: 60, count: 6 },
    { day: 'Mié', height: 85, count: 8 },
    { day: 'Jue', height: 70, count: 7 },
    { day: 'Vie', height: 90, count: 9 },
    { day: 'Sáb', height: 45, count: 4 },
    { day: 'Dom', height: 30, count: 3 },
  ]

  if (!mounted) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Limpiezas por Semana</h2>
          <BarChart3 className="w-5 h-5 text-gray-400" />
        </div>
        <div className="h-48 flex items-center justify-center text-gray-400">
          Cargando gráfico...
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Limpiezas por Semana</h2>
        <BarChart3 className="w-5 h-5 text-gray-400" />
      </div>

      {/* Placeholder chart */}
      <div className="flex items-end justify-between h-48 gap-2">
        {chartData.map((data) => (
          <div key={data.day} className="flex-1 flex flex-col items-center gap-2">
            <div
              className="w-full bg-blue-500 rounded-t-lg hover:bg-blue-600 transition-colors cursor-pointer"
              style={{ height: `${data.height}%` }}
              title={`${data.count} limpiezas`}
            />
            <span className="text-xs text-gray-600">{data.day}</span>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500 mt-4 text-center">
        * Gráfico de ejemplo - Se implementará con datos reales próximamente
      </p>
    </div>
  )
}
