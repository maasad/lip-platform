import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts'
import {useSystemState} from '../../hooks/useSystemState'
import {MetricCard} from './MetricCard'

// GCC region colors for the bar chart
const regionColors: Record<string, string> = {
    UAE: '#3b82f6',
    KSA: '#10b981',
    Qatar: '#f59e0b',
    Kuwait: '#8b5cf6',
    Bahrain: '#ec4899',
}

const formatVolume = (value: number): string => {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
    return `$${value}`
}

const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    })
}

export const StateDashboard = () => {
    const {state, isLoading, error} = useSystemState()

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full bg-gray-900 rounded-lg border border-gray-800">
                <p className="text-gray-500 text-sm">Loading state...</p>
            </div>
        )
    }

    if (error || !state) {
        return (
            <div className="flex items-center justify-center h-full bg-gray-900 rounded-lg border border-gray-800">
                <p className="text-red-400 text-sm">{error ?? 'No state available'}</p>
            </div>
        )
    }

    const failureRate =
        state.transactionCount > 0
            ? ((state.failedTransactionCount / state.transactionCount) * 100).toFixed(1)
            : '0.0'

    const regionalData = Object.entries(state.regionalVolume)
        .map(([region, volume]) => ({region, volume}))
        .sort((a, b) => b.volume - a.volume)

    return (
        <div className="flex flex-col h-full bg-gray-900 rounded-lg border border-gray-800">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                <h2 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">
                    System State
                </h2>
                <span className="text-xs text-gray-500 font-mono">
          updated {formatTime(state.lastUpdated)}
        </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Metric cards grid */}
                <div className="grid grid-cols-2 gap-3">
                    <MetricCard
                        label="Total Volume"
                        value={formatVolume(state.totalTransactionVolume)}
                        subValue={`${state.transactionCount} transactions`}
                        accent="blue"
                    />
                    <MetricCard
                        label="Failure Rate"
                        value={`${failureRate}%`}
                        subValue={`${state.failedTransactionCount} failed`}
                        accent={parseFloat(failureRate) > 10 ? 'red' : 'green'}
                    />
                    <MetricCard
                        label="Fraud Events"
                        value={String(state.fraudCount)}
                        subValue="detected total"
                        accent={state.fraudCount > 0 ? 'red' : 'green'}
                    />
                    <MetricCard
                        label="Anomalies"
                        value={String(state.anomalyCount)}
                        subValue={`${state.activeAnomalies.length} active`}
                        accent={state.anomalyCount > 5 ? 'orange' : 'default'}
                    />
                </div>

                {/* Total events counter */}
                <div className="bg-gray-800/40 rounded-lg px-4 py-3 border border-gray-800">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                        Total Events Processed
                    </p>
                    <p className="text-3xl font-bold font-mono text-gray-100">
                        {state.totalEvents.toLocaleString()}
                    </p>
                </div>

                {/* Regional volume chart */}
                <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-800">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">
                        Volume by Region
                    </p>
                    <ResponsiveContainer width="100%" height={160}>
                        <BarChart data={regionalData} margin={{top: 0, right: 0, left: 0, bottom: 0}}>
                            <XAxis
                                dataKey="region"
                                tick={{fill: '#6b7280', fontSize: 11}}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tickFormatter={(v: number) => formatVolume(v)}
                                tick={{fill: '#6b7280', fontSize: 10}}
                                axisLine={false}
                                tickLine={false}
                                width={45}
                            />
                            <Tooltip
                                formatter={(value: number) => [formatVolume(value), 'Volume']}
                                contentStyle={{
                                    backgroundColor: '#1f2937',
                                    border: '1px solid #374151',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                }}
                                labelStyle={{color: '#9ca3af'}}
                                itemStyle={{color: '#e5e7eb'}}
                            />
                            <Bar dataKey="volume" radius={[3, 3, 0, 0]}>
                                {regionalData.map((entry) => (
                                    <Cell
                                        key={entry.region}
                                        fill={regionColors[entry.region] ?? '#6b7280'}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Active anomalies list */}
                {state.activeAnomalies.length > 0 && (
                    <div className="bg-orange-900/10 rounded-lg p-4 border border-orange-900/30">
                        <p className="text-xs text-orange-400 uppercase tracking-wider mb-3">
                            Active Anomalies
                        </p>
                        <div className="space-y-2">
                            {state.activeAnomalies.slice(0, 3).map((anomaly) => (
                                <div key={anomaly.id} className="flex items-center justify-between">
                                    <span className="text-xs text-gray-300">{anomaly.type}</span>
                                    <span className="text-xs text-orange-400 font-mono">
                    {(anomaly.confidence * 100).toFixed(0)}% conf
                  </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recent fraud events */}
                {state.recentFraudEvents.length > 0 && (
                    <div className="bg-red-900/10 rounded-lg p-4 border border-red-900/30">
                        <p className="text-xs text-red-400 uppercase tracking-wider mb-3">
                            Recent Fraud
                        </p>
                        <div className="space-y-2">
                            {state.recentFraudEvents.slice(0, 3).map((fraud) => (
                                <div key={fraud.id} className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-mono">
                    {fraud.region}
                  </span>
                                    <span className="text-xs text-gray-300 font-mono">
                    ${fraud.amount.toLocaleString()}
                  </span>
                                    <span className="text-xs text-red-400 font-mono">
                    score {fraud.fraudScore}
                  </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
