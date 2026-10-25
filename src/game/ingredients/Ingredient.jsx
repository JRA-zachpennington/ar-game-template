import { INGREDIENTS } from './art.js';
import { svgContents } from './svg.js';
const artwork = Object.fromEntries(INGREDIENTS.map(kind=>[kind,svgContents(kind)]));
const stills = Object.fromEntries(INGREDIENTS.map(kind=>[kind,svgContents(kind,{animated:false})]));

// SVG stays vector at every UI size. CSS handles motion and reduced-motion;
// this component does not add a React render or requestAnimationFrame loop.
export function Ingredient({ kind = 'cookies', className = '', animated = true }) {
  return <svg viewBox="0 0 320 320" className={className} aria-hidden="true"
    focusable="false" dangerouslySetInnerHTML={{ __html:(animated ? artwork : stills)[kind] || (animated ? artwork : stills).cookies }} />;
}
