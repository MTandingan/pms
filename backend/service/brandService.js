const Constants = require('../helper/constants');
const brandRepository = require("../dao/brandRepository");

module.exports.createBrand = async (body) => {
    return await brandRepository.createBrand(body);
}

module.exports.updateBrand = async (body) => {
    const result = await brandRepository.updateBrand(body);

    return (result.affectedRows == Constants.HAS_UPDATED_DATA) ? Constants.HAS_UPDATED_DATA : Constants.STATUS_CODE_ERROR;
}

module.exports.getListOfBrandWithRange = async (body) => {
    return await brandRepository.getListOfBrandWithRange(body);
}

module.exports.getListOfBrand = async () => {
    return await brandRepository.getListOfBrand();
}

module.exports.getListOfBrandByStatus = async (body) => {
    return await brandRepository.getListOfBrandByStatus(body);
}

module.exports.deleteBrand = async (body) => {
    const result = await brandRepository.deleteBrand(body);

    return (result.affectedRows == Constants.HAS_NO_DATA_DELETED) ? Constants.STATUS_CODE_ERROR : Constants.STATUS_CODE_SUCCESS;
}

