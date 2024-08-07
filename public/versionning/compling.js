const gltf = {
Bull:'asset/gltf/Bull.gltf',
Deer:'asset/gltf/Deer.gltf',
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

//file: configImport.js
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
//file: RendererSetting.js
const renderer = new THREE.WebGLRenderer({antialias:true})
const scene = new THREE.Scene()

renderer.setSize(window.innerWidth,window.innerHeight);
document.body.appendChild(renderer.domElement)
//file: cameraSetting.js
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth/window.innerHeight,
    0.1,
    1000
);

camera.position.set(10,10,-5);

const orbit = new OrbitControls(camera,renderer.domElement)
orbit.update();
//file: cube.js
const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1,1,1),
    new THREE.MeshBasicMaterial({
        color: 0xFFFFFFF
    })
)
scene.add(cube)
//file: animate.js
function animate()
{
    cube.rotateX(0.01)
    renderer.render(scene,camera)
}
renderer.setAnimationLoop(animate);
//file: resizeSetting.js
window.addEventListener('resize',()=> {
    camera.aspect= window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth,window.innerHeight)
    })
