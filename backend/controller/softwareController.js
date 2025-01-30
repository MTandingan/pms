const model = require('../model/response');
const Constants = require('../helper/constants');
const softwareService = require('../service/softwareService');
const quarterService = require('../service/quarterService');

//CREATE computer data
module.exports.createSoftware = async (req, res, next) => {
    try{
        var data = {
            sw_name: req.body.sw_name,
            sw_description: req.body.sw_description,
            sw_isActive: req.body.sw_isActive,
            sw_isOthers: req.body.sw_isOthers
        };

        await softwareService.createSoftware(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully created a software data";
        model.response.data = {};
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//CREATE list of newly added software that aren't included in the checklist of a quarterly workstation
module.exports.createMultipleNewRefQuarterlyWsSoftware = async (req, res, next) => {
    try{
        var data = {
            wsq_id: req.body.wsq_id
        };

        await softwareService.createMultipleNewRefQuarterlyWsSoftware(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully created all the newly added software in a quarterly workstation by wsq id";
        model.response.data = {};
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//CREATE custom list of software that aren't included in the checklist of a quarterly workstation with return software data
module.exports.addQtySoftwarePlaceholdersCustomListIndex = async (req, res, next) => {
    try{
        var data = {
            wsq_id: req.body.wsq_id,
            softwareList: req.body.softwareList
        };

        var result = await quarterService.addQtySoftwarePlaceholdersCustomListIndex(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully created all the added software in a quarterly workstation by wsq id";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//UPDATE software data
module.exports.updateSoftware = async (req, res, next) => {
    try{
        var data = {
            sw_name: req.body.sw_name,
            sw_description: req.body.sw_description,
            sw_isActive: req.body.sw_isActive,
            sw_isOthers: req.body.sw_isOthers,
            sw_id: req.body.sw_id
        };

        const result = await softwareService.updateSoftware(data);

        if(result === Constants.HAS_UPDATED_DATA){
            model.response.status = Constants.STATUS_CODE_SUCCESS;
            model.response.message = "Successfully updated the software data";
            model.response.data = {};
        } else {
            model.response.status = Constants.STATUS_CODE_ERROR;
            model.response.message = "There is no software to update. Please reload the page. If it persists, please call the IT department";
            model.response.data = {};
        }
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET list of software
module.exports.getListOfSoftware = async (req, res, next) => {
    try{
        var result = await softwareService.getListOfSoftware();
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get all the list of software";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET list of software checklist of a quarterly workstation
module.exports.getListOfWsSoftwareDetailsByWsqId = async (req, res, next) => {
    try{
        var data = {
            qtysoft_wsqId: req.query.qtysoft_wsqId
        };

        var result = await softwareService.getListOfWsSoftwareDetailsByWsqId(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get all the software details of a quarterly workstation by wsq id";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET list of missing software checklist of a quarterly workstation
module.exports.getListOfMissingActiveSoftwareByWsqId = async (req, res, next) => {
    try{
        var data = {
            qtysoft_wsqId: req.query.qtysoft_wsqId,
            sw_isActive: req.query.sw_isActive,
            sw_isOthers: req.query.sw_isOthers
        };

        var result = await softwareService.getListOfMissingActiveSoftwareByWsqId(data);

        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get all the software details of a quarterly workstation by wsq id";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET list of missing software checklist with others of a quarterly workstation
module.exports.getListOfMissingActiveSoftwareWithOthersByWsqId = async (req, res, next) => {
    try{
        var data = {
            refsw_wsqId: req.query.qtysoft_wsqId,
            qtysoft_wsqId: req.query.qtysoft_wsqId,
            sw_isActive: req.query.sw_isActive,
            qtysoft_wsqId1: req.query.qtysoft_wsqId,
            sw_isActive1: req.query.sw_isActive,
            sw_isOthers: req.query.sw_isOthers
        };

        var result = await softwareService.getListOfMissingActiveSoftwareWithOthersByWsqId(data);

        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get all the software details of a quarterly workstation by wsq id";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET list of software inventory for reporting by sched id and month ranges
module.exports.getInventorySoftwareReportBySchedIdAndMonthRanges = async (req, res, next) => {
    try{
        var data = {
            sched_id: req.query.sched_id,
            fromMonth: req.query.fromMonth,
            toMonth: req.query.toMonth
        };

        var result = await softwareService.getInventorySoftwareReportBySchedIdAndMonthRanges(data);

        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get all the software inventory by sched id and month ranges";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET list of software inventory for reporting by sched id, item ids and month ranges
module.exports.getInventorySoftwareReportBySchedIdMonthRangesAndItemIds = async (req, res, next) => {
    try{
        var data = {
            sched_id: req.query.sched_id,
            software_items: req.query.software_items,
            fromMonth: req.query.fromMonth,
            toMonth: req.query.toMonth
        };

        var result = await softwareService.getInventorySoftwareReportBySchedIdMonthRangesAndItemIds(data);

        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get all the software inventory by sched id, software item ids and month ranges";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET list of software inventory for reporting by sched id, item ids and month ranges
module.exports.getInventorySoftwareReportBySchedIdMonthRangesWsqStatusAndItemIds = async (req, res, next) => {
    try{
        var data = {
            sched_id: req.query.sched_id,
            software_items: req.query.software_items,
            fromMonth: req.query.fromMonth,
            toMonth: req.query.toMonth
        };

        var result = await softwareService.getInventorySoftwareReportBySchedIdMonthRangesWsqStatusAndItemIds(data);

        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get all the software inventory by sched id, software item ids and month ranges";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET list of software inventory for reporting by sched id, item ids and month ranges
module.exports.getInventorySoftwareReportBySchedIdMonthRangesWsqStatusAndItemIdsV2 = async (req, res, next) => {
    try{
        var data = {
            sched_id: req.query.sched_id,
            software_items: req.query.software_items,
            wsq_resolution: req.query.wsq_resolution,
            wsq_status: req.query.wsq_status,
            fromMonth: req.query.fromMonth,
            toMonth: req.query.toMonth
        };

        var result = await softwareService.getInventorySoftwareReportBySchedIdMonthRangesWsqStatusAndItemIdsV2(data);

        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get all the software inventory by sched id, software item ids and month ranges";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET list of software limit range
module.exports.getListOfSoftwareWithRange = async (req, res, next) => {
    try{
        var data = {
            pFrom: Number(req.query.from),
            pTo: Number(req.query.to),
            sw_name: (req.query.sw_name == null) ? '' :  req.query.sw_name,
            sw_description: (req.query.sw_description == null) ? '' : req.query.sw_description,
            sw_isActive: (req.query.sw_isActive === null) ? '' : req.query.sw_isActive,
            sw_isOthers: (req.query.sw_isOthers === null) ? '' : req.query.sw_isOthers
        };

        var result = await softwareService.getListOfSoftwareWithRange(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get the list of software with limit range";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//DELETE software data
module.exports.deleteSoftware = async (req, res, next) => {
    try{
        var data = {
            sw_id: req.params.id
        };

        var result =  await softwareService.deleteSoftware(data);

        if(result === Constants.STATUS_CODE_SUCCESS){
            model.response.status = Constants.STATUS_CODE_SUCCESS;
            model.response.message = "Successfully deleted the software";
            model.response.data = {};
        } else if(result === Constants.STATUS_CODE_SUBMIT_DENY) {
            model.response.status = Constants.STATUS_CODE_ERROR;
            model.response.message = "Software can't be deleted as it is used on other data.";
            model.response.data = {};
        } else {
            model.response.status = Constants.STATUS_CODE_ERROR;
            model.response.message = "Software doesn't exist. Please reload the page. If it persists, please call the IT department";
            model.response.data = {};
        } 
    } catch (err) {
        model.response.status = 2;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//DELETE software data from the quarterly workstation by id
module.exports.deleteQtyWsSoftwareById = async (req, res, next) => {
    try{
        var data = {
            qtysoft_id: req.params.id
        };

        var result =  await softwareService.deleteQtyWsSoftwareById(data);

        if(result === Constants.STATUS_CODE_SUCCESS){
            model.response.status = Constants.STATUS_CODE_SUCCESS;
            model.response.message = "Successfully deleted the software of a quarterly workstation";
            model.response.data = {};
        } else {
            model.response.status = Constants.STATUS_CODE_ERROR;
            model.response.message = "Software doesn't exist. Please reload the page. If it persists, please call the IT department";
            model.response.data = {};
        } 
    } catch (err) {
        model.response.status = 2;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//DELETE software data and its quarterly workstation checklist data 
module.exports.deleteWorkstationOtherSoftware = async (req, res, next) => {
    try{
        var data = {
            sw_id: req.params.id
        };

        var result =  await softwareService.deleteWorkstationOtherSoftware(data);

        if(result === Constants.STATUS_CODE_SUCCESS){
            model.response.status = Constants.STATUS_CODE_SUCCESS;
            model.response.message = "Successfully deleted the software and its quarterly workstation checklist data";
            model.response.data = {};
        } else {
            model.response.status = Constants.STATUS_CODE_ERROR;
            model.response.message = "Software doesn't exist. Please reload the page. If it persists, please call the IT department";
            model.response.data = {};
        } 
    } catch (err) {
        model.response.status = 2;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//DELETE software data only if doesn't have previous record from its quarterly workstation 
module.exports.deleteAndCheckWorkstationOtherSoftware = async (req, res, next) => {
    try{
        var data = {
            qtysoft_wsqId: req.params.wsq_id,
            sw_id: req.params.sw_id
        };

        var result =  await softwareService.deleteAndCheckWorkstationOtherSoftware(data);

        if(result === Constants.STATUS_CODE_SUCCESS){
            model.response.status = Constants.STATUS_CODE_SUCCESS;
            model.response.message = "Successfully deleted the software and its quarterly workstation checklist data";
            model.response.data = {};
        } else {
            model.response.status = Constants.STATUS_CODE_ERROR;
            model.response.message = "Software doesn't exist. Please reload the page. If it persists, please call the IT department";
            model.response.data = {};
        } 
    } catch (err) {
        model.response.status = 2;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//DELETE software data only if doesn't have previous record from other tables
module.exports.deleteAndCheckWorkstationOtherSoftwareWithRef = async (req, res, next) => {
    try{
        var data = {
            qtysoft_wsqId: req.params.wsq_id,
            sw_id: req.params.sw_id
        };

        var result =  await softwareService.deleteAndCheckWorkstationOtherSoftwareWithRef(data);

        if(result === Constants.STATUS_CODE_SUCCESS){
            model.response.status = Constants.STATUS_CODE_SUCCESS;
            model.response.message = "Successfully deleted the software and its quarterly workstation checklist data";
            model.response.data = {};
        } else {
            model.response.status = Constants.STATUS_CODE_ERROR;
            model.response.message = "Software doesn't exist. Please reload the page. If it persists, please call the IT department";
            model.response.data = {};
        } 
    } catch (err) {
        model.response.status = 2;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};




