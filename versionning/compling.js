//file: configImport.js
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
//file: RendererSetting.js
const renderer = new THREE.WebGLRenderer()
const scene = new THREE.Scene()

renderer.setSize(window.innerWidth,window.innerHeight);
document.body.appendChild(renderer.domElement)

const orbit = new OrbitControls(camera,renderer.domElement)
orbit.update();



//file: cameraSetting.js

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth/window.innerHeight,
    0.1,
    1000
);

camera.position.set(10,0,0);

//file: light.js

const spotLight = new THREE.SpotLight(0xffffff,10000);


spotLight.position.set(30,30,0);
;
//file: mesh.js

const box = new THREE.Mesh(
    new THREE.BoxGeometry(1,1,1),
    new THREE.MeshBasicMaterial({
        color: 0Xffffff
    })

)


//file: mesh2.js

//file: animate.js
function animate()
{
    box.rotation.y += 0.01
    
    renderer.render(scene,camera)
}

renderer.setAnimationLoop(animate);

//file: resizeSetting.js

window.addEventListener('resize',()=> {
    camera.aspect= window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth,window.innerHeight)
    });
