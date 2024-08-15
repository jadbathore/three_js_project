const glb = {
donus:'asset/glb/donus.glb',
earth:'asset/glb/earth.glb',
}

const gltf = {
Bull:'asset/gltf/Bull.gltf',
Deer:'asset/gltf/Deer.gltf',
}

const hdr = {
NaturalStudio:'asset/hdr/NaturalStudio.hdr',
}

const img = {
earth_nightmap:'asset/img/earth_nightmap.jpg',
earthbump:'asset/img/earthbump.jpg',
earthmap1k:'asset/img/earthmap1k.jpg',
earthspecular:'asset/img/earthspecular.jpg',
fair_clouds_8k:'asset/img/fair_clouds_8k.jpg',
moonbump4k:'asset/img/moonbump4k.jpg',
moonmap4k:'asset/img/moonmap4k.jpg',
singleStar:'asset/img/singleStar.png',
}

//----------------------|configImport.js|----------------------------------
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as CANNON from 'cannon-es';
//----------------------|RendererSetting.js|----------------------------------
const renderer = new THREE.WebGLRenderer({antialias:true})
const scene = new THREE.Scene()
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth,window.innerHeight);
document.body.appendChild(renderer.domElement)
//----------------------|cameraSetting.js|----------------------------------
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth/window.innerHeight,
    0.1,
    1000
);

camera.position.set(-10,10,10);

const orbit = new OrbitControls(camera,renderer.domElement)
orbit.update();
//----------------------|loader.js|----------------------------------

//----------------------|ground.js|----------------------------------
const world = new CANNON.World({gravity:new CANNON.Vec3(0,-9.81,0)})

const groundGeo = new THREE.PlaneGeometry(10,10);
const groundphyMat = new CANNON.Material();
const groundMaterial = new THREE.MeshStandardMaterial({
    color:0XFFFFFF,
    side: THREE.DoubleSide
})
const ground = new THREE.Mesh(groundGeo,groundMaterial);
scene.add(ground);
ground.receiveShadow = true;
const groundBody = new CANNON.Body(
    {
        type: CANNON.Body.STATIC,
        shape: new CANNON.Box(new CANNON.Vec3(5,5,0.001)),
        material:groundphyMat
    });
groundBody.quaternion.setFromEuler(-Math.PI / 2,0,0);
world.addBody(groundBody);
//----------------------|light.js|----------------------------------
const dirLight = new THREE.DirectionalLight(0xFFFFFFF,0.8)
scene.add(dirLight);
dirLight.position.set(0,50,0);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 1024;
dirLight.shadow.mapSize.height = 1024;
//----------------------|mouseEvent.js|----------------------------------
const mouse = new THREE.Vector2();
const intersectPoint = new THREE.Vector3();
const planeNormal = new THREE.Vector3();
const plane = new THREE.Plane();
const raycaster = new THREE.Raycaster();

window.addEventListener('mousemove',(event)=>{
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    planeNormal.copy(camera.position).normalize();
    plane.setFromNormalAndCoplanarPoint(planeNormal, /*new THREE.Vector3(0,0,0)*/ planeNormal);
    raycaster.setFromCamera(mouse,camera);
    raycaster.ray.intersectPlane(plane,intersectPoint);
})

const meshes = [];
const bodies = [];

window.addEventListener('click',()=>{
    const sphereGeometry = new THREE.SphereGeometry(0.125,30,30);
    const sphereMat =  new THREE.MeshStandardMaterial({
        color: Math.random() * 0xFFFFFFF,
        metalness:0,
        roughness:0
    })
    const sphere = new THREE.Mesh(sphereGeometry,sphereMat);
    scene.add(sphere);
    sphere.castShadow = true;
    const spherephyMaterial = new CANNON.Material();
    const sphereBody = new CANNON.Body({
        mass:0.3,
        shape: new CANNON.Sphere(0.125),
        position: new CANNON.Vec3(intersectPoint.x,intersectPoint.y,intersectPoint.z),
        material: spherephyMaterial
    })
    world.addBody(sphereBody);

    const planeSpherecontactmat = new CANNON.ContactMaterial(
        groundphyMat,
        spherephyMaterial,
        {restitution:0.9}
    )
    world.addContactMaterial(planeSpherecontactmat);
    meshes.push(sphere);
    bodies.push(sphereBody);
})
const timestep = 1/60;
//----------------------|wordasset.js|----------------------------------

//----------------------|animate.js|----------------------------------
function animate()
{
    world.step(timestep);
    ground.position.copy(groundBody.position);
    ground.quaternion.copy(groundBody.quaternion);
    renderer.render(scene,camera);
    for(let i = 0; i < meshes.length;i++)
        {
            meshes[i].position.copy(bodies[i].position);
            meshes[i].quaternion.copy(bodies[i].quaternion);
        }
}
renderer.setAnimationLoop(animate);
//----------------------|resizeSetting.js|----------------------------------
window.addEventListener('resize',()=> {
    camera.aspect= window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth,window.innerHeight)
    })
