import fetch from 'node-fetch';
import { EmbedBuilder } from 'discord.js';
import { createButtonRow } from '../utils/createButtonRow.js';

const PAGE_SIZE = 10;

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

      let currentPage = 0;
      const totalPages = Math.ceil(characters.length / PAGE_SIZE);

      const generateEmbed = (page) => {
        const start = page * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        const charactersPage = characters.slice(start, end);

        return new EmbedBuilder()
          .setTitle('Personajes One Piece')
          .setColor('#ff4000')
          .setDescription(
            charactersPage.map((character, index) => `${start + index + 1}. ${character.name}`).join('\n')
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

        if (interaction.customId === 'prev' && currentPage > 0) {
          currentPage--;
        } else if (interaction.customId === 'next' && currentPage < totalPages - 1) {
          currentPage++;
        }

        await interaction.update({
          embeds: [generateEmbed(currentPage)],
          components: totalPages > 1 ? [createButtonRow(currentPage, totalPages)] : [],
        });
      });

      collector.on('end', async () => {
        try {
          await embedMessage.edit({ components: [] });
        } catch (error) {
          console.error('Error editing message after collector ended:', error);
        }
      });

    } catch (error) {
      console.error('Error fetching characters:', error);
      message.reply('There was a problem fetching the characters.');
    }
  },
};
