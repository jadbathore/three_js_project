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


const renderer = new THREE.WebGLRenderer({antialias:true})
const scene = new THREE.Scene()

renderer.setSize(window.innerWidth,window.innerHeight);
document.body.appendChild(renderer.domElement)




