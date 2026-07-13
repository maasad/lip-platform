import { useState, useEffect, useCallback } from "react";
import { getSocket } from "../services/socket.service";
import type { LiveEvent } from "../types";

const MAX_EVENTS = 50; // keep last 50 events in UI

export const useEvents = () => {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [eventCount, setEventCount] = useState(0);

  const addEvent = useCallback((event: LiveEvent) => {
    setEvents((prev) => {
      // Add new event to the front, cap at MAX_EVENTS
      const updated = [event, ...prev];
      return updated.slice(0, MAX_EVENTS);
    });
    setEventCount((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const socket = getSocket();

    // Connection lifecycle handlers
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    // Receives the last 20 events when we first connect
    const onRecentEvents = (recentEvents: LiveEvent[]) => {
      setEvents(recentEvents.reverse()); // reverse so newest is first
    };

    // Receives each new event as it arrives
    const onNewEvent = (event: LiveEvent) => {
      addEvent(event);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("recent_events", onRecentEvents);
    socket.on("new_event", onNewEvent);

    // Set initial connection state
    if (socket.connected) setIsConnected(true);

    // Cleanup: remove listeners when component unmounts
    // This prevents duplicate listeners if the hook remounts
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("recent_events", onRecentEvents);
      socket.off("new_event", onNewEvent);
    };
  }, [addEvent]);

  return { events, isConnected, eventCount };
};
