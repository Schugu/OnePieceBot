import { Client, Events } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  intents: 53608447
});

client.on(Events.ClientReady, () => {
  console.log(`Conectado como ${client.user.username}!`);
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith('!')) return;

  const args = message.content.slice(1).split(' '); 
  const commandName = args[0].toLowerCase(); 

  try {
    const command = await import(`./commands/${commandName}.js`);
    command.default.run(message, args.slice(1)); // Pasar los argumentos restantes a la función `run`
  } catch (error) {
    console.log(`Ha ocurrido un error al utilizar el comando ${commandName}:`, error.message);
    message.reply(`No puedo ejecutar el comando ${commandName}. ¿Está escrito correctamente?`);
  }
});



client.login(process.env.BOT_TOKEN);