import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { makeArtwork } from './art.js';
import { keyframes, sampleMotion, REST_TIME } from './animation.js';

// Tessellated SVG paths, not textures: sharp at any render resolution. Each
// moving layer is built once. The existing tracker owns geometry/material disposal.
export function makeIngredientModel(kind = 'cookies') {
  const model = new THREE.Group();
  model.name = `ingredient:${kind}`;
  const canvas = new THREE.Group();
  canvas.scale.set(1/160, -1/160, 1);
  canvas.position.set(-1, 1, 0);
  model.add(canvas);
  const rig=[];
  const loader=new SVGLoader();
  let order=0;
  const build = (node,parent,owner) => {
    if(node.d) {
      const parsed=loader.parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${node.d}" fill="${node.fill}"/></svg>`);
      const material=new THREE.MeshBasicMaterial({color:node.fill,side:THREE.DoubleSide,transparent:true,depthWrite:false});
      owner.materials.push(material);
      for(const path of parsed.paths) for(const shape of SVGLoader.createShapes(path)) {
        const mesh=new THREE.Mesh(new THREE.ShapeGeometry(shape,48),material);
        mesh.renderOrder=order++;
        parent.add(mesh);
      }
      return;
    }
    const fixed=new THREE.Group(), moving=new THREE.Group();
    fixed.name=node.id;
    const p=node.pose || {};
    fixed.position.set(p.x || 0,p.y || 0,0);
    fixed.rotation.z=THREE.MathUtils.degToRad(p.rotation || 0);
    fixed.scale.set(p.sx ?? 1,p.sy ?? 1,1);
    parent.add(fixed); fixed.add(moving);
    const entry={object:moving,motion:node.motion ? {...node.motion,keyframes:keyframes(node.motion)} : null,materials:[],parent:owner,opacity:1};
    rig.push(entry);
    node.children.forEach(child=>build(child,moving,entry));
  };
  build(makeArtwork(kind),canvas,{opacity:1});
  model.userData.ingredient=kind;
  model.userData.animate=(seconds,reduced=false)=> {
    const time=reduced ? REST_TIME[kind] : seconds;
    for(const entry of rig) {
      const p=sampleMotion(entry.motion,time);
      entry.object.position.set(p.x,p.y,0);
      entry.object.rotation.z=THREE.MathUtils.degToRad(p.rotation);
      entry.object.scale.set(p.sx,p.sy,1);
      entry.opacity=p.opacity*entry.parent.opacity;
      entry.object.visible=entry.opacity>.001;
      entry.materials.forEach(material=>{material.opacity=entry.opacity;});
    }
  };
  model.userData.animate(0,true);
  return model;
}
export function disposeIngredientModel(model) {
  const geometries=new Set(),materials=new Set();
  model.traverse(object=>{ if(object.geometry) geometries.add(object.geometry); if(object.material) materials.add(object.material); });
  geometries.forEach(item=>item.dispose()); materials.forEach(item=>item.dispose());
}
