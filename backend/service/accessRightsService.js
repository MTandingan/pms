const Constants = require('../helper/constants');
const accessRightsRepository = require("../dao/accessRightsRepository");

module.exports.getAccessRights = async (body) => {
    return await accessRightsRepository.getAccessRights(body);
}