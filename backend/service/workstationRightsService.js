const Constants = require('../helper/constants');
const workstationRightsRepository = require("../dao/workstationRightsRepository");

module.exports.createWorkstationRights = async (body) => {
    return await workstationRightsRepository.createWorkstationRights(body);
}

module.exports.createMultipleUserWorkstationRights = async (body) => {
    let listOfEmployees = body.listOfEmployees;
    let wsq_id = body.wsq_id;
    let listOfUserWsqRights = await this.getListOfUserWorkstationRightsByWsqId({wsq_id: wsq_id});
    
    for (const item of listOfEmployees) {
        let userWsqRights = listOfUserWsqRights.find(user => user.wsqRights_userId == item.id);

        if(userWsqRights == undefined){
            let data = {
                wsqRights_wsqId: wsq_id,
                wsqRights_userId: item.id,
                wsqRights_userName: item.name,
                can_approve_request: body.accessRights.can_approve_request
            };
    
            await this.createWorkstationRights(data)
        }   
    }

    return Constants.STATUS_CODE_SUCCESS;
}

module.exports.deleteUserWorkstationRightsById = async (body) => {
    const result = await workstationRightsRepository.deleteUserWorkstationRightsById(body);

    return (result.affectedRows == Constants.HAS_NO_DATA_DELETED) ? Constants.STATUS_CODE_ERROR : Constants.STATUS_CODE_SUCCESS;
}

module.exports.deleteUserWorkstationRightsByWsqId = async (body) => {
    const result = await workstationRightsRepository.deleteUserWorkstationRightsByWsqId(body);

    return (result.affectedRows == Constants.HAS_NO_DATA_DELETED) ? Constants.STATUS_CODE_ERROR : Constants.STATUS_CODE_SUCCESS;
}

module.exports.getListOfUserWorkstationRights = async () => {
    return await workstationRightsRepository.getListOfUserWorkstationRights();
}

module.exports.getListOfUserWorkstationRightsByWsqId = async (body) => {
    return await workstationRightsRepository.getListOfUserWorkstationRightsByWsqId(body);
}

module.exports.getListOfUserWorkstationRightsByWsqIdAndUserId = async (body) => {
    return await workstationRightsRepository.getListOfUserWorkstationRightsByWsqIdAndUserId(body);
}

module.exports.getUserWorkstationRightsByWsqIdAndUserIdWithAccess = async (body) => {
    return await workstationRightsRepository.getUserWorkstationRightsByWsqIdAndUserIdWithAccess(body);
}










