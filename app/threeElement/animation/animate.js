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
requestAnimationFrame(()=>{
    earthMesh.rotateY(0.002)
    lightMesh.rotateY(0.002)
    cloudMesh.rotateY(0.0025)
    glowmesh.rotateY(0.002)
    renderer.render(scene,camera)
    moonMesh.rotateY(0.02)
    moonRotation.rotateY(0.00514)
    this.file_animate()
})





