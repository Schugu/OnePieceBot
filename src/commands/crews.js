import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle } from 'discord.js';

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
            crewsPage.map((crew, index) => `${start + index + 1}. ${crew.name}`).join('\n')
          )
          .setFooter({ text: `Página ${page + 1} de ${totalPages}` });
      };

      const createActionRow = (page) => {
        return new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('prev')
            .setLabel('⬅️ Atrás')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page === 0), 
          new ButtonBuilder()
            .setCustomId('next')
            .setLabel('➡️ Adelante')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page === totalPages - 1)
        );
      };

      const embedMessage = await message.channel.send({
        embeds: [generateEmbed(currentPage)],
        components: totalPages > 1 ? [createActionRow(currentPage)] : [], 
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
          components: [createActionRow(currentPage)],
        });
      });

      collector.on('end', () => {
        embedMessage.edit({ components: [] });
      });

    } catch (error) {
      console.error('Error al obtener crews:', error);
      message.reply('Hubo un problema al obtener las crews.');
    }
  },
};
