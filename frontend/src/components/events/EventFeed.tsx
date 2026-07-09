import { useEvents } from '../../hooks/useEvents'
import { EventRow } from './EventRow'

export const EventFeed = () => {
    const { events, isConnected, eventCount } = useEvents()

    return (
        <div className="flex flex-col h-full bg-gray-900 rounded-lg border border-gray-800">
            {/* Panel header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">
                        Live Events
                    </h2>
                    {/* Live/offline indicator */}
                    <div className="flex items-center gap-1.5">
            <span
                className={`w-2 h-2 rounded-full ${
                    isConnected
                        ? 'bg-green-400 animate-pulse'
                        : 'bg-red-500'
                }`}
            />
                        <span className={`text-xs ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              {isConnected ? 'LIVE' : 'OFFLINE'}
            </span>
                    </div>
                </div>

                {/* Event counter */}
                <span className="text-xs text-gray-500 font-mono">
          {eventCount} received
        </span>
            </div>

            {/* Column headers */}
            <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-800/50 bg-gray-800/20">
                <span className="text-xs text-gray-600 uppercase tracking-wider w-20 shrink-0">Time</span>
                <span className="text-xs text-gray-600 uppercase tracking-wider w-10 shrink-0">Src</span>
                <span className="text-xs text-gray-600 uppercase tracking-wider flex-1">Event</span>
                <span className="text-xs text-gray-600 uppercase tracking-wider shrink-0">Amount</span>
                <span className="text-xs text-gray-600 uppercase tracking-wider shrink-0 mr-8">Region</span>
            </div>

            {/* Event list */}
            <div className="flex-1 overflow-y-auto">
                {events.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-600 text-sm">
                        Waiting for events...
                    </div>
                ) : (
                    events.map((event) => (
                        <EventRow key={event.id} event={event} />
                    ))
                )}
            </div>
        </div>
    )
}
