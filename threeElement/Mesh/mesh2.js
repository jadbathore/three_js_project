const {THREE, scene} = require('../../versionning/linkFile.js')

const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1,1,1),
    new THREE.MeshBasicMaterial({
        color:0xffffff
    })
)

scene.add(sphere)