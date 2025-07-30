// import fs from 'fs/promises';
import path from 'path';
import Compile from '../../model/CompilerSetUp/Utility/Utility.js';
import PathUtility from '../../model/CompilerSetUp/Utility/pathUtility.js';
// require('./init.cjs')

// // import { instantiate } from '../../public/wasm_mod/pkg/wasm_mod.js';
let CompilerUtilityClass = new Compile("scene1");

// CompilerUtilityClass.repopulateComposer(PathUtility.getcompilerFile());
CompilerUtilityClass.repopulatelinkFile(PathUtility.getlinkFile());


