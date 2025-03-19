// import express from 'express';
// import chalk from 'chalk';
// import boxen from 'boxen';
// import compression from 'compression';
// import livereload from 'livereload';
// import fs from 'fs';
// import https from "https";
// import connectLiveReload from 'connect-livereload'
// import { optionServer } from '../../server/optionStaticFileExpress';
// import PathUtility from '../../CompilerSetUp/Utility/pathUtility';
// import { ObserverWatch,CompilerWatchSubject,ProxyObserver } from '../../oberserver/oberserver';
// import { compiler } from '../../CompilerSetUp/Compiler'

// const app = express();
// const key = (fs.existsSync(PathUtility.keySLL))?fs.readFileSync(PathUtility.keySLL):null;
// const cert = (fs.existsSync(PathUtility.certSLL))?fs.readFileSync(PathUtility.certSLL):null;
// const server = (key && cert)? https.createServer({key: key, cert: cert }, app):app;
// const port = process.env.EXPRESS_PORT || 3000;
// const liveReloadServer = livereload.createServer();
// app.use(compression())
// app.use(connectLiveReload())
// app.set('view engine','ejs')
// app.set('views',PathUtility.getViewerFile())
// app.use(express.static('app/public',optionServer))

// async function callCompiler(
//     subject:LibFile.Subject,
//     oberserver:LibFile.Observer
// )
// {
//     return compiler(subject,oberserver)
// }

// const subject:LibFile.Subject = new CompilerWatchSubject()
// const oberserver:LibFile.Observer = new ObserverWatch("/")

// app.use((req,res,next)=>{
//     const oberserver:LibFile.Observer = new ObserverWatch(req.path)
//     ProxyObserver(oberserver,(event:EventFile,path:string)=>{
//         // res.render('index');
//         liveReloadServer.refresh(path);
//     })
//     next();
// });

// app.get('/',(req,res)=>
// {
//     res.render(
//         'index',
//         {
//             title:'test_app'
//         }
//     );
// })


// callCompiler(subject,oberserver)
//     .then(()=>{
//         app.listen(port,()=>{
//         console.log('\n'+chalk.green(
//                     boxen(`Server is running on port : ${port}`,
//                 {
//                     padding: 1,
//                 }
//                 ))
//                 + '\n')
//             })
//     })


/**
 * Concrete Iterators implement various traversal algorithms. These classes
 * store the current traversal position at all times.
 */

class TestIterator implements Server.Iterator<string> {
    private _collection: Server.Aggregator<string>;
    private _index: number = 0;
    private _reverse: boolean = false;

    constructor(collection: Server.Aggregator<string>,reverse: boolean = false) {
        this._collection = collection;
        this._reverse = reverse;
        this._index = this._collection.getExtremity(reverse);

    }

    public rewind() {
        this._index = this._collection.getExtremity(this._reverse);
    }

    public current(): string {
        return this._collection.getItems()[this._index];
    }

    public next(): string {
        const item = this.current();
        this._index += this._reverse ? -1 : 1;
        return item;
    }

    public valid(): boolean {
        if (this._reverse) {
            return this._index >= this._collection.getExtremity(this._reverse);
        }
        return this._index <= this._collection.getExtremity(this._reverse);
    }
}

class WordsCollection implements Server.Aggregator<string> {

    private _items:string[] = [];

    public getCount(): number {
        return this._items.length;
    }
    public getIterator(): Server.Iterator<string> {
        return new TestIterator(this);
    }
    public getReverseIterator(): Server.Iterator<string> {
        return new TestIterator(this,true);
    }

    public addItem(item:string): void {
        this._items.push(item);
    }

    public getItems():string[]{
        return this._items;
    }

    public getExtremity(reverse: boolean): number {
        return (reverse)?0:this._items.length -1;
    }
}


const collection = new WordsCollection();
collection.addItem('First');
collection.addItem('Second');
collection.addItem('Third');

const reverseIterator = collection.getReverseIterator();
while (reverseIterator.valid()) {
    console.log(reverseIterator.next());
}