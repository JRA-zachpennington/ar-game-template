// Safari ignores user-scalable and still pinch-zooms. These are not passive,
// so preventDefault can cancel the gesture. touchmove stays allowed for one finger.
const blockPinch = (event) => {
  if (event.type === "touchmove" && event.touches.length < 2) return;
  event.preventDefault();
};
for (const type of ["gesturestart", "gesturechange", "gestureend", "touchmove"]) {
  document.addEventListener(type, blockPinch, { passive: false, capture: true });
}
