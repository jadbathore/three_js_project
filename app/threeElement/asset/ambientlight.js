const {THREE, scene} = require('../../public/versionning/linkFile.js')


const rightLight = new THREE.PointLight(0xFFFFFF,100);
scene.add(rightLight);
rightLight.position.set(5,5,5);
rightLight.castShadow = true;

const leftLight = new THREE.PointLight(0xFFFFFF,50);
scene.add(leftLight);
leftLight.position.set(-5,-5,5);
leftLight.castShadow = true;

const downLight = new THREE.PointLight(0xFFFFFF,50);
scene.add(downLight);
downLight.position.set(-5,0,-5);
downLight.castShadow = true;
