//To add time instance we use moment
const moment = require('moment');

function formatMsg(user, msg){
    return{user, msg, time:moment().format('h:mm a')}
}

//export for use in server, so that server can emit time.
module.exports = formatMsg;