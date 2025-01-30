const Constants = require('../helper/constants');
const checklistItemRepository = require("../dao/checklistItemRepository");

module.exports.createChecklistItem = async (body) => {
    return await checklistItemRepository.createChecklistItem(body);
}

module.exports.createQuarterlyWorkstationChecklistItem = async (body) => {
    return await checklistItemRepository.createQuarterlyWorkstationChecklistItem(body);
}

module.exports.updateChecklistItem = async (body) => {
    const result = await checklistItemRepository.updateChecklistItem(body);

    return (result.affectedRows == Constants.HAS_UPDATED_DATA) ? Constants.HAS_UPDATED_DATA : Constants.STATUS_CODE_ERROR;
}

module.exports.updateQtyChecklistItemStatus = async (body) => {
    const result = await checklistItemRepository.updateQtyChecklistItemStatus(body);

    return (result.affectedRows == Constants.HAS_UPDATED_DATA) ? Constants.HAS_UPDATED_DATA : Constants.STATUS_CODE_ERROR;
}

module.exports.deleteChecklistItem = async (body) => {
    const data = await this.checkChecklistItemExistsOnOtherTables(body);

    if(data[0].isExists){
        return Constants.STATUS_CODE_DELETE_DENY;
    }
    
    const result = await checklistItemRepository.deleteChecklistItem(body);

    return (result.affectedRows == Constants.HAS_NO_DATA_DELETED) ? Constants.STATUS_CODE_ERROR : Constants.STATUS_CODE_SUCCESS;
}

module.exports.deleteQtyWsChecklistItemById = async (body) => {
    const result = await checklistItemRepository.deleteQtyWsChecklistItemById(body);

    return (result.affectedRows == Constants.HAS_NO_DATA_DELETED) ? Constants.STATUS_CODE_ERROR : Constants.STATUS_CODE_SUCCESS;
}

module.exports.deleteQtyWsChecklistItemByWsqIdAndId = async (body) => {
    const result = await checklistItemRepository.deleteQtyWsChecklistItemByWsqIdAndId(body);

    return (result.affectedRows == Constants.HAS_NO_DATA_DELETED) ? Constants.STATUS_CODE_ERROR : Constants.STATUS_CODE_SUCCESS;
}

module.exports.deleteChecklistByWsqId = async (body) => {
    const result = await checklistItemRepository.deleteChecklistByWsqId(body);

    return (result.affectedRows == Constants.HAS_NO_DATA_DELETED) ? Constants.STATUS_CODE_ERROR : Constants.STATUS_CODE_SUCCESS;
}

module.exports.checkChecklistItemExistsOnOtherTables = async (body) => {
    return await checklistItemRepository.checkChecklistItemExistsOnOtherTables(body);
}

module.exports.getListOfChecklistItemWithRange = async (body) => {
    return await checklistItemRepository.getListOfChecklistItemWithRange(body);
}

module.exports.getListOfChecklistItemsByStatus = async (body) => {
    return await checklistItemRepository.getListOfChecklistItemsByStatus(body);
}

module.exports.getWorkstationQuarterlyChecklistItemsByWsqId = async (body) => {
    return await checklistItemRepository.getWorkstationQuarterlyChecklistItemsByWsqId(body);
}

module.exports.getListOfMissingActiveChecklistItemsByWsqId = async (body) => {
    return await checklistItemRepository.getListOfMissingActiveChecklistItemsByWsqId(body);
}

module.exports.getWorkstationQuarterlyChecklistItemDetailsById = async (body) => {
    return await checklistItemRepository.getWorkstationQuarterlyChecklistItemDetailsById(body);
}



