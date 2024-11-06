const { THREE,scene,camera,renderer,__cube__,cube, cube2,cube3,cube4} = require('../../public/versionning/linkFile')

requestAnimationFrame(()=>{
    renderer.render(scene,camera)
    cube.rotateX(0.1);
    cube2.rotateY(-0.05);
    cube3.rotateY(0.025);
    cube3.rotateX(0.025);
    cube4.rotateX(-0.01)
    cube4.rotateY(-0.01)
    this.file_animate()
})

