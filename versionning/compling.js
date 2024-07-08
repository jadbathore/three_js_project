
export const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth/window.innerHeight,
    0.1,
    1000
);

camera.position.set(10,0,0);


import { camera } from './cameraSetting.js'
import { spotLight } from './light.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


const renderer = new THREE.WebGLRenderer()
const scene = new THREE.Scene()

renderer.setSize(window.innerWidth,window.innerHeight);
document.body.appendChild(renderer.domElement)

const orbit = new OrbitControls(camera,renderer.domElement)
orbit.update();

const box = new THREE.Mesh(
    new THREE.BoxGeometry(1,1,1),
    new THREE.MeshStandardMaterial({
        color:0xFFFFFF
    })
)
scene.add(box);

scene.add(spotLight);



function animate()
{
    box.rotation.y += 0.01
    renderer.render(scene,camera)
}

renderer.setAnimationLoop(animate)

window.addEventListener('resize',()=> {
    camera.aspect= window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth,window.innerHeight)
    })

export const spotLight = new THREE.SpotLight(0xffffff,10000);

spotLight.position.set(30,30,0)