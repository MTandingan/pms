const model = require('../model/response');
const Constants = require('../helper/constants');
const brandService = require('../service/brandService');
const { logger } = require('../helper/logger');

//CREATE brand data
module.exports.createBrand = async (req, res, next) => {
    try{
        var data = {
            brand_name: req.body.brand_name,
            brand_description: req.body.brand_description,
            brand_isActive: req.body.brand_isActive,
            brand_serial: req.body.brand_serial
        };

        await brandService.createBrand(data);

        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully created a brand data";
        model.response.data = {};
    } catch (err) {
        logger.error('Unhandled Exception in createBrand', {
            data: {
                brand_name: req.body.brand_name,
                brand_description: req.body.brand_description,
                brand_isActive: req.body.brand_isActive,
                brand_serial: req.body.brand_serial
            },
            errorMessage: err.message,
            stackTrace: err.stack
        });

        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//UPDATE brand data
module.exports.updateBrand = async (req, res, next) => {
    try{
        var data = {
            brand_name: req.body.brand_name,
            brand_description: req.body.brand_description,
            brand_isActive: req.body.brand_isActive,
            brand_serial: req.body.brand_serial,
            brand_id: req.body.brand_id
        };

        const result = await brandService.updateBrand(data);

        if(result === Constants.HAS_UPDATED_DATA){
            model.response.status = Constants.STATUS_CODE_SUCCESS;
            model.response.message = "Successfully updated the brand data";
            model.response.data = {};
        } else {
            model.response.status = Constants.STATUS_CODE_ERROR;
            model.response.message = "There is no brand to update. Please reload the page. If it persists, please call the IT department";
            model.response.data = {};
        }
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET list of hardware
module.exports.getListOfBrand = async (req, res, next) => {
    try{
        var result = await brandService.getListOfBrand();
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get all the list of brand";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//GET list of hardware with active status
module.exports.getListOfBrandByStatus = async (req, res, next) => {
    try{
        var data = {
            brand_isActive: req.query.brand_isActive
        };

        var result = await brandService.getListOfBrandByStatus(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get all the list of brand by status";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};


//GET list of brand limit range
module.exports.getListOfBrandWithRange = async (req, res, next) => {
    try{
        var data = {
            pFrom: Number(req.query.from),
            pTo: Number(req.query.to),
            brand_name: (req.query.brand_name == null) ? '' :  req.query.brand_name,
            brand_description: (req.query.brand_description == null) ? '' : req.query.brand_description,
            brand_isActive: (req.query.brand_isActive === null) ? '' : req.query.brand_isActive,
            brand_serial: (req.query.brand_serial == null) ? '' : req.query.brand_serial
        };

        var result = await brandService.getListOfBrandWithRange(data);
     
        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get the list of brand with limit range";
        model.response.data = result;
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//DELETE brand data
module.exports.deleteBrand = async (req, res, next) => {
    try{
        var data = {
            brand_id: req.params.id
        };

        var result =  await brandService.deleteBrand(data);

        if(result === Constants.STATUS_CODE_SUCCESS){
            model.response.status = Constants.STATUS_CODE_SUCCESS;
            model.response.message = "Successfully deleted the brand";
            model.response.data = {};
        } else {
            model.response.status = Constants.STATUS_CODE_ERROR;
            model.response.message = "Brand doesn't exist. Please reload the page. If it persists, please call the IT department";
            model.response.data = {};
        } 
    } catch (err) {
        model.response.status = 2;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};
