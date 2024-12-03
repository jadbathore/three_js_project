import express from 'express';
import chalk from 'chalk';
import boxen from 'boxen';
import compression from 'compression';
import PathUtility from '../CompilerSetUp/Utility/pathUtility.js';
import { option } from './optionStaticFileExpress.js';
import livereload from 'livereload';
import connectLiveReload from 'connect-livereload'

const app = express();
const port = process.env.EXPRESS_PORT || 3000;

app.use(compression())
app.set('view engine','ejs')
app.set('views',PathUtility.getViewerFile())
app.use(express.static('app/public',option))

async function callCompiler()
{
    const {compiler} =  await import('../CompilerSetUp/Compiler.js')
    return compiler()
}

app.get('/',(req,res)=>{
  
    res.render(
        'index',
        {
            title:'test_app'
        }
    );
})

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


