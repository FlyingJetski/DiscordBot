const { config } = require("dotenv");
const fs = require("fs");

config({
    path: __dirname + "/.env"
});

const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
client.contactList = require("./contact_list.json");
var sender = process.argv[2];
var receiver = process.argv[3];
var receiverNumber = client.contactList[receiver].number;

client.messages.create({
    from: 'whatsapp:' + process.env.TWILIO_NUMBER,
    to: 'whatsapp:' + receiverNumber,
    body: 'Hello, ' + sender + " tagged you in discord!"
}).then(message => console.log(message.sid));