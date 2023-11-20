const CryptoJS = require("crypto-js");
require('dotenv').config();

module.exports = (password) => {
  return CryptoJS.SHA3(password, process.env.ENCRYPT).toString();
}