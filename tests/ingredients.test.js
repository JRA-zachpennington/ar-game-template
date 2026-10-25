import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { INGREDIENTS, makeArtwork, ingredientForFind } from '../src/game/ingredients/art.js';
import { sampleMotion, REST_TIME } from '../src/game/ingredients/animation.js';
import { toSVG } from '../src/game/ingredients/svg.js';
const find=(node,id)=>node.id===id?node:node.children?.map(child=>find(child,id)).find(Boolean);

test('cookie pile grows from two to three to four',()=>{
  const root=makeArtwork('cookies');
  const count=time=>2+['cookie-three','cookie-four'].filter(id=>{
    const pose=sampleMotion(find(root,id).motion,time);return pose.opacity>.99&&Math.abs(pose.y)<.01;
  }).length;
  assert.equal(count(0),2);assert.equal(count(2),3);assert.equal(count(4),4);
});
test('spoon remains visible for its whole loop and resets continuously',()=>{
  const motion=find(makeArtwork('ice-cream'),'spoon').motion;
  for(let t=0;t<4;t+=.01) assert.equal(sampleMotion(motion,t).opacity,1);
  const first=sampleMotion(motion,0),last=sampleMotion(motion,4-1e-6);
  for(const key of Object.keys(first)) assert.ok(Math.abs(first[key]-last[key])<.001,key);
});
test('all loops have bounded poses, continuous seams, and useful reduced-motion frames',()=>{
  for(const kind of INGREDIENTS) {
    const visit=node=>{
      if(node.motion){
        const first=sampleMotion(node.motion,0),last=sampleMotion(node.motion,node.motion.duration-1e-6);
        for(const key of Object.keys(first)) assert.ok(Math.abs(first[key]-last[key])<.001,`${kind}/${node.id}/${key} seam`);
        for(let t=0;t<node.motion.duration;t+=.07){
          const p=sampleMotion(node.motion,t);
          assert.ok(Object.values(p).every(Number.isFinite));
          assert.ok(p.opacity>=0&&p.opacity<=1);
          assert.ok(p.sx>0&&p.sy>0);
        }
      }
      node.children?.forEach(visit);
    };
    visit(makeArtwork(kind));
    assert.ok(Number.isFinite(REST_TIME[kind]));
    for(const animated of [true,false]) assert.equal(readFileSync(`public/ingredients/${kind}${animated?'':'-still'}.svg`,'utf8'),toSVG(kind,{animated}));
  }
});
test('existing marker IDs retain compatibility and explicit fruit art is available',()=>{
  assert.deepEqual([1,2,3].map(id=>ingredientForFind({id})),['cookies','ice-cream','popcorn']);
  assert.equal(ingredientForFind({id:3,ingredient:'fruit'}),'fruit');
});
