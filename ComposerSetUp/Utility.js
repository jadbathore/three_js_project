const chalk = require('chalk');
const path = require('path');
const fs = require('fs');



const complierFile = path.join(process.cwd(),'versionning','compling.js')
const file = fs.readdirSync('./threeElement/'); 

module.exports = function() {

    this.MapContent = (fileArray) =>
    {
        const mapContent = new Map();
        let i = -1;
        fileArray.forEach((element) => {
            if(typeof(this.i) === 'undefined')
            {
                this.i = i;
            }

            switch(element)
            {
                case'configImport.js': mapContent.set(0,element);break;
                case'RendererSetting.js':mapContent.set(1,element);break;
                case'cameraSetting.js': mapContent.set(2,element);break;
                case'light.js': mapContent.set(3,element);break;
                case'animate.js': mapContent.set(fileArray.length - 2,element);break;
                case'resizeSetting.js':mapContent.set(fileArray.length - 1,element);break;
                default: mapContent.set(3+this.i,element);
                this.i++;
                break;
            }
        });
        let orderFile = [];
        for(let i=0;i < fileArray.length;i++)
        {
            orderFile.push(mapContent.get(i))
        }
        return orderFile;
    }

    this.getContentFile = (fileArray) => 
    {
        let compiledContent = '';
        for(const fileElement in fileArray)
        {
            let pathfile = path.join(process.cwd(),'threeElement',fileArray[fileElement])
            let content = fs.readFileSync(pathfile,'utf-8');
            compiledContent += content
        }
        return compiledContent;
    }

    this.repopulateComposer = async()=>
    {
        try {
            let time = new Date(Date.now()).toString()
            fs.truncate(complierFile, 0,(err)=>{ 
                if (err){ 
                    throw new Error(`erreur truncate ${time} \n${err}`);
                }}
            );
            await this.complilerContentPromise().then((data)=>{
                fs.appendFile(complierFile,data,(error)=>{
                    if(error)
                        {
                            throw new Error(error)
                        };
                        console.log(chalk.green(`fichier compiler mise à jour ${time}`))
                });
            },(err)=>{
                console.log(chalk.red(`erreur complation ${time} \n${err}`))
            }
            )
        } catch(err){
            console.log(`${err}\n${time}`)
        }   
    }

    this.complilerContentPromise = () =>
        {
        return new Promise((resolve,reject)=>
            {
                setTimeout(()=>{
                    reject("la complation des donnée à pris trop de temps");
                },3000)
                const mapContent = this.MapContent(file)
                resolve(this.getContentFile(mapContent));
            },)
    }

}