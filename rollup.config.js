import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import plugin from '@rollup/plugin-json'

export default {
    input:'app/public/versionning/compling.js',
    output:{
        dir:'app/public/dist',
        format:'es'
    },

    plugins:[
        resolve(),
        commonjs(),
        plugin()
    ]
}
