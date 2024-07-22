function animate()
{
    box.rotation.y += 0.01
    
    renderer.render(scene,camera)
}

renderer.setAnimationLoop(animate);
