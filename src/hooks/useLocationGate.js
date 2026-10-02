import { useCallback, useEffect, useRef, useState } from "react";
import { config } from "../game/config.js";
import { assessLocation } from "../game/geofence.js";

export function useLocationGate(active) {
  const latest = useRef(null);
  const [gate, setGate] = useState({ status: "idle", allowed: false });
  const [attempt, setAttempt] = useState(0);
  const [requested, setRequested] = useState(false);
  const override = config.features.locationOverride;
  const request = useCallback(() => {
    setRequested(true);
    setAttempt((value) => value + 1);
  }, []);
  const isAllowed = useCallback(() => {
    if (!active) return false;
    if (override) return requested;
    return assessLocation(latest.current).allowed;
  }, [active, override, requested]);

  useEffect(() => {
    latest.current = null;
    if (!active || !requested) {
      setGate({ status: "idle", allowed: false });
      return;
    }
    if (override) {
      setGate({ status: "override", allowed: true });
      return;
    }
    if (!window.isSecureContext) {
      setGate({ status: "insecure", allowed: false });
      return;
    }
    if (!navigator.geolocation) {
      setGate({ status: "unsupported", allowed: false });
      return;
    }
    let cancelled = false;
    let pending = false;
    setGate({ status: "checking", allowed: false });
    const success = (position) => {
      if (cancelled) return;
      latest.current = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
      };
      setGate(assessLocation(latest.current));
    };
    const failure = (error) => {
      if (cancelled) return;
      // Errors invalidate the previous authorization immediately.
      latest.current = null;
      setGate({
        status:
          { 1: "denied", 2: "unavailable", 3: "timeout" }[error.code] ||
          "unavailable",
        allowed: false,
      });
    };
    const options = { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 };
    let watch;
    try {
      watch = navigator.geolocation.watchPosition(success, failure, options);
    } catch {
      failure({ code: 2 });
    }
    const freshness = setInterval(() => {
      if (latest.current) setGate(assessLocation(latest.current));
    }, 1000);
    // Some browsers emit watchPosition only after movement. Refresh stationary fixes too.
    const refresh = setInterval(() => {
      if (pending) return;
      pending = true;
      try {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            pending = false;
            success(position);
          },
          (error) => {
            pending = false;
            failure(error);
          },
          options,
        );
      } catch {
        pending = false;
        failure({ code: 2 });
      }
    }, 15000);
    return () => {
      cancelled = true;
      latest.current = null;
      if (watch !== undefined) navigator.geolocation.clearWatch(watch);
      clearInterval(freshness);
      clearInterval(refresh);
    };
  }, [active, requested, attempt, override]);
  return { ...gate, request, isAllowed, override };
}
