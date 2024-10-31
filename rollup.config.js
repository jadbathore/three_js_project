import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { minify } from 'rollup-plugin-esbuild-minify'

export default {
    input:'app/public/versionning/compling.js',
    output:{
        dir:'app/public/dist',
        format:'es'
    },

    plugins:[
        resolve(),
        commonjs(),
        minify()
    ]
}
