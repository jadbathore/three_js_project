

function animate()
{
    world.step(timestep);
    ground.position.copy(groundBody.position);
    ground.quaternion.copy(groundBody.quaternion);
    renderer.render(scene,camera);
    for(let i = 0; i < meshes.length;i++)
        {
            meshes[i].position.copy(bodies[i].position);
            meshes[i].quaternion.copy(bodies[i].quaternion);
        }
}
renderer.setAnimationLoop(animate);
const {gltf,img,renderer,scene,camera,orbit,loader,animate,THREE} = require('../../public/versionning/linkFile.js')
