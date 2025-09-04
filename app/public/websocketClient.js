const ws = new WebSocket('ws://localhost:8080')
ws.onopen = () => {
        console.log("WebSocket active\n");
};

/**
 * @param {MessageEvent<string>} message 
 */
ws.onmessage = (message) =>{
        const {event:event,payload:payload} = JSON.parse(message.data)
        switch(event){
                case "RELOAD":
                        location.reload();
                        console.log(payload);
                break;
                default:
                        console.error(`unknow event: "${event}" with payload: ${payload}`)
        }
}