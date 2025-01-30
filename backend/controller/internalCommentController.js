const model = require('../model/response');
const Constants = require('../helper/constants');
const moment = require('moment');
const internalCommentService = require('../service/internalCommentService');

//CREATE comment of a wsq data
module.exports.addComment = async (req, res, next) => {
    try{
        var user = req.session.user;
        var userName = `${user.fname} ${user.mname} ${user.lname}`;
        var currentDateAndTime = moment(new Date().toISOString()).format('YYYY-MM-DD HH:mm:ss');
        var data = {
            ic_wsqId: req.body.ic_wsqId,
            ic_description: req.body.ic_description,
            ic_createdAt: currentDateAndTime,
            ic_createdBy: user.id,
            ic_createdByUsername: userName,
            ic_updatedAt: currentDateAndTime,
            ic_updatedBy: user.id,
            ic_updatedByUsername: userName,
            ic_hasDeleted: req.body.ic_hasDeleted
        };

        await internalCommentService.addComment(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully added the comment";
        model.response.data = {};
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//UPDATE comment data
module.exports.updateComment = async (req, res, next) => {
    try{
        var user = req.session.user;
        var userName = `${user.fname} ${user.mname} ${user.lname}`;
        var currentDateAndTime = moment(new Date().toISOString()).format('YYYY-MM-DD HH:mm:ss');
        var data = {
            ic_description: req.body.ic_description,
            ic_updatedAt: currentDateAndTime,
            ic_updatedBy: user.id,
            ic_updatedByUsername: userName,
            ic_id: req.body.ic_id
        };

        const result = await internalCommentService.updateComment(data);

        if(result === Constants.HAS_UPDATED_DATA){
            model.response.status = Constants.STATUS_CODE_SUCCESS;
            model.response.message = "Successfully updated the comment";
            model.response.data = {};
        } else {
            model.response.status = Constants.STATUS_CODE_ERROR;
            model.response.message = "There is no comment to update. Please reload the page. If it persists, please call the IT department";
            model.response.data = {};
        }
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//DELETE comment data
module.exports.deleteComment = async (req, res, next) => {
    try{
        var data = {
            ic_id: req.params.id
        };

        var result =  await internalCommentService.deleteComment(data);

        if(result === Constants.STATUS_CODE_SUCCESS){
            model.response.status = Constants.STATUS_CODE_SUCCESS;
            model.response.message = "Successfully deleted the comment";
            model.response.data = {};
        } else {
            model.response.status = Constants.STATUS_CODE_ERROR;
            model.response.message = "Comment doesn't exist. Please reload the page. If it persists, please call the IT department";
            model.response.data = {};
        } 
    } catch (err) {
        model.response.status = 2;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET list of comments by wsq id
module.exports.getListOfCommentsByWsqId = async (req, res, next) => {
    try{
        var data = {
            ic_wsqId: req.query.ic_wsqId
        };

        var result = await internalCommentService.getListOfCommentsByWsqId(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get the list of comments by wsq id";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET list of comments and wsq data by comp id
module.exports.getListOfCommentsAndWsqByCompId = async (req, res, next) => {
    try{
        var data = {
            ws_compId: req.query.ws_compId
        };

        var result = await internalCommentService.getListOfCommentsAndWsqByCompId(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get the list of comments and wsq data by comp id";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};
