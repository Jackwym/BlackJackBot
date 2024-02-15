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

const cardNames = ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Jack", "Queen", "King"];
const cardSuits = ["Hearts", "Diamonds", "Spades", "Clubs"];
var dealerHand = [[]];
var playerHands = [[[]]];
const numPlayers = 1;

client.on('ready', (c) => {
    console.log("bot is ready");
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
        msg.reply(playerHands[0][1][0] + " of " + playerHands[0][1][1]);
    }
})

client.login(process.env.TOKEN);

function cardValue(c) {
    switch(c) {
        case 'Ace':
            return 11;
            break;
        case 'Two':
            return 2;
            break;
        case 'Three':
            return 3;
            break;
        case 'Four':
            return 4;
            break;
        case 'Five':
            return 5;
            break;
        case 'Six':
            return 6;
            break;
        case 'Seven':
            return 7;
            break;
        case 'Eight':
            return 8;
            break;
        case 'Nine':
            return 9;
            break;
        case 'Ten':
            return 10;
            break;
        case 'Jack':
            return 10;
            break;
        case 'Queen':
            return 10;
            break;
        case 'King':
            return 10;
            break;
    }
}

/*
list of implimentations:

impliment multiple user server (includes talking to one user at a time)
take bets and calculate results
6 decks
*/