import fetch from 'node-fetch';
import { EmbedBuilder } from 'discord.js';
import { generateEmbedMessage } from '../utils/showSearchData/generateEmbedMessage.js';

const MAX_RETRIES = 3;

const fetchCrewData = async (url, retries = MAX_RETRIES) => {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error('Error en la respuesta:', response.status, response.statusText);
      throw new Error('No se pudo obtener la información de la crew.');
    }

    let data = await response.json();

    // Filtrar arrays vacíos del JSON
    data = data.filter(item => Array.isArray(item) ? item.length > 0 : true);

    return data;
  } catch (error) {
    if (retries > 0) {
      console.warn('Reintentando solicitud...', retries);
      return fetchCrewData(url, retries - 1);
    } else {
      throw error;
    }
  }
};

const formatCrewMessage = (crew) => `
  **Nombre**: ${crew.name || 'No disponible'}
  **Estado**: ${crew.status || 'No disponible'}
  **Yonko**: ${crew.is_yonko ? 'Sí' : 'No'}
  **Roman Name**: ${crew.roman_name || 'No disponible'}
`;

const formatIdNameChar = (crew) => `**${crew.id ?? 'X'}**: ${crew.name || 'No disponible'}`;

export default {
  description: 'Busca información sobre una tripulación',
  run: async (message, args) => {
    const crewName = args.join(' ');

    if (!crewName) {
      return message.reply('Por favor, proporciona el nombre de una tripulación.');
    }

    try {
      const url = `https://api.api-onepiece.com/v2/crews/en/search?name=${encodeURIComponent(crewName)}`;
      const crewData = await fetchCrewData(url);

      if (!crewData || crewData.length === 0) {
        return message.reply('No se encontró información para la tripulación especificada.');
      }

      if (crewData.length === 1) {
        await message.reply({
          embeds: [new EmbedBuilder()
            .setTitle(`Información de la tripulación: ${crewData[0].name}`)
            .setColor('#ff4000')
            .setDescription(formatCrewMessage(crewData[0]))
          ]
        });
      } else {
        await generateEmbedMessage(
          message,
          `Resultados para "${crewName}"`,
          crewData,
          formatIdNameChar
        );
      }
    } catch (error) {
      console.error('Error al obtener información:', error);
      message.reply('Hubo un problema al obtener la información de la tripulación.');
    }
  }
};
