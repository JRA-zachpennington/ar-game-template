import * as THREE from 'three';
import { INGREDIENTS, LABELS } from './art.js';
import { toSVG } from './svg.js';
import { makeIngredientModel, disposeIngredientModel } from './three.js';
import './preview.css';

const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const descriptions=['Two, three, four. A satisfyingly wonky little pile.','Vanilla, chocolate, cherry. One spoon, always in view.','A little more pop. Just enough to spill over the rim.','Bananas, apples, grapes, strawberries & blueberries.'];
document.querySelector('#root').innerHTML=`
  <header><a href="/">ELF & SEEK <span>/ ART STUDIO</span></a><span class="edition">PICNIC COLLECTION · 01</span></header>
  <main><div class="intro"><p class="eyebrow">SMALL FINDS. BIG APPETITES.</p><h1>A little picnic magic.</h1><p>Four playful ingredients. Endless little loops.</p></div>
  <div class="toolbar"><div class="modes" role="group" aria-label="Renderer"><button data-mode="svg" aria-pressed="true">SVG vectors</button><button data-mode="three" aria-pressed="false">Three.js</button></div><button id="play">Pause</button><label>Zoom <input id="zoom" type="range" min="1" max="2.5" step=".1" value="1"></label></div>
  <section class="collection" aria-label="Animated ingredients">${INGREDIENTS.map((kind,i)=>`<article><div class="card-top"><span>0${i+1}</span><span>↻ LOOP</span></div><div class="stage" data-kind="${kind}"><div class="vector">${toSVG(kind)}</div><canvas aria-label="${LABELS[kind]}, Three.js vector rendering" hidden></canvas></div><h2>${LABELS[kind]}</h2><p>${descriptions[i]}</p><div class="downloads"><a href="/ingredients/${kind}.svg" download>Animated SVG ↗</a><a href="/ingredients/${kind}-still.svg" download>Still ↗</a></div></article>`).join('')}</section>
  <div class="timeline"><label for="time">Scrub the loops</label><input id="time" type="range" min="0" max="12" step=".01" value="0"><output id="clock">0.00 s</output></div>
  <footer>Transparent backgrounds · Resolution-independent paths · Reduced-motion support <span>Made for the moonlight picnic.</span></footer></main>`;
let playing=!reduced.matches,time=0,zoom=1,mode='svg';
const renderers=[];
for(const stage of document.querySelectorAll('.stage')) {
  const canvas=stage.querySelector('canvas');
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-1,1,1,-1,.1,10);
  camera.position.z=3;
  const model=makeIngredientModel(stage.dataset.kind); scene.add(model);
  const resize=()=> {const size=stage.clientWidth;renderer.setSize(size,size,false);};
  const observer=new ResizeObserver(resize);observer.observe(stage);resize();
  renderers.push({renderer,scene,camera,model,observer});
}
const animations=document.getAnimations();animations.forEach(animation=>animation.pause());
const play=document.querySelector('#play');
const syncButton=()=>{play.textContent=playing?'Pause':'Play';play.setAttribute('aria-label',playing?'Pause animations':'Play animations');};
syncButton();
play.onclick=()=>{playing=!playing;syncButton();};
document.querySelector('#time').oninput=event=>{time=Number(event.target.value);playing=false;syncButton();};
document.querySelector('#zoom').oninput=event=>{zoom=Number(event.target.value);document.querySelectorAll('.vector').forEach(el=>el.style.transform=`scale(${zoom})`);};
document.querySelectorAll('[data-mode]').forEach(button=>button.onclick=()=>{
  mode=button.dataset.mode;
  document.querySelectorAll('[data-mode]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));
  document.querySelectorAll('.vector').forEach(el=>el.hidden=mode!=='svg');
  document.querySelectorAll('canvas').forEach(el=>el.hidden=mode!=='three');
});
let last=performance.now(),frame;
function tick(now) {
  if(playing&&!document.hidden) time+=Math.min((now-last)/1000,.1);
  last=now;
  animations.forEach(animation=>{animation.currentTime=time*1000;});
  for(const {renderer,scene,camera,model} of renderers) {
    model.userData.animate(time,reduced.matches);
    model.scale.setScalar(zoom);
    if(mode==='three') renderer.render(scene,camera);
  }
  document.querySelector('#time').value=time%12;
  document.querySelector('#clock').value=`${(time%12).toFixed(2)} s`;
  frame=requestAnimationFrame(tick);
}
frame=requestAnimationFrame(tick);
addEventListener('pagehide',()=>{cancelAnimationFrame(frame);for(const item of renderers){item.observer.disconnect();disposeIngredientModel(item.model);item.renderer.dispose();}});
// A small read-only test hook for inspecting the exact rig used by the AR tracker.
window.ingredientPreview={models:renderers.map(item=>item.model)};
