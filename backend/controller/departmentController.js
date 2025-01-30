const model = require('../model/response');
const Constants = require('../helper/constants');
const departmentService = require('../service/departmentService');

//GET list of departments by sched id and department id
module.exports.getDepartmentBySchedId = async (req, res, next) => {
    try{
        var data = {
            pdept_schedId: Number(req.query.pdept_schedId),
            pdept_locationId: Number(req.query.pdept_locationId)
        };

        var result = await departmentService.getDepartmentBySchedId(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully list department by sched id and department id";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET list of departments and its quarter data details by year and batch
module.exports.getDepartmentAndQuarterDetailsByYearAndBatch = async (req, res, next) => {
    try{
        var data = {
            pdept_batch: Number(req.query.pdept_batch),
            sched_year: Number(req.query.sched_year)
        };

        var result = await departmentService.getDepartmentAndQuarterDetailsByYearAndBatch(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully list department and its quarter data details by year and batch";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET list of departments and its quarter data details by sched id and batch
module.exports.getDepartmentAndQuarterDetailsBySchedIdAndBatch = async (req, res, next) => {
    try{
        var data = {
            pdept_batch: Number(req.query.pdept_batch),
            sched_id: Number(req.query.sched_id)
        };

        var result = await departmentService.getDepartmentAndQuarterDetailsBySchedIdAndBatch(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully list department and its quarter data details by sched id and batch";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET list of departments and its quarter data details by sched id and location ids
module.exports.getDepartmentAndQuarterDetailsBySchedIdAndLocations = async (req, res, next) => {
    try{
        var data = {
            locations: req.query.locations,
            sched_id: Number(req.query.sched_id)
        };

        var result = await departmentService.getDepartmentAndQuarterDetailsBySchedIdAndLocations(data);
     
        if(result.length !== 0){
            model.response.status = Constants.STATUS_CODE_SUCCESS;
            model.response.message = "Successfully list department and its quarter data details by sched id and locations";
            model.response.data = result;
        } else {
            model.response.status = Constants.STATUS_CODE_ERROR;
            model.response.message = "There is something wrong in fetching the data. If the problem persists, please call the IT department";
            model.response.data = {};
        }
        
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET list of departments and its quarter data details by sched id and location ids
module.exports.getDepartmentAndQuarterDetailsBySchedIdAndDepartmentId = async (req, res, next) => {
    try{
        var data = {
            location_deptId: Number(req.query.department_id),
            sched_id: Number(req.query.sched_id)
        };

        var result = await departmentService.getDepartmentAndQuarterDetailsBySchedIdAndDepartmentId(data);

        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully list department and its quarter data details by sched id and department id";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

