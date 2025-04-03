import express from 'express';
import chalk from 'chalk';
import boxen from 'boxen';
import fs from 'fs';
import compression from 'compression';
import livereload from 'livereload';
import connectLiveReload from 'connect-livereload';
import PathUtility from '../CompilerSetUp/Utility/pathUtility.js';
import { optionServer } from './optionStaticFileExpress.js';
import { CompilerWatchSubject,ObserverWatch,ProxyObserver } from '../../_types/app/oberserver/oberserver.js';
import { compiler,rollupWatchConfig } from "../CompilerSetUp/Compiler.js";
import https from 'https';

rollupWatchConfig();
const app = express();
const liveReloadServer = livereload.createServer();

const key = (fs.existsSync(PathUtility.keySLL))?fs.readFileSync(PathUtility.keySLL):null;
const cert = (fs.existsSync(PathUtility.certSLL))?fs.readFileSync(PathUtility.certSLL):null;
const subject = new CompilerWatchSubject()
const oberserver = new ObserverWatch('/')
const server = (key && cert)? https.createServer({key: key, cert: cert }, app):app;
// const server = app;
const port = process.env.EXPRESS_PORT || 3000;
ProxyObserver(oberserver,(event,path)=>{
    liveReloadServer.refresh(path);
})
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


