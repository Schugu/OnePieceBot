import { PermissionsBitField } from 'discord.js';

import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { sensitiveRoles } = require('../data/roles.json');

export const checkPermissions = async (message) => {
  const isOwner = message.guild.ownerId === message.author.id;

  const hasAdminPermissions = message.member.permissions.has(PermissionsBitField.Flags.Administrator);

  const hasRequiredRole = sensitiveRoles.some(roleId =>
    message.member.roles.cache.has(roleId)
  );

  if (isOwner || hasAdminPermissions || hasRequiredRole) {
    return true;
  } else {
    await message.reply('No tienes permisos para usar este comando.');
    return false;
  }
};
