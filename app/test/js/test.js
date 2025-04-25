import PathUtility from '../../model/CompilerSetUp/Utility/pathUtility.js'
import fs from 'fs'
console.log()
const test = PathUtility.getPathFromProcess('app','3DScenes','scene1')

console.log(PathUtility.getMapFile('./app/3DScenes/scene2'))