const {THREE, scene} = require('../../public/versionning/linkFile.js')

class testor2{
    "test class"
    method(){
        console.log("test")
    }
}

const fresnel = ""
const star = "a"
const sunLight = new THREE.DirectionalLight(0xFFFFFF)
scene.add(sunLight);
sunLight.position.set(10,0,0);
sunLight.castShadow = true
sunLight.shadow.mapSize.width = 1024;
sunLight.shadow.mapSize.height = 1024;
