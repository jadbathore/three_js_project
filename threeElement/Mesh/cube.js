

const {gltf,img,renderer,scene,camera,orbit,animate,THREE} = require('../../public/versionning/linkFile.js')

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1,1,1),
    new THREE.MeshBasicMaterial({
        color: 0xFFFFFFF
    })
)
scene.add(cube);

class Test {

    method(){
        console.log('Test')
    }
}