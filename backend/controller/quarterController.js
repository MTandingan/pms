const model = require('../model/response');
const Constants = require('../helper/constants');
const quarterService = require('../service/quarterService');
const { logger } = require('../helper/logger');

//CREATE quarterly workstations for Pms Summary and will add the planned count of the quarter   
module.exports.createQuarterlyWorkstation = async (req, res, next) => {
    try{
        var data = {
            ws_userId: req.body.ws_userId,
            ws_userName: req.body.ws_userName,
            ws_location: req.body.ws_location,
            ws_computerName: req.body.ws_computerName,
            ws_ipAddress: req.body.ws_ipAddress,
            ws_compId: req.body.ws_compId,
            ws_isActive: req.body.ws_isActive,
            quarter_id: req.body.quarter_id,
            ws_ipType: req.body.ws_ipType
        };

        await quarterService.createQuarterlyWorkstation(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully created a quarterly workstation";
        model.response.data = {};
    } catch (err) {
        logger.error('Unhandled Exception in createQuarterlyWorkstation', {
            ws_location: req.body.ws_location,
            ws_userName: req.body.ws_userName,
            ws_computerName: req.body.ws_computerName,
            quarter_id: req.body.quarter_id,
            errorMessage: err.message,
            stackTrace: err.stack
        });

        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//CREATE quarterly workstations for Pms Summary, add the planned count of the quarter, and record audit trail of computer data  
module.exports.createQuarterlyWorkstationRecordCompAuditTrail = async (req, res, next) => {
    try{
        var data = {
            ws_userId: req.body.ws_userId,
            ws_userName: req.body.ws_userName,
            ws_location: req.body.ws_location,
            ws_computerName: req.body.ws_computerName,
            ws_ipAddress: req.body.ws_ipAddress,
            ws_compId: req.body.ws_compId,
            ws_isActive: req.body.ws_isActive,
            quarter_id: req.body.quarter_id,
            ws_ipType: req.body.ws_ipType,
            compAudit_message: req.body.compAudit_message
        };

        await quarterService.createQuarterlyWorkstationRecordCompAuditTrail(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully created a quarterly workstation";
        model.response.data = {};
    } catch (err) {
        logger.error('Unhandled Exception in createQuarterlyWorkstationRecordCompAuditTrail', {
            ws_location: req.body.ws_location,
            ws_userName: req.body.ws_userName,
            ws_computerName: req.body.ws_computerName,
            quarter_id: req.body.quarter_id,
            errorMessage: err.message,
            stackTrace: err.stack
        });

        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//CREATE quarterly workstations for Pms Summary, add the planned count of the quarter, and record audit trail of computer data with workstation id in the message
module.exports.createQuarterlyWorkstationRecordCompAuditTrailWithWsId = async (req, res, next) => {
    try{
        var data = {
            ws_userId: req.body.ws_userId,
            ws_userName: req.body.ws_userName,
            ws_location: req.body.ws_location,
            ws_computerName: req.body.ws_computerName,
            ws_ipAddress: req.body.ws_ipAddress,
            ws_compId: req.body.ws_compId,
            ws_isActive: req.body.ws_isActive,
            quarter_id: req.body.quarter_id,
            ws_ipType: req.body.ws_ipType,
            compAudit_message: req.body.compAudit_message
        };

        await quarterService.createQuarterlyWorkstationRecordCompAuditTrailWithWsId(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully created a quarterly workstation";
        model.response.data = {};
    } catch (err) {
        logger.error('Unhandled Exception in createQuarterlyWorkstationRecordCompAuditTrailWithWsId', {
            ws_location: req.body.ws_location,
            ws_userName: req.body.ws_userName,
            ws_computerName: req.body.ws_computerName,
            quarter_id: req.body.quarter_id,
            errorMessage: err.message,
            stackTrace: err.stack
        });

        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//CREATE and update the quarterly workstation data by wsq Id   
module.exports.updateQuarterlyWorkstation = async (req, res, next) => {
    try{
        var data = {
            facaForm: req.body.facaForm,
            hardwareForm: req.body.hardwareForm,
            softwareForm: req.body.softwareForm,
            checklistForm: req.body.checklistForm,
            wsq_id: req.body.wsq_id,
            wsq_status: req.body.wsq_status,
            wsq_resolution: req.body.wsq_resolution,
            wsq_remarks: req.body.wsq_remarks
        };

        await quarterService.updateQuarterlyWorkstation(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully updated the quarterly workstation";
        model.response.data = {};
    } catch (err) {
        logger.error('Unhandled Exception in updateQuarterlyWorkstation', {
            wsq_id: req.body.wsq_id,
            errorMessage: err.message,
            stackTrace: err.stack
        });

        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//UPDATE the quarterly workstation status  
module.exports.updateQuarterlyWorkstationStatusById = async (req, res, next) => {
    try{
        var data = {
            wsq_status: req.body.wsq_status,
            wsq_id: req.body.wsq_id
        };

        const result = await quarterService.updateQuarterlyWorkstationStatusById(data);

        if(result === Constants.HAS_UPDATED_DATA){
            model.response.status = Constants.STATUS_CODE_SUCCESS;
            model.response.message = "Successfully updated the workstation status";
            model.response.data = {};
        } else {
            model.response.status = Constants.STATUS_CODE_ERROR;
            model.response.message = "There is no workstation status to update. Please reload the page. If it persists, please call the IT department";
            model.response.data = {};
        }
    } catch (err) {
        logger.error('Unhandled Exception in updateQuarterlyWorkstationStatusById', {
            wsq_id: req.body.wsq_id,
            errorMessage: err.message,
            stackTrace: err.stack
        });

        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//UPDATE the quarterly workstation status and resolution
module.exports.updateQuarterlyWorkstationStatusAndResolutionById = async (req, res, next) => {
    try{
        var data = {
            wsq_status: req.body.wsq_status,
            wsq_resolution: req.body.wsq_resolution,
            wsq_remarks: req.body.wsq_remarks,
            wsq_id: req.body.wsq_id,
            user: req.session.user
        };

        const result = await quarterService.updateQuarterlyWorkstationStatusAndResolutionById(data);

        if(result === Constants.HAS_UPDATED_DATA){
            model.response.status = Constants.STATUS_CODE_SUCCESS;
            model.response.message = "Successfully updated the workstation status and resolution";
            model.response.data = {};
        } else {
            model.response.status = Constants.STATUS_CODE_ERROR;
            model.response.message = "There is no workstation status and resolution to update. Please reload the page. If it persists, please call the IT department";
            model.response.data = {};
        }
    } catch (err) {
        logger.error('Unhandled Exception in updateQuarterlyWorkstationStatusAndResolutionById', {
            wsq_id: req.body.wsq_id,
            errorMessage: err.message,
            stackTrace: err.stack
        });

        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//UPDATE the quarterly workstation status and its quarter data where the user has approved it
module.exports.approveQuarterlyWorkstation = async (req, res, next) => {
    try{
        var data = {
            wsq_remarks: req.body.wsq_remarks,
            quarter_id: req.body.quarter_id,
            wsq_resolution: req.body.wsq_resolution,
            wsq_id: req.body.wsq_id,
            wsq_wsId: req.body.wsq_wsId,
            ws_userId: req.body.ws_userId,
            user: req.session.user
        };

        logger.info('Approved Quarterly Workstation', { wsq_id: req.body.wsq_id });
        
        const result = await quarterService.approveQuarterlyWorkstation(data);

        if(result === Constants.HAS_UPDATED_DATA){
            model.response.status = Constants.STATUS_CODE_SUCCESS;
            model.response.message = "Successfully approved the workstation status";
            model.response.data = {};
        }  else if(result === Constants.STATUS_CODE_SUBMIT_DENY) {
            model.response.status = Constants.STATUS_CODE_ERROR;
            model.response.message = "Workstation has been updated already by the owner / user or you don't have access for approving the request. Please reload the page again.";
            model.response.data = {};
        } else {
            model.response.status = Constants.STATUS_CODE_ERROR;
            model.response.message = "There is no workstation status to approve. Please reload the page. If it persists, please call the IT department";
            model.response.data = {};
        }
    } catch (err) {
        logger.error('Unhandled Exception in approveQuarterlyWorkstation', {
            wsq_id: req.body.wsq_id,
            errorMessage: err.message,
            stackTrace: err.stack
        });

        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//UPDATE the quarterly workstation's hasConducted
module.exports.updateConductedByWsqId = async (req, res, next) => {
    try{
        var data = {
            wsq_hasConducted: req.body.wsq_hasConducted,
            wsq_id: req.body.wsq_id
        };
        
        const result = await quarterService.updateConductedByWsqId(data);

        if(result === Constants.HAS_UPDATED_DATA){
            model.response.status = Constants.STATUS_CODE_SUCCESS;
            model.response.message = "Successfully updated the workstation hasConducted";
            model.response.data = {};
        } else {
            model.response.status = Constants.STATUS_CODE_ERROR;
            model.response.message = "There is no workstation status to update. Please reload the page. If it persists, please call the IT department";
            model.response.data = {};
        }
    } catch (err) {
        logger.error('Unhandled Exception in updateConductedByWsqId', {
            wsq_id: req.body.wsq_id,
            errorMessage: err.message,
            stackTrace: err.stack
        });

        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//UPDATE the quarterly workstation's hasConducted with audit trail
module.exports.updateWsqHasConducted = async (req, res, next) => {
    try{
        var data = {
            wsq_hasConducted: req.body.wsq_hasConducted,
            wsq_id: req.body.wsq_id,
            user: req.session.user
        };
        
        const result = await quarterService.updateWsqHasConducted(data);

        if(result === Constants.HAS_UPDATED_DATA){
            model.response.status = Constants.STATUS_CODE_SUCCESS;
            model.response.message = "Successfully updated the workstation hasConducted";
            model.response.data = {};
        } else {
            model.response.status = Constants.STATUS_CODE_ERROR;
            model.response.message = "There is no workstation status to update. Please reload the page. If it persists, please call the IT department";
            model.response.data = {};
        }
    } catch (err) {
        logger.error('Unhandled Exception in updateWsqHasConducted', {
            wsq_id: req.body.wsq_id,
            errorMessage: err.message,
            stackTrace: err.stack
        });

        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//UPDATE the quarterly workstation status and its quarter data where the user has disapproved it
module.exports.disapproveQuarterlyWorkstation = async (req, res, next) => {
    try{
        var data = {
            wsq_remarks: req.body.wsq_remarks,
            user: req.session.user,
            wsq_id: req.body.wsq_id,
            ws_userId: req.body.ws_userId
        };

        logger.info('Disapproved Quarterly Workstation', { wsq_id: req.body.wsq_id });

        const result = await quarterService.disapproveQuarterlyWorkstation(data);

        if(result === Constants.HAS_UPDATED_DATA){
            model.response.status = Constants.STATUS_CODE_SUCCESS;
            model.response.message = "Successfully disapproved the workstation status";
            model.response.data = {};
        } else if(result === Constants.STATUS_CODE_SUBMIT_DENY) {
            model.response.status = Constants.STATUS_CODE_ERROR;
            model.response.message = "Workstation has been updated already by the owner / user or you don't have access for disapproving the request. Please reload the page again.";
            model.response.data = {};
        } else {
            model.response.status = Constants.STATUS_CODE_ERROR;
            model.response.message = "There is no workstation status to disapprove. Please reload the page. If it persists, please call the IT department";
            model.response.data = {};
        }
    } catch (err) {
        logger.error('Unhandled Exception in disapproveQuarterlyWorkstation', {
            wsq_id: req.body.wsq_id,
            errorMessage: err.message,
            stackTrace: err.stack
        });

        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//UPDATE the quarterly workstation status and its quarter data where it's reverted
module.exports.revertQuarterlyWorkstation = async (req, res, next) => {
    try{
        var data = {
            wsq_remarks: req.body.wsq_remarks,
            user: req.session.user,
            wsq_id: req.body.wsq_id
        };

        const result = await quarterService.revertQuarterlyWorkstation(data);

        if(result === Constants.HAS_UPDATED_DATA){
            model.response.status = Constants.STATUS_CODE_SUCCESS;
            model.response.message = "Successfully reverted the workstation status";
            model.response.data = {};
        } else {
            model.response.status = Constants.STATUS_CODE_ERROR;
            model.response.message = "There is no workstation status to revert. Please reload the page. If it persists, please call the IT department";
            model.response.data = {};
        }
    } catch (err) {
        logger.error('Unhandled Exception in revertQuarterlyWorkstation', {
            wsq_id: req.body.wsq_id,
            errorMessage: err.message,
            stackTrace: err.stack
        });

        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//DELETE workstation quarterly data
module.exports.deleteWorkstationQuarterly = async (req, res, next) => {
    try{
        var data = {
            wsq_id: req.params.id
        };

        var result =  await quarterService.deleteWorkstationQuarterly(data);

        if(result === Constants.STATUS_CODE_SUCCESS){
            model.response.status = Constants.STATUS_CODE_SUCCESS;
            model.response.message = "Successfully deleted the quarterly workstation";
            model.response.data = {};
        } else {
            model.response.status = Constants.STATUS_CODE_ERROR;
            model.response.message = "Quarterly workstation doesn't exist. Please reload the page. If it persists, please call the IT department";
            model.response.data = {};
        } 
    } catch (err) {
        logger.error('Unhandled Exception in deleteWorkstationQuarterly', {
            wsq_id: req.body.wsq_id,
            errorMessage: err.message,
            stackTrace: err.stack
        });

        model.response.status = 2;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//DELETE workstation quarterly data
module.exports.deleteWorkstationQuarterlyCheckPrevRec = async (req, res, next) => {
    try{
        var data = {
            wsq_id: req.params.id
        };

        var result =  await quarterService.deleteWorkstationQuarterlyCheckPrevRec(data);

        if(result === Constants.STATUS_CODE_SUCCESS){
            model.response.status = Constants.STATUS_CODE_SUCCESS;
            model.response.message = "Successfully deleted the quarterly workstation";
            model.response.data = {};
        } else if(result === Constants.STATUS_CODE_DELETE_DENY){
            model.response.status = Constants.STATUS_CODE_DELETE_DENY;
            model.response.message = "Cannot delete workstation that has existing data in the previous month because of data reference. Instead please provide a resolution acknowledged by the workstation's owner";
            model.response.data = {};
        } else {
            model.response.status = Constants.STATUS_CODE_ERROR;
            model.response.message = "Quarterly workstation doesn't exist. Please reload the page. If it persists, please call the IT department";
            model.response.data = {};
        } 
    } catch (err) {
        logger.error('Unhandled Exception in deleteWorkstationQuarterlyCheckPrevRec', {
            wsq_id: req.body.wsq_id,
            errorMessage: err.message,
            stackTrace: err.stack
        });

        model.response.status = 2;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//DELETE location and its quarterly scheduled data by PMS schedule
module.exports.deleteLocationOfPmsSchedule = async (req, res, next) => {
    try{
        var data = {
            sched_id: req.params.sched_id,
            location_id: req.params.location_id
        };

        var result =  await quarterService.deleteLocationOfPmsSchedule(data);

        if(result === Constants.STATUS_CODE_SUCCESS){
            model.response.status = Constants.STATUS_CODE_SUCCESS;
            model.response.message = "Successfully deleted the location and its quarter data of a PMS schedule";
            model.response.data = {};
        } else if(result === Constants.STATUS_CODE_DELETE_DENY){
            model.response.status = Constants.STATUS_CODE_DELETE_DENY;
            model.response.message = "Location cannot be deleted because there are existing workstations inside of it";
            model.response.data = {};
        } else {
            model.response.status = Constants.STATUS_CODE_ERROR;
            model.response.message = "Location doesn't exist in the PMS schedule. Please choose another location";
            model.response.data = {};
        } 
    } catch (err) {
        logger.error('Unhandled Exception in deleteLocationOfPmsSchedule', {
            wsq_id: req.body.wsq_id,
            errorMessage: err.message,
            stackTrace: err.stack
        });

        model.response.status = 2;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//CREATE by adding multiple quarterly existing workstations for Pms Summary and will add the number of planned count of the quarter   
module.exports.addMultipleQuarterlyWorkStation = async (req, res, next) => {
    try{
        var data = {
            listOfAddedExistingWorkstation: req.body.listOfAddedExistingWorkstation,
            quarter_id: req.body.quarter_id
        };

        await quarterService.addMultipleQuarterlyWorkStation(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully added all workstations";
        model.response.data = {};
    } catch (err) {
        logger.error('Unhandled Exception in addMultipleQuarterlyWorkStation', {
            data: req.body.listOfAddedExistingWorkstation,
            quarter_id: req.body.quarter_id,
            errorMessage: err.message,
            stackTrace: err.stack
        });

        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};


//CREATE by adding the location's quarterly data and fetching its previous data year quarterly data to save it to its first month 
module.exports.addQuarterlyWorkstationLastPrevRecord = async (req, res, next) => {
    try{
        var data = {
            sched_id: req.body.sched_id,
            pdept_locationId: req.body.pdept_locationId
        };
        
        await quarterService.addQuarterlyWorkstationLastPrevRecord(data);

        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully added the department's workstation quarterly with its last 4th quarter data saved on its latest saved data";
        model.response.data = {};
    } catch (err) {
        logger.error('Unhandled Exception in addQuarterlyWorkstationLastPrevRecord', {
            sched_id: req.body.sched_id,
            pdept_locationId: req.body.pdept_locationId,
            errorMessage: err.message,
            stackTrace: err.stack
        });

        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET list of department's quarter by year and month
module.exports.getListOfQuarterlyByYearAndMonth = async (req, res, next) => {
    try{
        var data = {
            sched_year: req.query.sched_year,
            quarter_monthlyQuarter: req.query.quarter_monthlyQuarter
        };

        var result = await quarterService.getListOfQuarterlyByYearAndMonth(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get all the list of department quarterly by year and month";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET list of department's quarter by quarter id
module.exports.getDepartmentAndQuarterlyDetailsById = async (req, res, next) => {
    try{
        var data = {
            quarter_id: req.query.quarter_id
        };

        var result = await quarterService.getDepartmentAndQuarterlyDetailsById(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get the department and quarterly details by id";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET all details of the workstation quarterly data by wsq Id
module.exports.getDepartmentWorkstationQuarterlyDetailsByWsqId = async (req, res, next) => {
    try{
        var data = {
            wsq_id: req.query.wsq_id
        };

        var result = await quarterService.getDepartmentWorkstationQuarterlyDetailsByWsqId(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get all the details by wsq id";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET the workstation quarterly data only by wsq Id
module.exports.getQuarterlyWorkstationOnly = async (req, res, next) => {
    try{
        var data = {
            wsq_id: req.query.wsq_id
        };

        var result = await quarterService.getQuarterlyWorkstationOnly(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get all the details of the workstation quarterly data only by wsq id";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET the workstation quarterly data and its workstation only by wsq Id
module.exports.getQuarterlyWorkstationAndWsOnly = async (req, res, next) => {
    try{
        var data = {
            wsq_id: req.query.wsq_id
        };

        var result = await quarterService.getQuarterlyWorkstationAndWsOnly(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get all the details of the workstation quarterly data and workstation only by wsq id";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET list of quarterly workstations by quarter id
module.exports.getListOfQuarterlyWorkstationById = async (req, res, next) => {
    try{
        var data = {
            quarter_id: req.query.quarter_id
        };

        var result = await quarterService.getListOfQuarterlyWorkstationById(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get the quarterly workstations by id";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET quarter by quarter id and monthly quarter
module.exports.getQuarterByPmsDeptIdAndMonthlyQuarter = async (req, res, next) => {
    try{
        var data = {
            pdept_id: req.query.pdept_id,
            quarter_id: req.query.quarter
        };

        var result = await quarterService.getQuarterByPmsDeptIdAndMonthlyQuarter(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get the quarter by id and monthly quarter";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET workstation quarter by department details and monthly quarter
module.exports.getQuarterlyWorkstationByDeptDetailsAndMonth = async (req, res, next) => {
    try{
        var data = {
            pdept_schedId: req.query.pdept_schedId,
            pdept_locationId: req.query.pdept_locationId,
            quarter_monthlyQuarter: req.query.quarter_monthlyQuarter
        };

        var result = await quarterService.getQuarterlyWorkstationByDeptDetailsAndMonth(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get the workstation quarter by department details and monthly quarter";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET list of workstations by sched id and monthly quarters
module.exports.getListOfQuarterlyWorkstationBySchedIdAndMonthlyQuarters = async (req, res, next) => {
    try{
        var data = {
            sched_id: req.query.sched_id,
            listOfMonthOrderPosition1: req.query.listOfMonthOrderPosition1,
            listOfMonthOrderPosition2: req.query.listOfMonthOrderPosition2,
            listOfMonthOrderPosition3: req.query.listOfMonthOrderPosition3
        };

        var result = await quarterService.getListOfQuarterlyWorkstationBySchedIdAndMonthlyQuarters(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get the quarter by id and monthly quarter";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET result of boolean if workstation status of that schedule PMS is complete or not
module.exports.checkWorkstationIsCompleteBySchedId = async (req, res, next) => {
    try{
        var data = {
            sched_id: Number(req.query.sched_id),
            wsq_wsId: Number(req.query.wsq_wsId)
        };

        var result = await quarterService.checkWorkstationIsCompleteBySchedId(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully checked if workstation is complete in sched id";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET result of boolean if workstation quarterly has been conducted or not
module.exports.checkIfWsqHasConducted = async (req, res, next) => {
    try{
        var data = {
            wsq_id: Number(req.query.wsq_id)
        };

        var result = await quarterService.checkIfWsqHasConducted(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully checked if workstation quarterly has been conducted or not";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET list of workstations by status and sched id
module.exports.getListOfWorkstationsByQtrStatusAndSchedId = async (req, res, next) => {
    try{
        var data = {
            sched_id: Number(req.query.sched_id),
            wsq_status: Number(req.query.wsq_status),
            listOfWorkstations: req.query.listOfWorkstations
        };

        var result = await quarterService.getListOfWorkstationsByQtrStatusAndSchedId(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get list of workstations by quarterly workstation status and sched id";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET list of quarterly workstations by comp id and NOT status
module.exports.getListOfQuarterlyWorkstationByCompIdAndNotStatus = async (req, res, next) => {
    try{
        var data = {
            ws_compId: req.query.ws_compId,
            wsq_status: req.query.wsq_status
        };

        var result = await quarterService.getListOfQuarterlyWorkstationByCompIdAndNotStatus(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get list of workstations by NOT quarterly workstation status and computer id";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET list of workstations by NOT status and sched id
module.exports.getListOfWorkstationsByQtrNotStatusAndSchedId = async (req, res, next) => {
    try{
        var data = {
            sched_id: Number(req.query.sched_id),
            wsq_status: Number(req.query.wsq_status),
            listOfWorkstations: req.query.listOfWorkstations
        };

        var result = await quarterService.getListOfWorkstationsByQtrNotStatusAndSchedId(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get list of workstations by NOT quarterly workstation status and sched id";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET list of workstations details by workstation ids
module.exports.getQuarterlyWorkstationDetailsByWsqIds = async (req, res, next) => {
    try{
        var data = {
            listOfWorkstationIds: req.query.listOfWorkstationIds
        };

        var result = await quarterService.getQuarterlyWorkstationDetailsByWsqIds(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get list of workstations details by workstation ids";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};


