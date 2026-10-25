// Original vector artwork. One shape/timeline source for SVG and Three.js.
// Coordinates use a transparent 320 × 320 artboard, with generous motion padding.
export const INGREDIENTS = ['cookies', 'ice-cream', 'popcorn', 'fruit'];
export const LABELS = { cookies: 'Cookie stack', 'ice-cream': 'Ice cream sundae', popcorn: 'Popcorn', fruit: 'Fruit bowl' };
export const DURATION = { cookies: 5.6, 'ice-cream': 4, popcorn: 4.8, fruit: 12 };
const path = (d, fill) => ({ d, fill });
const ellipse = (x, y, rx, ry, fill) => path(`M${x-rx},${y}a${rx},${ry} 0 1,0 ${2*rx},0a${rx},${ry} 0 1,0 ${-2*rx},0`, fill);
const group = (id, children, pose = {}, motion) => ({ id, children, pose, motion });
const face = (x, y, s = 1) => group('', [
  ellipse(-12, 0, 3.5, 5.5, '#3e2944'), ellipse(12, 0, 3.5, 5.5, '#3e2944'),
  ellipse(-13, -2, 1.2, 1.5, '#fff'), ellipse(11, -2, 1.2, 1.5, '#fff'),
  path('M-6 8Q0 12 6 8Q4 18 0 17Q-4 18-6 8', '#3e2944'),
  ellipse(-22, 9, 6, 3, '#f48e8c'), ellipse(22, 9, 6, 3, '#f48e8c'),
], { x, y, sx:s, sy:s });
const star = (x, y, size, delay) => group('', [path('M0-13Q3-3 12 0Q3 3 0 13Q-3 3-12 0Q-3-3 0-13', '#ffc942')],
  { x, y, sx:size, sy:size }, { duration: 2.4, delay, frames: [[0,{sx:0.35,sy:0.35,opacity:0.35}], [.5,{sx:1,sy:1,opacity:1,rotation:18}], [1,{sx:0.35,sy:0.35,opacity:0.35}]] });
const shadow = ellipse(160, 271, 83, 10, '#e5e1d8');

function cookie() {
  return [
    path('M-64 0C-65-19-36-31 0-31S65-18 64 0L64 9C62 28 30 37-3 35C-37 34-64 23-64 9Z', '#b77332'),
    ellipse(0, 0, 64, 28, '#e9ad56'),
    path('M-58-5C-48-22-12-27 15-22C-22-23-43-11-49-1Q-54 4-58-5', '#ffdb87'),
    path('M-40-8l8-4 7 5-3 7-10-1zM7-17l10 1 2 7-8 3-7-5zM31 0l12-4 6 7-9 7-9-4zM-10 8l10-3 7 6-6 8-11-3zM-42 11l7-2 6 5-5 5-8-2z', '#67402e'),
    ellipse(-12, -13, 3, 2, '#cf8d42'), ellipse(20, 10, 3, 2, '#cf8d42'), ellipse(-24, 3, 2.5, 2, '#cf8d42'),
  ];
}
function cookies() {
  const fall = (start, rotation) => ({ duration:5.6, frames:[
    [0,{y:-130,opacity:0,rotation:rotation-16}], [start,{y:-130,opacity:0,rotation:rotation-16}],
    [start+.015,{y:-125,opacity:1,rotation:rotation-16}], [start+.12,{y:0,rotation,sx:1.08,sy:.9}],
    [start+.16,{y:-8,rotation:rotation+3,sx:.97,sy:1.04}], [start+.21,{y:0,rotation,sx:1,sy:1}],
    [.82,{y:0,rotation,opacity:1}], [.96,{y:-12,rotation,opacity:0}], [1,{y:-130,opacity:0,rotation:rotation-16}],
  ] });
  return [shadow,
    group('cookie-one', cookie(), {x:155,y:231,rotation:-5}),
    group('cookie-two', cookie(), {x:165,y:204,rotation:7}),
    group('cookie-three', cookie(), {x:149,y:177}, fall(.10,-8)),
    group('cookie-four', cookie(), {x:168,y:150}, fall(.42,9)),
    star(64,147,.6,.2), star(254,195,.8,1),
  ];
}
function iceCream() {
  const scoop = (x,y,r) => group('', [ellipse(0,3,r,r*.82,'#e8cfa0'),ellipse(-3,-4,r-2,r*.76,'#fff1cf'),
    path(`M${-r*.64} -8Q${-r*.45} ${-r*.55} ${-r*.1} ${-r*.53}Q${r*.03} ${-r*.36} ${-r*.2} ${-r*.32}Q${-r*.42} ${-r*.24} ${-r*.42} -7Q${-r*.6} 2 ${-r*.64} -8`, '#fff9e9')],{x,y});
  return [shadow,
    // Pedestal, glass body, three generous vanilla scoops.
    ellipse(160,256,43,10,'#569dc2'), ellipse(160,251,43,9,'#9bdce4'),
    path('M149 216H171V249Q160 256 149 249Z','#82cbd9'),
    path('M86 166H234Q227 228 160 235Q93 228 86 166','#56aaca'),
    path('M94 169H224Q214 218 158 224Q109 217 94 169','#8bd9e2'),
    path('M107 181Q111 201 129 208Q137 210 136 202Q121 192 119 181Z','#c4f5ef'),
    scoop(121,155,43), scoop(195,155,43), scoop(159,113,47),
    path('M114 102Q122 75 159 74Q196 74 204 103Q195 112 187 103L186 126Q180 137 174 127L173 107Q164 102 159 108L157 118Q149 126 143 116L142 103Q126 111 114 102','#674032'),
    path('M129 89Q145 78 167 81Q178 84 166 87Q145 84 132 95Z','#98604a'),
    ellipse(161,67,16,15,'#de435c'),ellipse(157,63,12,11,'#ff6073'),ellipse(152,59,4,3,'#ffadb8'),
    path('M160 56Q157 36 177 32L179 36Q164 39 165 56Z','#4d823f'),
    path('M169 41Q174 26 190 33Q185 46 169 41','#80c752'),
    face(160,193,.85),
    group('spoon', [
      path('M-5-4L-3-89Q0-98 6-91L8-4Z','#79a2bf'),
      path('M0-8L1-88Q3-91 4-87L5-8Z','#e3f4fa'),
      ellipse(0,6,17,24,'#6b93ad'),ellipse(-2,3,14,21,'#bcdde9'),ellipse(-4,0,9,15,'#edf9fc'),
      group('spoon-vanilla',[ellipse(0,5,12,10,'#fff0cd'),ellipse(-3,2,7,5,'#fff9e8')],{},
        {duration:4,frames:[[0,{sx:.05,sy:.05,opacity:0}],[.36,{sx:.05,sy:.05,opacity:0}],[.49,{sx:1,sy:1,opacity:1}],[.74,{sx:1,sy:1,opacity:1}],[.9,{sx:.05,sy:.05,opacity:0}],[1,{sx:.05,sy:.05,opacity:0}]]}),
    ],{x:219,y:111}, {duration:4,frames:[[0,{x:24,y:-18,rotation:27}],[.18,{x:7,y:7,rotation:15}],[.36,{x:-13,y:37,rotation:-10}],[.5,{x:2,y:14,rotation:7}],[.7,{x:29,y:-24,rotation:32}],[1,{x:24,y:-18,rotation:27}]]}),
    star(65,122,.65,.3),star(253,230,.6,1.1),
  ];
}
function kernel(x,y,s=1,rotation=0) {
  return group('', [path('M-9 9C-24 12-24-6-14-9C-18-23 1-25 6-15C18-22 28-7 18 2C29 13 14 24 5 17C-3 26-17 21-9 9','#e5b956'),
    path('M-10 6C-22 6-20-7-11-9C-13-20 1-22 5-12C17-18 24-6 15 1C24 10 12 18 5 13C-3 22-13 16-10 6','#fff0b5'),
    ellipse(-6,-8,6,5,'#fffbe2'),path('M-3 2Q4-5 8 2L5 8-1 8Z','#f3ce70')], {x,y,sx:s,sy:s,rotation});
}
function popcorn() {
  const base = [[101,153,.9,-10],[124,130,.92,20],[152,144,1,0],[180,129,1,-12],[212,148,.9,15],[129,162,1,-10],[184,161,1,10]];
  const extras = [[107,129,.8,-16],[145,112,.9,8],[193,108,.85,-12],[166,91,.85,16],[221,128,.68,25]];
  return [shadow,...base.map(args=>kernel(...args)), ...extras.map((args,i)=>group(`pop-${i}`,[kernel(0,0,args[2],args[3])],{x:args[0],y:args[1]},
    {duration:4.8,frames:[[0,{y:36,sx:.6,sy:.6,opacity:0}], [.12+i*.07,{y:36,opacity:0}], [.18+i*.07,{y:-10,sx:1,sy:1,opacity:1}], [.25+i*.07,{y:0}], [.8,{y:0,opacity:1}], [1,{y:36,sx:.6,sy:.6,opacity:0}]]})),
    path('M91 160Q160 171 229 160L212 251Q160 272 108 251Z','#e54e5c'),
    path('M97 165Q160 176 223 165L207 246Q160 262 113 246Z','#fff6df'),
    path('M97 165L116 168L128 251L113 246ZM137 171H155V257L139 255ZM174 171L191 170L181 255L164 257ZM210 167L223 165L207 246L193 251Z','#ff6973'),
    path('M91 158Q160 170 229 158L228 171Q160 184 93 171Z','#f34555'),
    path('M98 159Q160 168 221 159L220 163Q160 174 99 164Z','#ff9a9d'),
    ellipse(160,215,33,28,'#ffc949'),ellipse(160,211,30,26,'#ffdf70'),face(160,207,.78),
    star(61,184,.62,.1),star(254,107,.7,1.4),
  ];
}
function apple() { return [
  path('M-3-20C-33-35-44-4-29 18Q-16 34-3 26Q12 34 27 17C45-10 25-35-3-20','#d83a52'),
  path('M-4-18C-31-30-38-4-25 13Q-17 26-5 20Q8 27 22 12C34-12 18-28-4-18','#ff5d70'),
  ellipse(-20,-7,5,10,'#ffa1a8'),path('M-4-19L-6-36Q-2-41 2-36L1-19Z','#815539'),
  path('M0-29Q12-49 28-35Q20-19 0-29','#78be4a'),face(-1,2,.55),
]; }
function bananas() { return [
  path('M-29-47Q-27 0 34 3L41-7Q31 41-7 32Q-42 25-39-39Z','#d9a136'),
  path('M-28-46Q-28-1 33 3Q9 26-14 16Q-35 6-34-42Z','#ffdc54'),
  path('M-14-48Q-10-10 42-12L48-22Q43 18 12 20Q-20 20-24-40Z','#f7be37'),
  path('M-14-48Q-8-7 42-12Q22 10 5 7Q-13 1-19-43Z','#ffe97b'),
  path('M-39-39L-40-50-28-53-26-43ZM-24-40L-24-51-13-55-11-45Z','#86603a'),
  path('M34 3L41-7 45-4 40 6ZM42-12L48-22 52-19 47-10Z','#86603a'),
]; }
function grapes() { return [path('M-3-22Q-3-37 10-40L13-35Q2-33 2-19Z','#699540'),
  ...[[0,25],[-11,11],[11,11],[-21,-5],[0,-7],[20,-4],[-10,-23],[10,-24]].flatMap(([x,y])=>[
    ellipse(x,y,12,13,'#8252bc'),ellipse(x-2,y-3,10,10,'#ac7be0'),ellipse(x-5,y-6,3,3,'#d6b6fa')])]; }
function strawberry() { return [
  path('M-24-14Q-21-30 0-23Q23-30 25-11Q25 11 0 33Q-25 13-24-14','#e8445f'),
  path('M-19-13Q-16-23 0-18Q18-23 19-9Q14 11-1 24Q-21 6-19-13','#ff6a7f'),
  path('M0-20L-23-31-12-17-27-13-6-10 0-1 7-13 25-12 13-20 21-31Z','#6dbb4b'),
  ...[[-10,-3],[5,-5],[-5,10],[10,7],[0,20]].map(([x,y])=>ellipse(x,y,1.8,3,'#ffdfa3')),
]; }
function blueberries() { return [[-13,4],[9,8],[0,-12]].flatMap(([x,y])=>[
  ellipse(x,y,13,13,'#426fba'),ellipse(x-2,y-3,10,10,'#6798de'),
  path(`M${x} ${y-7}l2 3 4 1-3 2v4l-3-2-4 1 1-4-2-3 4 1Z`,'#355c9c'),
]); }
function fruit() {
  const items=[bananas(),apple(),grapes(),strawberry(),blueberries()];
  const bowl = [
    ellipse(160,196,91,31,'#438e8b'),ellipse(160,191,83,26,'#b8e9bf'),
    group('fruit-turn',items.map((children,i)=>{
      const offset = i / items.length;
      const poses = Array.from({length:49},(_,n)=> {
        const t=n/48, a=(t+offset)*Math.PI*2;
        const depth=Math.cos(a), scale=.83+depth*.15;
        return [t,{x:Math.sin(a)*59,y:depth*14,rotation:Math.sin(a)*5,sx:scale,sy:scale,z:depth}];
      });
      return group(`fruit-${i}`,children,{x:160,y:i===0?140:158},{duration:12,frames:poses});
    })),
    path('M68 192Q75 255 160 264Q245 255 252 192Q160 226 68 192','#399b9e'),
    path('M76 201Q91 249 160 254Q224 247 243 201Q160 227 76 201','#70cbb9'),
    path('M87 211Q94 230 112 237Q120 237 117 230L103 214Z','#b9edce'),
    path('M66 187Q160 222 254 187L253 198Q160 234 67 198Z','#9ae0c9'),
    face(160,230,.75),
  ];
  return [shadow, group('bowl-turn', [group('', bowl, {x:-160,y:-225})], {x:160,y:225},
    {duration:12,frames:[[0,{rotation:-3,sx:.98}],[.25,{rotation:0,sx:1}],[.5,{rotation:3,sx:.98}],[.75,{rotation:0,sx:1}],[1,{rotation:-3,sx:.98}]]}),
    star(59,126,.75,.2),star(255,144,.85,1),star(220,80,.55,1.8)];
}
export function makeArtwork(kind) {
  const builders = { cookies, 'ice-cream':iceCream, popcorn, fruit };
  if (!builders[kind]) throw new Error(`Unknown ingredient: ${kind}`);
  let nextId=0;
  const root=group(kind,builders[kind]());
  const identify = node => { if(node.children) { if(!node.id) node.id=`part-${nextId++}`; node.children.forEach(identify); } };
  identify(root);
  return root;
}
export function ingredientForFind(find) {
  return find.ingredient || INGREDIENTS[(find.id-1)%3] || 'cookies';
}
