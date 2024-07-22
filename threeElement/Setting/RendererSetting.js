const renderer = new THREE.WebGLRenderer()
const scene = new THREE.Scene()

renderer.setSize(window.innerWidth,window.innerHeight);
document.body.appendChild(renderer.domElement)

const orbit = new OrbitControls(camera,renderer.domElement)
orbit.update();


