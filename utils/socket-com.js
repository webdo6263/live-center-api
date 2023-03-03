const users = []
const messages = []
const WebSocket = require('ws');

const initialize = (httpsServer) => {
    const isMessageValid = (message) => {
        return new Promise((resolve, reject) => {
           if(message.includes('spam')) {
            reject('The text contains spam')    
           } else {
            resolve()    
           }
        })
    }
    
    const addMessage = ({userIp, text, displayName}) => {
        messages.push({
            userIp,
            text,
            displayName,
            createdAt: new Date().toISOString()
        })
    }
    
    const sendMessage  = (message) => {
        users.forEach((user) => {
            user.ws.send(JSON.stringify(message));
        });
    };
    
    const wss = new WebSocket.Server(
      { server: httpsServer }, 
      () => {
        console.log('Web Socket started on port 3020')
      }
    );
    wss.on('connection', function connection(ws) {
      users.push({
        ws
      });
      sendMessage({
        type: 'all-msgs',
        messages
    });
    
      ws.on('message', function incoming(rawData) {
        const data = JSON.parse(rawData.toString())
        switch(data?.type) {
            case 'add-msg': {
                isMessageValid(data.text)
                    .then(() => {
                        console.log('successfuly added')
                        addMessage(data);
                        sendMessage({
                            type: 'all-msgs',
                            messages
                        });
                    })
                    .catch(err => {
                        console.log('successfuly failed', err)
                        sendMessage({
                            type: 'add-failed',
                            reason: err
                        });
                    });
                
                break;
            }
            default: {
                console.log('invalid data type', data?.type)
            }
        }
        // wss.clients.forEach(function each(client) {
        //   if (client !== ws && client.readyState === WebSocket.OPEN) {
        //     client.send(data);
        //   }
        // });
      });
    });
};

module.exports ={
    initialize
};

