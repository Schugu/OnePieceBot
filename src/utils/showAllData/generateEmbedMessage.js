import { EmbedBuilder } from 'discord.js';
import { createButtonRow } from '../createButtonRow.js';

const PAGE_SIZE = 10;

export const generateEmbedMessage = async (data, message, title = 'Información') => {
  let currentPage = 0;
  const totalPages = Math.ceil(data.length / PAGE_SIZE);

  const generateEmbed = (page) => {
    const start = page * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const dataPage = data.slice(start, end);

    return new EmbedBuilder()
      .setTitle(title)
      .setColor('#ff4000')
      .setDescription(
        dataPage.map((item, index) => `${start + index + 1}. ${item.name}`).join('\n')
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
};
