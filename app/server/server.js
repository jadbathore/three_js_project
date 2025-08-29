import { exec } from 'child_process';
import { CompilerWatchSubject } from '../../_types/app/model/oberserver/oberserver.js'
import { ServerHandler } from '../../_types/app/model/server/serverHandler.js'
import { router } from '../../_types/app/route/routeur.js';
import { Socket } from '../../_types/app/server/serverHandler/socketImplement.js';
import express from 'express'

const app = express()

const socket = new Socket();
const subject = new CompilerWatchSubject()
const server = new ServerHandler(router,socket,subject,app,process.env.EXPRESS_PORT || 3000)

server.run()

// setTimeout(()=>{
//     server.restartServer()

// },5000)
// server.runServer()

if(process.env.COMPILE_DIR){
    // process.on('SIGINT', () => server.shutDown(process.env.COMPILE_DIR));
    // process.on('SIGTERM', () => server.shutDown(process.env.COMPILE_DIR)); 
}
