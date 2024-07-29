import * as chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import Utility from './Utility.js';
import { loadConfigFile } from 'rollup/loadConfigFile';
import rollup from '../rollup.config.js';

// load the config file next to the current script;
// the provided config object has the same effect as passing "--format es"
// on the command line and will override the format of all outputs
loadConfigFile(path.resolve(__dirname, 'rollup.config.js'), {
	format: 'es'
}).then(async ({ options, warnings }) => {
	// "warnings" wraps the default `onwarn` handler passed by the CLI.
	// This prints all warnings up to this point:
	console.log(`We currently have ${warnings.count} warnings`);

	// This prints all deferred warnings
	warnings.flush();

	// options is an array of "inputOptions" objects with an additional
	// "output" property that contains an array of "outputOptions".
	// The following will generate all outputs for all inputs, and write
	// them to disk the same way the CLI does it:
	for (const optionsObj of options) {
		const bundle = await rollup.rollup(optionsObj);
		await Promise.all(optionsObj.output.map(bundle.write));
	}


});

const mapFile = new Map();

fs.readdirSync('./threeElement/',{withFileTypes:true}).filter(dir => dir.isDirectory()).map(
    (dir)=>{
        const arry = fs.readdirSync(path.join(process.cwd(),'threeElement',dir.name))
        mapFile.set(dir.name,arry)
    })
    ;

const allFile = []

for (const [key, value] of mapFile) {
    for (const file of value)
    {
        const pathFile  = path.join(process.cwd(),'threeElement',key,file)
        allFile.push(pathFile);
    }
}



export const composer = () =>{
    const UtilityClass = new Utility(allFile);
    UtilityClass.repopulateComposer()
    UtilityClass.repopulatelinkFile()
    for(let i = 0;i< UtilityClass.fileDirArray.length;i++){
        fs.watch(UtilityClass.fileDirArray[i], async(event, file) => {
            switch (event)
            {
                case 'change': await UtilityClass.repopulateComposer(); 
                await UtilityClass.repopulatelinkFile();
                break;
                case 'rename': console.log(chalk.keyword('orange')('⚠️ do not change name or remove some file during the process ⚠️'));break;
                default : return;
            }
            console.log(chalk.keyword('violet')(`the file ${file} as been ${event} 🔮`))
        }); 
    }
}