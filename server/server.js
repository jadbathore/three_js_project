import express from 'express';
import chalk from 'chalk';
import boxen from 'boxen';
import path from 'path';
import compression from 'compression';
const app = express();
const port = process.env.port || 3000;
/* 
français:
    serveur express utilisant le express.static() sur ple dossier public 
    ce qui fait que maitenant tout les chemin en 'front-end' utiliseront 
    un chemin relatif :au lieu de (.../.../public/asset/gltf/bull.gftf)
    => (asset/gltf/bull.gltf) 
    utlilise un view engine ejs au cas ou des données modulaire pourrai être 
    transmisse une importation dynamique et fait ce qui permet de compiler les donner 
    puis par la suite démarre le server 
English:
    express server using express.static() on the public folder
    which means that now all the paths in the 'front-end' will use
    a relative path: instead of (.../.../public/asset/gltf/bull.gftf)
    => (asset/gltf/bull.gltf)
    uses an ejs view engine in case modular data could be
    transmits a dynamic import and does what allows the data to be compiled
    then subsequently starts the server
*/
app.use(compression())
app.set('view engine','ejs')
app.set('views',path.join(process.cwd(),'viewer'))
app.use(express.static(path.join(process.cwd(),'public')))

app.get('/',(req,res)=>{
    res.render('index')
})



async function callCompiler()
{
    const {composer} =  await import('../CompilerSetUp/Compiler.js')
    return composer()
}

callCompiler()
    .then(()=>{
        app.listen(port,()=>{
        console.log(chalk.green(
                    boxen(`server is running on port : ${port}`,
                {
                    padding: 1,
                    height: 2 ,
                }
                ))
                + '\n')
            })
    })


