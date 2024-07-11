const chalk = require('chalk');
const fs =  require('fs');
const path = require('path');
const Utility = require('./Utility')
const UtilityClass = new Utility();

const file = fs.readdirSync('./threeElement/'); 

//j'appel la fonction repopulate pour mettre à jour les changement hors fonctionnement composer;
UtilityClass.repopulateComposer();

for(let i = 0;i< file.length;i++){

    let pathfile = path.join(process.cwd(),'threeElement',file[i])
    fs.watch(pathfile, async(event, file) => {
        switch (event)
        {
            case 'change': await UtilityClass.repopulateComposer(); break;
            case 'rename':
            default : return;
        }
        console.log(chalk.keyword('violet')(`the file ${file} as been ${event} 🔮`))
    }); 
}
console.log(file);



