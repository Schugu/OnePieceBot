export default {
  description: 'Repite los argumentos dados',
  run: async (message, args) => {
    const response = args.join(' '); 

    if (response.length < 1) {
      return message.reply('Provee un argumento válido.');
    }

    message.reply(response);
  }
};
