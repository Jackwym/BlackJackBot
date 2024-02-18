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

const numDecks = 6;
const decks = [];
const cardNames = ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Jack", "Queen", "King"];
const cardSuits = ["Hearts", "Diamonds", "Spades", "Clubs"];
for (var i = 0; i < numDecks; i++) {
    for (var j = 0; j < 13; j++) {
        for (var k = 0; k < 4; k++) {
            decks.push(cardNames[j] + " of " + cardSuits[k]);
        }
    }
}
var dealerHand = []; // [card number][card descriptor]
var numPlayers = 0;
var playerHands = []; // [player number][card pair]
const playersStood = [];
const playersEntered = [];
const playersDoubledDown = [];
const bets = [];
const playersInsured = [];
const insuranceBets = [];
var takingBets = false;
var activeHand = false;
var insurance = false;
var curPlayer = 0;
var dealerProfit = 50;

client.on('ready', (c) => {
    console.log("Blackjack is running...");
})

client.on('messageCreate', (msg) => {
    // start hand
    if (msg.content === 'stop taking bets' || msg.content === 'stop' || msg.content === 'done') {
        if (activeHand) return;
        takingBets = false;
        for (var i = 0; i < numPlayers; i++) {
            var card1Pos = [Math.floor(Math.random() * decks.length)];
            var card2Pos = [Math.floor(Math.random() * decks.length)];
            while (card2Pos === card1Pos) {
                card2Pos = [Math.floor(Math.random() * decks.length)];
            }
            playerHands.push([decks[card1Pos], decks[card2Pos]]);
            decks.splice(card1Pos, 1);
            if (card1Pos > card2Pos) decks.splice(card2Pos, 1);
            else decks.splice(card2Pos - 1, 1);
        }
        for (var i = 0; i < numPlayers; i++) {
            playersStood.push(false);
        }
        for (var i = 0; i < numPlayers; i++) {
            playersDoubledDown.push(false);
        }
        for (var i = 0; i < numPlayers; i++) {
            msg.reply(playersEntered[i] + " has the " + playerHands[i][0] + " and the " + playerHands[i][1]);
        }
        msg.reply("And I've got the " + dealerHand[0]);
        if (dealerHand[0].substring(0, dealerHand[0].indexOf(" ")) === 'Ace') {
            insurance = true;
            msg.reply("Would anybody like to bet on insurance?");
            return;
        }
        activeHand = true;
        msg.reply("No more bets will be taken! The game begins now! What would you like to do " + playersEntered[0] + "?");
    }

    // insurance stopping
    if (msg.content === 'no' || msg.content === 'stop taking insurance') {
        if (activeHand) return;
        activeHand = true;
        msg.reply("No more bets will be taken! The game begins now! What would you like to do " + playersEntered[0] + "?");
    }

    // insurance bet (bug -> should check for integers only)
    if (insurance) {
        if (msg.author.bot) return;
        for (var i = 0; i < numPlayers; i++) {
            if (msg.author.globalName === playersEntered[i]) return;
        }
        playersInsured.push(msg.author.globalName);
        insuranceBets.push(msg.content);
    }

    // handle bets (bug -> should check for integers only)
    if (takingBets) {
        if (msg.author.bot) return;
        for (var i = 0; i < numPlayers; i++) {
            if (msg.author.globalName === playersEntered[i]) return;
        }
        playersEntered.push(msg.author.globalName);
        bets.push(msg.content);
        numPlayers++;
    }

    // player gets another card / checks for a bust
    if (msg.content === 'hit') {
        if (!activeHand) return;
        var cardPos = [Math.floor(Math.random() * decks.length)];
        playerHands[curPlayer].push(decks[cardPos]);
        decks.splice(cardPos, 1);
        var sum = 0;
        for (var i = 0; i < playerHands[curPlayer].length; i++) {
            sum += cardValue(playerHands[curPlayer][i].substring(0, playerHands[curPlayer][i].indexOf(" ")), true)
        }
        console.log(sum);
        if (sum > 21) {
            msg.reply("Oops! You busted. How unfortunate.");
            dealerProfit += bets[curPlayer];
            bets[curPlayer] = 0;
            curPlayer++;
            if (curPlayer == numPlayers) {
                msg.reply("All players have gone! lets see how this game will end...");
                activeHand = false;
                return;
            }
            if (playersEntered[curPlayer] === playersEntered[curPlayer - 1]) {
                msg.reply("What would you like to do with your second hand, " + playersEntered[0] + "?");
            }
            else {
                msg.reply("What would you like to do, " + playersEntered[0] + "?");
            }
        } else if (sum < 21){
            msg.reply("You drew the " + playerHands[curPlayer][playerHands[curPlayer].length - 1] + " and still under 21! What would you like to do now?");
        } else {
            msg.reply("You drew the " + playerHands[curPlayer][playerHands[curPlayer].length - 1] + " and are at 21! What would you like to do now?");
        }
    }

    // hand moves to the next player
    if (msg.content === 'stand') {
        if (!activeHand) return;
        curPlayer++;
        if (curPlayer == numPlayers) {
            msg.reply("All players have gone! lets see how this game will end...");
            activeHand = false;
            return;
        }
        msg.reply("All right, onto the next player! What would you like to do " + playersEntered[curPlayer] + "?");
    }

    // player creates a new hand / new player added (as themselves)
    if (msg.content === 'split') {
        if (!activeHand) return;
        if (playerHands[curPlayer].length !== 2) {
            msg.reply("It's too late to split! What would you like to do?");
            return;
        }
        if (playerHands[curPlayer][0].substring(0, playerHands[curPlayer][0].indexOf(" ")) !== 
            playerHands[curPlayer][1].substring(0, playerHands[curPlayer][1].indexOf(" ")) ) {
            msg.reply("You need the same denomination of cards to split. What would you like to do?");
            return;
        }
        numPlayers++;
        var newBet = bets[curPlayer]; // new bet had to be made to point to a different space in memory
        bets.splice(curPlayer, 0, newBet);
        playersEntered.splice(curPlayer, 0, playersEntered[curPlayer]);

        var newHand = [playerHands[curPlayer][1]]; // new hand had to be made to point to a different space in memory
        playerHands.splice(curPlayer + 1, 0, newHand);
        playerHands[curPlayer].pop();

        msg.reply("You're cards are now split, what would you like to do now " + playersEntered[curPlayer] + "?");
    }

    // player draws one card / is revealed and handled at the end of the game
    if (msg.content === 'double down') {
        if (!activeHand) return;
        if (playerHands[curPlayer].length !== 2) {
            msg.reply("It's too late to double down! What would you like to do?");
            return;
        }
        var value = cardValue(playerHands[curPlayer][0].substring(0, playerHands[curPlayer][0].indexOf(" ")), true) + 
        cardValue(playerHands[curPlayer][1].substring(0, playerHands[curPlayer][1].indexOf(" ")), true);
        if (value > 11 || value < 9) {
            msg.reply("You need a sum of 9, 10, or 11 to double down. What would you like to do?");
            return;
        }
        var cardPos = [Math.floor(Math.random() * decks.length)];
        playerHands[curPlayer].push(decks[cardPos]);
        decks.splice(cardPos, 1);
        playersDoubledDown[curPlayer] = true;
        curPlayer++;
        console.log(playerHands[curPlayer]);
        if (curPlayer == numPlayers) {
            msg.reply("All players have gone! lets see how this game will end...");
            activeHand = false;
            return;
        }
    }

    // start bet taking
    if (msg.content === 'start game' || msg.content === 'start' || msg.content === 'run') {
        msg.reply('Ready for a game of Blackjack? Taking bets now!');
        for (var i = 0; i < 2; i++) {
            var cardPos = [Math.floor(Math.random() * decks.length)];
            dealerHand.push(decks[cardPos]);
            decks.splice(cardPos, 1);
        }
        takingBets = true;
    }

    // dealer turn
    if (!activeHand && curPlayer !== 0) {

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
impliment "split" - DONE
impliment double down - DONE
if the dealer gets a blackjack, the hand should be over (and players with blackjack take up their bet)
impliment dealers turn
impliment naturals
impliment dealer-ace rule (insurance)
6 decks - DONE
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