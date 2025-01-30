const Constants = require('../helper/constants');
const quarterService = require("./quarterService");
const softwareRepository = require("../dao/softwareRepository");

module.exports.createQuarterlyWorkstationSoftware = async (body) => {
    return await softwareRepository.createQuarterlyWorkstationSoftware(body);
}

module.exports.createSoftwareReference = async (body) => {
    return await softwareRepository.createSoftwareReference(body);
}

module.exports.createSoftware = async (body) => {
    return await softwareRepository.createSoftware(body);
}

module.exports.createMultipleNewRefQuarterlyWsSoftware = async (body) => {
    //Get the list of new software data that aren't included from the Wsq by filtering from the software masterlist
    var newUnsavedSoftwareList = await this.getNotIncludedQuarterlyWsSoftwareFromMasterlist(body);

    //Add those data for the Wsq
    var qtyWsqSoftwareData = {
        softwareList: newUnsavedSoftwareList,
        wsq_id: body.wsq_id
    };
    
    await quarterService.createQtySoftwarePlaceholdersCustomList(qtyWsqSoftwareData);
}

module.exports.addAllMissingSoftwareComponentsOfWsq = async(body) => {
    var qtysoft_wsqId = body.wsq_id;
    var softwareList = await this.getListOfMissingActiveSoftwareByWsqId(body);

    for(var item of softwareList){
        let softwareObj = {
            qtysoft_wsqId: qtysoft_wsqId,
            qtysoft_hwId: item.sw_id,
            qtysoft_status: null,
            qtysoft_brandId: null,
            qtysoft_remarks: null
        }

        await this.createQuarterlyWorkstationSoftware(softwareObj);
    }
}

module.exports.updateSoftware = async (body) => {
    const result = await softwareRepository.updateSoftware(body);

    return (result.affectedRows == Constants.HAS_UPDATED_DATA) ? Constants.HAS_UPDATED_DATA : Constants.STATUS_CODE_ERROR;
}

module.exports.updateQuarterlyWorkstationSoftwareById = async (body) => {
    return await softwareRepository.updateQuarterlyWorkstationSoftwareById(body);
}

module.exports.updateQuarterlyWorkstationSoftwareStatusAndBrandByWsqId = async (body) => {
    return await softwareRepository.updateQuarterlyWorkstationSoftwareStatusAndBrandByWsqId(body);
}

module.exports.getListOfSoftware = async () => {
    return await softwareRepository.getListOfSoftware();
}

module.exports.getListOfSoftwareWoOthers = async (body) => {
    return await softwareRepository.getListOfSoftwareWoOthers(body);
}

module.exports.getListOfSoftwareByStatusAndOthers = async (body) => {
    return await softwareRepository.getListOfSoftwareByStatusAndOthers(body);
}

module.exports.getListOfSoftwareWoOthersAndWsqId = async (body) => {
    return await softwareRepository.getListOfSoftwareWoOthersAndWsqId(body);
}

module.exports.getListOfWsSoftwareDetailsByWsqId = async (body) => {
    return await softwareRepository.getListOfWsSoftwareDetailsByWsqId(body);
}

module.exports.getWsSoftwareDetailsByWsqId = async (body) => {
    return await softwareRepository.getWsSoftwareDetailsByWsqId(body);
}

module.exports.getListOfMissingActiveSoftwareByWsqId = async (body) => {
    return await softwareRepository.getListOfMissingActiveSoftwareByWsqId(body);
}

module.exports.getListOfMissingActiveSoftwareWithOthersByWsqId = async (body) => {
    return await softwareRepository.getListOfMissingActiveSoftwareWithOthersByWsqId(body);
}

module.exports.getListOfSoftwareOnlyByOthersAndWsqId = async (body) => {
    return await softwareRepository.getListOfSoftwareOnlyByOthersAndWsqId(body);
}

module.exports.getListOfSoftwareWithRange = async (body) => {
    return await softwareRepository.getListOfSoftwareWithRange(body);
}

module.exports.getListOfSoftwareReferenceByWsqId = async (body) => {
    return await softwareRepository.getListOfSoftwareReferenceByWsqId(body);
}

module.exports.getInventorySoftwareReportBySchedIdAndMonthRanges = async (body) => {
    return await softwareRepository.getInventorySoftwareReportBySchedIdAndMonthRanges(body);
}

module.exports.getInventorySoftwareReportBySchedIdMonthRangesAndItemIds = async (body) => {
    return await softwareRepository.getInventorySoftwareReportBySchedIdMonthRangesAndItemIds(body);
}

module.exports.getInventorySoftwareReportBySchedIdMonthRangesWsqStatusAndItemIds = async (body) => {
    return await softwareRepository.getInventorySoftwareReportBySchedIdMonthRangesWsqStatusAndItemIds(body);
}

module.exports.getInventorySoftwareReportBySchedIdMonthRangesWsqStatusAndItemIdsV2 = async (body) => {
    return await softwareRepository.getInventorySoftwareReportBySchedIdMonthRangesWsqStatusAndItemIdsV2(body);
}

module.exports.getNotIncludedQuarterlyWsSoftwareFromMasterlist = async (body) => {
    var softwareData = {
        sw_isActive: true,
        sw_isOthers: false
    };

    var softwareList = await this.getListOfSoftwareByStatusAndOthers(softwareData);

    var qtySoftwareData = {
        sw_isOthers: false,
        qtysoft_wsqId: body.wsq_id
    };

    var qtyWsSoftwareList = await this.getListOfSoftwareOnlyByOthersAndWsqId(qtySoftwareData);
    
    var result =  softwareList.filter(item => !qtyWsSoftwareList.some(sw_item => sw_item.sw_id == item.sw_id));

    return result;
}

module.exports.addSoftwareReferenceByWsqId = async (body) => {
    var wsq_id = body.wsq_id;
    var params1 = {
        sw_isOthers: true,
        qtysoft_wsqId: wsq_id
    };
    var listOfQuarterlyOtherSoftware = await this.getListOfSoftwareWoOthersAndWsqId(params1);
    var listOfSoftwareReference = await this.getListOfSoftwareReferenceByWsqId(body);

    for(var item of listOfQuarterlyOtherSoftware){
        let data = listOfSoftwareReference.find(softwareRef => item.qtysoft_swId == softwareRef.refsw_swId);
            
        if(data == undefined){
            let reference = {
                refsw_swId: item.qtysoft_swId,
                refsw_wsqId: wsq_id
            };

            await this.createSoftwareReference(reference);
        }
    }
}

module.exports.cloneSoftwareReferenceWithWsq = async (body) => {
    var wsq_id = body.old_wsq_id;
    var new_wsq_id = body.new_wsq_id;
    var listOfSoftwareReferencePrevWsq = await this.getListOfSoftwareReferenceByWsqId({wsq_id: wsq_id});
    var listOfSoftwareReferenceNewWsq = await this.getListOfSoftwareReferenceByWsqId({wsq_id: new_wsq_id});

    for(var item of listOfSoftwareReferencePrevWsq){
        let data = listOfSoftwareReferenceNewWsq.find(softwareRef => item.refsw_swId == softwareRef.refsw_swId);
        
        if(data == undefined){
            let reference = {
                refsw_swId: item.refsw_swId,
                refsw_wsqId: new_wsq_id
            };

            await this.createSoftwareReference(reference);
        }
    }
}

module.exports.cleanSoftwareReferenceByWsqId = async (body) => {
    var wsq_id = body.wsq_id;
    var params1 = {
        sw_isOthers: true,
        qtysoft_wsqId: wsq_id
    };
    var listOfQuarterlyOtherSoftware = await this.getListOfSoftwareWoOthersAndWsqId(params1);
    var listOfSoftwareReference = await this.getListOfSoftwareReferenceByWsqId(body);

    for(var item of listOfSoftwareReference){
        let data = listOfQuarterlyOtherSoftware.find(softwareRef => item.refsw_swId == softwareRef.qtysoft_swId);
            
        if(data == undefined){
            let reference = {
                refsw_id: item.refsw_id
            };

            await this.deleteSoftwareReferenceById(reference);
        }
    }
}

module.exports.deleteWorkstationOtherSoftware = async (body) => {
    await this.deleteQtyWorkstationSoftwareBySwId(body);

    var result = await this.deleteSoftware(body);

    return result;
}

module.exports.deleteAndCheckWorkstationOtherSoftware = async (body) => {
    var result = await this.deleteQtyWorkstationSoftwareBySwIdAndWsqId(body);

    await this.deleteSoftware({sw_id: body.sw_id});

    return result;
}

module.exports.deleteAndCheckWorkstationOtherSoftwareWithRef = async (body) => {
    var result = await this.deleteQtyWorkstationSoftwareBySwIdAndWsqId(body);
    await this.deleteSoftwareReferenceBySwIdAndWsqId(body);
    await this.deleteSoftware({sw_id: body.sw_id});

    return result;
}

module.exports.deleteQtyWorkstationSoftwareBySwId = async (body) => {
    const result = await softwareRepository.deleteQtyWorkstationSoftwareBySwId(body);

    return (result.affectedRows == Constants.HAS_NO_DATA_DELETED) ? Constants.STATUS_CODE_ERROR : Constants.STATUS_CODE_SUCCESS;
}

module.exports.deleteQtyWorkstationSoftwareByWsqId = async (body) => {
    const result = await softwareRepository.deleteQtyWorkstationSoftwareByWsqId(body);

    return (result.affectedRows == Constants.HAS_NO_DATA_DELETED) ? Constants.STATUS_CODE_ERROR : Constants.STATUS_CODE_SUCCESS;
}

module.exports.deleteQtyWorkstationSoftwareBySwIdAndWsqId = async (body) => {
    const result = await softwareRepository.deleteQtyWorkstationSoftwareBySwIdAndWsqId(body);

    return (result.affectedRows == Constants.HAS_NO_DATA_DELETED) ? Constants.STATUS_CODE_ERROR : Constants.STATUS_CODE_SUCCESS;
}

module.exports.deleteSoftware = async (body) => {
    var params1 = {
        qtysoft_swId: body.sw_id,
        refsw_swId: body.sw_id
    };

    //Cannot delete if data exists on other db tables
    const resultIfExists = await this.checkSoftwareExistsOnOtherTables(params1);

    if(resultIfExists[0].isExistsInQtySw || resultIfExists[0].isExistsInSwRef){
        return Constants.STATUS_CODE_SUBMIT_DENY;   
    }

    const result = await softwareRepository.deleteSoftware(body);

    return (result.affectedRows == Constants.HAS_NO_DATA_DELETED) ? Constants.STATUS_CODE_ERROR : Constants.STATUS_CODE_SUCCESS;
}

module.exports.deleteQtyWsSoftwareById = async (body) => {
    const result = await softwareRepository.deleteQtyWsSoftwareById(body);

    return (result.affectedRows == Constants.HAS_NO_DATA_DELETED) ? Constants.STATUS_CODE_ERROR : Constants.STATUS_CODE_SUCCESS;
}

module.exports.deleteSoftwareReferenceBySwIdAndWsqId = async (body) => {
    const result = await softwareRepository.deleteSoftwareReferenceBySwIdAndWsqId(body);

    return (result.affectedRows == Constants.HAS_NO_DATA_DELETED) ? Constants.STATUS_CODE_ERROR : Constants.STATUS_CODE_SUCCESS;
}

module.exports.deleteSoftwareReferenceById = async (body) => {
    const result = await softwareRepository.deleteSoftwareReferenceById(body);

    return (result.affectedRows == Constants.HAS_NO_DATA_DELETED) ? Constants.STATUS_CODE_ERROR : Constants.STATUS_CODE_SUCCESS;
}

module.exports.checkSoftwareExistsOnOtherTables = async(body) => {
    return await softwareRepository.checkSoftwareExistsOnOtherTables(body);
}

module.exports.deleteMultipleSoftware = async (body) => {
    var listOfSoftware = body.listOfSoftware;

    for(var item in listOfSoftware){
        await softwareRepository.deleteSoftware({sw_id: listOfSoftware[item].sw_id});
    }

    return Constants.STATUS_CODE_SUCCESS;
}




