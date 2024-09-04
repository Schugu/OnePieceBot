import fs from 'node:fs';
import { checkPermissions } from "../middlewares/permissionMiddleware.js";

const filePath = 'data/roles.json';

const readRoleList = () => {
  if (!fs.existsSync(filePath)) {
    return { sensitiveRoles: [] };
  }

  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error al leer o parsear el archivo:', error);
    return { sensitiveRoles: [] };
  }
};

const writeRoleToFile = (rolesArray) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify({ sensitiveRoles: rolesArray }, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error al escribir en el archivo:', error);
  }
};

export default {
  description: 'Agrega rol sensible por id',
  run: async (message, args) => {
    const hasPermission = await checkPermissions(message);
    if (!hasPermission) return;

    const roleId = args[0].trim();

    const role = message.guild.roles.cache.get(roleId);

    if (!role) {
      return message.reply(`El rol con ID ${roleId} no existe en el servidor.`);
    }

    const { sensitiveRoles } = readRoleList();

    const roleInList = sensitiveRoles.some(sensitiveRoleId => sensitiveRoleId === roleId);

    if (roleInList) {
      return message.reply(`El rol con ID ${roleId} ya existe en la lista de roles con permiso.`);
    }

    sensitiveRoles.push(roleId);

    writeRoleToFile(sensitiveRoles);

    return message.reply(`El rol con ID ${roleId} fue agregado a la lista de roles con permiso.`);
  }
};
