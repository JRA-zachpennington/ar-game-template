const defaults = { x:0, y:0, rotation:0, sx:1, sy:1, opacity:1, z:0 };
export const REST_TIME = { cookies:4.2, 'ice-cream':2.8, popcorn:3.5, fruit:0 };
export function keyframes(motion) {
  let previous = { ...defaults };
  return motion.frames.map(([at, pose]) => {
    previous = { ...previous, ...pose };
    return [at, previous];
  });
}
export function sampleMotion(motion, time) {
  if (!motion) return { ...defaults };
  const t = (((time + (motion.delay || 0)) / motion.duration) % 1 + 1) % 1;
  const frames = motion.keyframes || keyframes(motion);
  const index = frames.findIndex(([at]) => at > t);
  if (index < 1) return { ...frames[index < 0 ? frames.length-1 : 0][1] };
  const [a,from] = frames[index-1], [b,to] = frames[index];
  const p = (t-a)/(b-a);
  return Object.fromEntries(Object.keys(defaults).map(key=>[key,from[key]+(to[key]-from[key])*p]));
}
export function transform(pose = {}) {
  const p = { ...defaults, ...pose };
  return `translate(${p.x}px,${p.y}px) rotate(${p.rotation}deg) scale(${p.sx},${p.sy})`;
}
