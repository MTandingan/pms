const model = require('../model/response');
const Constants = require('../helper/constants');
const checklistItemService = require('../service/checklistItemService');
const quarterService = require('../service/quarterService');

//CREATE checklist item data
module.exports.createChecklistItem = async (req, res, next) => {
    try{
        var data = {
            chk_title: req.body.chk_title,
            chk_description: req.body.chk_description,
            chk_isActive: req.body.chk_isActive
        };

        await checklistItemService.createChecklistItem(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully created a checklist item data";
        model.response.data = {};
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//CREATE custom list of checklist items that aren't included in the checklist of a quarterly workstation with return checklist items data
module.exports.addQtyChecklistItemsPlaceholdersCustomListIndex = async (req, res, next) => {
    try{
        var data = {
            wsq_id: req.body.wsq_id,
            checklistItems: req.body.checklistItems
        };

        var result = await quarterService.addQtyChecklistItemsPlaceholdersCustomListIndex(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully created all the added checklist items in a quarterly workstation by wsq id";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//UPDATE checklist item data
module.exports.updateChecklistItem = async (req, res, next) => {
    try{
        var data = {
            chk_title: req.body.chk_title,
            chk_description: req.body.chk_description,
            chk_isActive: req.body.chk_isActive,
            chk_id: req.body.chk_id
        };

        const result = await checklistItemService.updateChecklistItem(data);

        if(result === Constants.HAS_UPDATED_DATA){
            model.response.status = Constants.STATUS_CODE_SUCCESS;
            model.response.message = "Successfully updated the checklist item data";
            model.response.data = {};
        } else {
            model.response.status = Constants.STATUS_CODE_ERROR;
            model.response.message = "There is no checklist item to update. Please reload the page. If it persists, please call the IT department";
            model.response.data = {};
        }
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//DELETE checklist item data
module.exports.deleteChecklistItem = async (req, res, next) => {
    try{
        var data = {
            chk_id: req.params.id
        };

        var result =  await checklistItemService.deleteChecklistItem(data);

        if(result === Constants.STATUS_CODE_SUCCESS){
            model.response.status = Constants.STATUS_CODE_SUCCESS;
            model.response.message = "Successfully deleted the checklist item";
            model.response.data = {};
        } else if(result === Constants.STATUS_CODE_DELETE_DENY){
            model.response.status = Constants.STATUS_CODE_DELETE_DENY;
            model.response.message = "Checklist Item can't be deleted as it is used on other data";
            model.response.data = {};
        } else {
            model.response.status = Constants.STATUS_CODE_ERROR;
            model.response.message = "Checklist Item doesn't exist. Please reload the page. If it persists, please call the IT department";
            model.response.data = {};
        } 
    } catch (err) {
        model.response.status = 2;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//DELETE all checklist item data regardless of any quarterly workstation by id
module.exports.deleteQtyWsChecklistItemById = async (req, res, next) => {
    try{
        var data = {
            qtychk_id: req.params.id
        };

        var result =  await checklistItemService.deleteQtyWsChecklistItemById(data);

        if(result === Constants.STATUS_CODE_SUCCESS){
            model.response.status = Constants.STATUS_CODE_SUCCESS;
            model.response.message = "Successfully deleted all the checklist item of a quarterly workstation";
            model.response.data = {};
        } else {
            model.response.status = Constants.STATUS_CODE_ERROR;
            model.response.message = "Checklist Item doesn't exist. Please reload the page. If it persists, please call the IT department";
            model.response.data = {};
        } 
    } catch (err) {
        model.response.status = 2;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//DELETE checklist item data of a quarterly workstation by  wsq id and id
module.exports.deleteQtyWsChecklistItemByWsqIdAndId = async (req, res, next) => {
    try{
        var data = {
            qtychk_wsqId: req.params.wsq_id,
            qtychk_id: req.params.id
        };

        var result =  await checklistItemService.deleteQtyWsChecklistItemByWsqIdAndId(data);

        if(result === Constants.STATUS_CODE_SUCCESS){
            model.response.status = Constants.STATUS_CODE_SUCCESS;
            model.response.message = "Successfully deleted the checklist item of a quarterly workstation";
            model.response.data = {};
        } else {
            model.response.status = Constants.STATUS_CODE_ERROR;
            model.response.message = "Checklist Item doesn't exist. Please reload the page. If it persists, please call the IT department";
            model.response.data = {};
        } 
    } catch (err) {
        model.response.status = 2;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET list of checklist item limit range
module.exports.getListOfChecklistItemWithRange = async (req, res, next) => {
    try{
        var data = {
            pFrom: Number(req.query.from),
            pTo: Number(req.query.to),
            chk_title: (req.query.chk_title == null) ? '' :  req.query.chk_title,
            chk_description: (req.query.chk_description == null) ? '' : req.query.chk_description,
            chk_isActive: (req.query.chk_isActive === null) ? '' : req.query.chk_isActive
        };

        var result = await checklistItemService.getListOfChecklistItemWithRange(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get the list of checklist item with limit range";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET list of checklist items by wsq id
module.exports.getWorkstationQuarterlyChecklistItemsByWsqId = async (req, res, next) => {
    try{
        var data = {
            qtychk_wsqId: Number(req.query.qtychk_wsqId)
        };

        var result = await checklistItemService.getWorkstationQuarterlyChecklistItemsByWsqId(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get the list of checklist item by wsq id";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET list of missing checklist items of a quarterly workstation
module.exports.getListOfMissingActiveChecklistItemsByWsqId = async (req, res, next) => {
    try{
        var data = {
            qtychk_wsqId: req.query.qtychk_wsqId,
            qtychk_wsqId1: req.query.qtychk_wsqId,
            chk_isActive: req.query.chk_isActive,
            qtychk_wsqId2: req.query.qtychk_wsqId,
            chk_isActive1: req.query.chk_isActive
        };

        var result = await checklistItemService.getListOfMissingActiveChecklistItemsByWsqId(data);

        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get all the missing checklist items of a quarterly workstation by wsq id";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};
