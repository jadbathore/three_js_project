import resolve from '@rollup/plugin-node-resolve'
import watch  from 'rollup-plugin-watch'

export default{
    input:'public/versionning/compling.js',
    output:{
        dir:'public/dist',
        format:'es'
    },
    plugins:[
        resolve(),
        watch({
            dir:"public/versionning/"
        })
    ]
}
