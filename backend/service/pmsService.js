const moment = require('moment');
const Constants = require('../helper/constants');
const pmsRepository = require("../dao/pmsRepository");
const departmentService = require("../service/departmentService");
const quarterService = require("../service/quarterService");
const computerAuditTrailService = require("../service/computerAuditTrailService");

module.exports.createPmsSchedule = async (body) => {
    //Create the scheduled year
    var dataSchedYear = {
        schedYear: body.schedYear
    };

    var sched_id = await this.createPmsYear(dataSchedYear);

    //Create departments with its assigned batches
    let dataBulkDepartments = {
        sched_id: sched_id,
        schedYear: body.schedYear,
        listAllAddedDepartments: body.listAllAddedDepartments
    };

    await departmentService.createYearlyPmsDepartments(dataBulkDepartments);

    return sched_id;
}

module.exports.addDepartmentBySchedId = async (body) => {
    let data = {
        pdept_schedId: body.sched_id,
        pdept_locationId: body.pdept_locationId,
        pdept_batch: body.pdept_batch
    };

    let result = await departmentService.createDepartment(data);

    let dataQuarter = {
        quarter_pDeptId: Number(result['insertId']),
        pdept_batch: body.pdept_batch
    };

    await quarterService.createYearlyPmsQuarters(dataQuarter);
}

module.exports.createPmsYear = async (body) => {
    var dataSchedYear = {
        schedYear: body.schedYear
    };

    var result = await pmsRepository.createPmsYear(dataSchedYear);

    return Number(result['insertId']);
}

module.exports.getListOfSchedule = async () => {
    return await pmsRepository.getListOfSchedule();
}

module.exports.getPmsScheduleByYear = async (body) => {
    return await pmsRepository.getPmsScheduleByYear(body);
}

module.exports.getPmsScheduleById = async (body) => {
    return await pmsRepository.getPmsScheduleById(body);
}

module.exports.updateCloningOfPrevYearDeptsBySchedId = async (body) => {
    var currentDateAndTime = moment(new Date().toISOString()).format('YYYY-MM-DD HH:mm:ss');

    //Get all the quarter id of the first quarters ONLY and its department data based from the chosen year
    var listOfNewQuarterData = await quarterService.getListOfQuarterlyFirstQuarterBySchedId(body); 

    //Get the previous or last year sched data
    var latestSchedData = await this.getPmsScheduleById(body);
    var prevSchedData = await this.getPmsScheduleByYear({sched_year: latestSchedData[0].sched_year - 1});

    //Update the latest quarter data with the last semester's data for to maintain its continuity
    if(listOfNewQuarterData.length !== 0){
        for(const key in listOfNewQuarterData){
            //Fetch its last data from the last quarter, and replicate its data to the first quarter
            let data = {
                pdept_schedId: prevSchedData[0].sched_id,
                pdept_locationId: listOfNewQuarterData[key].pdept_locationId
            };
            let quarterData = await quarterService.getQuarterByPmsDeptIdMonthlyQuarterAndLastQuarter(data);     //Quarter data

            if(quarterData.length !== 0){
                let quarterWsqData = {
                    wsq_quarterId: quarterData[0].quarter_id,
                    wsq_status: Constants.WSQ_STATUS_COMPLETE
                }
                let listOfWsq = await quarterService.getListOfQuarterlyWorkstationOnlyByIdAndStatus(quarterWsqData);     //Quarter data's WSQ

                //Replicating the WSQ data
                for(const idx in listOfWsq){
                    let wsq_resolution = listOfWsq[idx].wsq_resolution;

                    switch(Number(wsq_resolution)){
                        case Constants.WSQ_RESOLUTION_COMPLETE: {
                            let newWorkstationQuarterlyData = {
                                quarter_id: listOfNewQuarterData[key].quarter_id,
                                ws_id: listOfWsq[idx].wsq_wsId,
                                wsq_id: listOfWsq[idx].wsq_id
                            };
                
                            let new_wsq_id = await quarterService.addQuarterlyWorkStationWithPrevData(newWorkstationQuarterlyData);

                            let params1 = {
                                old_wsq_id: listOfWsq[idx].wsq_id,
                                new_wsq_id: new_wsq_id
                            };

                            await quarterService.createQtyWsqSystemComponentRefPrevData(params1);

                            let new_wsq_data = await quarterService.getQuarterlyWorkstationAndCompByWsqId({wsq_id: new_wsq_id})

                            //Record the audit trail for computer data
                            let computerAuditTrailData = {
                                compAudit_compId: new_wsq_data[0].comp_id,
                                compAudit_message: "Assigned to " + new_wsq_data[0].ws_userName + " with computer name of " + new_wsq_data[0].ws_computerName + " with workstation ID #" + new_wsq_data[0].ws_id,
                                compAudit_date: currentDateAndTime
                            };

                            await computerAuditTrailService.createComputerAuditTrail(computerAuditTrailData);
                        }break;
                        case Constants.WSQ_RESOLUTION_DEFERRED: {
                            let newWorkstationQuarterlyData = {
                                quarter_id: listOfNewQuarterData[key].quarter_id,
                                ws_id: listOfWsq[idx].wsq_wsId
                            };
                
                            let new_wsq_id = await quarterService.addQuarterlyWorkStation(newWorkstationQuarterlyData);

                            let params1 = {
                                old_wsq_id: listOfWsq[idx].wsq_id,
                                new_wsq_id: new_wsq_id
                            };

                            await quarterService.createQtyWsqSystemComponentRefPrevData(params1);
                        }break;
                    }
                }
    
                //Replicating the Quarter data
                let quarterReplicateData = {
                    quarter_numPlanned: quarterData[0].quarter_numActual + quarterData[0].quarter_numDeferred,
                    quarter_id: listOfNewQuarterData[key].quarter_id
                };
    
                await quarterService.updateQuarterPlanned(quarterReplicateData);
            }
        }
    }

    return Constants.STATUS_CODE_SUCCESS;
}







