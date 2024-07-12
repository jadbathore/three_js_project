const chalk = require('chalk');
const fs =  require('fs');
const path = require('path');
const Utility = require('./Utility');

const mapFile = new Map();
const arrayFile = []
const file = fs.readdirSync('./threeElement/',{withFileTypes:true}).filter(dir => dir.isDirectory()).map(
    (dir)=>{
        const arry = fs.readdirSync(path.join(process.cwd(),'threeElement',dir.name))
        mapFile.set(dir.name,arry)
        
    });

console.log(mapFile);
console.log(file);
// const animation = fs.readdirSync(path.join(process.cwd(),'threeElement','animation'));
// const asset = fs.readdirSync(path.join(process.cwd(),'threeElement','asset'));
// const Setting = fs.readdirSync(path.join(process.cwd(),'threeElement','Setting'));
// const Mesh = fs.readdirSync(path.join(process.cwd(),'threeElement','Mesh'));
// const MapFile = new Map()
// MapFile.set('animation',animation);
// MapFile.set('asset',asset);
// MapFile.set('Setting',Setting);
// MapFile.set('Mesh',Mesh);

// const AllFile = animation.concat(asset,Setting,Mesh);
// console.log(AllFile);

// const UtilityClass = new Utility(AllFile,MapFile);



//j'appel la fonction repopulate pour mettre à jour les changement hors fonctionnement composer;
// UtilityClass.repopulateComposer();
// for(let i = 0;i< UtilityClass.fileArray.length;i++){

//     let pathfile = path.join(process.cwd(),'threeElement',UtilityClass.fileArray[i])
//     fs.watch(pathfile, async(event, file) => {
//         switch (event)
//         {
//             case 'change': await UtilityClass.repopulateComposer(); break;
//             case 'rename': console.log(chalk.keyword('orange')('do not changer or remove some file during the process'));break;
//             default : return;
//         }
//         console.log(chalk.keyword('violet')(`the file ${file} as been ${event} 🔮`))
//     }); 
// }
// console.log(file);



