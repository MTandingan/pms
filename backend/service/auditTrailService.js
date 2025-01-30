const Constants = require('../helper/constants');
const auditTrailRepository = require("../dao/auditTrailRepository");

module.exports.createAuditTrail = async (body) => {
    var result = await auditTrailRepository.createAuditTrail(body);

    return Number(result['insertId']);
}

module.exports.getWorkstationQuarterlyAuditTrail = async (body) => {
    return await auditTrailRepository.getWorkstationQuarterlyAuditTrail(body);
}

module.exports.deleteAuditTrailByWsqId = async (body) => {
    const result = await auditTrailRepository.deleteAuditTrailByWsqId(body);

    return (result.affectedRows == Constants.HAS_NO_DATA_DELETED) ? Constants.STATUS_CODE_ERROR : Constants.STATUS_CODE_SUCCESS;
}

