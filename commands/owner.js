import { EmbedBuilder } from 'discord.js'

export default {
  description: 'Muestra el creador del servidor.',
  run: async (message) => {
    try {
      const guild = message.guild;
      if (!guild) return;

      const owner = await guild.fetchOwner();

      const avatar = owner.user.displayAvatarURL({ size: 512 })

      const embed = new EmbedBuilder()
        .setColor('Orange')
        .setTitle(`El propietario del servidor es ${owner.user.tag}.`)
        .setImage(avatar);

      message.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Error al obtener el propietario del servidor:', error);
      message.reply('Hubo un problema al obtener la información del propietario del servidor.');
    }
  }
};
