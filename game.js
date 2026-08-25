
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js';

const canvas = document.querySelector('#game');
const renderer = new THREE.WebGLRenderer({canvas, antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled = true;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8aa8b8);
scene.fog = new THREE.FogExp2(0x8aa8b8, 0.0018);

const camera = new THREE.PerspectiveCamera(68, innerWidth/innerHeight, 0.1, 3000);

const hemi = new THREE.HemisphereLight(0xddeeff,0x36542e,2.0);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffffff,2.6);
sun.position.set(200,300,100);
sun.castShadow = true;
scene.add(sun);

// ---- Terrain
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(3000,3000,1,1),
  new THREE.MeshStandardMaterial({color:0x315c31,roughness:1})
);
ground.rotation.x=-Math.PI/2;
ground.position.y=-2.2;
ground.receiveShadow=true;
scene.add(ground);

// Simplified Nordschleife-style path.
// Shape is intentionally approximate in v1.0; the physical scale/elevation model is a gameplay prototype.
const P = [
[-90,0,-180],[-15,3,-230],[75,8,-215],[145,15,-155],[175,25,-65],
[145,38,25],[75,51,55],[5,61,38],[-65,68,5],[-135,72,20],
[-195,66,85],[-225,54,165],[-190,41,235],[-112,28,265],[-35,18,235],
[25,8,175],[83,-4,120],[135,-18,92],[190,-28,125],[225,-38,190],
[210,-48,265],[150,-58,310],[70,-70,318],[-5,-80,275],[-75,-88,210],
[-130,-90,140],[-155,-84,70],[-135,-70,0],[-95,-54,-52],[-45,-36,-80],
[5,-18,-75],[50,-3,-50],[88,2,-80],[80,1,-120],[30,0,-145],[-35,0,-148]
].map(([x,y,z])=>new THREE.Vector3(x,y,z));

const curve = new THREE.CatmullRomCurve3(P,true,'centripetal',0.22);
const samples = 900;
const center = [];
const tangents = [];
const normals = [];
for(let i=0;i<samples;i++){
  const t=i/samples;
  center.push(curve.getPointAt(t));
  tangents.push(curve.getTangentAt(t).normalize());
}
for(let i=0;i<samples;i++){
  const up=new THREE.Vector3(0,1,0);
  normals.push(new THREE.Vector3().crossVectors(up,tangents[i]).normalize());
}

function ribbon(width, color, yOffset=0){
  const pos=[], idx=[];
  for(let i=0;i<samples;i++){
    const c=center[i], n=normals[i];
    const a=c.clone().addScaledVector(n,width/2); a.y+=yOffset;
    const b=c.clone().addScaledVector(n,-width/2); b.y+=yOffset;
    pos.push(a.x,a.y,a.z,b.x,b.y,b.z);
  }
  for(let i=0;i<samples;i++){
    const j=(i+1)%samples;
    idx.push(i*2,j*2,i*2+1, j*2,j*2+1,i*2+1);
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.setIndex(idx); g.computeVertexNormals();
  return new THREE.Mesh(g,new THREE.MeshStandardMaterial({color,roughness:.95,metalness:0}));
}
const verge=ribbon(15,0x567334,-.05); scene.add(verge);
const road=ribbon(10,0x303236,0); road.receiveShadow=true; scene.add(road);

// center dashes
const dashMat=new THREE.MeshBasicMaterial({color:0xe8e8df});
for(let i=0;i<samples;i+=18){
  const c=center[i], t=tangents[i];
  const dash=new THREE.Mesh(new THREE.BoxGeometry(.18,.035,3.6),dashMat);
  dash.position.copy(c); dash.position.y+=.06;
  dash.rotation.y=Math.atan2(t.x,t.z);
  scene.add(dash);
}

// red/white curbing markers
for(let i=0;i<samples;i+=7){
  const c=center[i], n=normals[i], t=tangents[i];
  for(const side of [-1,1]){
    const curb=new THREE.Mesh(
      new THREE.BoxGeometry(.65,.08,2.0),
      new THREE.MeshStandardMaterial({color:((Math.floor(i/7)%2)==0)?0xffffff:0xb92424})
    );
    curb.position.copy(c).addScaledVector(n,side*5.1);
    curb.position.y+=.08;
    curb.rotation.y=Math.atan2(t.x,t.z);
    scene.add(curb);
  }
}

// forest
const trunkGeo=new THREE.CylinderGeometry(.22,.28,3.8,6);
const leafGeo=new THREE.ConeGeometry(1.4,4.7,7);
const trunkMat=new THREE.MeshStandardMaterial({color:0x4e3727});
const leafMat=new THREE.MeshStandardMaterial({color:0x1e4b25});
for(let i=0;i<420;i++){
  const a=Math.random()*Math.PI*2;
  const r=260+Math.random()*850;
  const x=Math.cos(a)*r, z=Math.sin(a)*r;
  const trunk=new THREE.Mesh(trunkGeo,trunkMat);
  trunk.position.set(x,0,z);
  const leaf=new THREE.Mesh(leafGeo,leafMat);
  leaf.position.set(x,3.6,z);
  scene.add(trunk,leaf);
}

// start gantry
const start=center[0], startTan=tangents[0], startN=normals[0];
const gantry=new THREE.Group();
const beamMat=new THREE.MeshStandardMaterial({color:0x202428});
const beam=new THREE.Mesh(new THREE.BoxGeometry(13,.6,.7),beamMat);
beam.position.y=5.5; gantry.add(beam);
for(const s of [-1,1]){
  const post=new THREE.Mesh(new THREE.BoxGeometry(.5,5.6,.5),beamMat);
  post.position.set(s*5.7,2.7,0); gantry.add(post);
}
gantry.position.copy(start);
gantry.rotation.y=Math.atan2(startTan.x,startTan.z);
scene.add(gantry);

// ---- Car
const car=new THREE.Group();
const bodyMat=new THREE.MeshStandardMaterial({color:0x2457c5,metalness:.35,roughness:.35});
const body=new THREE.Mesh(new THREE.BoxGeometry(1.85,.48,4.15),bodyMat);
body.position.y=.52; body.castShadow=true; car.add(body);
const cabin=new THREE.Mesh(new THREE.BoxGeometry(1.5,.48,1.8),new THREE.MeshStandardMaterial({color:0x17202a,metalness:.2,roughness:.2}));
cabin.position.set(0,.94,-.15); car.add(cabin);
const wing=new THREE.Mesh(new THREE.BoxGeometry(2.05,.12,.42),bodyMat);
wing.position.set(0,.92,1.78); car.add(wing);
const wheelMat=new THREE.MeshStandardMaterial({color:0x111111,roughness:1});
for(const x of [-1.0,1.0]) for(const z of [-1.35,1.35]){
  const w=new THREE.Mesh(new THREE.CylinderGeometry(.38,.38,.28,18),wheelMat);
  w.rotation.z=Math.PI/2; w.position.set(x,.35,z); car.add(w);
}
scene.add(car);

let trackIndex=2;
car.position.copy(center[trackIndex]);
car.position.y+=.4;
let heading=Math.atan2(tangents[trackIndex].x,tangents[trackIndex].z);
car.rotation.y=heading;

// physics
let speed=0, steer=0, paused=false, cameraMode=0;
const keys={};
addEventListener('keydown',e=>{
  keys[e.key.toLowerCase()]=true;
  if(e.key.toLowerCase()==='r') resetCar();
  if(e.key.toLowerCase()==='c') cameraMode=(cameraMode+1)%3;
  if(e.key.toLowerCase()==='p') paused=!paused;
});
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);

function nearestTrackIndex(pos, guess){
  let best=guess,bestD=Infinity;
  for(let d=-20;d<=20;d++){
    const i=(guess+d+samples)%samples;
    const dx=center[i].x-pos.x,dz=center[i].z-pos.z;
    const dist=dx*dx+dz*dz;
    if(dist<bestD){bestD=dist;best=i;}
  }
  return [best,Math.sqrt(bestD)];
}
function resetCar(){
  speed=0;
  car.position.copy(center[trackIndex]); car.position.y+=.42;
  heading=Math.atan2(tangents[trackIndex].x,tangents[trackIndex].z);
  car.rotation.y=heading;
}

let lap=1, lapStart=performance.now(), bestLap=null, lastIndex=trackIndex, started=false;
const speedEl=document.querySelector('#speed'), gearEl=document.querySelector('#gear'),
lapEl=document.querySelector('#lap'), lapTimeEl=document.querySelector('#lapTime'),
bestEl=document.querySelector('#best'), progressEl=document.querySelector('#progress'),
msg=document.querySelector('#message');

function fmt(ms){
  const m=Math.floor(ms/60000), s=Math.floor((ms%60000)/1000), z=Math.floor(ms%1000);
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(z).padStart(3,'0')}`;
}

const clock=new THREE.Clock();
function update(){
  requestAnimationFrame(update);
  const dt=Math.min(clock.getDelta(),.033);
  if(!paused){
    const throttle=keys['w']||keys['arrowup'];
    const brake=keys['s']||keys['arrowdown'];
    const left=keys['a']||keys['arrowleft'];
    const right=keys['d']||keys['arrowright'];

    if(throttle){speed += (speed<58?18:8)*dt; started=true; msg.style.display='none';}
    else speed -= 3.2*dt;
    if(brake) speed -= (speed>0?30:8)*dt;
    speed=Math.max(-7,Math.min(82,speed)); // ~295 km/h

    const steerTarget=(left?1:0)+(right?-1:0);
    steer += (steerTarget-steer)*Math.min(1,6*dt);
    const steerGain=0.25+Math.min(Math.abs(speed)/20,1.0);
    heading += steer*steerGain*dt*(speed>=0?1:-1);
    car.rotation.y=heading;

    const forward=new THREE.Vector3(Math.sin(heading),0,Math.cos(heading));
    car.position.addScaledVector(forward,speed*dt);

    const [ni,dist]=nearestTrackIndex(car.position,trackIndex);
    trackIndex=ni;
    const roadY=center[trackIndex].y+.42;
    car.position.y += (roadY-car.position.y)*Math.min(1,8*dt);

    // Off-track slowdown
    if(dist>5.5) speed*=Math.pow(.965,dt*60);
    if(dist>15) speed*=Math.pow(.90,dt*60);

    // lap counting
    if(lastIndex > samples*.90 && trackIndex < samples*.10 && speed>3){
      const now=performance.now();
      const t=now-lapStart;
      if(lap>1 || t>10000){
        if(!bestLap || t<bestLap){bestLap=t;bestEl.textContent=fmt(t);localStorage.setItem('gh3d-best',String(t));}
      }
      lap++; lapStart=now;
    }
    lastIndex=trackIndex;
  }

  const now=performance.now();
  speedEl.textContent=Math.round(Math.abs(speed)*3.6);
  gearEl.textContent=speed<-.5?'R':speed<1?'N':String(Math.min(6,Math.max(1,Math.ceil(speed/13))));
  lapEl.textContent=lap;
  lapTimeEl.textContent=fmt(now-lapStart);
  progressEl.textContent=((trackIndex/samples)*100).toFixed(1)+'%';

  // camera
  const f=new THREE.Vector3(Math.sin(heading),0,Math.cos(heading));
  const r=new THREE.Vector3(Math.cos(heading),0,-Math.sin(heading));
  let targetPos,targetLook;
  if(cameraMode===0){
    targetPos=car.position.clone().addScaledVector(f,-8).add(new THREE.Vector3(0,3.8,0));
    targetLook=car.position.clone().addScaledVector(f,9).add(new THREE.Vector3(0,1,0));
  }else if(cameraMode===1){
    targetPos=car.position.clone().add(new THREE.Vector3(0,1.25,0)).addScaledVector(f,.55);
    targetLook=car.position.clone().addScaledVector(f,20).add(new THREE.Vector3(0,1,0));
  }else{
    targetPos=car.position.clone().addScaledVector(f,-15).add(new THREE.Vector3(0,10,0));
    targetLook=car.position.clone().addScaledVector(f,5);
  }
  camera.position.lerp(targetPos,.12);
  camera.lookAt(targetLook);

  renderer.render(scene,camera);
}

const saved=Number(localStorage.getItem('gh3d-best'));
if(saved>0){bestLap=saved;bestEl.textContent=fmt(saved);}

function resize(){
  renderer.setSize(innerWidth,innerHeight,false);
  camera.aspect=innerWidth/innerHeight;
  camera.updateProjectionMatrix();
}
addEventListener('resize',resize); resize(); update();
