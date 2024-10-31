const { THREE,
	OrbitControls, glb, gltf,
	hdr, img, renderer,
	scene, camera, orbit,
	loader, earthGroup, geo,
	earthMesh, lightMesh, couldsMat,
	cloudMesh, __moon__, moonRotation,
	moonMesh, fresnel, glowmesh,
	star, sunLight, getFresnelMat,
	getStarfield, } = require('../../public/versionning/linkFile.js')

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