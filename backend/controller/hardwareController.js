const model = require('../model/response');
const Constants = require('../helper/constants');
const hardwareService = require('../service/hardwareService');
const quarterService = require('../service/quarterService');

//CREATE computer data
module.exports.createHardware = async (req, res, next) => {
    try{
        var data = {
            hw_name: req.body.hw_name,
            hw_description: req.body.hw_description,
            hw_isActive: req.body.hw_isActive,
            hw_isOthers: req.body.hw_isOthers
        };

        await hardwareService.createHardware(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully created a hardware data";
        model.response.data = {};
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//CREATE list of newly added hardware that aren't included in the checklist of a quarterly workstation
module.exports.createMultipleNewRefQuarterlyWsHardware = async (req, res, next) => {
    try{
        var data = {
            wsq_id: req.body.wsq_id
        };

        await hardwareService.createMultipleNewRefQuarterlyWsHardware(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully created all the newly added hardware in a quarterly workstation by wsq id";
        model.response.data = {};
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//CREATE custom list of hardware that aren't included in the checklist of a quarterly workstation with return ids
module.exports.createQtyHardwarePlaceholdersCustomListIndex = async (req, res, next) => {
    try{
        var data = {
            wsq_id: req.body.wsq_id,
            hardwareList: req.body.hardwareList
        };

        var result = await quarterService.createQtyHardwarePlaceholdersCustomListIndex(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully created all the added hardware in a quarterly workstation by wsq id";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//CREATE custom list of hardware that aren't included in the checklist of a quarterly workstation with return hardware data
module.exports.addQtyHardwarePlaceholdersCustomListIndex = async (req, res, next) => {
    try{
        var data = {
            wsq_id: req.body.wsq_id,
            hardwareList: req.body.hardwareList
        };

        var result = await quarterService.addQtyHardwarePlaceholdersCustomListIndex(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully created all the added hardware in a quarterly workstation by wsq id";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//UPDATE hardware data
module.exports.updateHardware = async (req, res, next) => {
    try{
        var data = {
            hw_name: req.body.hw_name,
            hw_description: req.body.hw_description,
            hw_isActive: req.body.hw_isActive,
            hw_isOthers: req.body.hw_isOthers,
            hw_id: req.body.hw_id
        };

        const result = await hardwareService.updateHardware(data);

        if(result === Constants.HAS_UPDATED_DATA){
            model.response.status = Constants.STATUS_CODE_SUCCESS;
            model.response.message = "Successfully updated the hardware data";
            model.response.data = {};
        } else {
            model.response.status = Constants.STATUS_CODE_ERROR;
            model.response.message = "There is no hardware to update. Please reload the page. If it persists, please call the IT department";
            model.response.data = {};
        }
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET list of hardware
module.exports.getListOfHardware = async (req, res, next) => {
    try{
        var result = await hardwareService.getListOfHardware();
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get all the list of hardware";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET list of hardware checklist of a quarterly workstation
module.exports.getListOfWsHardwareDetailsByWsqId = async (req, res, next) => {
    try{
        var data = {
            qtyhard_wsqId: req.query.qtyhard_wsqId
        };

        var result = await hardwareService.getListOfWsHardwareDetailsByWsqId(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get all the hardware details of a quarterly workstation by wsq id";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET list of missing hardware checklist of a quarterly workstation
module.exports.getListOfMissingActiveHardwareByWsqId = async (req, res, next) => {
    try{
        var data = {
            qtyhard_wsqId: req.query.qtyhard_wsqId,
            hw_isActive: req.query.hw_isActive,
            hw_isOthers: req.query.hw_isOthers
        };

        var result = await hardwareService.getListOfMissingActiveHardwareByWsqId(data);

        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get all the hardware details of a quarterly workstation by wsq id";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET list of missing hardware checklist with others of a quarterly workstation
module.exports.getListOfMissingActiveHardwareWithOthersByWsqId = async (req, res, next) => {
    try{
        var data = {
            refhw_wsqId: req.query.qtyhard_wsqId,
            qtyhard_wsqId: req.query.qtyhard_wsqId,
            hw_isActive: req.query.hw_isActive,
            qtyhard_wsqId1: req.query.qtyhard_wsqId,
            hw_isActive1: req.query.hw_isActive,
            hw_isOthers: req.query.hw_isOthers
        };

        var result = await hardwareService.getListOfMissingActiveHardwareWithOthersByWsqId(data);

        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get all the hardware details of a quarterly workstation by wsq id";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET list of hardware inventory for reporting by sched id and month ranges
module.exports.getInventoryHardwareReportBySchedIdAndMonthRanges = async (req, res, next) => {
    try{
        var data = {
            sched_id: req.query.sched_id,
            fromMonth: req.query.fromMonth,
            toMonth: req.query.toMonth
        };

        var result = await hardwareService.getInventoryHardwareReportBySchedIdAndMonthRanges(data);

        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get all the hardware inventory by sched id and month ranges";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET list of hardware inventory for reporting by sched id, item ids, and month ranges
module.exports.getInventoryHardwareReportBySchedIdMonthRangesAndItemIds = async (req, res, next) => {
    try{
        var data = {
            sched_id: req.query.sched_id,
            hardware_items: req.query.hardware_items,
            fromMonth: req.query.fromMonth,
            toMonth: req.query.toMonth
        };

        var result = await hardwareService.getInventoryHardwareReportBySchedIdMonthRangesAndItemIds(data);

        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get all the hardware inventory by sched id, item ids and month ranges";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET list of hardware inventory for reporting by sched id, item ids, wsq status and month ranges
module.exports.getInventoryHardwareReportBySchedIdMonthRangesWsqStatusAndItemIds = async (req, res, next) => {
    try{
        var data = {
            sched_id: req.query.sched_id,
            hardware_items: req.query.hardware_items,
            fromMonth: req.query.fromMonth,
            toMonth: req.query.toMonth
        };

        var result = await hardwareService.getInventoryHardwareReportBySchedIdMonthRangesWsqStatusAndItemIds(data);

        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get all the hardware inventory by sched id, item ids and month ranges";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

module.exports.getInventoryHardwareReportBySchedIdMonthRangesWsqStatusAndItemIdsV2 = async (req, res, next) => {
    try{
        var data = {
            sched_id: req.query.sched_id,
            hardware_items: req.query.hardware_items,
            wsq_resolution: req.query.wsq_resolution,
            wsq_status: req.query.wsq_status,
            fromMonth: req.query.fromMonth,
            toMonth: req.query.toMonth
        };

        var result = await hardwareService.getInventoryHardwareReportBySchedIdMonthRangesWsqStatusAndItemIdsV2(data);

        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get all the hardware inventory by sched id, item ids and month ranges";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET list of hardware limit range
module.exports.getListOfHardwareWithRange = async (req, res, next) => {
    try{
        var data = {
            pFrom: Number(req.query.from),
            pTo: Number(req.query.to),
            hw_name: (req.query.hw_name == null) ? '' :  req.query.hw_name,
            hw_description: (req.query.hw_description == null) ? '' : req.query.hw_description,
            hw_isActive: (req.query.hw_isActive === null) ? '' : req.query.hw_isActive,
            hw_isOthers: (req.query.hw_isOthers === null) ? '' : req.query.hw_isOthers
        };

        var result = await hardwareService.getListOfHardwareWithRange(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get the list of hardware with limit range";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//DELETE hardware data
module.exports.deleteHardware = async (req, res, next) => {
    try{
        var data = {
            hw_id: req.params.id
        };

        var result =  await hardwareService.deleteHardware(data);

        if(result === Constants.STATUS_CODE_SUCCESS){
            model.response.status = Constants.STATUS_CODE_SUCCESS;
            model.response.message = "Successfully deleted the hardware";
            model.response.data = {};
        } else if(result === Constants.STATUS_CODE_SUBMIT_DENY) {
            model.response.status = Constants.STATUS_CODE_ERROR;
            model.response.message = "Hardware can't be deleted as it is used on other data.";
            model.response.data = {};
        }  else {
            model.response.status = Constants.STATUS_CODE_ERROR;
            model.response.message = "Hardware doesn't exist. Please reload the page. If it persists, please call the IT department";
            model.response.data = {};
        } 
    } catch (err) {
        model.response.status = 2;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//DELETE hardware data from the quarterly workstation by id
module.exports.deleteQtyWsHardwareById = async (req, res, next) => {
    try{
        var data = {
            qtyhard_id: req.params.id
        };

        var result =  await hardwareService.deleteQtyWsHardwareById(data);

        if(result === Constants.STATUS_CODE_SUCCESS){
            model.response.status = Constants.STATUS_CODE_SUCCESS;
            model.response.message = "Successfully deleted the hardware of a quarterly workstation";
            model.response.data = {};
        } else {
            model.response.status = Constants.STATUS_CODE_ERROR;
            model.response.message = "Hardware doesn't exist. Please reload the page. If it persists, please call the IT department";
            model.response.data = {};
        } 
    } catch (err) {
        model.response.status = 2;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//DELETE hardware data and its quarterly workstation checklist data 
module.exports.deleteWorkstationOtherHardware = async (req, res, next) => {
    try{
        var data = {
            hw_id: req.params.id
        };

        var result =  await hardwareService.deleteWorkstationOtherHardware(data);

        if(result === Constants.STATUS_CODE_SUCCESS){
            model.response.status = Constants.STATUS_CODE_SUCCESS;
            model.response.message = "Successfully deleted the hardware and its quarterly workstation checklist data";
            model.response.data = {};
        } else {
            model.response.status = Constants.STATUS_CODE_ERROR;
            model.response.message = "Hardware doesn't exist. Please reload the page. If it persists, please call the IT department";
            model.response.data = {};
        } 
    } catch (err) {
        model.response.status = 2;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//DELETE hardware data only if doesn't have previous record from its quarterly workstation 
module.exports.deleteAndCheckWorkstationOtherHardware = async (req, res, next) => {
    try{
        var data = {
            qtyhard_wsqId: req.params.wsq_id,
            hw_id: req.params.hw_id
        };

        var result =  await hardwareService.deleteAndCheckWorkstationOtherHardware(data);

        if(result === Constants.STATUS_CODE_SUCCESS){
            model.response.status = Constants.STATUS_CODE_SUCCESS;
            model.response.message = "Successfully deleted the hardware and its quarterly workstation checklist data";
            model.response.data = {};
        } else {
            model.response.status = Constants.STATUS_CODE_ERROR;
            model.response.message = "Hardware doesn't exist. Please reload the page. If it persists, please call the IT department";
            model.response.data = {};
        } 
    } catch (err) {
        model.response.status = 2;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//DELETE hardware data only if doesn't have previous record from other tables
module.exports.deleteAndCheckWorkstationOtherHardwareWithRef = async (req, res, next) => {
    try{
        var data = {
            qtyhard_wsqId: req.params.wsq_id,
            hw_id: req.params.hw_id
        };

        var result =  await hardwareService.deleteAndCheckWorkstationOtherHardwareWithRef(data);

        if(result === Constants.STATUS_CODE_SUCCESS){
            model.response.status = Constants.STATUS_CODE_SUCCESS;
            model.response.message = "Successfully deleted the hardware and its quarterly workstation checklist data";
            model.response.data = {};
        } else {
            model.response.status = Constants.STATUS_CODE_ERROR;
            model.response.message = "Hardware doesn't exist. Please reload the page. If it persists, please call the IT department";
            model.response.data = {};
        } 
    } catch (err) {
        model.response.status = 2;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};
