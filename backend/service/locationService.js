const Constants = require('../helper/constants');
const departmentService = require('../service/departmentService');
const locationRepository = require("../dao/locationRepository");

module.exports.createlocation = async (body) => {
    return await locationRepository.createlocation(body);
}

module.exports.getlistOfLocationWithRange = async (body) => {
    return await locationRepository.getlistOfLocationWithRange(body);
}

module.exports.getAllListOfLocation = async () => {
    return await locationRepository.getAllListOfLocation();
}

module.exports.getAllRawListOfLocationWithMonthlyBatchBySchedId = async (body) => {
    return await locationRepository.getAllListOfLocationWithMonthlyBatchBySchedId(body);
}

module.exports.getAllListOfLocationWithMonthlyBatchBySchedId = async (body) => {
    let list =  await this.getAllRawListOfLocationWithMonthlyBatchBySchedId(body);
    let newList = new Map();

    list.forEach(item => {
        if(newList.has(item.location_id)){
            let data = newList.get(item.location_id);
            data.quarter_monthlyQuarters.push(item.quarter_monthlyQuarter);
        } else {
            newList.set(item.location_id, {
                                            location_id: item.location_id,
                                            location_name: item.location_name,
                                            quarter_monthlyQuarters: [...[], item.quarter_monthlyQuarter] 
                                        });
        }
    });

    return Array.from(newList);
}

module.exports.updatelocation = async (body) => {
    const result = await locationRepository.updatelocation(body);

    return (result.affectedRows == Constants.HAS_UPDATED_DATA) ? Constants.HAS_UPDATED_DATA : Constants.STATUS_CODE_ERROR;
}

module.exports.deletelocation = async (body) => {
    var location = await departmentService.getDepartmentByLocationId(body);

    if(location.length != 0){
        return Constants.STATUS_CODE_DELETE_DENY;    
    }

    const result = await locationRepository.deletelocation(body);

    return (result.affectedRows == Constants.HAS_NO_DATA_DELETED) ? Constants.STATUS_CODE_ERROR : Constants.STATUS_CODE_SUCCESS;
}



