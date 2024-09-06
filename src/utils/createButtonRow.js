import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export const createButtonRow = (currentPage, totalPages) => new ActionRowBuilder().addComponents(
  new ButtonBuilder()
    .setCustomId('prev')
    .setLabel('⬅️ Anterior')
    .setStyle(ButtonStyle.Primary)
    .setDisabled(currentPage === 0),
  new ButtonBuilder()
    .setCustomId('next')
    .setLabel('➡️ Siguiente')
    .setStyle(ButtonStyle.Primary)
    .setDisabled(currentPage === totalPages - 1)
);
