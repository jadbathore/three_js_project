const { THREE,
	OrbitControls, glb, gltf,
	hdr, img, renderer,
	scene, camera, orbit,
	loader, earthGroup, geo,
	earthMesh, lightMesh, couldsMat,
	cloudMesh, moonRotation, moonMesh,
	fresnel, glowmesh, star,
	sunLight, getFresnelMat, getStarfield,
	} = require('../../public/versionning/linkFile.js')

window.addEventListener('resize',()=> {
    camera.aspect= window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth,window.innerHeight)
    })
