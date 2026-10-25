import { makeArtwork, LABELS } from './art.js';
import { keyframes, sampleMotion, transform, REST_TIME } from './animation.js';

// All strings originate in our own shape definitions; no external SVG or user HTML.
export function svgContents(kind, { animated = true, time = REST_TIME[kind] } = {}) {
  const styles=[];
  const render = node => {
    if (node.d) return `<path d="${node.d}" fill="${node.fill}"/>`;
    const pose=node.pose || {};
    const fixed=`translate(${pose.x || 0} ${pose.y || 0}) rotate(${pose.rotation || 0}) scale(${pose.sx ?? 1} ${pose.sy ?? 1})`;
    let inner=node.children.map(render).join('');
    if (node.motion) {
      const name=`ingredient-${kind}-${node.id}`;
      const rest=sampleMotion(node.motion,time);
      const still=`transform:${transform(rest)};opacity:${rest.opacity}`;
      if(animated) {
        styles.push(`@keyframes ${name}{${keyframes(node.motion).map(([at,p])=>`${at*100}%{transform:${transform(p)};opacity:${p.opacity}}`).join('')}}`);
        styles.push(`.${name}{animation:${name} ${node.motion.duration}s linear ${-(node.motion.delay || 0)}s infinite;transform-origin:0 0;transform-box:view-box}`);
        styles.push(`@media(prefers-reduced-motion:reduce){.${name}{animation:none!important;${still}}}`);
      }
      inner=`<g class="${name}"${animated?'':` style="${still}"`}>${inner}</g>`;
    }
    return `<g transform="${fixed}">${inner}</g>`;
  };
  const art=render(makeArtwork(kind));
  return `<style>${styles.join('\n')}</style>${art}`;
}
export function toSVG(kind, options) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" role="img" aria-label="${LABELS[kind]}">${svgContents(kind, options)}</svg>`;
}
