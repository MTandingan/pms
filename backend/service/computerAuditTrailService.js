const Constants = require('../helper/constants');
const computerAuditTrailRepository = require("../dao/computerAuditTrailRepository");

module.exports.createComputerAuditTrail = async (body) => {
    return await computerAuditTrailRepository.createComputerAuditTrail(body);
}

module.exports.getComputerAuditTrailByCompId = async (body) => {
    return await computerAuditTrailRepository.getComputerAuditTrailByCompId(body);
}
