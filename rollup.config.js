import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

export default{
    input:'public/versionning/compling.js',
    output:{
        dir:'public/dist',
        format:'es'
    },

    plugins:[
        resolve(),
        commonjs()
    ]
}
