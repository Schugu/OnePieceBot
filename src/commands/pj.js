import fetch from 'node-fetch';
import { EmbedBuilder } from 'discord.js';
import { generateEmbedMessage } from '../utils/showSearchData/generateEmbedMessage.js';

const MAX_RETRIES = 3;

const fetchCharacterData = async (url, retries = MAX_RETRIES) => {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error('Error en la respuesta:', response.status, response.statusText);
      throw new Error('No se pudo obtener la información del personaje.');
    }

    return await response.json();
  } catch (error) {
    if (retries > 0) {
      console.warn('Reintentando solicitud...', retries);
      return fetchCharacterData(url, retries - 1);
    } else {
      throw error;
    }
  }
};

const formatCharacterMessage = (character) => `
  **Nombre**: ${character.name || 'No disponible'}
  **Altura**: ${character.size || 'No disponible'}
  **Edad**: ${character.age || 'No disponible'}
  **Recompensa**: ${character.bounty || 'No disponible'}
  **Tripulación**: ${character.crew ? character.crew.name : 'No disponible'}
  **Fruta del diablo**: ${character.fruit ? character.fruit.name : 'No disponible'}
  **Ocupación**: ${character.job || 'No disponible'}
  **Estado**: ${character.status || 'No disponible'}
`;

const formatIdNameChar = (character) => `**${character.id ?? 'X'}**: ${character.name || 'No disponible'}`;

export default {
  description: 'Busca información sobre un personaje',
  run: async (message, args) => {
    const characterName = args.join(' ');

    if (!characterName) {
      return message.reply('Por favor, proporciona el nombre de un personaje.');
    }

    try {
      const url = `https://api.api-onepiece.com/v2/characters/en/search?name=${encodeURIComponent(characterName)}`;
      const characterData = await fetchCharacterData(url);

      if (!characterData || characterData.length === 0) {
        return message.reply('No se encontró información para el personaje especificado.');
      }

      if (characterData.length === 1) {
        await message.reply({
          embeds: [new EmbedBuilder()
            .setTitle(`Información del personaje: ${characterData[0].name}`)
            .setColor('#ff4000')
            .setDescription(formatCharacterMessage(characterData[0]))
          ]
        });
      } else {
        await generateEmbedMessage(
          message,
          `Resultados para "${characterName}"`,
          characterData,
          formatIdNameChar
        );
      }
    } catch (error) {
      console.error('Error al obtener información:', error);
      message.reply('Hubo un problema al obtener la información del personaje.');
    }
  }
};
