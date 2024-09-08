import fetch from 'node-fetch';
import { EmbedBuilder } from 'discord.js';
import { generateEmbedMessage } from '../utils/showSearchData/generateEmbedMessage.js';

const MAX_RETRIES = 3;
const API_URL = 'https://api.api-onepiece.com/v2/fruits/en';

const fetchFruitData = async (url, retries = MAX_RETRIES) => {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error('Error en la respuesta:', response.status, response.statusText);
      throw new Error('No se pudo obtener la información de la fruta.');
    }

    return await response.json();
  } catch (error) {
    if (retries > 0) {
      console.warn('Reintentando solicitud...', retries);
      return fetchFruitData(url, retries - 1);
    } else {
      throw error;
    }
  }
};

const formatCharacterMessage = (fruit) => `
  **Nombre**: ${fruit.name || 'No disponible'}
  **Roman Name**: ${fruit.roman_name || 'No disponible'}
  **Tipo**: ${fruit.type || 'No disponible'}
  **Descripción**: ${fruit.description || 'No disponible'}
`;

const formatIdNameChar = (fruit) => `**${fruit.id ?? 'X'}**: ${fruit.name || 'No disponible'}`;

export default {
  description: 'Busca información sobre una fruta',
  run: async (message, args) => {
    const fruitName = args.join(' ');

    if (!fruitName) {
      return message.reply('Por favor, proporciona el nombre de una fruta del diablo.');
    }

    try {
      const fruitData = await fetchFruitData(API_URL);

      if (!fruitData || fruitData.length === 0) {
        return message.reply('No se encontró información para la fruta especificada.');
      }

      const filteredFruits = fruitData.filter(fruit => 
        fruit.name.toLowerCase().includes(fruitName.toLowerCase())
      );

      if (filteredFruits.length === 0) {
        return message.reply('No se encontró información para la fruta especificada.');
      }

      if (filteredFruits.length === 1) {
        await message.reply({
          embeds: [new EmbedBuilder()
            .setTitle(`Información de la fruta: ${filteredFruits[0].name}`)
            .setColor('#ff4000')
            .setDescription(formatCharacterMessage(filteredFruits[0]))
            .setImage(filteredFruits[0].filename)
          ]
        });
      } else {
        await generateEmbedMessage(
          message,
          `Resultados para "${fruitName}"`,
          filteredFruits,
          formatIdNameChar
        );
      }
    } catch (error) {
      console.error('Error al obtener información:', error);
      message.reply('Hubo un problema al obtener la información de la fruta.');
    }
  }
};
