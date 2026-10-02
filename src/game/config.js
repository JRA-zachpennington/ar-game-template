// App knobs. Flip feature flags here — no rebuild gymnastics required beyond redeploy.
export const config = Object.freeze({
  features: Object.freeze({
    // When true, skip GPS and treat the player as inside the grove (dev / remote testing).
    locationOverride: true,
  }),
});
