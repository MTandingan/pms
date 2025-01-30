const Constants = require('../helper/constants');
const facaRepository = require("../dao/facaRepository");

module.exports.createFaca = async (body) => {
    var result = await facaRepository.createFaca(body);
    var faca_id = Number(result['insertId']);

    return faca_id;
}

module.exports.getListOfFacaByWsqId = async (body) => {
    return await facaRepository.getListOfFacaByWsqId(body);
}

module.exports.deleteFaca = async (body) => {
    const result = await facaRepository.deleteFaca(body);

    return (result.affectedRows == Constants.HAS_NO_DATA_DELETED) ? Constants.STATUS_CODE_ERROR : Constants.STATUS_CODE_SUCCESS;
}

module.exports.deleteFacaByWsqId = async (body) => {
    const result = await facaRepository.deleteFacaByWsqId(body);

    return (result.affectedRows == Constants.HAS_NO_DATA_DELETED) ? Constants.STATUS_CODE_ERROR : Constants.STATUS_CODE_SUCCESS;
}




