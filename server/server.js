const fs =  require('fs');
const mongoose = require('mongoose');
const { version } = require('punycode');


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
    let content = fs.readFileSync(`./threeElement/${file[i]}`,'utf-8');
    compiledfile += content;
}

async function testVersion()
{
    const select = await VersionningModel.findOne({'content':compiledfile});
    if(select === null)
        {
            //empty
            return false;
        } else {
            //not-empty
            return true
        }
}

if(testVersion() === false) {
    let name = versionName;
    if(versionningfile.length < 1)
        {
            
        } else {
            
        }
        const add = new VersionningModel({
        versionName:name,
        content:compiledfile
        })
        add.save();
} else {
    console.log('dernière version à jour')
}








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


