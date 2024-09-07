import fetch from 'node-fetch';
import { generateEmbedMessage } from '../utils/showAllData/generateEmbedMessage.js';

export default {
  name: 'crews',
  description: 'Mostrar todas las crews con paginación.',
  run: async (message) => {
    try {
      const url = 'https://api.api-onepiece.com/v2/crews/en';
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error al obtener las crews: ${response.statusText}`);
      }

      const crews = await response.json();

      if (!crews.length) {
        return message.reply('No se encontraron crews.');
      }

      await generateEmbedMessage(crews, message, 'Crews One Piece');

    } catch (error) {
      console.error('Error fetching characters:', error);
      message.reply('There was a problem fetching the characters.');
    }
  },
};
