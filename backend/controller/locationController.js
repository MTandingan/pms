const model = require('../model/response');
const Constants = require('../helper/constants');
const locationService = require('../service/locationService');

//CREATE location data
module.exports.createLocation = async (req, res, next) => {
    try{
        var data = {
            location_deptId: req.body.location_deptId,
            location_name: req.body.location_name,
            location_description: req.body.location_description,
            location_isActive: req.body.location_isActive,
            location_deptName: req.body.location_deptName
        };

        await locationService.createlocation(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully created a location data";
        model.response.data = {};
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET list of location limit range
module.exports.getlistOfLocationWithRange = async (req, res, next) => {
    try{
        var data = {
            pFrom: Number(req.query.from),
            pTo: Number(req.query.to),
            location_name: (req.query.location_name == null) ? '' :  req.query.location_name,
            location_description: (req.query.location_description == null) ? '' : req.query.location_description,
            location_isActive: (req.query.location_isActive === null) ? '' : req.query.location_isActive,
            location_departmentId: (req.query.location_departmentId == null) ? '' : req.query.location_departmentId
        };

        var result = await locationService.getlistOfLocationWithRange(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get the list of location with limit range";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//UPDATE location data
module.exports.updateLocation = async (req, res, next) => {
    try{
        var data = {
            location_deptId: req.body.location_deptId,
            location_name: req.body.location_name,
            location_description: req.body.location_description,
            location_isActive: req.body.location_isActive,
            location_deptName: req.body.location_deptName,
            location_id: req.body.location_id
        };  

        const result = await locationService.updatelocation(data);

        if(result === Constants.HAS_UPDATED_DATA){
            model.response.status = Constants.STATUS_CODE_SUCCESS;
            model.response.message = "Successfully updated the location data";
            model.response.data = {};
        } else {
            model.response.status = Constants.STATUS_CODE_ERROR;
            model.response.message = "There is no location to update. Please reload the page. If it persists, please call the IT department";
            model.response.data = {};
        }
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
}

//DELETE location data
module.exports.deleteLocation = async (req, res, next) => {
    try{
        var data = {
            location_id: req.params.id
        };

        var result =  await locationService.deletelocation(data);
        
        if(result === Constants.STATUS_CODE_SUCCESS){
            model.response.status = Constants.STATUS_CODE_SUCCESS;
            model.response.message = "Successfully deleted the location";
            model.response.data = {};
        } else if(result == Constants.STATUS_CODE_DELETE_DENY) {
            model.response.status = Constants.STATUS_CODE_ERROR;
            model.response.message = "Location can't be deleted because it is used on other data as reference";
            model.response.data = {};
        } else {
            model.response.status = Constants.STATUS_CODE_ERROR;
            model.response.message = "location doesn't exist. Please reload the page. If it persists, please call the IT department";
            model.response.data = {};
        } 
    } catch (err) {
        model.response.status = 2;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET all list of location
module.exports.getAllListOfLocation = async (req, res, next) => {
    try{

        var result = await locationService.getAllListOfLocation();
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get all list of location";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET all list of location with monthly batches (RAW)
module.exports.getAllRawListOfLocationWithMonthlyBatchBySchedId = async (req, res, next) => {
    try{
        var data = {
            sched_id: Number(req.query.sched_id)
        };

        var result = await locationService.getAllRawListOfLocationWithMonthlyBatchBySchedId(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get all list of location with monthly batches by sched id";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET all list of location with monthly batches
module.exports.getAllListOfLocationWithMonthlyBatchBySchedId = async (req, res, next) => {
    try{
        var data = {
            sched_id: Number(req.query.sched_id)
        };

        var result = await locationService.getAllListOfLocationWithMonthlyBatchBySchedId(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get all list of location with monthly batches by sched id";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

