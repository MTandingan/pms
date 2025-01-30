const model = require('../model/response');
const Constants = require('../helper/constants');
const workStationService = require('../service/workStationService');

//GET list of workstations
module.exports.getListOfWorkstations = async (req, res, next) => {
    try{
        var result = await workStationService.getListOfWorkstations();
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get all the list of workstation";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET list of computer by status
module.exports.getListOfWorkstationsByStatus = async (req, res, next) => {
    try{
        var data = {
            ws_isActive: req.query.ws_isActive
        };

        var result = await workStationService.getListOfWorkstationsByStatus(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get all the list of workstation by status";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET list of workstation with limit range
module.exports.getListOfUserWorkstationWithRange = async (req, res, next) => {
    try{
        var data = {
            pFrom: Number(req.query.from),
            pTo: Number(req.query.to),
            ws_userId: Number(req.query.ws_userId),
            access_right: Number(req.query.access_right),
            ws_computerName: (req.query.ws_computerName == null) ? '' :  req.query.ws_computerName,
            sched_year: (req.query.sched_year == null) ? 0 :  Number(req.query.sched_year),
            location_name: (req.query.location_name == null) ? '' :  req.query.location_name,
            pdept_batch: (req.query.pdept_batch == null) ? 0 :  Number(req.query.pdept_batch),
            ws_userName: (req.query.ws_userName == null) ? '' :  req.query.ws_userName,
            wsq_status: (req.query.wsq_status == null) ? 0 :  Number(req.query.wsq_status),
            wsq_id: (req.query.wsq_id == null) ? 0 :  Number(req.query.wsq_id)
        };

        var result = await workStationService.getListOfUserWorkstationWithRange(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get the list of workstation of user with limit range";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET list of other workstation with limit range
module.exports.getListOfUserOthersWorkstationWithRange = async (req, res, next) => {
    try{
        var data = {
            pFrom: Number(req.query.from),
            pTo: Number(req.query.to),
            ws_userId: Number(req.query.ws_userId),
            access_right: Number(req.query.access_right),
            ws_computerName: (req.query.ws_computerName == null) ? '' :  req.query.ws_computerName,
            sched_year: (req.query.sched_year == null) ? 0 :  Number(req.query.sched_year),
            location_name: (req.query.location_name == null) ? '' :  req.query.location_name,
            pdept_batch: (req.query.pdept_batch == null) ? 0 :  Number(req.query.pdept_batch),
            ws_userName: (req.query.ws_userName == null) ? '' :  req.query.ws_userName,
            wsq_status: (req.query.wsq_status == null) ? 0 :  Number(req.query.wsq_status)
        };

        var result = await workStationService.getListOfUserOthersWorkstationWithRange(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get the list of other workstation of user with limit range";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET list of workstation with limit range
module.exports.getListOfUserWorkstationDeviceWithRange = async (req, res, next) => {
    try{
        var data = {
            pFrom: Number(req.query.from),
            pTo: Number(req.query.to),
            ws_userId: (req.query.ws_userId == null || req.query.ws_userId == '') ? 0 : Number(req.query.ws_userId),
            ws_isActive: (req.query.ws_isActive == '') ? null : req.query.ws_isActive
        };

        var result = await workStationService.getListOfUserWorkstationDeviceWithRange(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get the list of workstation of user device with limit range";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};