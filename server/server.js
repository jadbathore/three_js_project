const fs =  require('fs');
const mongoose = require('mongoose');
const path = require('path')



mongoose.connect('mongodb://127.0.0.1:27017/versionningThreeJs')
const mongooseSchema = mongoose.Schema(
    {
        versionName:String,
        content:String
    }
)
const VersionningModel = new mongoose.model('versions',mongooseSchema);
const file = fs.readdirSync('./threeElement/');
const versionningfile = fs.readdirSync('./versionning/')
const test = './versionning/compling_firstcommit.js'
const versionName = 'compling_firstcommit.js'
let compiledfile = '';


for(let i = 0;i< file.length;i++){
    let pathfile = path.join(process.cwd(),'threeElement',file[i])
    // let content = fs.readFileSync(pathfile,'utf-8');
    // compiledfile += content;
    fs.watchFile(pathfile, (curr, prev) => {
        console.log(`the current mtime is: ${curr.mtime}`); 
        console.log(`the previous mtime was: ${prev.mtime}`);
      }); 
}



// if(testVersion() === false) {
//     let name = versionName;
//             const split = versionName.split('_')
//             name = split[0] + get
//             const add = new VersionningModel({
//                 versionName:`versions_${new mongoose.Types.ObjectId().toString()}`,
//                 content:compiledfile
//                 })
//         add.save();
// } else {
//     console.log('dernière version à jour')
// }








// if(fs.existsSync(test)){
// console.log(test)
// }
// fs.readFile(test,"utf8",()=> {
//     fs.appendFile(
//         test,
//         compiledfile,
//         {
//             encoding:"utf-8"
//         },
//         (err)=>{
//             if(err)
//                 {
//                     console.log(err)
//                 }
//             else {
//                 console.log('importation ajouté avec succés',
//                 )
//             }
//         }
//     )
// })


// file.forEach(element => {
//     fs.readFile(`./threeElement/${element}`,"utf8",(data)=>{
        
//     })
// });


