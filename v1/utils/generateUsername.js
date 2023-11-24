const { generateFromEmail } = require("unique-username-generator");

function generateUsername(email) {
  return generateFromEmail(email, 4);
}

module.exports = generateUsername;
