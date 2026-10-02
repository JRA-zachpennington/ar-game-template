import { useEffect, useRef } from "react";

export default function CameraView({ onMarkers, onStatus }) {
  const videoRef = useRef(null),
    canvasRef = useRef(null);
  const callbacks = useRef({ onMarkers, onStatus });
  callbacks.current = { onMarkers, onStatus };
  useEffect(() => {
    const abort = new AbortController();
    let stream;
    const video = videoRef.current;
    const stop = () => {
      stream?.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
    };
    const open = async () => {
      try {
        callbacks.current.onStatus({
          status: "loading",
          message: "Opening your camera…",
        });
        if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia)
          throw new Error(
            "Open the HTTPS game link in Safari or Chrome to use your camera.",
          );
        // The browser permission prompt follows the player’s explicit start action.
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 960 },
          },
        });
        if (abort.signal.aborted) {
          stop();
          return;
        }
        video.srcObject = stream;
        await video.play();
        stream.getVideoTracks()[0]?.addEventListener("ended", () => {
          if (!abort.signal.aborted) {
            callbacks.current.onStatus({
              status: "error",
              message: "Your camera stopped. Tap Try camera again to continue.",
            });
            abort.abort();
            stop();
          }
        });
        callbacks.current.onStatus({
          status: "loading",
          message: "Waking up the woodland magic…",
        });
        const { createTracker } = await import("../game/tracker.js");
        if (abort.signal.aborted) return;
        await createTracker(
          video,
          canvasRef.current,
          (...args) => callbacks.current.onMarkers(...args),
          abort.signal,
        );
        if (!abort.signal.aborted)
          callbacks.current.onStatus({
            status: "ready",
            message: "Look for a trail marker",
          });
      } catch (error) {
        if (abort.signal.aborted) return;
        stop();
        const message =
          error.name === "NotAllowedError"
            ? "Camera access is off. Allow this site to use your camera in browser settings, then try again."
            : error.name === "NotFoundError"
              ? "No camera was found. Open the game on a phone with a camera."
              : error.name === "NotReadableError"
                ? "Your camera is busy. Close other camera apps, then try again."
                : error.message ||
                  "The camera could not start. Please try again.";
        callbacks.current.onStatus({ status: "error", message });
      }
    };
    void open();
    return () => {
      abort.abort();
      stop();
    };
  }, []);
  return (
    <div className="camera-stage">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        aria-label="Live camera view"
      />
      <canvas ref={canvasRef} aria-label="Augmented woodland characters" />
    </div>
  );
}
