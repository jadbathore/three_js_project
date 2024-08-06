import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import Utility from './Utility.js';
import { allFile,mapAsset } from './pathUtility.js';
import {loadConfigFile} from 'rollup/loadConfigFile'
import {rollup,watch} from 'rollup';

loadConfigFile(path.resolve(process.cwd(), 'rollup.config.js'), {
	format: 'es'
}).then(async ({ options, warnings }) => {
	console.log(chalk.keyword('orange')(`Nous avons ${warnings.count} avertissement de la part de rollup`));
	warnings.flush();
	for (const optionsObj of options) {
		const bundle = await rollup(optionsObj);
		await Promise.all(optionsObj.output.map(bundle.write));
	}
    watch(options)
    console.log(chalk.green('le fichier dist est connecté avec succée !'))
});





const UtilityClass = new Utility(allFile,mapAsset);
for(let i = 0;i< UtilityClass.fileDirArray.length;i++){
    UtilityClass.addimportScript(UtilityClass.fileDirArray[i])
}
export const composer = () =>{
    UtilityClass.repopulateComposer()
    UtilityClass.repopulatelinkFile()
    for(let i = 0;i< UtilityClass.fileDirArray.length;i++){
        fs.watch(UtilityClass.fileDirArray[i],async(event, file) => {
            switch (event)
            {
                case 'change': 
                await UtilityClass.repopulateComposer(); 
                await UtilityClass.repopulatelinkFile();
                break;
                case 'rename': console.log(chalk.keyword('orange')('⚠️ do not change name or remove some file during the process ⚠️'));break;
                default : return;
            }
            console.log(chalk.keyword('violet')(`the file ${file} as been ${event} 🔮`))
        }); 
    }
}