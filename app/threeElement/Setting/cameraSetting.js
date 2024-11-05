const {THREE,OrbitControls} = require('../../public/versionning/linkFile')

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth/window.innerHeight,
    0.1,
    1000
);

camera.position.set(2,2.5,-5);

const orbit = new OrbitControls(camera,renderer.domElement)
orbit.update();
localStorage.setItem('test','test')