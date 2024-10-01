requestAnimationFrame(()=>{
    earthMesh.rotateY(0.002)
    lightMesh.rotateY(0.002)
    cloudMesh.rotateY(0.0025)
    glowmesh.rotateY(0.002)
    moonMesh.rotateY(0.02)
    moonRotation.rotateY(0.00514)
    renderer.render(scene,camera)
    this.file_animate()
})





const {gltf,img,renderer,scene,camera,orbit,earthGroup,loader,earthMesh,lightMesh,couldsMat,cloudMesh,moonRotation,moonMesh,getFresnelMat,getStarfield,randomSpherePoint,animate,THREE} = require('../../public/versionning/linkFile.js')