import { EventFeed } from './components/events/EventFeed'
import { StateDashboard } from './components/layout/StateDashboard'
import { QueryPanel } from './components/layout/QueryPanel'

function App() {
    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
            {/* Top navigation bar */}
            <header className="flex items-center justify-between px-6 py-3 bg-gray-900 border-b border-gray-800 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">L</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-200 tracking-wide">
            LIP Platform
          </span>
                    <span className="text-xs text-gray-600 font-mono">
            LiveOps Intelligence
          </span>
                </div>
                <div className="flex items-center gap-4">
          <span className="text-xs text-gray-500 font-mono">
            {new Date().toUTCString().slice(0, 25)}
          </span>
                </div>
            </header>

            {/* Three panel layout */}
            <main className="flex-1 p-4 overflow-hidden">
                <div
                    className="grid gap-4 h-[calc(100vh-72px)]"
                    style={{ gridTemplateColumns: '1fr 320px 320px' }}
                >
                    {/* Left: Live event feed */}
                    <EventFeed />

                    {/* Middle: System state dashboard */}
                    <StateDashboard />

                    {/* Right: Claude query interface */}
                    <QueryPanel />
                </div>
            </main>
        </div>
    )
}

export default App
