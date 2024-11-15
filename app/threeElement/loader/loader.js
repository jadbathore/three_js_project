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

const loader = new THREE.TextureLoader();

