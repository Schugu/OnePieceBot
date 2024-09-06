import fetch from 'node-fetch';
import { EmbedBuilder } from 'discord.js';
import { createButtonRow } from "../utils/createButtonRow.js";

const PAGE_SIZE = 10;
const MAX_RETRIES = 3;

const formatCrewMessage = (crew) => `
  **Nombre**: ${crew.name || 'No disponible'}
  **Estado**: ${crew.status || 'No disponible'}
  **Yonko**: ${crew.is_yonko ? 'Sí' : 'No'}
  **Roman Name**: ${crew.roman_name || 'No disponible'}
`;

const formatIdNameChar = (crew) => `**${crew.id ?? 'X'}**: ${crew.name || 'No disponible'}`;

const createDetailedEmbed = (title, crews) => new EmbedBuilder()
  .setTitle(title)
  .setColor('#ff4000')
  .setDescription(crews.map(formatCrewMessage).join('\n'));

const generateNameOnlyEmbed = (title, crews, page, totalPages) => {
  const start = page * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const crewsPage = crews.slice(start, end);

  return new EmbedBuilder()
    .setTitle(title)
    .setColor('#ff4000')
    .setDescription(crewsPage.map(formatIdNameChar).join('\n'))
    .setFooter({ text: `Página ${page + 1} de ${totalPages}` });
};

const fetchCrewData = async (url, retries = MAX_RETRIES) => {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error('Error en la respuesta:', response.status, response.statusText);
      throw new Error('No se pudo obtener la información del personaje.');
    }

    const data = await response.json();
    return data.filter(item => Object.keys(item).length !== 0 && item.name); // Filtra los datos vacíos
  } catch (error) {
    if (retries > 0) {
      console.warn('Reintentando solicitud...', retries);
      return fetchCrewData(url, retries - 1);
    } else {
      throw error;
    }
  }
};

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

      if (crewData.length < 11) {
        await message.reply({ embeds: [createDetailedEmbed(`Resultados para "${crewName}"`, crewData)] });
      } else {
        let currentPage = 0;
        const totalPages = Math.ceil(crewData.length / PAGE_SIZE);

        const embedMessage = await message.channel.send({
          embeds: [generateNameOnlyEmbed(`Resultados para "${crewName}"`, crewData, currentPage, totalPages)],
          components: totalPages > 1 ? [createButtonRow(currentPage, totalPages)] : [],
        });

        if (totalPages > 1) {
          const collector = embedMessage.createMessageComponentCollector({ time: 60000 });

          collector.on('collect', async (interaction) => {
            if (!interaction.isButton()) return;

            if (interaction.customId === 'prev' && currentPage > 0) {
              currentPage--;
            } else if (interaction.customId === 'next' && currentPage < totalPages - 1) {
              currentPage++;
            }

            try {
              await interaction.update({
                embeds: [generateNameOnlyEmbed(`Resultados para "${crewName}"`, crewData, currentPage, totalPages)],
                components: [createButtonRow(currentPage, totalPages)],
              });
            } catch (error) {
              console.error('Error al actualizar la interacción:', error);
            }
          });

          collector.on('end', async () => {
            try {
              await embedMessage.edit({ components: [] });
            } catch (error) {
              console.error('Error al editar el mensaje después de que el collector terminó:', error);
            }
          });
        }
      }
    } catch (error) {
      console.error('Error al obtener información:', error);
      message.reply('Hubo un problema al obtener la información de la tripulación.');
    }
  }
};
