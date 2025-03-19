import express from 'express';
import chalk from 'chalk';
import boxen from 'boxen';
import fs from 'fs';
import compression from 'compression';
import livereload from 'livereload';
import connectLiveReload from 'connect-livereload';
import PathUtility from '../CompilerSetUp/Utility/pathUtility.js';
import { optionServer } from './optionStaticFileExpress.js';
import { CompilerWatchSubject,ObserverWatch,ProxyObserver } from '../oberserver/oberserver.js';
import https from 'https';
const app = express();

const key = (fs.existsSync(PathUtility.keySLL))?fs.readFileSync(PathUtility.keySLL):null;
const cert = (fs.existsSync(PathUtility.certSLL))?fs.readFileSync(PathUtility.certSLL):null;
const server = (key && cert)? https.createServer({key: key, cert: cert }, app):app;

const port = process.env.EXPRESS_PORT || 3000;
const liveReloadServer = livereload.createServer();
app.use(compression())
app.set('view engine','ejs')
app.set('views',PathUtility.getViewerFile())
app.use(express.static('app/public',optionServer))

async function callCompiler(subject,oberserver)
{
    const {compiler} =  await import('../CompilerSetUp/Compiler.js')
    return compiler(subject,oberserver)
}

app.use(connectLiveReload())

const subject = new CompilerWatchSubject()
const oberserver = new ObserverWatch('/')


app.use((req,res,next)=>{
    ProxyObserver(oberserver,(event,path)=>{
        // res.render('index');
        liveReloadServer.refresh(path);
    })
    next();
});




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
        server.listen(port,()=>{
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


