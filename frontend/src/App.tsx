import { EventFeed } from './components/events/EventFeed'
import { StateDashboard } from './components/layout/StateDashboard'
import { QueryPanel } from './components/layout/QueryPanel'

function App() {
  return (
      <div style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#030712', color: '#f3f4f6' }}>
        {/* Header */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', background: '#111827', borderBottom: '1px solid #1f2937', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: 28, height: 28, background: '#2563eb', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>L</span>
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#e5e7eb', letterSpacing: '0.05em' }}>LIP Platform</span>
            <span style={{ fontSize: 12, color: '#4b5563', fontFamily: 'monospace' }}>LiveOps Intelligence</span>
          </div>
          <span style={{ fontSize: 12, color: '#6b7280', fontFamily: 'monospace' }}>
          {new Date().toUTCString().slice(0, 25)}
        </span>
        </header>

        {/* Three panel layout */}
        <main style={{ flex: 1, minHeight: 0, padding: 16, display: 'grid', gap: 16, gridTemplateColumns: '1fr 320px 320px', gridTemplateRows: '1fr', overflow: 'hidden' }}>
          <EventFeed />
          <StateDashboard />
          <QueryPanel />
        </main>
      </div>
  )
}

export default App
