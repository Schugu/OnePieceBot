import { EmbedBuilder } from 'discord.js';
import fetch from 'node-fetch';

const API_KEY = process.env.GIPHY_API_KEY; 
const BASE_URL = 'https://api.giphy.com/v1/gifs/search';
const LIMIT = 1; 

export default {  
  description: 'Busca un gif.',
  run: async (message, args) => {
    try {
      const url = `${BASE_URL}?api_key=${API_KEY}&q=${encodeURIComponent(args)}&limit=${LIMIT}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.data.length === 0) {
        return message.reply('No se encontraron GIFs para tu búsqueda.');
      }

      const gif = data.data[0]; 

      const embed = new EmbedBuilder()
        .setTitle('GIF encontrado:')
        .setColor('#ff4000')
        .setImage(gif.images.original.url)
        .setURL(gif.url)
        .setFooter({ text: `Búsqueda realizada con Giphy` });

      await message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error al buscar GIFs:', error);
      message.reply('Hubo un problema al obtener GIFs.');
    }
  }
};

