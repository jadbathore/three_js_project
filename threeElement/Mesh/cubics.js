const {scene,THREE} = require('../../public/versionning/linkFile.js')

const cubics = new THREE.Mesh(
    new THREE.BoxGeometry(1,1,1),
    new THREE.MeshBasicMaterial({
        color: 0xFFFFFFF
    })
)
scene.add(cubics)