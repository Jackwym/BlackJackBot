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
var dealerHand = []; // [card number][card descriptor]
const numPlayers = 1;
var playerHands = []; // [player number][card number][card descriptor]
const playersStood = []
for (var i = 0; i < numPlayers; i++) {
    playersStood.push(false);
}

client.on('ready', (c) => {
    console.log("bot is running");
})

client.on('messageCreate', (msg) => {
    if (msg.content === 'test') {
        msg.reply('running');
    }
    
    if (msg.content === 'start game') {
        msg.reply('starting BlackJack');
        msg.reply('test reply');
        for (var i = 0; i < 2; i++) {
            dealerHand.push([cardNames[Math.floor(Math.random() * 13)], cardSuits[Math.floor(Math.random() * 4)]]);
        }
        for (var i = 0; i < numPlayers; i++) {
            for (var j = 0; j < 2; j++) {
                playerHands.push([[cardNames[Math.floor(Math.random() * 13)]], [cardSuits[Math.floor(Math.random() * 4)]]]);
            }
        }
        for (var p = 0; p < numPlayers; p++) {
            while(!playersStood[p]) {
                msg.reply("You have the " + playerHands[p][0][0] + " of " + playerHands[p][0][1] + " and the "
                + playerHands[p][1][0] + " of " + playerHands[p][1][1]);
                msg.reply('would you like to stand?');
                client.on('messageCreate', (msg2) => {
                    if (msg2 === 'stand') playersStood[p] = true;
                })
            }
        }
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

/*
Black Jack rules:
all players have two face up cards, and the dealer has one face down
ace + ten card = natural
if a player has a natural, the dealer gives him 1.5 times his bet
if the dealer has a natural, he collects all bets from the players who dont have a natural (players with a natural take back their bets)
player hits for more cards until they stay or bust (bust leads to dealer collecting bet)
ace + not a ten = soft hand (player decides if the ace is a 11 or 1) (program should choose the better option)
dealer should draw until the sum is at or above 17 (aces are 11) 
if a player has two of the same number card, the can split and must match their bet from their first hand (program can treat it as two people)
doubling down is only possible when the sum is 9, 10, or 11
doubling down: player doubles bet and is dealt one more card (card is revealed at the end of the hand)
*/