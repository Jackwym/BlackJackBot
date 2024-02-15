require('dotenv').config();

const {Client, IntentsBitField} = require("discord.js");

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ]
})

const cardNames = ["Ace", "Two"];
const cardSuits = ["Hearts", "Diamonds"];
var dealerHand = [[]];
var playerHands = [[[]]];
const numPlayers = 1;

client.on('ready', (c) => {
    console.log("Black Jack is ready");
})

client.on('messageCreate', (msg) => {
    if (msg.content === 'test') {
        msg.reply('running');
    }

    if (msg.content === 'start game') {
        msg.reply('starting BlackJack');
        for (var i = 0; i < 2; i++) {
            playerHand[i][0] = cardNames[Math.random() * 2];
            playerHand[i][1] = cardSuits[Math.random() * 2];
        }
        for (var i = 0; i < numPlayers; i++) {
            for (var j = 0; j < 2; j++) {
                playerHand[i][j][0] = cardNames[Math.random() * 2];
                playerHand[i][j][1] = cardSuits[Math.random() * 2];
            }
        }
        msg.reply(playerHands[0][0][0] + " of " + playerHands[0][0][1]);
    }
})

client.login(process.env.TOKEN);