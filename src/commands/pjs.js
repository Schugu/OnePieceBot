import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle } from 'discord.js';

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

      const generateEmbed = (page) => {
        const start = page * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        const charactersPage = characters.slice(start, end);

        const embed = new EmbedBuilder()
          .setTitle('Personajes One Piece')
          .setColor('#0099ff')
          .setDescription(
            charactersPage.map((character, index) => `${start + index + 1}. ${character.name}`).join('\n')
          )
          .setFooter({ text: `Página ${page + 1} de ${Math.ceil(characters.length / PAGE_SIZE)}` });

        return embed;
      };

      const createActionRow = (page) => {
        const isFirstPage = page === 0;
        const isLastPage = page === Math.ceil(characters.length / PAGE_SIZE) - 1;

        return new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('prev')
            .setLabel('⬅️ Atrás')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(isFirstPage),
          new ButtonBuilder()
            .setCustomId('next')
            .setLabel('➡️ Adelante')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(isLastPage)
        );
      };

      const embedMessage = await message.channel.send({
        embeds: [generateEmbed(currentPage)],
        components: [createActionRow(currentPage)],
      });

      const collector = embedMessage.createMessageComponentCollector({ time: 300000 });

      collector.on('collect', async (interaction) => {
        if (!interaction.isButton()) return;

        if (interaction.customId === 'prev' && currentPage > 0) {
          currentPage--;
        } else if (interaction.customId === 'next' && currentPage < Math.ceil(characters.length / PAGE_SIZE) - 1) {
          currentPage++;
        }

        await interaction.update({
          embeds: [generateEmbed(currentPage)],
          components: [createActionRow(currentPage)],
        });
      });

      collector.on('end', () => {
        embedMessage.edit({ components: [] });
      });

    } catch (error) {
      console.error('Error fetching characters:', error);
      message.reply('There was a problem fetching the characters.');
    }
  },
};
