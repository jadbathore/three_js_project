#! /usr/bin/env node
import { usage as _usage, exit, showHelp } from "yargs";
import { keyword, green } from "chalk";
import { textSync } from "figlet";
import { connect, Schema, model, Types } from 'mongoose';
import { join } from 'path';
import boxen from 'boxen';
import { readFileSync } from 'fs';




connect('mongodb://127.0.0.1:27017/versionningThreeJs')
const mongooseSchema = Schema(
    {
        versionName:String,
        date:{type:Date,default:Date.now},
        content:String
    }
)

const VersionningModel = new model('versions',mongooseSchema);
const usage = keyword('violet')('\nUsage: ThreeCli <command>')
_usage(usage)
.command('SaveElement', 'make a get HTTP request',()=>
{
    const pathfile = join(process.cwd(),'public','versionning','compling.js')
    const content = readFileSync(pathfile,'utf-8');
    const versionName = `versions_${new Types.ObjectId().toString()}`
    const add = new VersionningModel({
        versionName:versionName,
        content:content
        })
        add.save();
        console.log('\n' + keyword('violet')('element sauvegardé versionning/compling.js :') + '\n\n' +
            green(
            boxen(`version: '${versionName}' \ntime: '${new Date(Date.now()).toString()}'`,
            {
                padding: 1,
                height: 2 ,
            }
            ))
            + '\n'
        );
        exit();
})


.help(true)
.argv
;
const argv = require('yargs/yargs')(process.argv.slice(2)).argv;


const filePaths = argv._
if (filePaths.length == 0) {
    console.log(
        green(
        textSync('ThreeCLI', { horizontalLayout: 'full' })
        )
    );
    showHelp()
} else {
    return true 
}





