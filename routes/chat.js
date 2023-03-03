var express = require('express');
var router = express.Router();


router.ws('/chat', function(ws, req) {
    ws.on('message', function(msg) {
        ws.send('received msg', msg);
    });
});
  
module.exports = router;
