import { EmbedBuilder } from 'discord.js';
import { createButtonRow } from "../utils/createButtonRow.js";
import fetch from 'node-fetch';

const PAGE_SIZE = 10;

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

      let currentPage = 0;
      const totalPages = Math.ceil(crews.length / PAGE_SIZE);

      const generateEmbed = (page) => {
        const start = page * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        const crewsPage = crews.slice(start, end);

        return new EmbedBuilder()
          .setTitle('Crews de One Piece')
          .setColor('#ff4000')
          .setDescription(
            crewsPage.map((crew, index) => `${start + index + 1}. ${crew.name || 'Nombre no disponible'}`).join('\n')
          )
          .setFooter({ text: `Página ${page + 1} de ${totalPages}` });
      };

      const embedMessage = await message.channel.send({
        embeds: [generateEmbed(currentPage)],
        components: totalPages > 1 ? [createButtonRow(currentPage, totalPages)] : [],
      });

      const collector = embedMessage.createMessageComponentCollector({ time: 300000 });

      collector.on('collect', async (interaction) => {
        if (!interaction.isButton()) return;

        try {
          if (interaction.customId === 'prev' && currentPage > 0) {
            currentPage--;
          } else if (interaction.customId === 'next' && currentPage < totalPages - 1) {
            currentPage++;
          }

          await interaction.update({
            embeds: [generateEmbed(currentPage)],
            components: [createButtonRow(currentPage, totalPages)],
          });
        } catch (error) {
          console.error('Error al actualizar la interacción:', error);
        }
      });

      collector.on('end', async (collected) => {
        try {
          await embedMessage.edit({ components: [] });
        } catch (error) {
          console.error('Error al editar el mensaje después de que el collector terminó:', error);
        }
      });

    } catch (error) {
      console.error('Error al obtener crews:', error);
      message.reply('Hubo un problema al obtener las crews.');
    }
  },
};
