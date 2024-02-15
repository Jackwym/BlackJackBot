require('dotenv').config();
const {REST, Routes} = require('discord.js');

const commands = [
    {
        name: 'run',
        description: 'runs program',
    },
];

const rest = new REST({version: '10'}).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log("registering commands");

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), 
            {body: commands}
        )

        console.log("commands registered");
    } catch (error) {
        console.log('an error occured');
    }
})();