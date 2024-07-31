function animate()
{
    earthMesh.rotateY(0.002)
    lightMesh.rotateY(0.002)
    cloudMesh.rotateY(0.0025)
    glowmesh.rotateY(0.002)
    renderer.render(scene,camera)
    moonMesh.rotateY(0.02)
    moonRotation.rotateY(0.00514)
}

renderer.setAnimationLoop(animate);;
