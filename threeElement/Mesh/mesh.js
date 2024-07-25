const {THREE, scene } = require('../../versionning/linkFile')

const box = new THREE.Mesh(
    new THREE.BoxGeometry(1,1,1),
    new THREE.MeshBasicMaterial({
        color: 0Xffffff
    })
)

scene.add(box)


