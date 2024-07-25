const http = require("http") 
const chalk = require('chalk');
const boxen = require('boxen');
const path = require('path');
const fs = require('fs').promises;
const port = 3000;

const server = http.createServer((req,res)=>{
    fs.readFile(path.join(process.cwd(),'index.html'))
    .then((data) => {
        res.setHeader("Content-Type","text/html");
        res.writeHead(200);
        res.end(data)
    })
});

server.listen(port,()=>{
        console.log(chalk.green(
                    boxen(`server is running on port : ${port}`,
                {
                    padding: 1,
                    height: 2 ,
                }
                ))
                + '\n')
})

// .listen(port,()=>{
//    
// })