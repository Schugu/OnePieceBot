import fetch from 'node-fetch';
import { generateEmbedMessage } from '../utils/showAllData/generateEmbedMessage.js';

export default {
  name: 'fruits',
  description: 'Shows a list of One Piece fruits with pagination',
  run: async (message) => {
    try {
      const url = 'https://api.api-onepiece.com/v2/fruits/en';
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch fruits from the API: ${response.statusText}`);
      }

      const fruits = await response.json();

      if (!fruits.length) {
        return message.reply('No fruits found.');
      }

      await generateEmbedMessage(fruits, message, 'Frutas One Piece');

    } catch (error) {
      console.error('Error fetching fruits:', error);
      message.reply('There was a problem fetching the fruits.');
    }
  },
};
