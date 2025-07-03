const { THREE,
	OrbitControls, glb, gltf,
	hdr, img, renderer,
	scene, camera, orbit,
	loader, earthGroup, geo,
	earthMesh, lightMesh, couldsMat,
	cloudMesh, moonRotation, moonMesh,
	fresnel, glowmesh, star,
	sunLight, getFresnelMat, getStarfield,
	} = require('../../../public/versionning/linkFile.js')

window.addEventListener('resize',()=> {
	//Redimension du ratio de l'aspect de la camera 
    camera.aspect= window.innerWidth / window.innerHeight;
	//la mise a jour de la projection de la matrice visuelle
    camera.updateProjectionMatrix();
	//mise a jour de la taille de l'ecran 
    renderer.setSize(window.innerWidth,window.innerHeight)
})
