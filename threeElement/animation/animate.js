function animate()
{
    cube.rotateX(0.01)
    renderer.render(scene,camera)
}
renderer.setAnimationLoop(animate);
const {gltf,img,renderer,scene,camera,orbit,animate,THREE, cube} = require('../../public/versionning/linkFile.js')
