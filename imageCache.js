
import express from 'express';
import chalk from 'chalk';
import boxen from 'boxen';
import path from 'path';


const app = express();
const port = process.env.port || 5000;

app.set('view engine','ejs')
app.set('views',path.join(process.cwd(),'viewer'))
app.use(express.static(path.join(process.cwd(),'public')))

app.get('/',(req,res)=>{
    res.render('index')
}) 


app.listen(port,()=>{
    console.log(chalk.green(
                boxen(`server is running on port : ${port}`,
            {
                padding: 1,
                height: 2 ,
            }
            ))
            + '\n')
        })



