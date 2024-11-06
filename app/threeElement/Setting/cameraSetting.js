const { THREE } = require('../../public/versionning/linkFile')

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth/window.innerHeight,
    0.1,
    1000
    );
camera.position.set(15,15,5);
const orbit = new OrbitControls(camera,renderer.domElement);
orbit.update();