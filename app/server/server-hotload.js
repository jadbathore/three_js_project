import net from 'net'
import http from 'http'
import{ RequestParser, ResponseParser }from '../../_types/app/model/server/headParser.js'
// import { Utils } from 'utils/Utils'

const client = net.createConnection({port:3000},(socket)=>{
    const request = {

    }
    const header = [
        'GET / HTTP/1.1',
        'Host: localhost',
        'Connection: Upgrade',
        'Upgrade: tree-for-three',
        '',
        '',
    ].join('\r\n')

    const test = [
        'GET / HTTP/1.1',
        'Host: localhost',
        'Connection: Upgrade',
        'Upgrade: tree-fo-three',
        '',
        '',
    ].join('\r\n')
    client.write(header)
})


client.on('data', (data) => {
    // const parser = new ResponseParser(data.toString())
    // const header = {
    //     host: 'localhost',
    //     method: 'GET',
    //     protocole: 'HTTP/1.1',
    //     path:'/'
    // }
    // const headers = {
    //     code: 200,
    //     host: 'localhost',
    //     method: 'GET',
    //     protocole: 'HTTP/1.1'
    // }
    console.log('connection')

    // console.log(new RequestParser(header,headers).request)
    // console.log('pro '+parser.protocole)
    // console.log('code '+parser.code)
    // console.log('header ',parser.headers)
    // console.log('message '+parser.message)
    // console.log('body '+parser.body)
    // console.log(parser.body)
});

// client.on('connect',()=>{
//     console.log('connection')
// })

client.on('end', () => {
    console.log('Déconnecté du serveur');
});

