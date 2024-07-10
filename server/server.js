const chalk = require('chalk');
const { error } = require('console');
const fs =  require('fs');
const path = require('path')



const file = fs.readdirSync('./threeElement/');
const complierFile = path.join(process.cwd(),'versionning','compling.js')
let compiledContent = ''



for(let i = 0;i< file.length;i++){
    let pathfile = path.join(process.cwd(),'threeElement',file[i])
    let content = fs.readFileSync(pathfile,'utf-8');
    compiledContent += content;

    fs.watchFile(pathfile, async(curr, prev) => {
        this.curr = curr
        this.prev =prev
        try {
            fs.truncate(complierFile, 0,(err, bytes)=>{ 
                if (err){ 
                    throw new Error();
                }}
            ); 
            await complilerContentPromise().then((data)=>{
                fs.appendFile(complierFile,data,(error)=>{
                    if(error)
                        throw new Error();
                });
            },(err)=>{
                console.log(chalk.red(`erreur complation ${this.curr.mtime} \n${err}`))
            }
            )
            

            console.log(chalk.green(`fichier compiler mise à jour ${this.curr.mtime}`))
        } catch(err){
            console.log(`${err}\n${curr.mtime}`)
        }   
    }); 
}
const fullCompiled = compiledContent

function complilerContentPromise(){
    return new Promise((resolve,reject)=>
        {
            setTimeout(()=>{
                reject("la complation des donnée à pris trop de temps");
            },30000)
            resolve(fullCompiled);
        },)
}

// if(fs.existsSync(test)){
// console.log(test)
// }
// fs.readFile(test,"utf8",()=> {@
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











// file.forEach(element => {
//     fs.readFile(`./threeElement/${element}`,"utf8",(data)=>{
        
//     })
// });


