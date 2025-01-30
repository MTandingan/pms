const model = require('../model/response');
const Constants = require('../helper/constants');
const computerAuditTrailService = require('../service/computerAuditTrailService');

//GET computer audit trail by comp id
module.exports.getComputerAuditTrailByCompId = async (req, res, next) => {
    try{
        var data = {
            compAudit_compId: req.query.compAudit_compId
        };

        var result = await computerAuditTrailService.getComputerAuditTrailByCompId(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get the computer audit trail by comp id";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};