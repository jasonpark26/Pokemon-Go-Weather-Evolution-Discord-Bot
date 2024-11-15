require('dotenv').config();
const {Client, IntentsBitField} = require('discord.js');
const fetch = require('node-fetch');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ]
});

const APIKey = process.env.OPENWEATHER_API_KEY;

// Define the Pokémon evolution data
class Pokemon {
    constructor(name, candy, time, weather) {
        this.name = name;
        this.candy = candy;
        this.time = time;
        this.weather = weather;
    }
}

const pokemonList = [
    new Pokemon('Tyrunt', 50, 'day', 'any'),
    new Pokemon('Yungoos', 50, 'day', 'any'),
    new Pokemon('Fomantis', 50, 'day', 'any'),
    new Pokemon('Cosmoem (Solgaleo)', 100, 'day', 'any'),
    new Pokemon('Rockruff (Day)', 50, 'day', 'any'),
    new Pokemon('Eevee (Espeon)', 25, 'day', 'any'),
    new Pokemon('Sneasal (Hisuanian)', 50, 'day', 'any'),
    new Pokemon('Amaura', 50, 'night', 'any'),
    new Pokemon('Cosmoem (Lunala)', 100, 'night', 'any'),
    new Pokemon('Rockruff (Night)', 50, 'night', 'any'),
    new Pokemon('Eevee (Umbreon)', 25, 'night', 'any'),
    new Pokemon('Sliggoo', 100, 'any', 'rain')
];

// Define regional Pokémon data
const regionalPokemon = {
    "North America": ["Tauros", "Heracross", "Carnivine"],
    "South America": ["Heracross", "Corsola"],
    "Europe": ["Mr. Mime", "Pachirisu"],
    "Asia": ["Farfetch'd", "Pachirisu", "Chatot"],
    "Africa": ["Tropius", "Corsola"],
    "Australia": ["Kangaskhan", "Chatot"],
    "Middle East": ["Sigilyph"],
    "New Zealand": ["Relicanth"],
};

// Helper function to map country to region
function getRegionByCountry(country) {
    const regions = {
        "US": "North America",
        "CA": "North America",
        "MX": "North America",
        "BR": "South America",
        "AR": "South America",
        "FR": "Europe",
        "DE": "Europe",
        "JP": "Asia",
        "KR": "Asia",
        "IN": "Asia",
        "ZA": "Africa",
        "EG": "Africa",
        "AU": "Australia",
        "NZ": "New Zealand",
        "AE": "Middle East",
        "IL": "Middle East",
    };
    return regions[country] || "Unknown";
}


// Utility function to check if it's day or night based on the local time
function isDay(time) {
    const hour = time.getHours();
    return hour >= 8 && hour < 20;
}

function getUTCTime (shiftInSeconds) {

    date = new Date()
    localTime = date.getTime()
    localOffset = date.getTimezoneOffset() * 60000
    utc = localTime + localOffset
    var searchedTime = utc + (1000 * shiftInSeconds)
    newDate = new Date(searchedTime)

    return newDate;
}

// When the bot is ready
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});
/*
// Listen for messages
client.on('messageCreate', async message => {
    if (!message.content.startsWith('!weather') || message.author.bot) return;

    const args = message.content.split(' ');
    const city = args.slice(1).join(' ');

    if (!city) {
        return message.reply('Please provide a city name.');
    }

    try {
        // Fetch weather data
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${APIKey}`);
        const data = await response.json();

        if (data.cod === '404') {
            return message.reply(`City "${city}" not found.`);
        }

        // Extract relevant weather data
        const { main: { temp, humidity }, weather, timezone } = data;
        const weatherDescription = weather[0].description;
        const weatherType = weather[0].main;
        const localTime = getUTCTime(timezone);
        const day = isDay(localTime);

        // Filter Pokémon based on time of day and weather conditions
        const evolvablePokemon = pokemonList.filter(pokemon => {
            if (pokemon.time === 'any' && pokemon.weather === weatherType.toLowerCase()) return true;
            if (day && pokemon.time === 'day' && pokemon.weather === 'any') return true;
            if (!day && pokemon.time === 'night' && pokemon.weather === 'any') return true;
            return pokemon.weather === weatherType.toLowerCase();
        });

        // Generate message with weather and Pokémon details
        let replyMessage = `**Weather in ${city}**\nTemperature: ${temp}°C\nDescription: ${weatherDescription}\nHumidity: ${humidity}%\nLocal Time: ${localTime.toLocaleTimeString()}\n\n**Pokémon that can evolve now:**\n`;

        if (evolvablePokemon.length > 0) {
            evolvablePokemon.forEach(pokemon => {
                replyMessage += `- ${pokemon.name} (Candy: ${pokemon.candy})\n`;
            });
        } else {
            replyMessage += 'No Pokémon can evolve at the moment based on the current conditions.';
        }

        message.channel.send(replyMessage);
    } catch (error) {
        console.error(error);
        message.reply('An error occurred while fetching the weather data. Please try again later.');
    }
});
*/
// Listen for messages
client.on('messageCreate', async message => {
    if (message.author.bot) return;

    const args = message.content.split(' ');
    const command = args[0].toLowerCase();
    const city = args.slice(1).join(' ');

    if (!city) {
        return message.reply('Please provide a city name.');
    }

    try {
        // Fetch weather data
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${APIKey}`);
        const data = await response.json();

        if (data.cod === '404') {
            return message.reply(`City "${city}" not found.`);
        }

        // Extract relevant weather data
        const { main: { temp, humidity }, weather, timezone } = data;
        const weatherDescription = weather[0].description;
        const weatherType = weather[0].main;
        const localTime = getUTCTime(timezone);
        const day = isDay(localTime);

        if (command === '!weather') {
            // Filter Pokémon based on time of day and weather conditions
            const evolvablePokemon = pokemonList.filter(pokemon => {
                if (pokemon.time === 'any' && pokemon.weather === weatherType.toLowerCase()) return true;
                if (day && pokemon.time === 'day' && pokemon.weather === 'any') return true;
                if (!day && pokemon.time === 'night' && pokemon.weather === 'any') return true;
                return pokemon.weather === weatherType.toLowerCase();
            });

            // Generate message with weather and Pokémon details
            let replyMessage = `**Weather in ${city}**\nTemperature: ${temp}°C\nDescription: ${weatherDescription}\nHumidity: ${humidity}%\nLocal Time: ${localTime.toLocaleTimeString()}\n\n**Pokémon that can evolve now:**\n`;

            if (evolvablePokemon.length > 0) {
                evolvablePokemon.forEach(pokemon => {
                    replyMessage += `- ${pokemon.name} (Candy: ${pokemon.candy})\n`;
                });
            } else {
                replyMessage += 'No Pokémon can evolve at the moment based on the current conditions.';
            }

            message.channel.send(replyMessage);

        } else if (command === '!regional') {
            // Get the country code and region for regional Pokémon
            const country = data.sys.country;
            const region = getRegionByCountry(country);

            // Find regional Pokémon for the identified region
            let replyMessage = `**Regional Pokémon available in ${region}:**\n`;
            const regionPokemon = regionalPokemon[region];

            if (regionPokemon && regionPokemon.length > 0) {
                regionPokemon.forEach(pokemon => {
                    replyMessage += `- ${pokemon}\n`;
                });
            } else {
                replyMessage += 'No regional Pokémon data available for this region.';
            }

            message.channel.send(replyMessage);
        }
    } catch (error) {
        console.error(error);
        message.reply('An error occurred while fetching the data. Please try again later.');
    }
});

client.login(process.env.TOKEN);