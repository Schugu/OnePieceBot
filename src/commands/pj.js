import fetch from 'node-fetch';
import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle } from 'discord.js';

const PAGE_SIZE = 10; 
const MAX_RETRIES = 3;

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

const createDetailedEmbed = (title, characters) => new EmbedBuilder()
  .setTitle(title)
  .setColor('#0099ff')
  .setDescription(characters.map(formatCharacterMessage).join('\n'));

const generateNameOnlyEmbed = (title, characters, page, totalPages) => {
  const start = page * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const charactersPage = characters.slice(start, end);

  return new EmbedBuilder()
    .setTitle(title)
    .setColor('#0099ff')
    .setDescription(
      charactersPage.map(formatIdNameChar).join('\n')
    )
    .setFooter({ text: `Página ${page + 1} de ${totalPages}` });
};

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
        const character = characterData[0];
        await message.reply({ embeds: [createDetailedEmbed(`Información del personaje: ${character.name}`, [character])] });
      } else if (characterData.length <= 10) {
        await message.reply({ embeds: [createDetailedEmbed(`Resultados para "${characterName}"`, characterData)] });
      } else {
        let currentPage = 0;
        const totalPages = Math.ceil(characterData.length / PAGE_SIZE);

        const createButtonRow = () => new ActionRowBuilder().addComponents(
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

        const embedMessage = await message.channel.send({
          embeds: [generateNameOnlyEmbed(`Resultados para "${characterName}"`, characterData, currentPage, totalPages)],
          components: [createButtonRow()],
        });

        const collector = embedMessage.createMessageComponentCollector({ time: 60000 });

        collector.on('collect', async (interaction) => {
          if (!interaction.isButton()) return;

          if (interaction.customId === 'prev' && currentPage > 0) {
            currentPage--;
          } else if (interaction.customId === 'next' && currentPage < totalPages - 1) {
            currentPage++;
          }

          await interaction.update({
            embeds: [generateNameOnlyEmbed(`Resultados para "${characterName}"`, characterData, currentPage, totalPages)],
            components: [createButtonRow()],
          });
        });

        collector.on('end', () => {
          embedMessage.edit({ components: [] });
        });
      }
    } catch (error) {
      console.error('Error al obtener información:', error);
      message.reply('Hubo un problema al obtener la información del personaje.');
    }
  }
};
