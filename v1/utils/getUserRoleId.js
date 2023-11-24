const Role = require("../models/Role");
const { ROLES } = require("./constants");

async function getUserRoleId() {
  try {
    const roles = await Role.find();
    const userRole = roles.filter((role) => role.name === ROLES.user);
    if (!userRole.length) return;

    return userRole[0].id;
  } catch (error) {
    console.log(error.message);
  }
}

module.exports = getUserRoleId;
