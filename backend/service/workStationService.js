const Constants = require('../helper/constants');
const workStationRepository = require("../dao/workStationRepository");

module.exports.createWorkStation = async (body) => {
    return await workStationRepository.createWorkStation(body);
}

module.exports.getListOfWorkstations = async () => {
    return await workStationRepository.getListOfWorkstations();
}

module.exports.getListOfWorkstationsByStatus = async (body) => {
    return await workStationRepository.getListOfWorkstationsByStatus(body);
}

module.exports.getListOfUserWorkstationWithRange = async (body) => {
    return await workStationRepository.getListOfUserWorkstationWithRange(body);
}

module.exports.getListOfUserOthersWorkstationWithRange = async (body) => {
    return await workStationRepository.getListOfUserOthersWorkstationWithRange(body);
}

module.exports.getListOfUserWorkstationDeviceWithRange = async (body) => {
    return await workStationRepository.getListOfUserWorkstationDeviceWithRange(body);
}

module.exports.getWorkstationAndComputerByWsId = async (body) => {
    return await workStationRepository.getWorkstationAndComputerByWsId(body);
}

module.exports.getWorkstationById = async (body) => {
    return await workStationRepository.getWorkstationById(body);
}

module.exports.updateWorkstationStatus = async (body) => {
    const result = await workStationRepository.updateWorkstationStatus(body);

    return (result.affectedRows == Constants.HAS_UPDATED_DATA) ? Constants.HAS_UPDATED_DATA : Constants.STATUS_CODE_ERROR;
}



