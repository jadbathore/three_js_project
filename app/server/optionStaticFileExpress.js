
import express from 'express'
import threeTreeConfig from '../../threeTree.config.js'
import path from 'path'

/**
 * @type {Server.OptionStatic}
 */
const optionServer =
{
    dotfiles: 'ignore',
    etag: true,
    extensions:['htm','html'],
    index: false,  
    redirect: false,
    maxAge:'1d',
}

if (threeTreeConfig.server.caching_Script){
    optionServer['setHeaders'] = (res,pathFile,stat) =>{
        res.header('Cache-Control', [(express.static.mime.lookup(pathFile) === 'application/javascript')?'no-store':'public'])
        // console.log(path,stat)
    }
}

export { optionServer }