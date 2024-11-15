import express from 'express'
import threeTreeConfig from '../../threeTree.config.js'
const option =
{
    dotfiles: 'ignore',
    etag: true,
    index: false,  
    redirect: false,
    maxAge:'1d',
}

if (!threeTreeConfig.server.caching_Script){
    option['setHeaders'] = (res,path) =>{
        res.set({
            'Cache-Control':(express.static.mime.lookup(path) === 'application/javascript')?'public,maxAge=0':'public'
        })
    }
}

export { option }