'use client'

import { useState } from 'react'
import { CycleClosureValidation, CloseCycleRequest } from '@/types/cropCycles'
import CycleSummaryReport from './CycleSummaryReport'

interface CycleClosureModalProps {
  validation: CycleClosureValidation
  onClose: () => void
  onConfirm: (data: CloseCycleRequest) => void
}

export default function CycleClosureModal({ validation, onClose, onConfirm }: CycleClosureModalProps) {
  const [actualHarvestDate, setActualHarvestDate] = useState('')
  const [userConfirmation, setUserConfirmation] = useState(false)
  const [notes, setNotes] = useState('')
  const [showSummary, setShowSummary] = useState(false)
  const [showDetailedReport, setShowDetailedReport] = useState(false)

  const handleConfirm = () => {
    if (!actualHarvestDate) {
      alert('Actual harvest date is required')
      return
    }

    if (!userConfirmation) {
      alert('Please confirm that you have reviewed the cycle summary')
      return
    }

    onConfirm({
      cycleId: validation.cycleId,
      actualHarvestDate,
      userConfirmation,
      notes
    })
  }

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

  if (!validation.canClose) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Cannot Close Cycle</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center mb-4">
                <svg className="w-8 h-8 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <h3 className="text-lg font-medium text-red-800">
                  The following issues must be resolved before closing this cycle:
                </h3>
              </div>

              {/* Validation Errors */}
              {validation.validationErrors.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Validation Errors:</h4>
                  <ul className="space-y-2">
                    {validation.validationErrors.map((error, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-gray-700">{error.message}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Missing Observations */}
              {validation.missingObservations.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Missing Mandatory Observations:</h4>
                  <ul className="space-y-2">
                    {validation.missingObservations.map((obs, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="w-4 h-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <span className="text-sm font-medium text-gray-900">{obs.name}</span>
                          <p className="text-xs text-gray-600">{obs.description}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Missing Activity Costs */}
              {validation.missingActivityCosts.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Activities Missing Actual Costs:</h4>
                  <ul className="space-y-3">
                    {validation.missingActivityCosts.map((activity, index) => (
                      <li key={index} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-start">
                          <svg className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-900">{activity.activityName}</span>
                            <span className="text-xs text-gray-500 ml-2">({activity.phase})</span>
                            <ul className="mt-1 text-xs text-gray-600">
                              {activity.missingItems.map((item, itemIndex) => (
                                <li key={itemIndex}>
                                  • {item.name} ({item.type}) - Missing actual cost
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Close Crop Cycle</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {!showSummary ? (
            <div>
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <svg className="w-8 h-8 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <h3 className="text-lg font-medium text-green-800">
                    All validation checks passed! Ready to close cycle.
                  </h3>
                </div>
                <p className="text-gray-600 mb-6">
                  Please provide the actual harvest date and review the cycle summary before confirming closure.
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Actual Harvest Date *
                </label>
                <input
                  type="date"
                  value={actualHarvestDate}
                  onChange={(e) => setActualHarvestDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Add any additional notes about this cycle closure..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-between">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowSummary(true)}
                  disabled={!actualHarvestDate}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  Review Cycle Summary
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Cycle Summary</h3>
                {validation.summary && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Financial Summary */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Financial Performance</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total Costs:</span>
                          <span className="font-medium">{formatCurrency(validation.summary.costs.total)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Revenue:</span>
                          <span className="font-medium">{formatCurrency(validation.summary.revenue.total)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="font-medium">Net Profit:</span>
                          <span className={`font-medium ${validation.summary.profitability.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(validation.summary.profitability.netProfit)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Profit per Hectare:</span>
                          <span className={`font-medium ${validation.summary.profitability.profitPerHectare >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(validation.summary.profitability.profitPerHectare)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>ROI:</span>
                          <span className={`font-medium ${validation.summary.profitability.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatNumber(validation.summary.profitability.roi, 1)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Yield Summary */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Yield Performance</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Sugarcane Yield:</span>
                          <span className="font-medium">{formatNumber(validation.summary.yields.sugarcane.perHectare)} t/ha</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sugar Yield:</span>
                          <span className="font-medium">{formatNumber(validation.summary.yields.sugar.perHectare)} t/ha</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sugar Content:</span>
                          <span className="font-medium">{formatNumber(validation.summary.yields.sugar.percentage, 1)}%</span>
                        </div>
                        {validation.summary.yields.electricity.total > 0 && (
                          <div className="flex justify-between">
                            <span>Biomass Yield:</span>
                            <span className="font-medium">{formatNumber(validation.summary.yields.electricity.perHectare)} t/ha</span>
                          </div>
                        )}
                        {validation.summary.yields.intercrop && (
                          <div className="flex justify-between">
                            <span>Intercrop Yield:</span>
                            <span className="font-medium">{formatNumber(validation.summary.yields.intercrop.perHectare)} t/ha</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quality Metrics */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Quality Metrics</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Brix:</span>
                          <span className="font-medium">{formatNumber(validation.summary.quality.brix, 1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Purity:</span>
                          <span className="font-medium">{formatNumber(validation.summary.quality.purity, 1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sugar Content:</span>
                          <span className="font-medium">{formatNumber(validation.summary.quality.sugarContent, 1)}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Activity Completion */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Completion Status</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Activities Completed:</span>
                          <span className="font-medium">
                            {validation.summary.activities.completed}/{validation.summary.activities.total} 
                            ({formatNumber(validation.summary.activities.completionRate, 0)}%)
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Observations Completed:</span>
                          <span className="font-medium">
                            {validation.summary.observations.completed}/{validation.summary.observations.total} 
                            ({formatNumber(validation.summary.observations.completionRate, 0)}%)
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cycle Duration:</span>
                          <span className="font-medium">{validation.summary.duration} days</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={userConfirmation}
                    onChange={(e) => setUserConfirmation(e.target.checked)}
                    className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">
                    I have reviewed the cycle summary and confirm that all data is accurate. 
                    I understand that once closed, this cycle cannot be modified except by a super user.
                  </span>
                </label>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setShowSummary(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  Back
                </button>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDetailedReport(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                  >
                    View Detailed Report
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={!userConfirmation}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium transition-colors duration-200"
                  >
                    Confirm & Close Cycle
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Report Modal */}
      {showDetailedReport && validation.summary && (
        <CycleSummaryReport
          cycle={{
            id: validation.cycleId,
            type: validation.summary.cycleType,
            cycleNumber: validation.summary.cycleNumber,
            sugarcaneVarietyName: validation.summary.sugarcaneVariety,
            intercropVarietyName: validation.summary.intercropVariety
          } as any}
          summary={validation.summary}
          onClose={() => setShowDetailedReport(false)}
          onExport={() => {
            // TODO: Implement export functionality
            console.log('Export cycle summary')
          }}
        />
      )}
    </div>
  )
}
