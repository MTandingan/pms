const model = require('../model/response');
const Constants = require('../helper/constants');
const config = require('../config.json');
const accessRightsService = require('../service/accessRightsService');

//TODO: REPLACE EVERYTHING WITH JSON WEB TOKEN SESSION

exports.authenticateCanManagePmsSchedule = async function (req, res, next) {
    try{
        return next();
        // if(req.session.user){
        //     let result = await accessRightsService.getAccessRights({acc_id: req.session.user.access_right}); 

        //     if(result.length !== 0){
        //         let data = result[0];

        //         if(data.can_manage_pms_schedule == true){
        //             return next();
        //         }
        //     }

        //     model.response.status = Constants.STATUS_CODE_AUTH_ROLE;
        //     model.response.message = "User does not have the authorization to execute the action";
        //     model.response.data = {};
    
        //     return res.send(model.response);
        // } else {
        //     model.response.status = Constants.STATUS_CODE_AUTH_ROLE;
        //     model.response.message = "User is not found upon checking the authorization or you don't have any authorization to execute the action";
        //     model.response.data = {};
    
        //     return res.send(model.response);
        // }
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
}

exports.authenticateCanManageComputer = async function (req, res, next) {
    try{
        return next();
        // if(req.session.user){
        //     let result = await accessRightsService.getAccessRights({acc_id: req.session.user.access_right}); 

        //     if(result.length !== 0){
        //         let data = result[0];

        //         if(data.can_manage_computer == true){
        //             return next();
        //         }
        //     }

        //     model.response.status = Constants.STATUS_CODE_AUTH_ROLE;
        //     model.response.message = "User does not have the authorization to execute the action";
        //     model.response.data = {};
    
        //     return res.send(model.response);
        // } else {
        //     model.response.status = Constants.STATUS_CODE_AUTH_ROLE;
        //     model.response.message = "User is not found upon checking the authorization or you don't have any authorization to execute the action";
        //     model.response.data = {};
    
        //     return res.send(model.response);
        // }
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
}

exports.authenticateCanManageWorkstation = async function (req, res, next) {
    try{
        return next();
        // if(req.session.user){
        //     let result = await accessRightsService.getAccessRights({acc_id: req.session.user.access_right}); 

        //     if(result.length !== 0){
        //         let data = result[0];

        //         if(data.can_manage_workstation == true){
        //             return next();
        //         }
        //     }

        //     model.response.status = Constants.STATUS_CODE_AUTH_ROLE;
        //     model.response.message = "User does not have the authorization to execute the action";
        //     model.response.data = {};
    
        //     return res.send(model.response);
        // } else {
        //     model.response.status = Constants.STATUS_CODE_AUTH_ROLE;
        //     model.response.message = "User is not found upon checking the authorization or you don't have any authorization to execute the action";
        //     model.response.data = {};
    
        //     return res.send(model.response);
        // }
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
}

exports.authenticateCanManageQuarterlyWorkstation = async function (req, res, next) {
    try{
        return next();
        // if(req.session.user){
        //     let result = await accessRightsService.getAccessRights({acc_id: req.session.user.access_right}); 

        //     if(result.length !== 0){
        //         let data = result[0];

        //         if(data.can_manage_quarterly_workstation == true){
        //             return next();
        //         }
        //     }

        //     model.response.status = Constants.STATUS_CODE_AUTH_ROLE;
        //     model.response.message = "User does not have the authorization to execute the action";
        //     model.response.data = {};
    
        //     return res.send(model.response);
        // } else {
        //     model.response.status = Constants.STATUS_CODE_AUTH_ROLE;
        //     model.response.message = "User is not found upon checking the authorization or you don't have any authorization to execute the action";
        //     model.response.data = {};
    
        //     return res.send(model.response);
        // }
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
}

exports.authenticateCanManageApprovalQuarterlyWorkstation = async function (req, res, next) {
    try{
        return next();
        // if(req.session.user){
        //     let result = await accessRightsService.getAccessRights({acc_id: req.session.user.access_right}); 

        //     if(result.length !== 0){
        //         let data = result[0];

        //         if(data.can_manage_approval_quarterly_workstation == true){
        //             return next();
        //         }
        //     }

        //     model.response.status = Constants.STATUS_CODE_AUTH_ROLE;
        //     model.response.message = "User does not have the authorization to execute the action";
        //     model.response.data = {};
    
        //     return res.send(model.response);
        // } else {
        //     model.response.status = Constants.STATUS_CODE_AUTH_ROLE;
        //     model.response.message = "User is not found upon checking the authorization or you don't have any authorization to execute the action";
        //     model.response.data = {};
    
        //     return res.send(model.response);
        // }
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
}

exports.authenticateCanManageFaca = async function (req, res, next) {
    try{
        return next();
        // if(req.session.user){
        //     let result = await accessRightsService.getAccessRights({acc_id: req.session.user.access_right}); 

        //     if(result.length !== 0){
        //         let data = result[0];

        //         if(data.can_manage_faca == true){
        //             return next();
        //         }
        //     }

        //     model.response.status = Constants.STATUS_CODE_AUTH_ROLE;
        //     model.response.message = "User does not have the authorization to execute the action";
        //     model.response.data = {};
    
        //     return res.send(model.response);
        // } else {
        //     model.response.status = Constants.STATUS_CODE_AUTH_ROLE;
        //     model.response.message = "User is not found upon checking the authorization or you don't have any authorization to execute the action";
        //     model.response.data = {};
    
        //     return res.send(model.response);
        // }
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
}

exports.authenticateCanManageHardware = async function (req, res, next) {
    try{
        return next();
        // if(req.session.user){
        //     let result = await accessRightsService.getAccessRights({acc_id: req.session.user.access_right}); 

        //     if(result.length !== 0){
        //         let data = result[0];

        //         if(data.can_manage_hardware == true){
        //             return next();
        //         }
        //     }

        //     model.response.status = Constants.STATUS_CODE_AUTH_ROLE;
        //     model.response.message = "User does not have the authorization to execute the action";
        //     model.response.data = {};
    
        //     return res.send(model.response);
        // } else {
        //     model.response.status = Constants.STATUS_CODE_AUTH_ROLE;
        //     model.response.message = "User is not found upon checking the authorization or you don't have any authorization to execute the action";
        //     model.response.data = {};
    
        //     return res.send(model.response);
        // }
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
}

exports.authenticateCanManageSoftware = async function (req, res, next) {
    try{
        return next();
        // if(req.session.user){
        //     let result = await accessRightsService.getAccessRights({acc_id: req.session.user.access_right}); 

        //     if(result.length !== 0){
        //         let data = result[0];

        //         if(data.can_manage_software == true){
        //             return next();
        //         }
        //     }

        //     model.response.status = Constants.STATUS_CODE_AUTH_ROLE;
        //     model.response.message = "User does not have the authorization to execute the action";
        //     model.response.data = {};
    
        //     return res.send(model.response);
        // } else {
        //     model.response.status = Constants.STATUS_CODE_AUTH_ROLE;
        //     model.response.message = "User is not found upon checking the authorization or you don't have any authorization to execute the action";
        //     model.response.data = {};
    
        //     return res.send(model.response);
        // }
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
}

exports.authenticateCanManageBrand = async function (req, res, next) {
    try{
        return next();
        // if(req.session.user){
        //     let result = await accessRightsService.getAccessRights({acc_id: req.session.user.access_right}); 

        //     if(result.length !== 0){
        //         let data = result[0];

        //         if(data.can_manage_brand == true){
        //             return next();
        //         }
        //     }

        //     model.response.status = Constants.STATUS_CODE_AUTH_ROLE;
        //     model.response.message = "User does not have the authorization to execute the action";
        //     model.response.data = {};
    
        //     return res.send(model.response);
        // } else {
        //     model.response.status = Constants.STATUS_CODE_AUTH_ROLE;
        //     model.response.message = "User is not found upon checking the authorization or you don't have any authorization to execute the action";
        //     model.response.data = {};
    
        //     return res.send(model.response);
        // }
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
}

exports.authenticateCanRevertQuarterlyWorkstation = async function (req, res, next) {
    try{
        return next();
        // if(req.session.user){
        //     let result = await accessRightsService.getAccessRights({acc_id: req.session.user.access_right}); 

        //     if(result.length !== 0){
        //         let data = result[0];

        //         if(data.can_revert_quarterly_workstation == true){
        //             return next();
        //         }
        //     }

        //     model.response.status = Constants.STATUS_CODE_AUTH_ROLE;
        //     model.response.message = "User does not have the authorization to execute the action";
        //     model.response.data = {};
    
        //     return res.send(model.response);
        // } else {
        //     model.response.status = Constants.STATUS_CODE_AUTH_ROLE;
        //     model.response.message = "User is not found upon checking the authorization or you don't have any authorization to execute the action";
        //     model.response.data = {};
    
        //     return res.send(model.response);
        // }
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
}