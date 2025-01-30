const moment = require('moment');
const Constants = require('../helper/constants');
const workStationService = require("../service/workStationService");
const softwareService = require("../service/softwareService");
const hardwareService = require("../service/hardwareService");
const facaService = require("../service/facaService");
const computerService = require("../service/computerService");
const auditTrailService = require("../service/auditTrailService");
const computerAuditTrailService = require("../service/computerAuditTrailService");
const workstationRightsService = require("../service/workstationRightsService");
const departmentService = require("../service/departmentService");
const checklistItemService = require("../service/checklistItemService");
const internalCommentService = require("../service/internalCommentService");
const pmsService = require("../service/pmsService");
const quarterRepository = require("../dao/quarterRepository");

module.exports.createYearlyPmsQuarters = async (body) => {
    //Get all index position of the months to save in the database immediately
    var result = this.getArrMonthlyQuartersByBatch(body.pdept_batch);

    for (const month of result) {
        let data = {
            quarter_pDeptId: body.quarter_pDeptId,
            quarter_monthlyQuarter: month,
            quarter_numPlanned: 0,
            quarter_numActual: 0,
            quarter_numDeferred: 0
        };
        
        await quarterRepository.createQuarter(data);
    }
}

module.exports.deleteWorkstationQuarterlyCheckPrevRec = async (body) => {
    var hasPrevCompleteRecord = await this.checkWorkstationQuarterlyHasPrevRecord(body);

    if(hasPrevCompleteRecord == false){
        return await this.deleteWorkstationQuarterly(body);
    }

    return Constants.STATUS_CODE_DELETE_DENY; 
}

module.exports.deleteLocationOfPmsSchedule = async (body) => {
    var resultDepartment = await departmentService.getDepartmentOnlyBySchedIdAndLocationId(body);

    if(resultDepartment.length != 0){
        let data = {
            quarter_pDeptId: resultDepartment[0].pdept_id
        };

        let resultListOfQuarterOfDept = await this.getQuarterByPmsDeptId(data);
        let canBeDeleted = await this.checkAllQuarterNumPlannedIsZero(resultListOfQuarterOfDept);

        if(canBeDeleted == true){
            await this.deleteQuarterByDeptId(data);

            let deptDeleteData = {
                pdept_id: resultDepartment[0].pdept_id
            };

            await departmentService.deleteDepartmentById(deptDeleteData);

            return Constants.STATUS_CODE_SUCCESS;
        } else {
            return Constants.STATUS_CODE_DELETE_DENY;
        }
    }

    return Constants.STATUS_CODE_ERROR; 
}

module.exports.deleteWorkstationQuarterly = async (body) => {
    var wsqDetails = await this.getQuarterlyWorkstationOnly(body);
    var result = "";

    if(wsqDetails.length !== 0){
        await workstationRightsService.deleteUserWorkstationRightsByWsqId(body);
        
        if(wsqDetails[0].wsq_status == Constants.WSQ_STATUS_COMPLETE){
            let computer = await workStationService.getWorkstationAndComputerByWsId({ws_id: wsqDetails[0].wsq_wsId});

            switch(wsqDetails[0].wsq_resolution){
                case Constants.WSQ_RESOLUTION_TRANSFERRED: {
                    result = await this.deleteWorkstationQuarterlyTransferred(body);;
                }break;
                case Constants.WSQ_RESOLUTION_CONDEMNED: {
                    result = await this.deleteWorkstationQuarterlyCondemned(body);
                }break;
                case Constants.WSQ_RESOLUTION_COMPLETE:{
                    let nextWsq = await this.getWorkstationQuarterlyHasFutureRecord(body);

                    if(nextWsq != null){
                        await this.removeNewlyCreatedDataChecklistWithRef({wsq_id: nextWsq.wsq_id});
                        await this.deleteWorkstationQuarterlyNoReso({wsq_id: nextWsq.wsq_id});
                    }

                    await this.removeNewlyCreatedDataChecklistWithRef(body);
                    result = await this.deleteWorkstationQuarterlyCompleted(body);
                }break;
                case Constants.WSQ_RESOLUTION_DEFERRED:{
                    let nextWsq = await this.getWorkstationQuarterlyHasFutureRecord(body);

                    if(nextWsq != null){
                        await this.removeNewlyCreatedDataChecklistWithRef({wsq_id: nextWsq.wsq_id});
                        await this.deleteWorkstationQuarterlyNoReso({wsq_id: nextWsq.wsq_id});
                    }

                    await this.removeNewlyCreatedDataChecklistWithRef(body);
                    result = await this.deleteWorkstationQuarterlyDeferred(body);
                }break;
                default: {
                    //Deduct with -1 from the Total Planned from its department
                    let deductData = {
                        quarter_id: wsqDetails[0].wsq_quarterId,
                        numtotalDeduction: 1
                    };

                    await this.deductQuarterPlanned(deductData);

                    result = await this.deleteWorkstationQuarterlyNoReso(body);
                }
            }
                    
            let currentDateAndTime = moment(new Date().toISOString()).format('YYYY-MM-DD HH:mm:ss');

            //Record the audit trail of its computer data
            let data = {
                compAudit_compId: computer[0].comp_id,
                compAudit_message: `Deleted permanently the workstation whose computer name is ${computer[0].ws_computerName} and owner is ${computer[0].ws_userName} that aligns with this computer`,
                compAudit_date: currentDateAndTime
            };

            await computerAuditTrailService.createComputerAuditTrail(data);          
        } else {
            let currentDateAndTime = moment(new Date().toISOString()).format('YYYY-MM-DD HH:mm:ss');
            let computer = await workStationService.getWorkstationAndComputerByWsId({ws_id: wsqDetails[0].wsq_wsId});
            
            //Deduct with -1 from the Total Planned from its department
            let deductData = {
                quarter_id: wsqDetails[0].wsq_quarterId,
                numtotalDeduction: 1
            };

            await this.deductQuarterPlanned(deductData);
            result = await this.deleteWorkstationQuarterlyNoReso(body);

            //Record the audit trail of its computer data
            let data = {
                compAudit_compId: computer[0].comp_id,
                compAudit_message: `Deleted permanently the workstation whose computer name is ${computer[0].ws_computerName} and owner is ${computer[0].ws_userName} that aligns with this computer`,
                compAudit_date: currentDateAndTime
            };

            await computerAuditTrailService.createComputerAuditTrail(data);           
        }

        return result;
    } else {
        return Constants.STATUS_CODE_ERROR;
    }
}

module.exports.checkWorkstationQuarterlyHasPrevRecord = async (body) => {
    //Get the wsq data and its quarter data
    var wsq = await this.getQuarterlyWorkstationOnly({wsq_id: body.wsq_id});

    if(wsq.length == 0){
        return false;
    }

    //Get the quarter data 
    var quarter = await this.getQuarter({quarter_id: wsq[0].wsq_quarterId});
    
    //Calculate the previous monthly quarter based from the first wsq data as the basis for the second wsq data to compare as reference
    var prevMonth = quarter[0].quarter_monthlyQuarter - 3;

    if(prevMonth <= 0){
        return false;
    }

    //Get the quarter data based from the previous monthly quarter and the dept id of the first gathered quarter data
    let prevQaurterData = {
        quarter_pDeptId: quarter[0].quarter_pDeptId,
        quarter_monthlyQuarter: prevMonth
    };
    var prevQuarter = await this.getQuarterByPmsDeptIdAndMonthlyQuarter(prevQaurterData);

    if(prevQuarter.length == 0){
        return false;
    }

    //Get the wsq data based from the new quarter id gathered and the ws id of the first wsq data
    let prevWsqData = {
        wsq_quarterId: prevQuarter[0].quarter_id,
        wsq_wsId: wsq[0].wsq_wsId
    };
    var prevWsq = await this.getQuarterlyWorkstationByQuarterIdAndWorkstationId(prevWsqData);

    //If it exists, then it has a previous record from the past month and the data should not be deleted to avoid breaking the data 
    return prevWsq.length !== 0 ? true : false; 
}

module.exports.checkAllQuarterNumPlannedIsZero = async (listOfQuarterData) => {
    for(var quarter of listOfQuarterData){
        if(quarter.quarter_numPlanned == 0){
            continue;
        }

        return false;
    }

    return true;
}

module.exports.deleteWorkstationQuarterlyNoReso = async (body) => {
    await facaService.deleteFacaByWsqId(body);
    await internalCommentService.deleteCommentByWsqId(body);
    await checklistItemService.deleteChecklistByWsqId(body);

    var hardwareQtyData = {
        hw_isOthers: true,
        qtyhard_wsqId: body.wsq_id
    };
    var listOfHardware = await hardwareService.getListOfHardwareWoOthersAndWsqId(hardwareQtyData);

    await hardwareService.deleteQtyWorkstationHardwareByWsqId(body);
    await hardwareService.deleteMultipleHardware({listOfHardware: listOfHardware});

    var softwareQtyData = {
        sw_isOthers: true,
        qtysoft_wsqId: body.wsq_id
    };
    var listOfSoftware = await softwareService.getListOfSoftwareWoOthersAndWsqId(softwareQtyData);

    await softwareService.deleteQtyWorkstationSoftwareByWsqId(body);
    await softwareService.deleteMultipleSoftware({listOfSoftware: listOfSoftware});
    
    await auditTrailService.deleteAuditTrailByWsqId(body);

    var result = await this.deleteWorkstationQuarterlyById(body);

    return result;
}

module.exports.deleteWorkstationQuarterlyTransferred = async (body) => {
    var wsqDetails = await this.getQuarterlyWorkstationOnly(body);

    //Revert back the workstation from being inactive
    var updateStatusData = {
        ws_isActive: true,
        ws_id: wsqDetails[0].wsq_wsId
    }
    await workStationService.updateWorkstationStatus(updateStatusData);

    //Deduct with -1 from the Total Planned from its department
    var deductData = {
        quarter_id: wsqDetails[0].wsq_quarterId,
        numtotalDeduction: 1
    };

    await this.deductQuarterPlanned(deductData);

    var result = await this.deleteWorkstationQuarterlyNoReso(body);

    return result;
}

module.exports.deleteWorkstationQuarterlyCompleted = async (body) => {
    var wsqDetails = await this.getQuarterlyWorkstationOnly(body);

    //Deduct with -1 from the Total Actual from its department
    var deductData = {
        quarter_id: wsqDetails[0].wsq_quarterId,
        numtotalDeduction: 1
    };

    await this.deductQuarterActual(deductData);

    //Deduct with -1 from the Total Planned from its department
    var deductData = {
        quarter_id: wsqDetails[0].wsq_quarterId,
        numtotalDeduction: 1
    };

    await this.deductQuarterPlanned(deductData);

    //Deduct with -1 from the Total Planned from its next semester of the department
    var deductMonthData = {
        quarter_id: wsqDetails[0].wsq_quarterId,
        numMonthlyInterval: 3,
        numtotalDeduction: 1
    };

    await this.deductQuarterPlannedByMonthlyQuarterInterval(deductMonthData);

    var result = await this.deleteWorkstationQuarterlyNoReso(body);

    return result;
}

module.exports.deleteWorkstationQuarterlyDeferred = async (body) => {
    var wsqDetails = await this.getQuarterlyWorkstationOnly(body);

    //Deduct with -1 from the Total Deferred from its department
    var deductData = {
        quarter_id: wsqDetails[0].wsq_quarterId,
        numtotalDeduction: 1
    };

    await this.deductQuarterDeferred(deductData);

    //Deduct with -1 from the Total Planned from its department
    var deductData = {
        quarter_id: wsqDetails[0].wsq_quarterId,
        numtotalDeduction: 1
    };

    await this.deductQuarterPlanned(deductData);

    //Deduct with -1 from the Total Planned from its next semester of the department
    var deductMonthData = {
        quarter_id: wsqDetails[0].wsq_quarterId,
        numMonthlyInterval: 3,
        numtotalDeduction: 1
    };

    await this.deductQuarterPlannedByMonthlyQuarterInterval(deductMonthData);

    var result = await this.deleteWorkstationQuarterlyNoReso(body);

    return result;
}

module.exports.getWorkstationQuarterlyHasFutureRecord = async (body) => {
    //Get the wsq data and its quarter data
    var wsq = await this.getQuarterlyWorkstationOnly({wsq_id: body.wsq_id});

    //Get the quarter data 
    var quarter = await this.getQuarter({quarter_id: wsq[0].wsq_quarterId});
    
    //Calculate the next monthly quarter based from the first wsq data as the basis for the second wsq data to compare as reference
    var nextMonth = quarter[0].quarter_monthlyQuarter + 3;

    if(nextMonth >= 13){
        return false;
    }

    //Get the quarter data based from the next monthly quarter and the dept id of the first gathered quarter data
    let nextQuarterData = {
        quarter_pDeptId: quarter[0].quarter_pDeptId,
        quarter_monthlyQuarter: nextMonth
    };
    var nextQuarter = await this.getQuarterByPmsDeptIdAndMonthlyQuarter(nextQuarterData);

    if(nextQuarter.length == 0){
        return false;
    }

    //Get the wsq data based from the new quarter id gathered and the ws id of the first wsq data
    let nextWsqData = {
        wsq_quarterId: nextQuarter[0].quarter_id,
        wsq_wsId: wsq[0].wsq_wsId
    };
    var nextWsq = await this.getQuarterlyWorkstationByQuarterIdAndWorkstationId(nextWsqData);

    //If it exists, then it has a next record from the past month and the data should not be deleted to avoid breaking the data 
    return nextWsq.length !== 0 ? nextWsq[0] : null; 
}

module.exports.deductQuarterActual = async(body) => {
    var resultQuarter = await this.getDepartmentAndQuarterlyDetailsById({quarter_id: body.quarter_id});
    let newQuarterNumActual = resultQuarter[0].quarter_numActual - body.numtotalDeduction;

    let quarterActualData = {
        quarter_numActual: newQuarterNumActual,
        quarter_id: body.quarter_id
    };

    return await this.updateQuarterActual(quarterActualData);
}

module.exports.deductQuarterPlanned = async(body) => {
    var resultQuarter = await this.getDepartmentAndQuarterlyDetailsById({quarter_id: body.quarter_id});
    let newQuarterNumPlanned = resultQuarter[0].quarter_numPlanned - body.numtotalDeduction;

    let quarterPlannedData = {
        quarter_numPlanned: newQuarterNumPlanned,
        quarter_id: body.quarter_id
    };

    return await this.updateQuarterPlanned(quarterPlannedData);
}

module.exports.deductQuarterDeferred = async(body) => {
    var resultQuarter = await this.getDepartmentAndQuarterlyDetailsById({quarter_id: body.quarter_id});
    let newQuarterNumDeferred = resultQuarter[0].quarter_numDeferred - body.numtotalDeduction;

    let quarterDeferredData = {
        quarter_numDeferred: newQuarterNumDeferred,
        quarter_id: body.quarter_id
    };

    return await this.updateQuarterDeferred(quarterDeferredData);
}

module.exports.deductQuarterPlannedByMonthlyQuarterInterval = async(body) => {
    var resultQuarter = await this.getDepartmentAndQuarterlyDetailsById({quarter_id: body.quarter_id});
    let quarterSemesterData = {
        quarter_pDeptId: resultQuarter[0].quarter_pDeptId,
        quarter_monthlyQuarter: resultQuarter[0].quarter_monthlyQuarter + body.numMonthlyInterval
    };

    let resultMonthQuarter = await this.getQuarterByPmsDeptIdAndMonthlyQuarter(quarterSemesterData);

    if(resultMonthQuarter.length != 0){
        let newQuarterNumPlanned = resultMonthQuarter[0].quarter_numPlanned - body.numtotalDeduction;

        let quarterPlannedData = {
            quarter_numPlanned: newQuarterNumPlanned,
            quarter_id: resultMonthQuarter[0].quarter_id
        };

        let result = await this.updateQuarterPlanned(quarterPlannedData);

        return (result == Constants.HAS_UPDATED_DATA) ? Constants.HAS_UPDATED_DATA : Constants.STATUS_CODE_ERROR;
    }

    return Constants.STATUS_CODE_ERROR;
}

module.exports.deleteWorkstationQuarterlyCondemned = async (body) => {
    var wsqDetails = await this.getQuarterlyWorkstationAndWsOnly(body);
    var wsAndCompDetails = await workStationService.getWorkstationAndComputerByWsId({ws_id: wsqDetails[0].wsq_wsId})

    //Revert back the workstation from being inactive
    var updateWsStatusData = {
        ws_isActive: true,
        ws_id: wsqDetails[0].wsq_wsId
    }
    await workStationService.updateWorkstationStatus(updateWsStatusData);

    //Revert back the computer status to being active
    var computer = await computerService.getComputer({comp_id: wsAndCompDetails[0].comp_id});
    
    var updateComputerStatusData = {
        comp_status: Constants.COMP_STATUS_ACTIVE,
        comp_id: computer[0].comp_id
    } 

    await computerService.updateComputerStatus(updateComputerStatusData);

    //Deduct with -1 from the Total Planned from its department
    var deductData = {
        quarter_id: wsqDetails[0].wsq_quarterId,
        numtotalDeduction: 1
    };

    await this.deductQuarterPlanned(deductData);

    var result = await this.deleteWorkstationQuarterlyNoReso(body);
    return result;
}

module.exports.deleteWorkstationQuarterlyById = async (body) => {
    const result = await quarterRepository.deleteWorkstationQuarterlyById(body);

    return (result.affectedRows == Constants.HAS_NO_DATA_DELETED) ? Constants.STATUS_CODE_ERROR : Constants.STATUS_CODE_SUCCESS;
}

module.exports.deleteQuarterByDeptId = async (body) => {
    const result = await quarterRepository.deleteQuarterByDeptId(body);

    return (result.affectedRows == Constants.HAS_NO_DATA_DELETED) ? Constants.STATUS_CODE_ERROR : Constants.STATUS_CODE_SUCCESS;
}

module.exports.getArrMonthlyQuartersByBatch = (batch) => {
    switch(batch){
        case Constants.BATCH_1:{
            return [1, 4, 7, 10];
        }break;
        case Constants.BATCH_2:{
            return [2, 5, 8, 11];
        }break;
        case Constants.BATCH_3:{
            return [3, 6, 9, 12];
        }break;
    }
}

module.exports.getListOfQuarterlyByYearAndMonth = async (body) => {
    return await quarterRepository.getListOfQuarterlyByYearAndMonth(body);
}

module.exports.getQuarterByPmsDeptIdMonthlyQuarterAndLastQuarter = async (body) => {
    return await quarterRepository.getQuarterByPmsDeptIdMonthlyQuarterAndLastQuarter(body);
}

module.exports.getListOfQuarterlyByYear = async (body) => {
    return await quarterRepository.getListOfQuarterlyByYear(body);
}

module.exports.getListOfQuarterlyBySchedId = async (body) => {
    return await quarterRepository.getListOfQuarterlyBySchedId(body);
}

module.exports.getListOfQuarterlyFirstQuarterBySchedId = async (body) => {
    return await quarterRepository.getListOfQuarterlyFirstQuarterBySchedId(body);
}

module.exports.getQuarter = async (body) => {
    return await quarterRepository.getQuarter(body);
}

module.exports.getDepartmentAndQuarterlyDetailsById = async (body) => {
    return await quarterRepository.getDepartmentAndQuarterlyDetailsById(body);
}

module.exports.getDepartmentWorkstationQuarterlyDetailsByWsqId = async (body) => {
    return await quarterRepository.getDepartmentWorkstationQuarterlyDetailsByWsqId(body);
}

module.exports.getQuarterlyWorkstationOnly = async (body) => {
    return await quarterRepository.getQuarterlyWorkstationOnly(body);
}

module.exports.getQuarterlyWorkstationAndWsOnly = async (body) => {
    return await quarterRepository.getQuarterlyWorkstationAndWsOnly(body);
}

module.exports.getListOfQuarterlyWorkstationById = async (body) => {
    return await quarterRepository.getListOfQuarterlyWorkstationById(body);
}

module.exports.getQuarterlyWorkstationByDeptDetailsAndMonth = async (body) => {
    return await quarterRepository.getQuarterlyWorkstationByDeptDetailsAndMonth(body);
}

module.exports.getQuarterlyWorkstationAndCompByWsqId = async (body) => {
    return await quarterRepository.getQuarterlyWorkstationAndCompByWsqId(body);
}

module.exports.getListOfQuarterlyWorkstationOnlyById = async (body) => {
    return await quarterRepository.getListOfQuarterlyWorkstationOnlyById(body);
}

module.exports.getListOfQuarterlyWorkstationOnlyByIdWithStatusAndReso = async (body) => {
    return await quarterRepository.getListOfQuarterlyWorkstationOnlyByIdWithStatusAndReso(body);
}

module.exports.getListOfQuarterlyWorkstationOnlyByIdAndStatus = async (body) => {
    return await quarterRepository.getListOfQuarterlyWorkstationOnlyByIdAndStatus(body);
}

module.exports.getQuarterByPmsDeptIdAndMonthlyQuarter = async (body) => {
    return await quarterRepository.getQuarterByPmsDeptIdAndMonthlyQuarter(body);
}

module.exports.getListOfQuarterlyWorkstationBySchedIdAndMonthlyQuarters = async (body) => {
    return await quarterRepository.getListOfQuarterlyWorkstationBySchedIdAndMonthlyQuarters(body);
}

module.exports.getListOfQuarterlyWorkstationByCompIdAndNotStatus = async (body) => {
    return await quarterRepository.getListOfQuarterlyWorkstationByCompIdAndNotStatus(body);
}

module.exports.getQuarterByPmsDeptId = async (body) => {
    return await quarterRepository.getQuarterByPmsDeptId(body);
}

module.exports.getQuarterlyWorkstationDetailsByWsqIds = async (body) => {
    return await quarterRepository.getQuarterlyWorkstationDetailsByWsqIds(body);
}

module.exports.getFirstQuarterlyWorkstationByYearAndDeptId = async (body) => {
    return await quarterRepository.getFirstQuarterlyWorkstationByYearAndDeptId(body);
}

module.exports.getFirstQuarterlyWorkstationBySchedIdAndDeptId = async (body) => {
    return await quarterRepository.getFirstQuarterlyWorkstationBySchedIdAndDeptId(body);
}

module.exports.checkWorkstationIsCompleteBySchedId = async (body) => {
    return await quarterRepository.checkWorkstationIsCompleteBySchedId(body);
}

module.exports.checkIfWsqHasConducted = async (body) => {
    var result = await quarterRepository.getQuarterlyWorkstationOnly(body);

    if(result[0].wsq_hasConducted == true){
        return true;
    }
    
    return false;
}

module.exports.getListOfWorkstationsByQtrStatusAndSchedId = async (body) => {
    var listOfWorkstationsString = ``;
    var listOfWorkstations = body.listOfWorkstations;

    for (var workstation in listOfWorkstations) {
        listOfWorkstationsString += `${workstation.ws_id},`;
    }

    listOfWorkstationsString = listOfWorkstationsString.slice(0, -1);
    body.listOfWorkstationsString = listOfWorkstationsString;

    return await quarterRepository.getListOfWorkstationsByQtrStatusAndSchedId(body);
}

module.exports.getListOfWorkstationsByQtrNotStatusAndSchedId = async (body) => {
    var listOfWorkstationsString = ``;
    var listOfWorkstations = body.listOfWorkstations;

    for (var key in listOfWorkstations) {
        listOfWorkstationsString += `${listOfWorkstations[key].ws_id},`;
    }

    listOfWorkstationsString = listOfWorkstationsString.slice(0, -1);
    body.listOfWorkstationsString = listOfWorkstationsString;

    return await quarterRepository.getListOfWorkstationsByQtrNotStatusAndSchedId(body);
}

module.exports.createQuarterlyWorkstation = async (body) => {
    //Create workstation
    var data_workStation = {
        ws_compId: body.ws_compId,
        ws_userId: body.ws_userId,  
        ws_userName: body.ws_userName,
        ws_computerName: body.ws_computerName,
        ws_location: body.ws_location,
        ws_ipAddress: body.ws_ipAddress,
        ws_isActive: body.ws_isActive,
        ws_ipType: body.ws_ipType
    }

    var result_workStation = await workStationService.createWorkStation(data_workStation);

    //Create quarterly and add workstation
    var data_quarterlyWorkstation = {
        wsq_quarterId: body.quarter_id,
        wsq_wsId: Number(result_workStation['insertId']),
        wsq_checkedBy: null,
        wsq_checkedByUserName: null,
        wsq_checkedAt: null,
        wsq_acknowledgedBy: null, 
        wsq_acknowledgedByUserName: null, 
        wsq_acknowledgedAt: null,
        wsq_status: Constants.WSQ_STATUS_PENDING
    }

    var result_qtyWorkstation = await this.createWorkstationForQuarterly(data_quarterlyWorkstation);
    var wsq_id = Number(result_qtyWorkstation['insertId']);

    //Create the software checklist placeholders
    await this.createQtySoftwarePlaceholdersByActiveStatus({wsq_id: wsq_id,
                                                            sw_isActive: true,
                                                            sw_IsOthers: false});

    //Create the hardware checklist placeholders
    await this.createQtyHardwarePlaceholdersByActiveStatus({wsq_id: wsq_id,
                                                            hw_isActive: true,
                                                            hw_IsOthers: false});

    //Create the checklist items
    await this.createQtyChecklistItems({
        wsq_id: wsq_id,
        chk_isActive: true
    });

    //Increment the quarterly count of the plan
    let addUpdateData = {
        quarter_id: body.quarter_id,
        numtotalDeduction: 1
    }

    await this.addQuarterPlanned(addUpdateData);

    return result_workStation;
}

module.exports.createQuarterlyWorkstationRecordCompAuditTrail = async(body) => {
    var currentDateAndTime = moment(new Date().toISOString()).format('YYYY-MM-DD HH:mm:ss');

    await this.createQuarterlyWorkstation(body);

    //Record the audit trail for computer data
    let data = {
        compAudit_compId: body.ws_compId,
        compAudit_message: body.compAudit_message,
        compAudit_date: currentDateAndTime
    };

    await computerAuditTrailService.createComputerAuditTrail(data);
}

module.exports.createQuarterlyWorkstationRecordCompAuditTrailWithWsId = async(body) => {
    var currentDateAndTime = moment(new Date().toISOString()).format('YYYY-MM-DD HH:mm:ss');

    var workstation = await this.createQuarterlyWorkstation(body);

    //Record the audit trail for computer data
    let data = {
        compAudit_compId: body.ws_compId,
        compAudit_message: body.compAudit_message + Number(workstation['insertId']),
        compAudit_date: currentDateAndTime
    };

    await computerAuditTrailService.createComputerAuditTrail(data);
}

module.exports.createQtySoftwarePlaceholders = async (body) => {
    var listSoftware = await softwareService.getListOfSoftwareWoOthers({sw_IsOthers: false});

    for (const key in listSoftware) {
        let softwareObj = {
            qtysoft_wsqId: body.wsq_id,
            qtysoft_swId: listSoftware[key].sw_id,
            qtysoft_status: null,
            qtysoft_brandId: null,
            qtysoft_remarks: null
        }

        await softwareService.createQuarterlyWorkstationSoftware(softwareObj);
    }
}

module.exports.createQtySoftwarePlaceholdersByActiveStatus = async (body) => {
    var listSoftware = await softwareService.getListOfSoftwareByStatusAndOthers({sw_isActive: body.sw_isActive,
                                                                                 sw_IsOthers: body.sw_IsOthers});

    for (const key in listSoftware) {
        let softwareObj = {
            qtysoft_wsqId: body.wsq_id,
            qtysoft_swId: listSoftware[key].sw_id,
            qtysoft_status: null,
            qtysoft_brandId: null,
            qtysoft_remarks: null
        }

        await softwareService.createQuarterlyWorkstationSoftware(softwareObj);
    }
}

module.exports.createQtySoftwarePrevDataByActiveStatus = async (body) => {
    var listSoftware = await softwareService.getListOfSoftware();
    var listPrevSoftware = await softwareService.getListOfWsSoftwareDetailsByWsqId({qtysoft_wsqId: body.old_wsq_id});

    for (const key in listSoftware){
        let oldSoftwareData = listPrevSoftware.find(item => item.qtysoft_swId == listSoftware[key].sw_id);

        if(oldSoftwareData != undefined && oldSoftwareData != null){
            let softwareObj = {
                qtysoft_wsqId: body.new_wsq_id,
                qtysoft_swId: listSoftware[key].sw_id,
                qtysoft_status: oldSoftwareData.qtysoft_status,
                qtysoft_brandId: oldSoftwareData.qtysoft_brandId,
                qtysoft_remarks: oldSoftwareData.qtysoft_remarks
            }

            await softwareService.createQuarterlyWorkstationSoftware(softwareObj);
        }
    }
}

module.exports.createQtyChecklistItemsPrevDataByActiveStatus = async (body) => {
    var listPrevChecklistItems = await checklistItemService.getWorkstationQuarterlyChecklistItemsByWsqId({qtychk_wsqId: body.old_wsq_id});

    for (const item of listPrevChecklistItems) {
        let checklistItemObj = {
            qtychk_wsqId: body.new_wsq_id,
            qtychk_chkId: item.qtychk_chkId,
            qtychk_status: item.qtychk_status
        }

        await checklistItemService.createQuarterlyWorkstationChecklistItem(checklistItemObj);
    }
}

module.exports.createQtySoftwareRefPrevData = async (body) => {
    var listPrevSoftware = await softwareService.getListOfSoftwareReferenceByWsqId({refsw_wsqId: body.old_wsq_id});

    for (const key in listPrevSoftware){
        let softwareRef = {
            refsw_swId: listPrevSoftware[key].refsw_swId,
            refsw_wsqId: body.new_wsq_id
        };
                                                     
        await softwareService.createSoftwareReference(softwareRef);
    }
}

module.exports.createQtyHardwarePrevDataByActiveStatus = async (body) => {
    var listHardware = await hardwareService.getListOfHardware();
    var listPrevHardware = await hardwareService.getListOfWsHardwareDetailsByWsqId({qtyhard_wsqId: body.old_wsq_id});

    for (const key in listHardware){
        let oldHardwareData = listPrevHardware.find(item => item.qtyhard_hwId == listHardware[key].hw_id);

        if(oldHardwareData != undefined && oldHardwareData != null){
            let hardwareObj = {
                qtyhard_wsqId: body.new_wsq_id,
                qtyhard_hwId: listHardware[key].hw_id,
                qtyhard_status: oldHardwareData.qtyhard_status,
                qtyhard_brandId: oldHardwareData.qtyhard_brandId,
                qtyhard_remarks: oldHardwareData.qtyhard_remarks
            }

            await hardwareService.createQuarterlyWorkstationHardware(hardwareObj);
        }
    }
}

module.exports.createQtyHardwareRefPrevData = async (body) => {
    var listPrevHardware = await hardwareService.getListOfHardwareReferenceByWsqId({refhw_wsqId: body.old_wsq_id});

    for (const key in listPrevHardware){
        let hardwareRef = {
            refhw_hwId: listPrevHardware[key].refhw_hwId,
            refhw_wsqId: body.new_wsq_id
        };
                                                     
        await hardwareService.createHardwareReference(hardwareRef);
    }
}

module.exports.createQtySoftwarePlaceholdersCustomList = async(body) => {
    var newQtyWsqIds = [];
    var softwareList = body.softwareList;

    for (const key in softwareList) {
        let softwareObj = {
            qtysoft_wsqId: body.wsq_id,
            qtysoft_swId: softwareList[key].sw_id,
            qtysoft_status: null,
            qtysoft_brandId: null,
            qtysoft_remarks: null
        }

        let result = await softwareService.createQuarterlyWorkstationSoftware(softwareObj);
        newQtyWsqIds.push(result['insertId']);
    }

    return newQtyWsqIds;
}

module.exports.createQtyHardwarePlaceholders = async (body) => {
    var listHardware = await hardwareService.getListOfHardwareWoOthers({hw_IsOthers: false});
    
    for (const key in listHardware) {
        let hardwareObj = {
            qtyhard_wsqId: body.wsq_id,
            qtyhard_hwId: listHardware[key].hw_id,
            qtyhard_status: null,
            qtyhard_brandId: null,
            qtyhard_remarks: null
        }

        await hardwareService.createQuarterlyWorkstationHardware(hardwareObj);
    }
}

module.exports.createQtyHardwarePlaceholdersByActiveStatus = async (body) => {
    var listHardware = await hardwareService.getListOfHardwareByStatusAndOthers({hw_isActive: body.hw_isActive,
                                                                                 hw_IsOthers: body.hw_IsOthers});

    for (const key in listHardware) {
        let hardwareObj = {
            qtyhard_wsqId: body.wsq_id,
            qtyhard_hwId: listHardware[key].hw_id,
            qtyhard_status: null,
            qtyhard_brandId: null,
            qtyhard_remarks: null
        }

        await hardwareService.createQuarterlyWorkstationHardware(hardwareObj);
    }
}

module.exports.createQtyChecklistItems = async (body) => {
    var listChecklistItems = await checklistItemService.getListOfChecklistItemsByStatus({chk_isActive: body.chk_isActive});

    for (const key in listChecklistItems) {
        let checklistItemObj = {
            qtychk_wsqId: body.wsq_id,
            qtychk_chkId: listChecklistItems[key].chk_id,
            qtychk_status: false
        }

        await checklistItemService.createQuarterlyWorkstationChecklistItem(checklistItemObj);
    }
}

module.exports.createQtyHardwarePlaceholdersCustomList = async(body) => {
    var newQtyWsqIds = [];
    var hardwareList = body.hardwareList;

    for (const key in hardwareList) {
        let hardwareObj = {
            qtyhard_wsqId: body.wsq_id,
            qtyhard_hwId: hardwareList[key].hw_id,
            qtyhard_status: null,
            qtyhard_brandId: null,
            qtyhard_remarks: null
        }

        let result = await hardwareService.createQuarterlyWorkstationHardware(hardwareObj);
        newQtyWsqIds.push(result['insertId']);
    }

    return newQtyWsqIds;
}

module.exports.addQtyHardwarePlaceholdersCustomListIndex = async(body) => {
    var listOfNewlyAddedWsqHardware = [];
    var result = await this.createQtyHardwarePlaceholdersCustomListIndex(body);

    for(var item of result){
        let wsqHardware = await hardwareService.getWsHardwareDetailsByWsqId({qtyhard_id: item});

        if(wsqHardware.length !== 0){
            listOfNewlyAddedWsqHardware.push(wsqHardware[0]);
        }
    }

    return listOfNewlyAddedWsqHardware;
}

module.exports.addQtySoftwarePlaceholdersCustomListIndex = async(body) => {
    var listOfNewlyAddedWsqSoftware = [];
    var result = await this.createQtySoftwarePlaceholdersCustomListIndex(body);

    for(var item of result){
        let wsqSoftware = await softwareService.getWsSoftwareDetailsByWsqId({qtysoft_id: item});

        if(wsqSoftware.length !== 0){
            listOfNewlyAddedWsqSoftware.push(wsqSoftware[0]);
        }
    }

    return listOfNewlyAddedWsqSoftware;
}

module.exports.addQtyChecklistItemsPlaceholdersCustomListIndex = async(body) => {
    var listOfNewlyAddedWsqChecklist = [];
    var result = await this.createQtyChecklistItemPlaceholdersCustomListIndex(body);

    for(var item of result){
        let wsqChecklistItem = await checklistItemService.getWorkstationQuarterlyChecklistItemDetailsById({qtychk_id: item});

        if(wsqChecklistItem.length !== 0){
            listOfNewlyAddedWsqChecklist.push(wsqChecklistItem[0]);
        }
    }

    return listOfNewlyAddedWsqChecklist;
}

module.exports.createQtyHardwarePlaceholdersCustomListIndex = async(body) => {
    var newQtyWsqIds = [];
    var hardwareList = body.hardwareList;

    for (const key in hardwareList) {
        let hardwareObj = {
            qtyhard_wsqId: body.wsq_id,
            qtyhard_hwId: hardwareList[key],
            qtyhard_status: null,
            qtyhard_brandId: null,
            qtyhard_remarks: null
        }

        let result = await hardwareService.createQuarterlyWorkstationHardware(hardwareObj);
        newQtyWsqIds.push(result['insertId']);
    }

    return newQtyWsqIds;
}

module.exports.createQtySoftwarePlaceholdersCustomListIndex = async(body) => {
    var newQtyWsqIds = [];
    var softwareList = body.softwareList;

    for (const key in softwareList) {
        let softwareObj = {
            qtysoft_wsqId: body.wsq_id,
            qtysoft_swId: softwareList[key],
            qtysoft_status: null,
            qtysoft_brandId: null,
            qtysoft_remarks: null
        }

        let result = await softwareService.createQuarterlyWorkstationSoftware(softwareObj);
        newQtyWsqIds.push(result['insertId']);
    }

    return newQtyWsqIds;
}

module.exports.createQtyChecklistItemPlaceholdersCustomListIndex = async(body) => {
    var newQtyWsqIds = [];
    var checklistItems = body.checklistItems;

    for (const key in checklistItems) {
        let checklistItemObj = {
            qtychk_wsqId: body.wsq_id,
            qtychk_chkId: checklistItems[key],
            qtychk_status: false
        }

        let result = await checklistItemService.createQuarterlyWorkstationChecklistItem(checklistItemObj);
        newQtyWsqIds.push(result['insertId']);
    }

    return newQtyWsqIds;
}

module.exports.addQuarterlyWorkStation = async (body) => {
    //Create quarterly and add workstation
    var data_quarterlyWorkstation = {
        wsq_quarterId: body.quarter_id,
        wsq_wsId: body.ws_id,
        wsq_checkedBy: null,
        wsq_checkedByUserName: null,
        wsq_checkedAt: null,
        wsq_acknowledgedBy: null, 
        wsq_acknowledgedByUserName: null, 
        wsq_acknowledgedAt: null,
        wsq_status: Constants.WSQ_STATUS_PENDING
    }

    var result_qtyWorkstation = await this.createWorkstationForQuarterly(data_quarterlyWorkstation);
    var wsq_id = Number(result_qtyWorkstation['insertId']);

    await this.createQtyWsqSystemComponentPlaceholders({wsq_id: wsq_id});
    await this.createQtyChecklistItems({
        wsq_id: wsq_id,
        chk_isActive: true
    });

    return wsq_id;
}

module.exports.createQtyWsqSystemComponentPlaceholders = async (body) => {
    //Create the software checklist placeholders
    await this.createQtySoftwarePlaceholdersByActiveStatus({wsq_id: body.wsq_id,
                                                            sw_isActive: true,
                                                            sw_IsOthers: false});

    //Create the hardware checklist placeholders
    await this.createQtyHardwarePlaceholdersByActiveStatus({wsq_id: body.wsq_id,
                                                            hw_isActive: true,
                                                            hw_IsOthers: false});
}

module.exports.addQuarterlyWorkStationWithPrevData = async (body) => {
    //Create quarterly and add workstation
    var data_quarterlyWorkstation = {
        wsq_quarterId: body.quarter_id,
        wsq_wsId: body.ws_id,
        wsq_checkedBy: null,
        wsq_checkedByUserName: null,
        wsq_checkedAt: null,
        wsq_acknowledgedBy: null, 
        wsq_acknowledgedByUserName: null, 
        wsq_acknowledgedAt: null,
        wsq_status: Constants.WSQ_STATUS_PENDING
    }

    var result_qtyWorkstation = await this.createWorkstationForQuarterly(data_quarterlyWorkstation);
    var new_wsq_id = Number(result_qtyWorkstation['insertId']);

    var data_qtyWsqs = {
        old_wsq_id: body.wsq_id,     //Previous or last month's Wsq id that relates to this new next monthly Wsq Id
        new_wsq_id: new_wsq_id
    };

    await this.createQtyWsqSystemComponentWithPrevData(data_qtyWsqs);
    await this.createQtyChecklistItemsPrevDataByActiveStatus(data_qtyWsqs);

    return new_wsq_id;
}

module.exports.createQtyWsqSystemComponentWithPrevData = async (body) => {
    //Create the software checklist with carried over data
    await this.createQtySoftwarePrevDataByActiveStatus({old_wsq_id: body.old_wsq_id,
                                                        new_wsq_id: body.new_wsq_id});

    //Create the hardware checklist with carried over data
    await this.createQtyHardwarePrevDataByActiveStatus({old_wsq_id: body.old_wsq_id,
                                                        new_wsq_id: body.new_wsq_id});
}

module.exports.createQtyWsqSystemComponentRefPrevData = async (body) => {
    //Create the software reference with carried over data
    await this.createQtySoftwareRefPrevData({old_wsq_id: body.old_wsq_id,
                                             new_wsq_id: body.new_wsq_id});

    //Create the hardware reference with carried over data
    await this.createQtyHardwareRefPrevData({old_wsq_id: body.old_wsq_id,
                                            new_wsq_id: body.new_wsq_id});
}

module.exports.addMultipleQuarterlyWorkStation = async (body) => {
    var listOfAddedExistingWorkstation = body.listOfAddedExistingWorkstation;
    var quarter_id = body.quarter_id;
    var numtotalDeduction = 0;

    for (const key in listOfAddedExistingWorkstation) { 
        //Do not save workstation in the quarterly if it has already been existed
        let data_existingWs = {
            wsq_quarterId: quarter_id,
            wsq_wsId: Number(listOfAddedExistingWorkstation[key].ws_id)
        };
        let result_existedQsWs = await this.getQuarterlyWorkstationByQuarterIdAndWorkstationId(data_existingWs);

        if(result_existedQsWs.length !== 0){
            continue;
        }

        //Create workstation quarterly for the quarter
        let data_quarterlyWorkstation = {
            wsq_quarterId: quarter_id,
            wsq_wsId: Number(listOfAddedExistingWorkstation[key].ws_id),
            wsq_checkedBy: null,
            wsq_checkedByUserName: null,
            wsq_checkedAt: null,
            wsq_acknowledgedBy: null, 
            wsq_acknowledgedByUserName: null, 
            wsq_acknowledgedAt: null,
            wsq_status: Constants.WSQ_STATUS_PENDING
        }

        let result_qtyWorkstation = await this.createWorkstationForQuarterly(data_quarterlyWorkstation);
        let wsq_id = Number(result_qtyWorkstation['insertId']);

        ++numtotalDeduction;

        //Create the software checklist placeholders
        var listSoftware = await softwareService.getListOfSoftwareByStatusAndOthers({sw_isActive: true,
                                                                                     sw_IsOthers: false});

        for (const key in listSoftware) {
            let softwareObj = {
                qtysoft_wsqId: wsq_id,
                qtysoft_swId: listSoftware[key].sw_id,
                qtysoft_status: null,
                qtysoft_brandId: null,
                qtysoft_remarks: null
            }

            await softwareService.createQuarterlyWorkstationSoftware(softwareObj);
        }

        //Create the hardware checklist placeholders
        var listHardware = await hardwareService.getListOfHardwareByStatusAndOthers({hw_isActive: true,
                                                                                     hw_IsOthers: false});
         
        for (const key in listHardware) {
            let hardwareObj = {
                qtyhard_wsqId: wsq_id,
                qtyhard_hwId: listHardware[key].hw_id,
                qtyhard_status: null,
                qtyhard_brandId: null,
                qtyhard_remarks: null
            }

            await hardwareService.createQuarterlyWorkstationHardware(hardwareObj);
        }

        //Create the checklist items
        await this.createQtyChecklistItems({
            wsq_id: wsq_id,
            chk_isActive: true
        });
    }

    //Increment the quarterly count of the plan based from the number of workstations added in the quarter
    if(numtotalDeduction !== 0){
        let addUpdateData = {
            quarter_id: quarter_id,
            numtotalDeduction: numtotalDeduction
        }
    
        await this.addQuarterPlanned(addUpdateData);
    }
}

module.exports.addQuarterlyWorkstationLastPrevRecord = async (body) => {
    var currentDateAndTime = moment(new Date().toISOString()).format('YYYY-MM-DD HH:mm:ss');

    //Get the previous or last year sched data
    var latestSchedData = await pmsService.getPmsScheduleById(body);
    var prevSchedData = await pmsService.getPmsScheduleByYear({sched_year: latestSchedData[0].sched_year - 1});

    let data = {
        pdept_schedId: prevSchedData[0].sched_id,
        pdept_locationId: body.pdept_locationId
    };     

    let quarterData = await this.getQuarterByPmsDeptIdMonthlyQuarterAndLastQuarter(data);     //Quarter data

    if(quarterData.length !== 0){
        let newQuarterlyData = await this.getFirstQuarterlyWorkstationBySchedIdAndDeptId(body);

        let quarterWsqData = {
            wsq_quarterId: quarterData[0].quarter_id,
            wsq_status: Constants.WSQ_STATUS_COMPLETE
        }
        let listOfWsq = await this.getListOfQuarterlyWorkstationOnlyByIdAndStatus(quarterWsqData);     //Quarter data's WSQ

        //Replicating the WSQ data
        for(const idx in listOfWsq){
            let wsq_resolution = listOfWsq[idx].wsq_resolution;

            switch(Number(wsq_resolution)){
                case Constants.WSQ_RESOLUTION_COMPLETE: {
                    let newWorkstationQuarterlyData = {
                        quarter_id: newQuarterlyData[0].quarter_id,
                        ws_id: listOfWsq[idx].wsq_wsId,
                        wsq_id: listOfWsq[idx].wsq_id
                    };
        
                    let new_wsq_id = await this.addQuarterlyWorkStationWithPrevData(newWorkstationQuarterlyData);

                    let params1 = {
                        old_wsq_id: listOfWsq[idx].wsq_id,
                        new_wsq_id: new_wsq_id
                    };

                    await this.createQtyWsqSystemComponentRefPrevData(params1);

                    let new_wsq_data = await this.getQuarterlyWorkstationAndCompByWsqId({wsq_id: new_wsq_id})

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
                        quarter_id: newQuarterlyData[0].quarter_id,
                        ws_id: listOfWsq[idx].wsq_wsId
                    };
        
                    let new_wsq_id = await this.addQuarterlyWorkStation(newWorkstationQuarterlyData);

                    let params1 = {
                        old_wsq_id: listOfWsq[idx].wsq_id,
                        new_wsq_id: new_wsq_id
                    };

                    await this.createQtyWsqSystemComponentRefPrevData(params1);
                }break;
            }
        }

        //Replicating the Quarter data
        let quarterReplicateData = {
            quarter_numPlanned: quarterData[0].quarter_numActual + quarterData[0].quarter_numDeferred,
            quarter_id: newQuarterlyData[0].quarter_id
        };

        await this.updateQuarterPlanned(quarterReplicateData);
    }

    return Constants.STATUS_CODE_SUCCESS;
}

module.exports.getQuarterlyWorkstationByQuarterIdAndWorkstationId = async (body) => {
    return await quarterRepository.getQuarterlyWorkstationByQuarterIdAndWorkstationId(body);
} 

module.exports.createWorkstationForQuarterly = async (body) => {
    return await quarterRepository.createWorkstationForQuarterly(body);
}

module.exports.updateQuarterlyWorkstation = async (body) => {
    //Update the status
    var data = {
        wsq_status: body.wsq_status,
        wsq_resolution: body.wsq_resolution,
        wsq_id: body.wsq_id
    };

    await this.updateQuarterlyWorkstationStatusAndResolutionByIdOnly(data);

    //Update Remarks
    var remarksData = {
        wsq_remarks: body.wsq_remarks,
        wsq_id: body.wsq_id
    };

    await this.updateQuarterlyWorkstationRemarks(remarksData);

    //Update the Software Checklist
    var listSoftware = body.softwareForm;

    for (const key in listSoftware) {
        if(listSoftware[key].sw_isNew){
            //Add it in the database but treat is as from "Others"
            let data = {
                sw_name: listSoftware[key].sw_name,
                sw_description:  listSoftware[key].sw_description,
                sw_isActive: true,
                sw_isOthers: true
            };

            let result = await softwareService.createSoftware(data);

            let software = {
                qtysoft_wsqId: body.wsq_id,
                qtysoft_swId: Number(result['insertId']),
                qtysoft_status: listSoftware[key].qtysoft_status,
                qtysoft_brandId: listSoftware[key].qtysoft_brandId,
                qtysoft_remarks: listSoftware[key].qtysoft_remarks
            };

            await softwareService.createQuarterlyWorkstationSoftware(software);

        } else {
            let software = {
                qtysoft_remarks: listSoftware[key].qtysoft_remarks,
                qtysoft_status: listSoftware[key].qtysoft_status,
                qtysoft_brandId: listSoftware[key].qtysoft_brandId,
                qtysoft_id: listSoftware[key].qtysoft_id
            };
    
            await softwareService.updateQuarterlyWorkstationSoftwareById(software);
        }
    }

    //Update the Hardware Checklist 
    var listHardware = body.hardwareForm;

    for (const key in listHardware) {
        if(listHardware[key].hw_isNew){
            //Add it in the database but treat is as from "Others"
            let data = {
                hw_name: listHardware[key].hw_name,
                hw_description:  listHardware[key].hw_description,
                hw_isActive: true,
                hw_isOthers: true
            }

            let result = await hardwareService.createHardware(data);

            let hardware = {
                qtyhard_wsqId: body.wsq_id,
                qtyhard_hwId: Number(result['insertId']),
                qtyhard_status: listHardware[key].qtyhard_status,
                qtyhard_brandId: listHardware[key].qtyhard_brandId,
                qtyhard_remarks: listHardware[key].qtyhard_remarks
            }

            await hardwareService.createQuarterlyWorkstationHardware(hardware);
        } else {
            let hardware = {
                qtyhard_remarks: listHardware[key].qtyhard_remarks,
                qtyhard_status: listHardware[key].qtyhard_status,
                qtyhard_brandId: listHardware[key].qtyhard_brandId,
                qtyhard_id: listHardware[key].qtyhard_id
            };
    
            await hardwareService.updateQuarterlyWorkstationHardwareById(hardware);
        }
    }

    //Create Faca
    var listFaca = body.facaForm;

    for (const key in listFaca) {
        if(listFaca[key].faca_isNew){
            let faca = {
                wsq_id: body.wsq_id,
                faca_date: listFaca[key].faca_date,
                faca_findings: listFaca[key].faca_findings,
                faca_recommendation: listFaca[key].faca_recommendation,
                faca_ticketNum: listFaca[key].faca_ticketNum
            };
    
            await facaService.createFaca(faca);
        }
    }

    //Update Checklist Items
    var listChecklistItems = body.checklistForm;

    for(const item of listChecklistItems){
        let obj = {
            qtychk_status: item.qtychk_status,
            qtychk_id: item.qtychk_id
        };

        await checklistItemService.updateQtyChecklistItemStatus(obj);
    }
}

module.exports.updateQuarterlyWorkstationStatusById = async (body) => {
    const result = await quarterRepository.updateQuarterlyWorkstationStatusById(body);

    return (result.affectedRows == Constants.HAS_UPDATED_DATA) ? Constants.HAS_UPDATED_DATA : Constants.STATUS_CODE_ERROR;
}

module.exports.updateQuarterlyWorkstationStatusAndResolutionById = async (body) => {
    //Update the checkedby data needed as proof that the computer was checked by an IT user
    var currentDateAndTime = moment(new Date().toISOString()).format('YYYY-MM-DD HH:mm:ss');
    var userData = body.user;
    var username = `${userData.fname} ${userData.mname} ${userData.lname}`;
    var data = {
        wsq_checkedBy: userData.id,
        wsq_checkedByUserName: username,
        wsq_checkedAt: currentDateAndTime,
        wsq_id: body.wsq_id,
    }

    await this.updateQuarterlyWorkstationCheckedbyById(data);

    //Update the audit trail
    var auditTrailData = {
        audit_wsqId: body.wsq_id,
        audit_message: `${username} has submitted the request for approval`,
        audit_updatedAt: currentDateAndTime,
        audit_updatedBy: userData.id,
        audit_updatedByUsername: username,
        audit_remarks: body.wsq_remarks
    };

    await auditTrailService.createAuditTrail(auditTrailData);

    //Update status
    var updateData = {
        wsq_status: body.wsq_status,
        wsq_resolution: body.wsq_resolution,
        wsq_id: body.wsq_id
    }

    var result = await quarterRepository.updateQuarterlyWorkstationStatusAndResolutionById(updateData);

    return (result.affectedRows == Constants.HAS_UPDATED_DATA) ? Constants.HAS_UPDATED_DATA : Constants.STATUS_CODE_ERROR;
}

module.exports.removeNewlyCreatedDataChecklist = async(body) => {
    await this.removeNewSoftwaresByWsqId(body);
    await this.removeNewHardwaresByWsqId(body);
}

module.exports.removeNewlyCreatedDataChecklistWithRef = async(body) => {
    await this.removeNewSoftwaresAndRefByWsqId(body);
    await this.removeNewHardwaresAndRefByWsqId(body);
}

module.exports.removeNewlyCreatedDataChecklistButNotRef = async(body) => {
    await this.removeNewSoftwaresButNotRefByWsqId(body);
    await this.removeNewHardwaresButNotRefByWsqId(body);
}

module.exports.removeNewSoftwaresByWsqId = async(body) => {
    var data = {
        sw_isOthers: true,
        qtysoft_wsqId: body.wsq_id
    };

    var resultNewSoftware = await softwareService.getListOfSoftwareOnlyByOthersAndWsqId(data);

    for(var item in resultNewSoftware){
        await softwareService.deleteWorkstationOtherSoftware({sw_id: resultNewSoftware[item].sw_id});
    }

    return Constants.STATUS_CODE_SUCCESS;
}

module.exports.removeNewSoftwaresAndRefByWsqId = async(body) => {
    var wsq_id = body.wsq_id;

    var data = {
        sw_isOthers: true,
        qtysoft_wsqId: wsq_id
    };

    var resultNewSoftware = await softwareService.getListOfSoftwareOnlyByOthersAndWsqId(data);

    for(var item in resultNewSoftware){
        var params1 = {
            qtysoft_wsqId: wsq_id,
            sw_id: resultNewSoftware[item].sw_id
        }

        await softwareService.deleteAndCheckWorkstationOtherSoftwareWithRef(params1);
    }

    return Constants.STATUS_CODE_SUCCESS;
}

module.exports.removeNewSoftwaresButNotRefByWsqId = async(body) => {
    var wsq_id = body.wsq_id;

    var data = {
        sw_isOthers: true,
        qtysoft_wsqId: wsq_id
    };

    var resultNewSoftware = await softwareService.getListOfSoftwareOnlyByOthersAndWsqId(data);

    for(var item in resultNewSoftware){
        var params1 = {
            qtysoft_wsqId: wsq_id,
            sw_id: resultNewSoftware[item].sw_id
        }

        await softwareService.deleteAndCheckWorkstationOtherSoftware(params1);
    }

    return Constants.STATUS_CODE_SUCCESS;
}

module.exports.removeNewHardwaresByWsqId = async(body) => {
    var data = {
        hw_isOthers: true,
        qtyhard_wsqId: body.wsq_id
    };

    var resultNewHardware = await hardwareService.getListOfHardwareOnlyByOthersAndWsqId(data);

    for(var item in resultNewHardware){
        await hardwareService.deleteWorkstationOtherHardware({hw_id: resultNewHardware[item].hw_id});
    }

    return Constants.STATUS_CODE_SUCCESS;
}

module.exports.removeNewHardwaresAndRefByWsqId = async(body) => {
    var wsq_id = body.wsq_id;

    var data = {
        hw_isOthers: true,
        qtyhard_wsqId: wsq_id
    };

    var resultNewHardware = await hardwareService.getListOfHardwareOnlyByOthersAndWsqId(data);

    for(var item in resultNewHardware){
        var params1 = {
            qtyhard_wsqId: wsq_id,
            hw_id: resultNewHardware[item].hw_id
        }

        await hardwareService.deleteAndCheckWorkstationOtherHardwareWithRef(params1);
    }

    return Constants.STATUS_CODE_SUCCESS;
}

module.exports.removeNewHardwaresButNotRefByWsqId = async(body) => {
    var wsq_id = body.wsq_id;

    var data = {
        hw_isOthers: true,
        qtyhard_wsqId: wsq_id
    };

    var resultNewHardware = await hardwareService.getListOfHardwareOnlyByOthersAndWsqId(data);

    for(var item in resultNewHardware){
        var params1 = {
            qtyhard_wsqId: wsq_id,
            hw_id: resultNewHardware[item].hw_id
        }

        await hardwareService.deleteAndCheckWorkstationOtherHardware(params1);
    }

    return Constants.STATUS_CODE_SUCCESS;
}

module.exports.updateQuarterlyWorkstationStatusAndResolutionByIdOnly = async (body) => {
    const result = await quarterRepository.updateQuarterlyWorkstationStatusAndResolutionById(body);

    return (result.affectedRows == Constants.HAS_UPDATED_DATA) ? Constants.HAS_UPDATED_DATA : Constants.STATUS_CODE_ERROR;
}

module.exports.updateQuarterlyWorkstationRemarks = async (body) => {
    const result = await quarterRepository.updateQuarterlyWorkstationRemarks(body);

    return (result.affectedRows == Constants.HAS_UPDATED_DATA) ? Constants.HAS_UPDATED_DATA : Constants.STATUS_CODE_ERROR;
}

module.exports.updateQuarterlyWorkstationCheckedbyById = async (body) => {
    const result = await quarterRepository.updateQuarterlyWorkstationCheckedbyById(body);

    return (result.affectedRows == Constants.HAS_UPDATED_DATA) ? Constants.HAS_UPDATED_DATA : Constants.STATUS_CODE_ERROR;
}

module.exports.updateQuarterlyWorkstationAcknowledgedbyById = async (body) => {
    const result = await quarterRepository.updateQuarterlyWorkstationAcknowledgedbyById(body);

    return (result.affectedRows == Constants.HAS_UPDATED_DATA) ? Constants.HAS_UPDATED_DATA : Constants.STATUS_CODE_ERROR;
}

module.exports.updateQuarterActual = async (body) => {
    const result = await quarterRepository.updateQuarterActual(body);

    return (result.affectedRows == Constants.HAS_UPDATED_DATA) ? Constants.HAS_UPDATED_DATA : Constants.STATUS_CODE_ERROR;
}

module.exports.updateQuarterDeferred = async (body) => {
    const result = await quarterRepository.updateQuarterDeferred(body);

    return (result.affectedRows == Constants.HAS_UPDATED_DATA) ? Constants.HAS_UPDATED_DATA : Constants.STATUS_CODE_ERROR;
}

module.exports.updateQuarterPlanned = async (body) => {
    const result = await quarterRepository.updateQuarterPlanned(body);

    return (result.affectedRows == Constants.HAS_UPDATED_DATA) ? Constants.HAS_UPDATED_DATA : Constants.STATUS_CODE_ERROR;
}

module.exports.updateQuarterDataByQuarterId = async (body) => {
    const result = await quarterRepository.updateQuarterDataByQuarterId(body);

    return (result.affectedRows == Constants.HAS_UPDATED_DATA) ? Constants.HAS_UPDATED_DATA : Constants.STATUS_CODE_ERROR;
}

module.exports.updateConductedByWsqId = async (body) => {
    const result = await quarterRepository.updateConductedByWsqId(body);

    return (result.affectedRows == Constants.HAS_UPDATED_DATA) ? Constants.HAS_UPDATED_DATA : Constants.STATUS_CODE_ERROR;
}

module.exports.checkIfQuarterlyWorkstationHasUserUpdated = async (body) => {
    const wsqDetails = await this.getQuarterlyWorkstationOnly({wsq_id: body.wsq_id});

    if(wsqDetails.length !== 0){
        if(wsqDetails[0].wsq_status == Constants.WSQ_STATUS_COMPLETE || wsqDetails[0].wsq_status == Constants.WSQ_STATUS_DISAPPROVE){
            return true;
        }
    }

    return false;
}

module.exports.updateWsqHasConducted = async (body) => {
    var currentDateAndTime = moment(new Date().toISOString()).format('YYYY-MM-DD HH:mm:ss');
    var userData = body.user;
    var username = `${userData.fname} ${userData.mname} ${userData.lname}`;
    var data = {
        wsq_hasConducted: body.wsq_hasConducted,
        wsq_id: body.wsq_id
    };

    var result = await this.updateConductedByWsqId(data);

    if(result == Constants.HAS_UPDATED_DATA){
        let auditTrailData = {
            audit_wsqId: body.wsq_id,
            audit_message: `${username} has started conducted the preventive maintenance`,
            audit_updatedAt: currentDateAndTime,
            audit_updatedBy: userData.id,
            audit_updatedByUsername: username,
            audit_remarks: ""
        };
    
        await auditTrailService.createAuditTrail(auditTrailData);

        return Constants.HAS_UPDATED_DATA;
    }

    return Constants.STATUS_CODE_ERROR;
}

module.exports.checkIfUserHasWsqAccessRights = async (body) => {
    let result = await workstationRightsService.getUserWorkstationRightsByWsqIdAndUserIdWithAccess(body);

    if(result.length !== 0){
        return true
    }

    return false;
}

module.exports.approveQuarterlyWorkstation = async (body) => {
    var userData = body.user;
    
    if(await this.checkIfQuarterlyWorkstationHasUserUpdated(body) == true){
        return Constants.STATUS_CODE_SUBMIT_DENY;
    }

    if(body.wsq_resolution != Constants.WSQ_RESOLUTION_DROPPED){
        if(body.ws_userId != userData.id){
            let params1 = {
                wsqRights_wsqId: body.wsq_id,
                wsqRights_userId: userData.id,
                can_approve_request: true
            };
            
            if (await this.checkIfUserHasWsqAccessRights(params1) == false){
                return Constants.STATUS_CODE_SUBMIT_DENY;
            }
        }
    }

    var currentDateAndTime = moment(new Date().toISOString()).format('YYYY-MM-DD HH:mm:ss');

    switch(Number(body.wsq_resolution)){
        case Constants.WSQ_RESOLUTION_COMPLETE: {
            //Increment the total of actual with the current department's quarter
            let addUpdateData = {
                quarter_id: body.quarter_id,
                numtotalDeduction: 1
            }

            await this.addQuarterActual(addUpdateData);

            //Increment the total of planned of department's next quarter
            let addMonthlyQuarterData = {
                quarter_id: body.quarter_id,
                numMonthlyInterval: 3,
                numtotalDeduction: 1
            }

            let resultAddQuarterPlanned = await this.addQuarterPlannedByMonthlyQuarterInterval(addMonthlyQuarterData);

            //Add reference data for software and hardware
            await this.addReferenceDataForWsq({wsq_id: body.wsq_id});

            if(resultAddQuarterPlanned != null){
                let quarterData = {
                    quarter_id: body.quarter_id,
                    numMonthlyInterval: 3
                }
                let nextMonthlyQuarter = await this.getMonthlyQuarterByQuarterIdAndInterval(quarterData);
    
                let newWorkstationQuarterlyData = {
                    quarter_id: nextMonthlyQuarter[0].quarter_id,
                    ws_id: body.wsq_wsId,
                    wsq_id: body.wsq_id
                };
    
                let new_wsq_id = await this.addQuarterlyWorkStationWithPrevData(newWorkstationQuarterlyData);

                await this.addReferenceDataForWsq({wsq_id: new_wsq_id});

                let new_wsq_data = await this.getQuarterlyWorkstationAndCompByWsqId({wsq_id: new_wsq_id})

                //Record the audit trail for computer data
                let computerAuditTrailData = {
                    compAudit_compId: new_wsq_data[0].comp_id,
                    compAudit_message: "Assigned to " + new_wsq_data[0].ws_userName + " with computer name of " + new_wsq_data[0].ws_computerName + " with workstation ID #" + new_wsq_data[0].ws_id,
                    compAudit_date: currentDateAndTime
                };

                await computerAuditTrailService.createComputerAuditTrail(computerAuditTrailData);
            }

            //Delete or Clean up its reference data that aren't in the wsq checklist
            await this.cleanWsqReference({wsq_id: body.wsq_id}); 
        }break;
        case Constants.WSQ_RESOLUTION_DEFERRED: {
            await this.resetAllCreatedDataButNotRefChecklist({wsq_id: body.wsq_id});
            await this.addAllMissingActiveComponentsOfWsq({wsq_id: body.wsq_id});

            //Increment the total of deferred with the current department's quarter
            let addUpdateData = {
                quarter_id: body.quarter_id,
                numtotalDeduction: 1
            }

            await this.addQuarterDeferred(addUpdateData);

            //Increment the total of planned of department's next quarter
            let addMonthlyQuarterData = {
                quarter_id: body.quarter_id,
                numMonthlyInterval: 3,
                numtotalDeduction: 1
            }

            let resultAddQuarterPlanned = await this.addQuarterPlannedByMonthlyQuarterInterval(addMonthlyQuarterData);

            if(resultAddQuarterPlanned != null){
                let quarterData = {
                    quarter_id: body.quarter_id,
                    numMonthlyInterval: 3
                }
                let nextMonthlyQuarter = await this.getMonthlyQuarterByQuarterIdAndInterval(quarterData);
    
                let newWorkstationQuarterlyData = {
                    quarter_id: nextMonthlyQuarter[0].quarter_id,
                    ws_id: body.wsq_wsId
                };
    
                let new_wsq_id = await this.addQuarterlyWorkStation(newWorkstationQuarterlyData);

                let params1 = {
                    old_wsq_id: body.wsq_id,
                    new_wsq_id: new_wsq_id
                }

                this.cloneReferenceDataWithWsq(params1);
            }
        }break;
        case Constants.WSQ_RESOLUTION_TRANSFERRED: {
            // await this.resetAllCreatedDataChecklist({wsq_id: body.wsq_id});
            // await this.cleanWsqReference({wsq_id: body.wsq_id}); 
            // await this.addAllMissingActiveComponentsOfWsq({wsq_id: body.wsq_id});

            //When transferred, workstation can't be used again as user is to one workstation and computer is now active/available for another workstation
            let wsqData = await this.getQuarterlyWorkstationAndWsOnly({wsq_id: body.wsq_id});

            let quarterActualData = {
                ws_isActive: false,
                ws_id: wsqData[0].ws_id
            };

            await workStationService.updateWorkstationStatus(quarterActualData);

            //Record the audit trail of its computer data
            let wsqAndCompData = await workStationService.getWorkstationAndComputerByWsId({wsq_wsId: body.wsq_wsId});
            let data = {
                compAudit_compId: wsqAndCompData[0].ws_compId,
                compAudit_message: `Transferred to another user from its previous owner ${wsqAndCompData[0].ws_userName}`,
                compAudit_date: currentDateAndTime
            };

            await computerAuditTrailService.createComputerAuditTrail(data);
        }break;
        case Constants.WSQ_RESOLUTION_CONDEMNED: {
            // await this.resetAllCreatedDataChecklist({wsq_id: body.wsq_id});
            // await this.cleanWsqReference({wsq_id: body.wsq_id}); 
            // await this.addAllMissingActiveComponentsOfWsq({wsq_id: body.wsq_id});

            //When condemned, workstation and computer can't be used again 
            let wsqData = await this.getQuarterlyWorkstationAndWsOnly({wsq_id: body.wsq_id});

            let quarterActualData = {
                ws_isActive: false,
                ws_id: wsqData[0].ws_id
            };

            await workStationService.updateWorkstationStatus(quarterActualData);

            let compData = await workStationService.getWorkstationAndComputerByWsId({ws_id: wsqData[0].ws_id});

            let compUpdateData = {
                comp_status: Constants.COMP_STATUS_DEFECTIVE,
                comp_id: compData[0].comp_id 
            };

            await computerService.updateComputerStatus(compUpdateData);

            //Record the audit trail of its computer data
            let data = {
                compAudit_compId: compUpdateData.comp_id,
                compAudit_message: `Condemned and its previous owner is ${wsqData[0].ws_userName}`,
                compAudit_date: currentDateAndTime
            };

            await computerAuditTrailService.createComputerAuditTrail(data);
        }break;
        case Constants.WSQ_RESOLUTION_DROPPED: {
            // await this.resetAllCreatedDataChecklist({wsq_id: body.wsq_id});
            // await this.cleanWsqReference({wsq_id: body.wsq_id}); 
            // await this.addAllMissingActiveComponentsOfWsq({wsq_id: body.wsq_id});
        }break;
        default: { 
            //TODO: Do something...
        }
    }

    //Update the acknowledgedby data needed as proof that the computer was acknowledged by an the user
    var currentDateAndTime = moment(new Date().toISOString()).format('YYYY-MM-DD HH:mm:ss');
    var username = `${userData.fname} ${userData.mname} ${userData.lname}`;
    var acknowledgedData = {
        wsq_acknowledgedBy: userData.id,
        wsq_acknowledgedByUserName: username,
        wsq_acknowledgedAt: currentDateAndTime,
        wsq_id: body.wsq_id,
    }

    await this.updateQuarterlyWorkstationAcknowledgedbyById(acknowledgedData);

    var auditTrailData = {
        audit_wsqId: body.wsq_id,
        audit_message: `${username} has approved the request`,
        audit_updatedAt: currentDateAndTime,
        audit_updatedBy: userData.id,
        audit_updatedByUsername: username,
        audit_remarks: body.wsq_remarks
    };

    await auditTrailService.createAuditTrail(auditTrailData);

    var remarksData = {
        wsq_remarks: body.wsq_remarks,
        wsq_id: body.wsq_id
    };

    var result = await this.updateQuarterlyWorkstationRemarks(remarksData);

    var workstationStatusData = {
        wsq_status: Constants.WSQ_STATUS_COMPLETE,
        wsq_id: body.wsq_id,
    };

    var result = await this.updateQuarterlyWorkstationStatusById(workstationStatusData);
    
    return (result == Constants.HAS_UPDATED_DATA) ? Constants.HAS_UPDATED_DATA : Constants.STATUS_CODE_ERROR;
}

module.exports.addAllMissingActiveComponentsOfWsq = async(body) => {
    var params1 = {
        wsq_id: body.wsq_id,
        hw_isActive: true,
        hw_isOthers: false
    };
    
    await hardwareService.addAllMissingHardwareComponentsOfWsq(params1);

    var params2 = {
        wsq_id: body.wsq_id,
        sw_isActive: true,
        sw_isOthers: false
    };

    await softwareService.addAllMissingSoftwareComponentsOfWsq(params2);
}

module.exports.resetAllCreatedDataChecklist = async(body) => {
    await this.removeNewlyCreatedDataChecklistWithRef({wsq_id: body.wsq_id});
    await this.updateQuarterlyWorkstationComponentsStatusAndBrandByWsqId(body);
}

module.exports.resetAllCreatedDataButNotRefChecklist = async(body) => {
    await this.removeNewlyCreatedDataChecklistButNotRef({wsq_id: body.wsq_id});
    await this.updateQuarterlyWorkstationComponentsStatusAndBrandByWsqId(body);
}

module.exports.updateQuarterlyWorkstationComponentsStatusAndBrandByWsqId = async(body) => {
    let hardwareData = {
        qtyhard_status: null,
        qtyhard_brandId: null,
        qtyhard_remarks: null,
        qtyhard_wsqId: body.wsq_id
    };

    await hardwareService.updateQuarterlyWorkstationHardwareStatusAndBrandByWsqId(hardwareData);

    let softwareData = {
        qtysoft_status: null,
        qtysoft_brandId: null,
        qtysoft_remarks: null,
        qtysoft_wsqId: body.wsq_id
    };

    await softwareService.updateQuarterlyWorkstationSoftwareStatusAndBrandByWsqId(softwareData);
}

module.exports.addReferenceDataForWsq = async(body) => {
    await hardwareService.addHardwareReferenceByWsqId(body);
    await softwareService.addSoftwareReferenceByWsqId(body);
}

module.exports.cloneReferenceDataWithWsq = async(body) => {
    await hardwareService.cloneHardwareReferenceWithWsq(body);
    await softwareService.cloneSoftwareReferenceWithWsq(body);
}

module.exports.cleanWsqReference = async(body) => {
    await hardwareService.cleanHardwareReferenceByWsqId(body);
    await softwareService.cleanSoftwareReferenceByWsqId(body);
}

module.exports.addQuarterActual = async(body) => {
    var resultQuarter = await this.getDepartmentAndQuarterlyDetailsById({quarter_id: body.quarter_id});
    let newQuarterNumActual = resultQuarter[0].quarter_numActual + body.numtotalDeduction;

    let quarterActualData = {
        quarter_numActual: newQuarterNumActual,
        quarter_id: body.quarter_id
    };

    return await this.updateQuarterActual(quarterActualData);
}

module.exports.addQuarterPlanned = async(body) => {
    var resultQuarter = await this.getDepartmentAndQuarterlyDetailsById({quarter_id: body.quarter_id});
    let newQuarterNumPlanned = resultQuarter[0].quarter_numPlanned + body.numtotalDeduction;

    let quarterPlannedData = {
        quarter_numPlanned: newQuarterNumPlanned,
        quarter_id: body.quarter_id
    };

    return await this.updateQuarterPlanned(quarterPlannedData);
}

module.exports.addQuarterDeferred = async(body) => {
    var resultQuarter = await this.getDepartmentAndQuarterlyDetailsById({quarter_id: body.quarter_id});
    let newQuarterNumDefer = resultQuarter[0].quarter_numDeferred + body.numtotalDeduction;

    let quarterDeferData = {
        quarter_numDeferred: newQuarterNumDefer,
        quarter_id: body.quarter_id
    };

    return await this.updateQuarterDeferred(quarterDeferData);
}

module.exports.addQuarterPlannedByMonthlyQuarterInterval = async(body) => {
    var quarterData = {
        quarter_id: body.quarter_id,
        numMonthlyInterval: body.numMonthlyInterval
    }
    var resultMonthQuarter = await this.getMonthlyQuarterByQuarterIdAndInterval(quarterData);

    if(resultMonthQuarter.length != 0){
        let newQuarterNumPlanned = resultMonthQuarter[0].quarter_numPlanned + body.numtotalDeduction;

        let quarterPlannedData = {
            quarter_numPlanned: newQuarterNumPlanned,
            quarter_id: resultMonthQuarter[0].quarter_id
        };

        return await this.updateQuarterPlanned(quarterPlannedData);
    } else {
        return null;
    }
}

module.exports.getMonthlyQuarterByQuarterIdAndInterval = async(body) => {
    var resultQuarter = await this.getDepartmentAndQuarterlyDetailsById({quarter_id: body.quarter_id});
    let quarterSemesterData = {
        quarter_pDeptId: resultQuarter[0].quarter_pDeptId,
        quarter_monthlyQuarter: resultQuarter[0].quarter_monthlyQuarter + body.numMonthlyInterval
    };

    return await this.getQuarterByPmsDeptIdAndMonthlyQuarter(quarterSemesterData);
}

module.exports.disapproveQuarterlyWorkstation = async (body) => {
    var userData = body.user;

    if(await this.checkIfQuarterlyWorkstationHasUserUpdated(body) == true){
        return Constants.STATUS_CODE_SUBMIT_DENY;
    }

    if(body.ws_userId != userData.id){
        let params1 = {
            wsqRights_wsqId: body.wsq_id,
            wsqRights_userId: userData.id,
            can_approve_request: true
        };
        
        if (await this.checkIfUserHasWsqAccessRights(params1) == false){
            return Constants.STATUS_CODE_SUBMIT_DENY;
        }
    }

    var currentDateAndTime = moment(new Date().toISOString()).format('YYYY-MM-DD HH:mm:ss');
    var username = `${userData.fname} ${userData.mname} ${userData.lname}`;
    var updateData = {
        wsq_id: body.wsq_id
    };

    await this.updateQuarterlyWorkstationToDisapprove(updateData);

    var auditTrailData = {
        audit_wsqId: body.wsq_id,
        audit_message: `${username} has disapproved the request`,
        audit_updatedAt: currentDateAndTime,
        audit_updatedBy: userData.id,
        audit_updatedByUsername: username,
        audit_remarks: body.wsq_remarks
    };

    await auditTrailService.createAuditTrail(auditTrailData);

    var remarksData = {
        wsq_remarks: body.wsq_remarks,
        wsq_id: body.wsq_id
    };

    var result = await this.updateQuarterlyWorkstationRemarks(remarksData);
    
    return (result == Constants.HAS_UPDATED_DATA) ? Constants.HAS_UPDATED_DATA : Constants.STATUS_CODE_ERROR;
}

module.exports.revertQuarterlyWorkstation = async (body) => {
    var currentDateAndTime = moment(new Date().toISOString()).format('YYYY-MM-DD HH:mm:ss');
    var userData = body.user;
    var username = `${userData.fname} ${userData.mname} ${userData.lname}`;
    var wsqDetails = await this.getQuarterlyWorkstationOnly({wsq_id: body.wsq_id});
    var auditMessage = `${username} has reverted the request`;

    //Revert the wsq details to its default values
    var wsqData = {
        wsq_checkedBy: null,
        wsq_checkedByUserName: null,
        wsq_checkedAt: null,
        wsq_acknowledgedBy: null,
        wsq_acknowledgedByUserName: null,
        wsq_acknowledgedAt: null,
        wsq_status: Constants.WSQ_STATUS_PENDING,
        wsq_resolution: null,
        wsq_remarks: null,
        wsq_id: body.wsq_id
    }

    await this.updateWsq(wsqData);

    //Reverting process
    if(wsqDetails.length !== 0){
        if(wsqDetails[0].wsq_status == Constants.WSQ_STATUS_COMPLETE){
            switch(wsqDetails[0].wsq_resolution){
                case Constants.WSQ_RESOLUTION_TRANSFERRED: {
                    await this.revertWorkstationQuarterlyTransferred({wsq_id: body.wsq_id});

                    let computer = await workStationService.getWorkstationAndComputerByWsId({ws_id: wsqDetails[0].wsq_wsId});

                    //Record the audit trail of its computer data
                    let data = {
                        compAudit_compId: computer[0].comp_id,
                        compAudit_message: `Reverted its status from being Transferred, returning to its previous owner ${computer[0].ws_userName}`,
                        compAudit_date: currentDateAndTime
                    };

                    await computerAuditTrailService.createComputerAuditTrail(data);

                }break;
                case Constants.WSQ_RESOLUTION_CONDEMNED: {
                    await this.revertWorkstationQuarterlyCondemned({wsq_id: body.wsq_id});

                    let computer = await workStationService.getWorkstationAndComputerByWsId({ws_id: wsqDetails[0].wsq_wsId});
                    
                    //Record the audit trail of its computer data
                    let data = {
                        compAudit_compId: computer[0].comp_id,
                        compAudit_message: `Reverted its status from being Condemned, returning to its previous owner ${computer[0].ws_userName}`,
                        compAudit_date: currentDateAndTime
                    };

                    await computerAuditTrailService.createComputerAuditTrail(data);

                }break;
                case Constants.WSQ_RESOLUTION_COMPLETE: {
                    let nextWsq = await this.getWorkstationQuarterlyHasFutureRecord({wsq_id: body.wsq_id});

                    if(nextWsq != null){
                        await this.removeNewlyCreatedDataChecklistWithRef({wsq_id: nextWsq.wsq_id});
                        await this.deleteWorkstationQuarterlyNoReso({wsq_id: nextWsq.wsq_id});
                    }

                    await this.removeNewlyCreatedDataChecklistWithRef({wsq_id: body.wsq_id});
                    await this.revertWorkstationQuarterlyCompleted({wsq_id: body.wsq_id});
                }break;
                case Constants.WSQ_RESOLUTION_DEFERRED: {
                    let nextWsq = await this.getWorkstationQuarterlyHasFutureRecord({wsq_id: body.wsq_id});

                    if(nextWsq != null){
                        await this.removeNewlyCreatedDataChecklistWithRef({wsq_id: nextWsq.wsq_id});
                        await this.deleteWorkstationQuarterlyNoReso({wsq_id: nextWsq.wsq_id});
                    }

                    await this.removeNewlyCreatedDataChecklistWithRef({wsq_id: body.wsq_id});
                    await this.revertWorkstationQuarterlyDeferred({wsq_id: body.wsq_id});
                }break;
            }
        }
    } else {
        return Constants.STATUS_CODE_ERROR;
    }

    //Update latest remarks with the reason of why the request is reverted
    var remarksData = {
        wsq_remarks: body.wsq_remarks,
        wsq_id: body.wsq_id
    };

    var result = await this.updateQuarterlyWorkstationRemarks(remarksData);

    var auditTrailData = {
        audit_wsqId: body.wsq_id,
        audit_message: auditMessage,
        audit_updatedAt: currentDateAndTime,
        audit_updatedBy: userData.id,
        audit_updatedByUsername: username,
        audit_remarks: body.wsq_remarks
    };

    await auditTrailService.createAuditTrail(auditTrailData);

    return (result == Constants.HAS_UPDATED_DATA) ? Constants.HAS_UPDATED_DATA : Constants.STATUS_CODE_ERROR;
}

module.exports.revertWorkstationQuarterlyCompleted = async (body) => {
    var wsqDetails = await this.getQuarterlyWorkstationOnly(body);

    //Deduct with -1 from the Total Actual from its department
    var deductData = {
        quarter_id: wsqDetails[0].wsq_quarterId,
        numtotalDeduction: 1
    };

    await this.deductQuarterActual(deductData);

    //Deduct with -1 from the Total Planned from its next semester of the department
    var deductMonthData = {
        quarter_id: wsqDetails[0].wsq_quarterId,
        numMonthlyInterval: 3,
        numtotalDeduction: 1
    };

    var result = await this.deductQuarterPlannedByMonthlyQuarterInterval(deductMonthData);    

    return (result == Constants.HAS_UPDATED_DATA) ? Constants.HAS_UPDATED_DATA : Constants.STATUS_CODE_ERROR;
}

module.exports.revertWorkstationQuarterlyDeferred = async (body) => {
    var wsqDetails = await this.getQuarterlyWorkstationOnly(body);

    //Deduct with -1 from the Total Deferred from its department
    var deductData = {
        quarter_id: wsqDetails[0].wsq_quarterId,
        numtotalDeduction: 1
    };

    await this.deductQuarterDeferred(deductData);

    //Deduct with -1 from the Total Planned from its next semester of the department
    var deductMonthData = {
        quarter_id: wsqDetails[0].wsq_quarterId,
        numMonthlyInterval: 3,
        numtotalDeduction: 1
    };

    var result = await this.deductQuarterPlannedByMonthlyQuarterInterval(deductMonthData);    

    return (result == Constants.HAS_UPDATED_DATA) ? Constants.HAS_UPDATED_DATA : Constants.STATUS_CODE_ERROR;
}

module.exports.revertWorkstationQuarterlyTransferred = async (body) => {
    var wsqDetails = await this.getQuarterlyWorkstationOnly(body);

    //Revert back the workstation from being inactive
    var updateStatusData = {
        ws_isActive: true,
        ws_id: wsqDetails[0].wsq_wsId
    }
    var result = await workStationService.updateWorkstationStatus(updateStatusData);

    return (result == Constants.HAS_UPDATED_DATA) ? Constants.HAS_UPDATED_DATA : Constants.STATUS_CODE_ERROR;
}

module.exports.revertWorkstationQuarterlyCondemned = async (body) => {
    var wsqDetails = await this.getQuarterlyWorkstationAndWsOnly(body);
    var wsAndCompDetails = await workStationService.getWorkstationAndComputerByWsId({ws_id: wsqDetails[0].wsq_wsId})
    
    //Revert back the workstation from being inactive
    var updateWsStatusData = {
        ws_isActive: true,
        ws_id: wsqDetails[0].wsq_wsId
    }
    await workStationService.updateWorkstationStatus(updateWsStatusData);

    //Revert back the computer status to being active
    var computer = await computerService.getComputer({comp_id: wsAndCompDetails[0].comp_id});
    
    var updateComputerStatusData = {
        comp_status: Constants.COMP_STATUS_ACTIVE,
        comp_id: computer[0].comp_id
    } 

    var result = await computerService.updateComputerStatus(updateComputerStatusData);

    return (result == Constants.HAS_UPDATED_DATA) ? Constants.HAS_UPDATED_DATA : Constants.STATUS_CODE_ERROR;
}

module.exports.updateWsq = async (body) => {
    var workstationStatusData = {
        wsq_checkedBy: body.wsq_checkedBy,
        wsq_checkedByUserName: body.wsq_checkedByUserName,
        wsq_checkedAt: body.wsq_checkedAt,
        wsq_acknowledgedBy: body.wsq_acknowledgedBy,
        wsq_acknowledgedByUserName: body.wsq_acknowledgedByUserName,
        wsq_acknowledgedAt: body.wsq_acknowledgedAt,
        wsq_status: body.wsq_status,
        wsq_resolution: body.wsq_resolution,
        wsq_remarks: body.wsq_remarks,
        wsq_id: body.wsq_id
    };

    var result = await quarterRepository.updateWsq(workstationStatusData);
    
    return (result == Constants.HAS_UPDATED_DATA) ? Constants.HAS_UPDATED_DATA : Constants.STATUS_CODE_ERROR;
}

module.exports.updateQuarterlyWorkstationToDisapprove = async (body) => {
    var workstationStatusData = {
        wsq_status: Constants.WSQ_STATUS_DISAPPROVE,
        wsq_id: body.wsq_id
    };

    var result = await this.updateQuarterlyWorkstationStatusById(workstationStatusData);
    
    return (result == Constants.HAS_UPDATED_DATA) ? Constants.HAS_UPDATED_DATA : Constants.STATUS_CODE_ERROR;
}








