const model = require('../model/response');
const Constants = require('../helper/constants');
const facaService = require('../service/facaService');

//GET list of faca
module.exports.getListOfFacaByWsqId = async (req, res, next) => {
    try{
        var data = {
            faca_wsqId: req.query.faca_wsqId
        };

        var result = await facaService.getListOfFacaByWsqId(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get list of faca by wsq id";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//DELETE faca data
module.exports.deleteFaca = async (req, res, next) => {
    try{
        var data = {
            faca_id: req.params.id
        };

        var result =  await facaService.deleteFaca(data);

        if(result === Constants.STATUS_CODE_SUCCESS){
            model.response.status = Constants.STATUS_CODE_SUCCESS;
            model.response.message = "Successfully deleted the faca from the database";
            model.response.data = {};
        } else {
            model.response.status = Constants.STATUS_CODE_ERROR;
            model.response.message = "Faca doesn't exist. Please reload the page. If it persists, please call the IT department";
            model.response.data = {};
        } 
    } catch (err) {
        model.response.status = 2;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};