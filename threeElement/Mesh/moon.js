const {THREE, scene,img} = require('../../public/versionning/linkFile.js')

const moonRotation = new THREE.Object3D();
scene.add(moonRotation);




const moonMesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.27,12),
    new THREE.MeshPhongMaterial({
        map: loader.load(img.moonmap4k),
        bumpMap: loader.load(img.moonbump4k),
        bumpScale:4,
    })
)
moonRotation.add(moonMesh);
moonMesh.position.x = 8
moonMesh.castShadow = true

const booleana = 4