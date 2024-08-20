//generate with configImport.js
const THREE = require('three')
const OrbitControls = require('three/examples/jsm/controls/OrbitControls.js')
const RGBELoader = require('three/examples/jsm/Addons.js')
const CANNON = require('cannon-es')
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
const loader = new RGBELoader();
loader.load(hdr.NaturalStudio,(texture)=>{
    texture.mapping = THREE.EquirectangularReflectionMapping;
    // scene.background = texture;
    // scene.environment = texture;
    const sphere_66c3770bdbbd0e2d3bfd0138 =  new THREE.Mesh(
        new THREE.SphereGeometry(3,50,50),
        new THREE.MeshStandardMaterial({
            roughness:0,
            metalness:0.5,
            color: 0x41c63c,
            envMap:texture
        })
    )
    scene.add(sphere_66c3770bdbbd0e2d3bfd0138);;
    const sphere_66c3770bdbbd0e2d3bfd01382 =  new THREE.Mesh(
        new THREE.SphereGeometry(3,50,50),
        new THREE.MeshStandardMaterial({
            roughness:0,
            metalness:0.5,
            color: 0x433cc6,
            envMap:texture
        })
    )
    scene.add(sphere_66c3770bdbbd0e2d3bfd01382);
    sphere_66c3770bdbbd0e2d3bfd01382.position.x = -10
});
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
world.addBody(groundBody);;
//----------------------|light.js|----------------------------------
const dirLight = new THREE.DirectionalLight(0xFFFFFFF,0.8)
scene.add(dirLight);
dirLight.position.set(0,50,0);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 1024;
dirLight.shadow.mapSize.height = 1024;;
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

//----------------------|bj.js|----------------------------------

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
exports.THREE = THREE
exports.OrbitControls = OrbitControls
exports.RGBELoader = RGBELoader
exports.CANNON = CANNON
module.exports = {glb}
module.exports = {gltf}
module.exports = {hdr}
module.exports = {img}
module.exports = {renderer}
module.exports = {scene}
module.exports = {camera}
module.exports = {orbit}
module.exports = {loader}
module.exports = {sphere_66c3770bdbbd0e2d3bfd0138}
module.exports = {sphere_66c3770bdbbd0e2d3bfd01382}
module.exports = {world}
module.exports = {groundGeo}
module.exports = {groundphyMat}
module.exports = {groundMaterial}
module.exports = {ground}
module.exports = {groundBody}
module.exports = {dirLight}
module.exports = {mouse}
module.exports = {intersectPoint}
module.exports = {planeNormal}
module.exports = {plane}
module.exports = {raycaster}
module.exports = {meshes}
module.exports = {bodies}
module.exports = {sphereGeometry}
module.exports = {sphereMat}
module.exports = {sphere}
module.exports = {spherephyMaterial}
module.exports = {sphereBody}
module.exports = {planeSpherecontactmat}
module.exports = {timestep}
module.exports = {animate}
