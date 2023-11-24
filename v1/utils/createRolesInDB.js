const Role = require("../models/Role");
const { ROLES } = require("./constants");

async function createRolesInDB() {
  const roles = await Role.find();

  if (!roles.length) {
    const response = await Role.create([
      { name: ROLES.admin },
      { name: ROLES.user },
      { name: ROLES.tester },
    ]);
  }
}

module.exports = {
  createRolesInDB,
};
