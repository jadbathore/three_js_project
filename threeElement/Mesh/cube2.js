

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1,1,1),
    new THREE.MeshBasicMaterial({
        color: 0xFFFFFFF
    })
)

scene.add(cube)

let a = 'aab'

const {gltf,img,renderer,scene,camera,orbit,loader,cube,animate,THREE} = require('../../public/versionning/linkFile.js')
