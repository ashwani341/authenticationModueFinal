const bcrypt = require("bcrypt");

const encryptPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    return hashedPassword;
  } catch (error) {
    console.log(error.message);
    return null;
  }
};

const verifyPassword = async (password, hashedPassword) => {
  try {
    const isCorrect = await bcrypt.compare(password, hashedPassword);
    if (!isCorrect) return false;

    return true;
  } catch (error) {
    console.log(error.message);
    return null;
  }
};

module.exports = {
  encryptPassword,
  verifyPassword,
};
