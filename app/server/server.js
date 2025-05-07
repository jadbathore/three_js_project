import { CompilerWatchSubject } from '../../_types/app/model/oberserver/oberserver.js'
import { ServerHandler } from '../../_types/app/model/server/serverHandler.js'
import { router } from '../../_types/app/route/routeur.js';
import { Socket } from '../../_types/app/server/serverHandler/socketImplement.js';
import express from 'express'

const socket = new Socket();
const subject = new CompilerWatchSubject()
const server = new ServerHandler(router,socket,subject)
const app = express()
server.runServer(app)
