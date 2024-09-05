import { checkPermissions } from "../middlewares/permissionMiddleware.js";

export default {
  description: 'Elimina un número específico de mensajes o todos los mensajes si no se proporciona un número.',
  run: async (message, args) => {
    const hasPermission = await checkPermissions(message);

    if (!hasPermission) return;

    try {
      if (args.length === 0) {
        let fetched;
        do {
          fetched = await message.channel.messages.fetch({ limit: 100 });
          if (fetched.size === 0) break;

          const messagesToDelete = fetched.filter(msg => {
            return (Date.now() - msg.createdTimestamp) < 14 * 24 * 60 * 60 * 1000;
          });

          await message.channel.bulkDelete(messagesToDelete, true);
        } while (fetched.size >= 2);

        await message.channel.send('Se han eliminado todos los mensajes en este canal.');
      } else {
        const amount = parseInt(args[0]);

        if (!amount || amount < 1 || amount > 100) {
          return message.reply('Por favor, proporciona un número entre 1 y 100.');
        }

        const fetched = await message.channel.messages.fetch({ limit: amount + 1 });
        const messagesToDelete = fetched.filter(msg => {
          return (Date.now() - msg.createdTimestamp) < 14 * 24 * 60 * 60 * 1000;
        });

        if (messagesToDelete.size === 0) {
          return message.reply('No se encontraron mensajes que pudieran eliminarse (los mensajes de más de 14 días no se pueden eliminar).');
        }

        await message.channel.bulkDelete(messagesToDelete, true);

        await message.channel.send(`Se han eliminado ${messagesToDelete.size - 1} mensajes.`);
      }
    } catch (error) {
      console.error('Error al eliminar mensajes:', error);

      if (error.code === 10008) {
        message.reply('Algunos mensajes no pudieron eliminarse porque ya no existen.');
      } else {
        message.reply('Hubo un problema al intentar eliminar los mensajes.');
      }
    }
  }
};
