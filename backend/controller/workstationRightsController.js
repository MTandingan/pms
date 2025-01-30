const model = require('../model/response');
const Constants = require('../helper/constants');
const workstationRightsService = require('../service/workstationRightsService');

//CREATE workstation rights data
module.exports.createWorkstationRights = async (req, res, next) => {
    try{
        var data = {
            wsqRights_wsqId: req.body.wsqRights_wsqId,
            wsqRights_userId: req.body.wsqRights_userId,
            wsqRights_userName: req.body.wsqRights_userName,
            can_approve_request: req.body.can_approve_request
        };

        await workstationRightsService.createWorkstationRights(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully created a user workstation rights data";
        model.response.data = {};
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//CREATE multiple user workstation rights data
module.exports.createMultipleUserWorkstationRights = async (req, res, next) => {
    try{
        var data = {
            wsq_id: req.body.wsq_id,
            listOfEmployees: req.body.listOfEmployees,
            accessRights: req.body.accessRights
        };

        await workstationRightsService.createMultipleUserWorkstationRights(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully created multiple user workstation rights";
        model.response.data = {};
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//DELETE user workstation rights by id
module.exports.deleteUserWorkstationRightsById = async (req, res, next) => {
    try{
        var data = {
            wsqRights_id: req.params.id
        };

        var result = await workstationRightsService.deleteUserWorkstationRightsById(data);
     
        if(result === Constants.STATUS_CODE_SUCCESS){
            model.response.status = Constants.STATUS_CODE_SUCCESS;
            model.response.message = "Successfully deleted the user";
            model.response.data = {};
        } else if(result === Constants.STATUS_CODE_SUBMIT_DENY) {
            model.response.status = Constants.STATUS_CODE_ERROR;
            model.response.message = "User can't be deleted as it is used on other data.";
            model.response.data = {};
        } else {
            model.response.status = Constants.STATUS_CODE_ERROR;
            model.response.message = "User doesn't exist. Please reload the page. If it persists, please call the IT department";
            model.response.data = {};
        } 
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET list of workstation rights
module.exports.getListOfUserWorkstationRights = async (req, res, next) => {
    try{
        var result = await workstationRightsService.getListOfUserWorkstationRights();
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get all the list of user workstation rights";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET list of user workstation rights by wsq id
module.exports.getListOfUserWorkstationRightsByWsqId = async (req, res, next) => {
    try{
        var data = {
            wsqRights_wsqId: req.query.wsqRights_wsqId
        };

        var result = await workstationRightsService.getListOfUserWorkstationRightsByWsqId(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get the list of user workstation rights by wsq id";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET list of user workstation rights by wsq id and user id
module.exports.getListOfUserWorkstationRightsByWsqIdAndUserId = async (req, res, next) => {
    try{
        var data = {
            wsqRights_wsqId: req.query.wsqRights_wsqId,
            wsqRights_userId: req.query.wsqRights_userId
        };

        var result = await workstationRightsService.getListOfUserWorkstationRightsByWsqIdAndUserId(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get the list of user workstation rights by wsq id and user id";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET list of user workstation rights by wsq id and user id with access for approval
module.exports.getUserWorkstationRightsByWsqIdAndUserIdWithAccess = async (req, res, next) => {
    try{
        var data = {
            wsqRights_wsqId: req.query.wsqRights_wsqId,
            wsqRights_userId: req.query.wsqRights_userId,
            can_approve_request: req.query.can_approve_request
        };

        var result = await workstationRightsService.getUserWorkstationRightsByWsqIdAndUserIdWithAccess(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get the list of user workstation rights by wsq id and user id with permission";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};


