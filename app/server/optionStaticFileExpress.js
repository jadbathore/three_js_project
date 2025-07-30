
import express from 'express'
import threeTreeConfig from '../../threeTree.config.js'
import path from 'path'
import PathUtility from '../model/CompilerSetUp/Utility/pathUtility.js'

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
        switch (true) {
            // must do like that (switch check before if it wasmFile add after check mime type 
            // each true but wasmfirst)
            case (pathFile == PathUtility.wasmFile):
                res.header('Cache-Control', ['public'])
            break;
            case (express.static.mime.lookup(pathFile) === 'application/javascript'):
                res.header('Cache-Control', ['public'])
            break;
            default : res.header('Cache-Control', ['public']);
            break
        }
    }
}

export { optionServer }