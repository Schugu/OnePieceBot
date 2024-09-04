import { EmbedBuilder } from 'discord.js'

export default {
  description: 'Muestra el avatar del usuario.',
  run: async (message) => {
    const target = message.mentions.users.first() || message.author;
    const member = await message.guild.members.fetch(target.id);

    if (!member) return message.reply('Introduce un usuario válido.');

    const avatar = member.user.displayAvatarURL({ size: 512 })

    const embed = new EmbedBuilder()
      .setColor('Orange')
      .setTitle(`Avatar de ${member.user.displayName}`)
      .setImage(avatar);

    message.reply({ embeds: [embed] });

  }
};
