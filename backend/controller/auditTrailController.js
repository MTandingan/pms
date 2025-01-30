const model = require('../model/response');
const Constants = require('../helper/constants');
const auditTrailService = require('../service/auditTrailService');

//CREATE audit trail
module.exports.createAuditTrail = async (req, res, next) => {
    try{
        var data = {
            audit_wsqId: req.body.audit_wsqId,
            audit_message: req.body.audit_message,
            audit_updatedAt: req.body.audit_updatedAt,
            audit_updatedBy: req.body.audit_updatedBy,
            audit_updatedByUsername: req.body.audit_updatedByUsername,
            audit_remarks: req.body.audit_remarks
        };

        await auditTrailService.createAuditTrail(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully created an audit trail";
        model.response.data = {};
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//CREATE audit trail in a structured way
module.exports.createAuditTrailStructured = async (req, res, next) => {
    try{
        var user = req.session.user;
        var userName = `${user.fname} ${user.mname} ${user.lname}`;
        var currentDateAndTime = moment(new Date().toISOString()).format('YYYY-MM-DD HH:mm:ss');
        var data = {
            audit_wsqId: req.body.audit_wsqId,
            audit_message: userName + req.body.audit_message,
            audit_updatedAt: currentDateAndTime,
            audit_updatedBy: user.id,
            audit_updatedByUsername: userName,
            audit_remarks: req.body.audit_remarks
        };

        await auditTrailService.createAuditTrail(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully created an audit trail with structured requested data";
        model.response.data = {};
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET list of audit trail
module.exports.getWorkstationQuarterlyAuditTrail = async (req, res, next) => {
    try{
        var data = {
            audit_wsqId: req.query.audit_wsqId
        };

        var result = await auditTrailService.getWorkstationQuarterlyAuditTrail(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get the audit trail of the quarterly workstation";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};