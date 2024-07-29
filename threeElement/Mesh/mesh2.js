const {THREE, scene} = require('../../public/versionning/linkFile.js')

const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1,1,1),
    new THREE.MeshBasicMaterial({
        color:0xffffff
    })
)
const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(1,1,1),
    new THREE.MeshBasicMaterial({
        color:0xffffff
    })
)
scene.add(sphere)