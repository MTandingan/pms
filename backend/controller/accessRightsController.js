const model = require('../model/response');
const Constants = require('../helper/constants');
const accessRightsService = require('../service/accessRightsService');

//GET list of access rights
module.exports.getAccessRights = async (req, res, next) => {
    try{
        var data = {
            acc_id: req.query.acc_id
        };

        var result = await accessRightsService.getAccessRights(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get the access rights";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};