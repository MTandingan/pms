const model = require('../model/response');
const Constants = require('../helper/constants');
const computerService = require('../service/computerService');

//CREATE computer data
module.exports.createComputer = async (req, res, next) => {
    try{
        var data = {
            comp_name: req.body.comp_name,
            comp_description: req.body.comp_description,
            comp_inventoryId: req.body.comp_inventoryId,
            comp_barCode: req.body.comp_barCode,
            comp_serial: req.body.comp_serial,
            comp_status: req.body.comp_status
        };

        await computerService.createComputer(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully created a computer data";
        model.response.data = {};
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//UPDATE computer data
module.exports.updateComputer = async (req, res, next) => {
    try{
        var data = {
            comp_name: req.body.comp_name,
            comp_description: req.body.comp_description,
            comp_inventoryId: req.body.comp_inventoryId,
            comp_serial: req.body.comp_serial,
            comp_status: req.body.comp_status,
            comp_id: req.body.comp_id
        };

        const result = await computerService.updateComputer(data);

        if(result === Constants.HAS_UPDATED_DATA){
            model.response.status = Constants.STATUS_CODE_SUCCESS;
            model.response.message = "Successfully updated the computer data";
            model.response.data = {};
        } else {
            model.response.status = Constants.STATUS_CODE_ERROR;
            model.response.message = "There is no computer to update. Please reload the page. If it persists, please call the IT department";
            model.response.data = {};
        }
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//DELETE computer data
module.exports.deleteComputer = async (req, res, next) => {
    try{
        var data = {
            comp_id: req.params.id
        };

        var result =  await computerService.deleteComputer(data);

        if(result === Constants.STATUS_CODE_SUCCESS){
            model.response.status = Constants.STATUS_CODE_SUCCESS;
            model.response.message = "Successfully deleted the computer";
            model.response.data = {};
        } else if(result === Constants.STATUS_CODE_SUBMIT_DENY) {
            model.response.status = Constants.STATUS_CODE_ERROR;
            model.response.message = "Computer can't be deleted as it is used on other data.";
            model.response.data = {};
        } else {
            model.response.status = Constants.STATUS_CODE_ERROR;
            model.response.message = "Computer doesn't exist. Please reload the page. If it persists, please call the IT department";
            model.response.data = {};
        } 
    } catch (err) {
        model.response.status = 2;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET list of computer
module.exports.getListOfComputer = async (req, res, next) => {
    try{
        var result = await computerService.getListOfComputer();
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get all the list of computer";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET wsq details by different params (usually is used to get the wsq details of a defective computer)
module.exports.getWsqDetailsByParams = async (req, res, next) => {
    try{
        var data = {
            comp_id: req.query.comp_id,
            comp_status: req.query.comp_status,
            ws_isActive: req.query.ws_isActive,
            wsq_status: req.query.wsq_status,
            wsq_resolution: req.query.wsq_resolution
        };

        var result = await computerService.getWsqDetailsByParams(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get the wsq details of a defective computer";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET list of computer with NOT status
module.exports.getListOfComputerNotStatus = async (req, res, next) => {
    try{
        var data = {
            comp_status: req.query.comp_status
        };

        var result = await computerService.getListOfComputerNotStatus(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get all the list of computer by NOT status";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET list of computer by status
module.exports.getListOfComputerByStatus = async (req, res, next) => {
    try{
        var data = {
            comp_status: req.query.comp_status
        };

        var result = await computerService.getListOfComputerByStatus(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get all the list of computer by status";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET list of computer limit range
module.exports.getListOfComputerWithRange = async (req, res, next) => {
    try{
        var data = {
            pFrom: Number(req.query.from),
            pTo: Number(req.query.to),
            comp_name: (req.query.comp_name == null) ? '' :  req.query.comp_name,
            comp_inventoryId: (req.query.comp_inventoryId == null) ? '' : req.query.comp_inventoryId,
            comp_barCode: (req.query.comp_barCode == null) ? '' : req.query.comp_barCode,
            comp_serial: (req.query.comp_serial == null) ? '' : req.query.comp_serial,
            comp_status: (req.query.comp_status == 0) ? null : req.query.comp_status
        };

        var result = await computerService.getListOfComputerWithRange(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get the list of computer with limit range";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};