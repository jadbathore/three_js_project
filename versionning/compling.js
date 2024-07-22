//file: /Users/jadbathore/Documents/coding/coding_javascript/three_js_project/threeElement/Setting/configImport.js
import * as THREE from 'three'
import { camera } from './cameraSetting.js'
import { spotLight } from '../asset/light.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
//file: /Users/jadbathore/Documents/coding/coding_javascript/three_js_project/threeElement/Setting/RendererSetting.js
const renderer = new THREE.WebGLRenderer()
const scene = new THREE.Scene()

renderer.setSize(window.innerWidth,window.innerHeight);
document.body.appendChild(renderer.domElement)

const orbit = new OrbitControls(camera,renderer.domElement)
orbit.update();



//file: /Users/jadbathore/Documents/coding/coding_javascript/three_js_project/threeElement/Setting/cameraSetting.js

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth/window.innerHeight,
    0.1,
    1000
);

camera.position.set(10,0,0);

//file: /Users/jadbathore/Documents/coding/coding_javascript/three_js_project/threeElement/asset/light.js

const spotLight = new THREE.SpotLight(0xffffff,10000);


spotLight.position.set(30,30,0);
;
//file: /Users/jadbathore/Documents/coding/coding_javascript/three_js_project/threeElement/Mesh/mesh.js



//file: /Users/jadbathore/Documents/coding/coding_javascript/three_js_project/threeElement/Mesh/mesh2.js

//file: /Users/jadbathore/Documents/coding/coding_javascript/three_js_project/threeElement/animation/animate.js
function animate()
{
    box.rotation.y += 0.01
    
    renderer.render(scene,camera)
}

renderer.setAnimationLoop(animate);

//file: /Users/jadbathore/Documents/coding/coding_javascript/three_js_project/threeElement/Setting/resizeSetting.js

window.addEventListener('resize',()=> {
    camera.aspect= window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth,window.innerHeight)
    });
