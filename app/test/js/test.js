import PathUtility from '../../model/CompilerSetUp/Utility/pathUtility.js'
import fs from 'fs'

console.log(PathUtility.getMapFile('scene2'))
console.log(PathUtility.getarrayFile('scene2'))
console.log()
PathUtility.initElement('scene1')
// console.log(PathUtility.getPathFromProcess('app','3DScenes','scene2'))
console.log(PathUtility.getPathFromElement('test'))
console.log(PathUtility.getPathFromElement())
console.log(PathUtility.getPathFromElement())
PathUtility.initElement('scene2')

console.log(PathUtility.getPathFromElement())
console.log(PathUtility.getPathFromElement())
console.log(PathUtility.getPathFromElement())
PathUtility.initElement()
console.log(PathUtility.getPathFromElement())
console.log(PathUtility.getPathFromElement())
console.log(PathUtility.getPathFromElement())