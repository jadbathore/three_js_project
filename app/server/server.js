import express from 'express';
import chalk from 'chalk';
import boxen from 'boxen';
import compression from 'compression';
import PathUtility from '../CompilerSetUp/Utility/pathUtility.js';
import { option } from './optionStaticFileExpress.js';
import livereload from 'livereload';
import connectLiveReload from 'connect-livereload'
import { CompilerWatchSubject,ObserverWatch,ProxyObserver } from '../oberserver/oberserver.js';


const app = express();
const port = process.env.EXPRESS_PORT || 3000;
const liveReloadServer = livereload.createServer()

app.use(compression())
app.set('view engine','ejs')
app.set('views',PathUtility.getViewerFile())
app.use(express.static('app/public',option))

async function callCompiler(subject,oberserver)
{
    const {compiler} =  await import('../CompilerSetUp/Compiler.js')
    return compiler(subject,oberserver)
}

app.use(connectLiveReload())

const subject = new CompilerWatchSubject()
const oberserver = new ObserverWatch('/')

ProxyObserver(oberserver,(event,path)=>{
    liveReloadServer.refresh(path);
})


app.get('/',(req,res)=>
{
    res.render(
        'index',
        {
            title:'test_app'
        }
    );
})



callCompiler(subject,oberserver)
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


