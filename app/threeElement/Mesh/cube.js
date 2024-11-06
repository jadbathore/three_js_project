const {scene,THREE,img,loader} = require('../../public/versionning/linkFile.js')

const CubeGroup = new THREE.Group();
scene.add(CubeGroup)
const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1,1,1),
    new THREE.MeshStandardMaterial({
        color: 0xFFFFFFF,
    })
)

const cube2 = new THREE.Mesh(
    new THREE.BoxGeometry(2,2,2),
    new THREE.MeshStandardMaterial({
        color: 0xFFFFFFF,
        transparent:true,
        opacity:0.5
    })
)

const cube3 = new THREE.Mesh(
    new THREE.BoxGeometry(4,4,4),
    new THREE.MeshStandardMaterial({
        color: 0xFFFFFFF,
        transparent:true,
        opacity:0.3
    })
)

const cube4 = new THREE.Mesh(
    new THREE.BoxGeometry(8,8,8),
    new THREE.MeshPhongMaterial({
        bumpMap:loader.load(img.moonbump4k),
        transparent:true,
        opacity:0.2,
        bumpScale:4
    })
)
CubeGroup.add(cube)
CubeGroup.add(cube2)
CubeGroup.add(cube3)
CubeGroup.add(cube4)

