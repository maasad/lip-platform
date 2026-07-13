import { useState, useEffect } from "react";
import { apiService } from "../services/api.service";
import type { SystemState } from "../types";

const POLL_INTERVAL = 5000; // poll every 5 seconds

export const useSystemState = () => {
  const [state, setState] = useState<SystemState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchState = async () => {
      try {
        const data = await apiService.getState();
        if (isMounted) {
          setState(data);
          setError(null);
        }
      } catch {
        if (isMounted) setError("Failed to fetch system state");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    // Fetch immediately on mount
    void fetchState();

    // Then poll every 5 seconds
      const interval = setInterval(() => { void fetchState() }, POLL_INTERVAL)

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return { state, isLoading, error };
};
