const Constants = require('../helper/constants');
const departmentRepository = require("../dao/departmentRepository");
const quarterService = require("../service/quarterService");

module.exports.createYearlyPmsDepartments = async (body) => {
    var listAllAddedDepartments = body.listAllAddedDepartments;
    var sched_Year = body.schedYear;
    
    for (const key in listAllAddedDepartments) {
        let data = {
            pdept_schedId: body.sched_id,
            pdept_locationId: listAllAddedDepartments[key].location_id,
            pdept_batch: listAllAddedDepartments[key].batch
        };

        let result = await this.createDepartment(data);

        //Create all the quarterly data of the departments
        let dataQuarter = {
            quarter_pDeptId: Number(result['insertId']),
            pdept_batch: data.pdept_batch,
            sched_Year: sched_Year,
            pdept_locationId: data.pdept_locationId
        };

        await quarterService.createYearlyPmsQuarters(dataQuarter);
    }
}

module.exports.createDepartment = async (body) => {
    let data = {
        pdept_schedId: body.pdept_schedId,
        pdept_locationId: body.pdept_locationId,
        pdept_batch: body.pdept_batch
    };
    
    return await departmentRepository.createDepartment(data);
}

module.exports.deleteDepartmentById = async (body) => {
    const result = await departmentRepository.deleteDepartmentById(body);

    return (result.affectedRows == Constants.HAS_NO_DATA_DELETED) ? Constants.STATUS_CODE_ERROR : Constants.STATUS_CODE_SUCCESS;
}

module.exports.getDepartmentBySchedId = async (body) => {
    return await departmentRepository.getDepartmentBySchedId(body);
}

module.exports.getDepartmentByLocationId = async (body) => {
    return await departmentRepository.getDepartmentByLocationId(body);
}

module.exports.getDepartmentOnlyBySchedIdAndLocationId = async (body) => {
    return await departmentRepository.getDepartmentOnlyBySchedIdAndLocationId(body);
}

module.exports.getDepartmentAndQuarterDetailsByYearAndBatch = async (body) => {
    return await departmentRepository.getDepartmentAndQuarterDetailsByYearAndBatch(body);
}

module.exports.getDepartmentAndQuarterDetailsBySchedIdAndBatch = async (body) => {
    return await departmentRepository.getDepartmentAndQuarterDetailsBySchedIdAndBatch(body);
}

module.exports.getDepartmentAndQuarterDetailsBySchedIdAndLocations = async (body) => {
    var listOfLocationsString = ``;
    var locations = body.locations;

    for (var location of locations) {
        listOfLocationsString += `${location},`;
    }

    if(listOfLocationsString == ``){
        return [];
    }

    listOfLocationsString = listOfLocationsString.slice(0, -1);
    body.locations = listOfLocationsString;

    return await departmentRepository.getDepartmentAndQuarterDetailsBySchedIdAndLocations(body);
}

module.exports.getDepartmentAndQuarterDetailsBySchedIdAndDepartmentId = async (body) => {
    return await departmentRepository.getDepartmentAndQuarterDetailsBySchedIdAndDepartmentId(body);
}





