'use client'

import { useState } from 'react'
import { CycleSummary, CropCycle } from '@/types/cropCycles'

interface CycleSummaryReportProps {
  cycle: CropCycle
  summary: CycleSummary
  onClose: () => void
  onExport?: () => void
}

export default function CycleSummaryReport({ 
  cycle, 
  summary, 
  onClose, 
  onExport 
}: CycleSummaryReportProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'financial' | 'production' | 'quality'>('overview')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatNumber = (num: number, decimals: number = 2) => {
    return num.toLocaleString('en-ZA', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })
  }

  const formatPercentage = (num: number) => {
    return `${formatNumber(num, 1)}%`
  }

  const getCycleDisplayName = () => {
    if (cycle.type === 'plantation') {
      return `Plantation Cycle`
    } else {
      return `Ratoon ${cycle.cycleNumber - 1} Cycle`
    }
  }

  const getProfitabilityColor = (value: number) => {
    if (value >= 0) return 'text-green-600'
    return 'text-red-600'
  }

  const getPerformanceIndicator = (actual: number, target: number) => {
    const percentage = (actual / target) * 100
    if (percentage >= 100) return { color: 'text-green-600', icon: '↗️', text: 'Above Target' }
    if (percentage >= 80) return { color: 'text-yellow-600', icon: '→', text: 'Near Target' }
    return { color: 'text-red-600', icon: '↘️', text: 'Below Target' }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{getCycleDisplayName()} Summary</h2>
              <p className="text-sm text-gray-600 mt-1">
                {cycle.sugarcaneVarietyName} • {summary.blocArea} hectares • {summary.duration} days
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {onExport && (
                <button
                  onClick={onExport}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Export</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mt-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Overview', icon: '📊' },
                { id: 'financial', name: 'Financial', icon: '💰' },
                { id: 'production', name: 'Production', icon: '🌾' },
                { id: 'quality', name: 'Quality', icon: '⭐' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800">Net Profit</p>
                      <p className={`text-2xl font-bold ${getProfitabilityColor(summary.profitability.netProfit)}`}>
                        {formatCurrency(summary.profitability.netProfit)}
                      </p>
                    </div>
                    <div className="text-3xl">💰</div>
                  </div>
                  <p className="text-xs text-green-600 mt-2">
                    {formatCurrency(summary.profitability.profitPerHectare)}/ha
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-800">Sugarcane Yield</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {formatNumber(summary.yields.sugarcane.perHectare)} t/ha
                      </p>
                    </div>
                    <div className="text-3xl">🌾</div>
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    {formatNumber(summary.yields.sugarcane.total)} tons total
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Sugar Content</p>
                      <p className="text-2xl font-bold text-yellow-900">
                        {formatPercentage(summary.yields.sugar.percentage)}
                      </p>
                    </div>
                    <div className="text-3xl">🍯</div>
                  </div>
                  <p className="text-xs text-yellow-600 mt-2">
                    {formatNumber(summary.yields.sugar.perHectare)} t/ha sugar
                  </p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-800">ROI</p>
                      <p className={`text-2xl font-bold ${getProfitabilityColor(summary.profitability.roi)}`}>
                        {formatPercentage(summary.profitability.roi)}
                      </p>
                    </div>
                    <div className="text-3xl">📈</div>
                  </div>
                  <p className="text-xs text-purple-600 mt-2">
                    {formatPercentage(summary.profitability.profitMargin)} margin
                  </p>
                </div>
              </div>

              {/* Summary Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Cost Breakdown */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Cost Breakdown</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Land Preparation', value: summary.costs.landPreparation, color: 'bg-red-500' },
                      { label: 'Planting', value: summary.costs.planting, color: 'bg-orange-500' },
                      { label: 'Establishment', value: summary.costs.establishment, color: 'bg-yellow-500' },
                      { label: 'Growth', value: summary.costs.growth, color: 'bg-green-500' },
                      { label: 'Maintenance', value: summary.costs.maintenance, color: 'bg-blue-500' },
                      { label: 'Harvest', value: summary.costs.harvest, color: 'bg-purple-500' }
                    ].map((item) => {
                      const percentage = (item.value / summary.costs.total) * 100
                      return (
                        <div key={item.label} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                            <span className="text-sm text-gray-700">{item.label}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(item.value)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatPercentage(percentage)}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Revenue Breakdown */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Breakdown</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Sugarcane Sales', value: summary.revenue.sugarcane, color: 'bg-green-500' },
                      { label: 'Sugar Sales', value: summary.revenue.sugar, color: 'bg-yellow-500' },
                      ...(summary.revenue.electricity > 0 ? [{ label: 'Electricity/Biomass', value: summary.revenue.electricity, color: 'bg-blue-500' }] : []),
                      ...(summary.revenue.intercrop > 0 ? [{ label: 'Intercrop Sales', value: summary.revenue.intercrop, color: 'bg-purple-500' }] : [])
                    ].map((item) => {
                      const percentage = (item.value / summary.revenue.total) * 100
                      return (
                        <div key={item.label} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                            <span className="text-sm text-gray-700">{item.label}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(item.value)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatPercentage(percentage)}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Activity and Observation Completion */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Completion</h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Completed Activities</span>
                    <span className="text-sm font-medium text-gray-900">
                      {summary.activities.completed}/{summary.activities.total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${summary.activities.completionRate}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatPercentage(summary.activities.completionRate)} completion rate
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Observation Completion</h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Completed Observations</span>
                    <span className="text-sm font-medium text-gray-900">
                      {summary.observations.completed}/{summary.observations.total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${summary.observations.completionRate}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatPercentage(summary.observations.completionRate)} completion rate
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'financial' && (
            <div className="space-y-6">
              {/* Financial Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-red-800 mb-4">Total Costs</h3>
                  <p className="text-3xl font-bold text-red-900 mb-2">
                    {formatCurrency(summary.costs.total)}
                  </p>
                  <p className="text-sm text-red-600">
                    {formatCurrency(summary.costs.perHectare)} per hectare
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-green-800 mb-4">Total Revenue</h3>
                  <p className="text-3xl font-bold text-green-900 mb-2">
                    {formatCurrency(summary.revenue.total)}
                  </p>
                  <p className="text-sm text-green-600">
                    {formatCurrency(summary.revenue.perHectare)} per hectare
                  </p>
                </div>

                <div className={`border rounded-lg p-6 ${
                  summary.profitability.netProfit >= 0 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <h3 className={`text-lg font-medium mb-4 ${
                    summary.profitability.netProfit >= 0 ? 'text-blue-800' : 'text-red-800'
                  }`}>
                    Net Profit
                  </h3>
                  <p className={`text-3xl font-bold mb-2 ${getProfitabilityColor(summary.profitability.netProfit)}`}>
                    {formatCurrency(summary.profitability.netProfit)}
                  </p>
                  <p className={`text-sm ${
                    summary.profitability.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(summary.profitability.profitPerHectare)} per hectare
                  </p>
                </div>
              </div>

              {/* Detailed Cost Breakdown */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Detailed Cost Analysis</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phase
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Cost
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cost per Hectare
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          % of Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {[
                        { phase: 'Land Preparation', cost: summary.costs.landPreparation },
                        { phase: 'Planting', cost: summary.costs.planting },
                        { phase: 'Establishment', cost: summary.costs.establishment },
                        { phase: 'Growth', cost: summary.costs.growth },
                        { phase: 'Maintenance', cost: summary.costs.maintenance },
                        { phase: 'Pre-Harvest', cost: summary.costs.preHarvest },
                        { phase: 'Harvest', cost: summary.costs.harvest },
                        { phase: 'Post-Harvest', cost: summary.costs.postHarvest }
                      ].map((item) => {
                        const percentage = (item.cost / summary.costs.total) * 100
                        const costPerHa = item.cost / summary.blocArea
                        return (
                          <tr key={item.phase}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.phase}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(item.cost)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(costPerHa)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatPercentage(percentage)}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Profitability Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Profit Margin</h4>
                  <p className={`text-xl font-bold ${getProfitabilityColor(summary.profitability.profitMargin)}`}>
                    {formatPercentage(summary.profitability.profitMargin)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Return on Investment</h4>
                  <p className={`text-xl font-bold ${getProfitabilityColor(summary.profitability.roi)}`}>
                    {formatPercentage(summary.profitability.roi)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Revenue per Hectare</h4>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(summary.revenue.perHectare)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Cost per Hectare</h4>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(summary.costs.perHectare)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Add more tab content for production and quality tabs */}
          {activeTab === 'production' && (
            <div className="text-center py-8">
              <p className="text-gray-500">Production analysis coming soon...</p>
            </div>
          )}

          {activeTab === 'quality' && (
            <div className="text-center py-8">
              <p className="text-gray-500">Quality analysis coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
