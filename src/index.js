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
var numPlayers = 0;
var playerHands = []; // [player number][card pair][card denomination]
const playersStood = [];
const playersEntered = [];
const bets = [];
var takingBets = false;
var activeHand = false;
var curPlayer = 0;
var dealerProfit = 50;

client.on('ready', (c) => {
    console.log("Blackjack is running...");
})

client.on('messageCreate', (msg) => {
    if (msg.content === 'stop taking bets' || msg.content === 'stop' || msg.content === 'done') {
        takingBets = false;
        activeHand = true;
        // playersEntered.splice(0, 1);
        // numPlayers--;
        for (var i = 0; i < numPlayers; i++) {
            playerHands.push([[cardNames[Math.floor(Math.random() * 13)], cardSuits[Math.floor(Math.random() * 4)]], 
            [cardNames[Math.floor(Math.random() * 13)], cardSuits[Math.floor(Math.random() * 4)]]]);
            console.log(playerHands[i][0][0] + playerHands[i][0][1] + playerHands[i][1][0] + playerHands[i][1][1]);
        
        }
        for (var i = 0; i < numPlayers; i++) {
            playersStood.push(false);
        }
        for (var i = 0; i < numPlayers; i++) {
            msg.reply(playersEntered[i] + " has the " + 
            playerHands[i][0][0] + " of " + playerHands[i][0][1] + " and the " + 
            playerHands[i][1][0] + " of " + playerHands[i][1][1]);
        }
        msg.reply("No more bets will be taken! The game begins now! What would you like to do " + playersEntered[0] + "?");
    }

    if (takingBets) {
        if (msg.author.bot) return;
        for (var i = 0; i < numPlayers; i++) {
            if (msg.author.globalName === playersEntered[i]) return;
        }
        playersEntered.push(msg.author.globalName);
        bets.push(msg.content);
        numPlayers++;
    }

    if (msg.content === 'hit') {
        playerHands[curPlayer].push([cardNames[Math.floor(Math.random() * 13)], cardSuits[Math.floor(Math.random() * 4)]]);
        var sum = 0;
        for (var i = 0; i < playerHands[curPlayer].length; i++) {
            sum += cardValue(playerHands[curPlayer][i][0], true);
        }
        console.log(sum);
        if (sum > 21) {
            msg.reply("Oops! You busted. How unfortunate.");
            dealerProfit += bets[curPlayer];
            bets[curPlayer] = 0;
            curPlayer++;
            if (playersEntered[curPlayer] === playersEntered[curPlayer - 1]) {
                msg.reply("What would you like to do with your second hand, " + playersEntered[0] + "?");
            }
            else {
                msg.reply("What would you like to do, " + playersEntered[0] + "?");
            }
            if (curPlayer == numPlayers) {
                msg.reply("All players have gone! lets see how this game will end...");
                return;
            }
        } else if (sum < 21){
            msg.reply("You drew the " + playerHands[curPlayer][playerHands[curPlayer].length - 1][0] + " of " 
            + playerHands[curPlayer][playerHands[curPlayer].length - 1][1] + " and still under 21! what would you like to do now?");
        } else {
            msg.reply("You drew the " + playerHands[curPlayer][playerHands[curPlayer].length - 1][0] + " of " 
            + playerHands[curPlayer][playerHands[curPlayer].length - 1][1] + " and are at 21! what would you like to do now?");
        }
    }

    if (msg.content === 'stand') {
        curPlayer++;
        if (curPlayer == numPlayers) {
            msg.reply("All players have gone! lets see how this game will end...");
            return;
        }
        msg.reply("All right, onto the next player! What would you like to do " + playersEntered[curPlayer] + "?");
    }

    if (msg.content === 'split') {
        if (playerHands[curPlayer].length !== 2) {
            msg.reply("It's too late to split! What would you like to do?");
            return;
        }
        if (playerHands[curPlayer][0][0] !== playerHands[curPlayer][1][0]) {
            msg.reply("You need the same denomination of cards to split. What would you like to do?");
            console.log(playerHands[curPlayer][0][0]);
            console.log(playerHands[curPlayer][1][0]);
            return;
        }
        numPlayers++;
        var newBet = bets[curPlayer]; // new bet had to be made to point to a different space in memory
        bets.splice(curPlayer, 0, newBet);
        playersEntered.splice(curPlayer, 0, playersEntered[curPlayer]);

        var newHand = [playerHands[curPlayer][0], playerHands[curPlayer][1]]; // new hand had to be made to point to a different space in memory
        playerHands.splice(curPlayer, 0, newHand);

        playerHands[curPlayer].pop();
        playerHands[curPlayer + 1].shift();

        msg.reply("You're cards are now split, what would you like to do now " + playersEntered[curPlayer] + "?");
    }

    if (msg.content === 'start game' || msg.content === 'start' || msg.content === 'run') {
        msg.reply('Ready for a game of Blackjack? Taking bets now!');
        for (var i = 0; i < 2; i++) {
            dealerHand.push([cardNames[Math.floor(Math.random() * 13)], cardSuits[Math.floor(Math.random() * 4)]]);
        }
        takingBets = true;
    }
})

client.login(process.env.TOKEN);

function cardValue(c, soft) {
    if (soft && c === 'Ace') return 1;
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

print all players cards after bets are stopped - DONE
impliment "hit" (if all cards added up is greater than 21 post-hit, bets[curPlayer] = 0 and goes to dealer) - DONE
impliment double down
if the dealer gets a blackjack, the hand should be over (and players with blackjack take up their bet)
impliment naturals
impliment dealer-ace rule (insurance)
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
insurance: if the dealers face up card is an ace, the players may bet up to half of their 
    original bet, if the dealer has a Blackjack, the player gets double of their insurance and 
    loses their hand bet. if not, the user loses insurance and keeps playing the hand as normal
*/