const Discord = require("discord.js");
const { config } = require("dotenv");
const childProcess = require("child_process");
const path = require("path");
const fs = require("fs");

const client = new Discord.Client();
client.contactList = require("./contact_list.json");
const pepeEmojis = [];

config({
    path: __dirname + "/.env"
});

client.on("ready", () => {
    console.log("Online");

    client.user.setPresence({
        status: "online",
        activity: {
            type: "PLAYING",
            name: "my peepee | ;commands"
        }
    });

    client.emojis.cache.forEach(emoji => {
        if (emoji.name.toLowerCase().includes("pepe") || emoji.name.toLowerCase().includes("peepo")) {
            pepeEmojis.push(emoji.toString());
        }
    });
});

client.on("message", async message => {
    const prefix = ';';

    if (message.author.bot) return;
    if (message.author == client.users.cache.find(user => user.username.toLowerCase().includes("pmurt"))) {
        if (Math.round(Math.random) == 0) {
            message.channel.send("diam la");
            return;
        }
    } else if (message.author == client.users.cache.find(user => user.username.toLowerCase().includes("smiggie"))) {
        if (Math.round(Math.random) == 0) {
            message.channel.send("dame da yo");
            return;
        }
    }
    if (message.content.startsWith(prefix)) {
        var args = message.content.substring(1).split(' ');
        var cmd = args[0];
        var param = args[1];

        args = args.splice(1);

        // commands without parameter
        if (param == null) {
            switch (cmd) {
                // ;commands
                case 'commands':
                    message.channel.send("**List of commands:**\n" +
                        "\n*Without parameters:*\n" +
                        "`;roll` - rolls from 0-100\n" +
                        "\n*With parameters:*\n" +
                        "`;roll x` - rolls from 0-n\n" +
                        "`;roll x-y` - rolls from x-y\n" +
                        "`;tokenroll x1-y1,x2-y2,x3-y3,...,xn-yn` where x = name, y = amount of tokens:\n" +
                        "x will be allocated numbers based on the amount of tokens they have ranging from 1-totalTokens, " +
                        "then the bot rolls from 1-totalTokens\n" + 
                        "`;register x` where x is *phone number* preceded by country code (e.g. ;register +62811234234):\n " +
                        "registers your phone number so people can mention you in WhatsApp from Discord\n" +
                        "`;whatsapp x` where x is a *user* that you want to mention in WhatsApp (e.g ;whatsapp @RollerBot):\n" +
                        "sends a WhatsApp message from the bot to the user to notify them that you mentioned them in Discord\n");
                    break;
                // ;roll (default is 100)
                case 'roll':
                    var result = Math.round((Math.random() * 100) + 1);
                    message.channel.send('>>> Rolling from 1-100: ' + result);
                    break;
            }
        }
        // commands that require parameter
        else {
            switch (cmd) {
                case 'roll':
                    var count = 0, result, flag = false;

                    // roll x-y
                    if (param.includes('-')) {
                        var range = param.split('-');

                        // Validation
                        if (range.length != 2) {
                            message.channel.send(">>> You can only input `two` numbers.");
                            return;
                        }

                        try {
                            range.forEach(item => {
                                for (let index = 0; index < item.length; index++) {
                                    if (isNaN(parseInt(item[index]))) {
                                        message.channel.send(">>> You cannot input `letters` nor `symbols`.");
                                        flag = true;
                                        throw "";
                                    }
                                }
                            });
                        } catch { }
                        if (flag) {
                            return;
                        }

                        if (parseInt(range[0]) > parseInt(range[1])) {
                            message.channel.send(">>> The format should be $lowerBoundary-$upperBoundary.");
                            return;
                        }

                        // Sending message
                        result = Math.round((Math.random() * (parseInt(range[1]) - parseInt(range[0]))) + parseInt(range[0]));
                        message.channel.send('>>> Rolling from ' + parseInt(range[0]) +
                            '-' + parseInt(range[1]) + ': ' + result);
                    }
                    // roll x
                    else if (!isNaN(parseInt(param))) {
                        var flag = false;

                        try {
                            for (let index = 0; index < param.length; index++) {
                                if (isNaN(parseInt(param[index]))) {
                                    message.channel.send(">>> You cannot input `letters` nor `symbols`.");
                                    flag = true;
                                    throw "";
                                }
                            }

                        } catch { }
                        if (flag) {
                            return;
                        }

                        result = Math.round((Math.random() * param) + 1);
                        message.channel.send('>>> Rolling from 1-' + param + ': ' + result);
                    } else {
                        message.channel.send("You can only input `number/s`.");
                    }
                    break;

                // ;tokenroll name-token,name-token,name-token
                case 'tokenroll':
                    var result, totalToken = 0,
                        unavailableNumber = [],
                        assignedNumber = [],
                        pairing = param.split(',');
                    // get totalToken
                    pairing.forEach(pair => {
                        totalToken += parseInt(pair.split('-')[1]);
                    });

                    pairing.forEach(pair => {
                        var tokenAmount = pair.split('-')[1],
                            tokens = [];
                        for (let count = 1; count <= tokenAmount; count++) {
                            var number = Math.round((Math.random() * totalToken) + 1);
                            while (unavailableNumber.includes(number)) {
                                number = Math.round((Math.random() * totalToken) + 1);
                            }
                            tokens.push(number);
                        }
                        assignedNumber.push(tokens);
                    })

                    function tokenAssignment() {
                        var value = '',
                            index = 0;
                        pairing.forEach(pair => {
                            value += pair.split('-')[0] + ': ' + assignedNumber[index] + '\n';
                            index++;
                        });
                        return value;
                    }

                    result = Math.round((Math.random() * totalToken) + 1);
                    message.channel.send('>>> Numbers assigned:\n' + tokenAssignment() +
                        '\nRolling from 1-' + totalToken + ': ' + result);
                    break;
                // ;whatsapp
                case 'whatsapp':
                    var receiver = message.mentions.users.first();
                    childProcess.fork(path.join(__dirname, "send-whatsapp.js"), [message.author.username, receiver.id]);
                    // childProcess.fork(path.join(__dirname, "send-whatsapp.js"));
                    break;
                // ;register
                case 'register':
                    var senderId = message.author.id;
                    client.contactList[message.author.id] = {
                        number: param
                    }
                    fs.writeFile("./contact_list.json", JSON.stringify(client.contactList, null, 4), err => {
                        if (err) throw err;
                        message.channel.send("number registered");
                    })
            }
        }
    }
});

client.login(process.env.DISCORD_TOKEN);