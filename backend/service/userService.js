const moment = require('moment');
const Constants = require('../helper/constants');
const userRepository = require("../dao/userRepository");

module.exports.login = async (body) => {
    return await userRepository.login(body);
}
