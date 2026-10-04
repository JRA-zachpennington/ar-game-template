import * as THREE from "three";
import {
  ArToolkitContext,
  ArMarkerControls,
} from "@ar-js-org/ar.js/three.js/build/ar-threex.mjs";
import { asset, FINDS } from "./quest.js";
import { makeFindModel } from "./themes/elf/models.js";

// ponytail: accumulate/drain over ~200ms. One missed AR.js frame must not
// zero the lock (outdoor barcodes flicker); a one-frame blip must not show.
// Lengthen if pop-in/out is still noisy.
const MARKER_HOLD_MS = 200;

export function holdMarker(state, raw, now, holdMs = MARKER_HOLD_MS) {
  if (state.lastAt == null) {
    state.lastAt = now;
    state.score = 0;
  }
  const dt = Math.max(0, now - state.lastAt);
  state.lastAt = now;
  state.score = Math.min(
    holdMs,
    Math.max(0, (state.score || 0) + (raw ? dt : -dt)),
  );
  // On at full charge, off only when fully drained — not at every dip.
  if (!state.shown && state.score >= holdMs) state.shown = true;
  else if (state.shown && state.score <= 0) state.shown = false;
  return state.shown;
}

// AR.js repeats a pose at most maxDetectionRate times a second and leaves
// object.visible unchanged on the renders in between. Those renders are not
// new "miss" samples. Counting them drains a solid card before it can lock.
export function holdIfUpdated(state, detected, updated, now, holdMs) {
  if (!updated) return state.shown;
  return holdMarker(state, detected, now, holdMs);
}

export async function createTracker(video, canvas, onMarkers, signal) {
  const scene = new THREE.Scene();
  const camera = new THREE.Camera();
  scene.add(camera);
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);
  scene.add(new THREE.HemisphereLight(0xfff4d1, 0x41644e, 2.3));
  const light = new THREE.DirectionalLight(0xffedd2, 2.5);
  light.position.set(1, 3, 2);
  scene.add(light);
  const width = 640;
  const height = Math.round(width * (video.videoHeight / video.videoWidth));
  const context = new ArToolkitContext({
    detectionMode: "mono_and_matrix",
    matrixCodeType: "3x3",
    cameraParametersUrl: asset("ar/camera_para.dat"),
    canvasWidth: width,
    canvasHeight: height,
    maxDetectionRate: 30,
  });
  let disposed = false;
  let frame;
  const controls = [];
  const models = [];
  const roots = [];
  const resize = () => {
    const bounds = canvas.parentElement?.getBoundingClientRect();
    if (!bounds) return;
    const scale = Math.max(
      bounds.width / video.videoWidth,
      bounds.height / video.videoHeight,
    );
    const cssWidth = Math.ceil(video.videoWidth * scale);
    const cssHeight = Math.ceil(video.videoHeight * scale);
    renderer.setSize(width, height, false);
    for (const element of [video, canvas])
      Object.assign(element.style, {
        width: `${cssWidth}px`,
        height: `${cssHeight}px`,
        left: `${(bounds.width - cssWidth) / 2}px`,
        top: `${(bounds.height - cssHeight) / 2}px`,
      });
  };
  const observer = new ResizeObserver(resize);
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    observer.disconnect();
    controls.forEach((control) => control.dispose?.());
    context.dispose();
    const geometries = new Set(),
      materials = new Set();
    scene.traverse((object) => {
      if (object.geometry) geometries.add(object.geometry);
      if (object.material) materials.add(object.material);
    });
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
    renderer.dispose();
    renderer.forceContextLoss();
    signal.removeEventListener("abort", dispose);
  };
  signal.addEventListener("abort", dispose, { once: true });
  try {
    await new Promise((resolve, reject) => {
      const aborted = () => {
        clearTimeout(timeout);
        reject(new DOMException("Cancelled", "AbortError"));
      };
      const timeout = setTimeout(() => {
        signal.removeEventListener("abort", aborted);
        reject(
          new Error(
            "Tracking could not load. Check your connection and try again.",
          ),
        );
      }, 20000);
      signal.addEventListener("abort", aborted, { once: true });
      context.init(() => {
        clearTimeout(timeout);
        signal.removeEventListener("abort", aborted);
        if (disposed) {
          context.dispose();
          reject(new DOMException("Cancelled", "AbortError"));
          return;
        }
        resolve();
      });
    });
    if (signal.aborted) throw new DOMException("Cancelled", "AbortError");
    camera.projectionMatrix.copy(context.getProjectionMatrix());
    FINDS.forEach((find) => {
      const root = new THREE.Group();
      root.visible = false;
      scene.add(root);
      controls.push(
        new ArMarkerControls(context, root, {
          type: "barcode",
          barcodeValue: find.id,
          size: 1,
          changeMatrixMode: "modelViewMatrix",
          smooth: false,
        }),
      );
      // Keep the pop-up portrait facing the player on floor, wall, or handheld
      // cards. Its size is less than one marker width, so it stays in frame.
      const portrait = new THREE.Group();
      portrait.scale.setScalar(0.3);
      root.add(portrait);
      const model = makeFindModel(find);
      portrait.add(model);
      models.push(model);
      roots.push({
        id: find.id,
        root,
        portrait,
        hold: { lastAt: null, score: 0, shown: false },
      });
    });
    observer.observe(canvas.parentElement);
    resize();
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const animate = (time) => {
      if (disposed) return;
      const updated = context.update(video);
      roots.forEach(({ root, portrait, hold }) => {
        root.visible = holdIfUpdated(hold, root.visible, updated, time);
        portrait.quaternion.copy(root.quaternion).invert();
      });
      models.forEach((model) => model.userData.animate(time / 1000, reduced));
      onMarkers(
        roots.filter((item) => item.root.visible).map((item) => item.id),
        time,
      );
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return dispose;
  } catch (error) {
    dispose();
    throw error;
  }
}
