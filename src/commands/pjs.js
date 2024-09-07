import fetch from 'node-fetch';
import { generateEmbedMessage } from '../utils/showAllData/generateEmbedMessage.js';

export default {
  name: 'characters',
  description: 'Shows a list of One Piece characters with pagination',
  run: async (message) => {
    try {
      const url = 'https://api.api-onepiece.com/v2/characters/en';
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch characters from the API: ${response.statusText}`);
      }

      const characters = await response.json();

      if (!characters.length) {
        return message.reply('No characters found.');
      }

      await generateEmbedMessage(characters, message, 'Personajes One Piece');

    } catch (error) {
      console.error('Error fetching characters:', error);
      message.reply('There was a problem fetching the characters.');
    }
  },
};
