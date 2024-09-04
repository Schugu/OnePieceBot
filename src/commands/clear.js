import { checkPermissions } from "../middlewares/permissionMiddleware.js";

export default {
  description: 'Elimina un número específico de mensajes o todos los mensajes si no se proporciona un número.',
  run: async (message, args) => {
    const hasPermission = await checkPermissions(message);

    if (!hasPermission) return;

    try {
      if (args.length === 0) {
        // Eliminar todos los mensajes en el canal
        let fetched;
        do {
          fetched = await message.channel.messages.fetch({ limit: 100 });
          await message.channel.bulkDelete(fetched, true); // true para ignorar mensajes que no se pueden eliminar (como los más antiguos)
        } while (fetched.size >= 2); // Continúa eliminando mientras haya mensajes

        // Enviar un mensaje de confirmación después de eliminar los mensajes
        await message.channel.send('Se han eliminado todos los mensajes en este canal.');
      } else {
        const amount = parseInt(args[0]);

        if (!amount || amount < 1 || amount > 100) {
          return message.reply('Por favor, proporciona un número entre 1 y 100.');
        }

        // Eliminar una cantidad específica de mensajes
        const fetched = await message.channel.messages.fetch({ limit: amount + 1 });
        await message.channel.bulkDelete(fetched, true);

        // Enviar un mensaje de confirmación después de eliminar los mensajes
        await message.channel.send(`Se han eliminado ${amount} mensajes.`);
      }
    } catch (error) {
      console.error('Error al eliminar mensajes:', error);
      message.reply('Hubo un problema al intentar eliminar los mensajes.');
    }
  }
};
