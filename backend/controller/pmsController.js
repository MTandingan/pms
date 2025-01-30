const model = require('../model/response');
const Constants = require('../helper/constants');
const pmsService = require('../service/pmsService');

//CREATE pms schedule
module.exports.createPmsSchedule = async (req, res, next) => {
    try{
        var data = {
            schedYear: req.body.schedYear,
            listAllAddedDepartments: req.body.listAllAddedDepartments
        };
        
        var sched_id = await pmsService.createPmsSchedule(data);

        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully created a pms schedule";
        model.response.data = {
            sched_id: sched_id
        };
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//UPDATE adding a department on an existing PMS schedule
module.exports.addDepartmentBySchedId = async (req, res, next) => {
    try{
        var data = {
            sched_id: req.body.sched_id,
            pdept_locationId: req.body.pdept_locationId,
            pdept_batch: req.body.pdept_batch
        };
        
        await pmsService.addDepartmentBySchedId(data);

        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully added the department on the pms schedule";
        model.response.data = {};
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
}

//GET list of scheduled year of Pms
module.exports.getListOfSchedule = async (req, res, next) => {
    try{
        var result = await pmsService.getListOfSchedule();
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get all the list of schedule years of Pms";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET scheduled year of Pms by year
module.exports.getPmsScheduleByYear = async (req, res, next) => {
    try{
        var data = {
            sched_year: Number(req.query.sched_year)
        };

        var result = await pmsService.getPmsScheduleByYear(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get the schedule year of Pms by year";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET scheduled year of Pms by id
module.exports.getPmsScheduleById = async (req, res, next) => {
    try{
        var data = {
            sched_id: Number(req.query.sched_id)
        };

        var result = await pmsService.getPmsScheduleById(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get the schedule year of Pms by id";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//UPDATE the cloning of the workstations data from the previous year's 4th quarter based on schedule Id 
module.exports.updateCloningOfPrevYearDeptsBySchedId = async (req, res, next) => {
    try{
        var data = {
            sched_id: req.body.sched_id
        };

        const result = await pmsService.updateCloningOfPrevYearDeptsBySchedId(data);

        if(result === Constants.HAS_UPDATED_DATA){
            model.response.status = Constants.STATUS_CODE_SUCCESS;
            model.response.message = "Successfully updated the cloning of previous workstation data to a schedule Id";
            model.response.data = {};
        } else {
            model.response.status = Constants.STATUS_CODE_ERROR;
            model.response.message = "There is no cloning to do. Please reload the page. If it persists, please call the IT department";
            model.response.data = {};
        }
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};



