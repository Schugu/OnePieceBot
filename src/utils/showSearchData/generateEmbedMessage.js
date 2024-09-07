import { EmbedBuilder } from 'discord.js';
import { createButtonRow } from '../createButtonRow.js';

export const generateEmbedMessage = async (message, title, items, formatItem, pageSize = 10) => {
  const totalPages = Math.ceil(items.length / pageSize);

  const generateEmbed = (page) => {
    const start = page * pageSize;
    const end = start + pageSize;
    const itemsPage = items.slice(start, end);

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setColor('#ff4000')
      .setDescription(itemsPage.map(formatItem).join('\n'));

    if (totalPages > 1) {
      embed.setFooter({ text: `Página ${page + 1} de ${totalPages}` });
    }

    return embed;
  };

  if (items.length <= pageSize) {
    return message.channel.send({ embeds: [generateEmbed(0)] });
  }

  let currentPage = 0;
  const embedMessage = await message.channel.send({
    embeds: [generateEmbed(currentPage)],
    components: [createButtonRow(currentPage, totalPages)],
  });

  const collector = embedMessage.createMessageComponentCollector({ time: 60000 });

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

  collector.on('end', async () => {
    try {
      await embedMessage.edit({ components: [] });
    } catch (error) {
      console.error('Error al editar el mensaje después de que el collector terminó:', error);
    }
  });
};
