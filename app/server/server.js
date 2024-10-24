import express from 'express';
import chalk from 'chalk';
import boxen from 'boxen';
import compression from 'compression';
import PathUtility from '../CompilerSetUp/Utility/pathUtility.js';
import optionStaticFileExpress from './optionStaticFileExpress.js';


const app = express();
const port = process.env.port || 3000;


app.use(compression())
app.set('view engine','ejs')
app.set('views',PathUtility.getViewerFile())
app.use(express.static('app/public',optionStaticFileExpress))



app.get('/',(req,res)=>{
    res.render(
        'index',
        {
            title:'test_app'
        }
    );
})

async function callCompiler()
{
    const {composer} =  await import('../CompilerSetUp/Compiler.js')
    return composer()
}

callCompiler()
    .then(()=>{
        app.listen(port,()=>{
        console.log('\n'+chalk.green(
                    boxen(`Server is running on port : ${port}`,
                {
                    padding: 1,
                    height: 2 ,
                }
                ))
                + '\n')
            })
    })


