import fetch from 'node-fetch';

// Formatear para uno o pocos personajes 
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

// Formatear para muchos personajes
const formatCharacterName = (character) => `**Nombre**: ${character.name || 'No disponible'}`;

// Tamaño máximo del mensaje en caracteres
const MAX_MESSAGE_LENGTH = 2000;

// Tamaño máximo de los resultados antes de simplificar la información
const DETAIL_THRESHOLD = 10; // Muestra detalles completos hasta 10 personajes

export default {
  description: 'Busca información sobre un personaje',
  run: async (message, args) => {
    const characterName = args.join(' ');

    if (!characterName) {
      return message.reply('Por favor, proporciona el nombre de un personaje.');
    }

    try {
      const url = `https://api.api-onepiece.com/v2/characters/en/search?name=${encodeURIComponent(characterName)}`;

      const response = await fetch(url);

      if (!response.ok) {
        console.error('Error en la respuesta:', response.status, response.statusText);
        throw new Error('No se pudo obtener la información del personaje.');
      }

      const characterData = await response.json();

      if (!characterData || characterData.length === 0) {
        return message.reply('No se encontró información para el personaje especificado.');
      }

      let replyMessage;

      if (characterData.length > 10) {
        replyMessage = `Se encontraron ${characterData.length} personajes con el nombre "${characterName}". Para ver más detalles, por favor, sé más específico en tu búsqueda.`;
      } else if (characterData.length > DETAIL_THRESHOLD) {
        replyMessage = `Se encontraron ${characterData.length} personajes con el nombre "${characterName}":\n\n${characterData.slice(0, DETAIL_THRESHOLD).map(formatCharacterName).join('\n\n')}\n\n(Sólo se muestran los primeros ${DETAIL_THRESHOLD} resultados.)`;
      } else {
        replyMessage = characterData.map(formatCharacterMessage).join(' ');
      }

      if (replyMessage.length > MAX_MESSAGE_LENGTH) {
        let currentMessage = '';
        const messages = [];

        const lines = replyMessage.split('\n');
        for (const line of lines) {
          if ((currentMessage + line).length > MAX_MESSAGE_LENGTH) {
            messages.push(currentMessage);
            currentMessage = line + '\n';
          } else {
            currentMessage += line + '\n';
          }
        }
        if (currentMessage) {
          messages.push(currentMessage);
        }

        for (const msg of messages) {
          await message.reply(msg);
        }
      } else {
        message.reply(replyMessage);
      }
    } catch (error) {
      console.error('Error al obtener información:', error);
      message.reply('Hubo un problema al obtener la información del personaje.');
    }
  }
};
