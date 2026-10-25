import { writeFileSync, mkdirSync } from 'node:fs';
import { INGREDIENTS } from '../src/game/ingredients/art.js';
import { toSVG } from '../src/game/ingredients/svg.js';
mkdirSync('public/ingredients', { recursive:true });
for(const kind of INGREDIENTS) {
  writeFileSync(`public/ingredients/${kind}.svg`,toSVG(kind));
  writeFileSync(`public/ingredients/${kind}-still.svg`,toSVG(kind,{animated:false}));
}
console.log('Exported four animated SVGs and four vector stills.');
