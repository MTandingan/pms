const Constants = require('../helper/constants');
const computerRepository = require("../dao/computerRepository");

module.exports.createComputer = async (body) => {
    var result = await computerRepository.createComputer(body);

    //Update the barcode (to make it more unique)
    var comp_id = Number(result['insertId']);
    var comp_barCode = body.comp_barCode + comp_id;

    await this.updateComputerBarCode({
        comp_barCode: comp_barCode,
        comp_id: comp_id
    });

    return comp_id;
}

module.exports.updateComputer = async (body) => {
    const result = await computerRepository.updateComputer(body);

    return (result.affectedRows == Constants.HAS_UPDATED_DATA) ? Constants.HAS_UPDATED_DATA : Constants.STATUS_CODE_ERROR;
}

module.exports.updateComputerStatus = async (body) => {
    const result = await computerRepository.updateComputerStatus(body);

    return (result.affectedRows == Constants.HAS_UPDATED_DATA) ? Constants.HAS_UPDATED_DATA : Constants.STATUS_CODE_ERROR;
}

module.exports.updateComputerBarCode = async (body) => {
    const result = await computerRepository.updateComputerBarCode(body);

    return (result.affectedRows == Constants.HAS_UPDATED_DATA) ? Constants.HAS_UPDATED_DATA : Constants.STATUS_CODE_ERROR;
}

module.exports.deleteComputer = async (body) => {
    //Cannot delete if data exists on other db tables
    const resultIfExists = await this.checkComputerExistsOnOtherTables(body);

    if(resultIfExists[0].isExists){
        return Constants.STATUS_CODE_SUBMIT_DENY;   
    }

    const result = await computerRepository.deleteComputer(body);

    return (result.affectedRows == Constants.HAS_NO_DATA_DELETED) ? Constants.STATUS_CODE_ERROR : Constants.STATUS_CODE_SUCCESS;
}

module.exports.checkComputerExistsOnOtherTables = async(body) => {
    return await computerRepository.checkComputerExistsOnOtherTables(body);
}

module.exports.getListOfComputer = async () => {
    return await computerRepository.getListOfComputer();
}

module.exports.getListOfComputerNotStatus = async (body) => {
    return await computerRepository.getListOfComputerNotStatus(body);
}

module.exports.getListOfComputerByStatus = async (body) => {
    return await computerRepository.getListOfComputerByStatus(body);
}

module.exports.getComputer = async (body) => {
    return await computerRepository.getComputer(body);
}

module.exports.getListOfComputerWithRange = async (body) => {
    return await computerRepository.getListOfComputerWithRange(body);
}

module.exports.getWsqDetailsByParams = async (body) => {
    return await computerRepository.getWsqDetailsByParams(body);
}






