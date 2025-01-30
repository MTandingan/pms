const Constants = require('../helper/constants');
const quarterService = require("./quarterService");
const hardwareRepository = require("../dao/hardwareRepository");

module.exports.createHardware = async (body) => {
    return await hardwareRepository.createHardware(body);
}

module.exports.createHardwareReference = async (body) => {
    return await hardwareRepository.createHardwareReference(body);
}

module.exports.createQuarterlyWorkstationHardware = async (body) => {
    return await hardwareRepository.createQuarterlyWorkstationHardware(body);
}

module.exports.createMultipleNewRefQuarterlyWsHardware = async (body) => {
    //Get the list of new hardware data that aren't included from the Wsq by filtering from the hardware masterlist
    var newUnsavedHardwareList = await this.getNotIncludedQuarterlyWsHardwareFromMasterlist(body);

    //Add those data for the Wsq
    var qtyWsqHardwareData = {
        hardwareList: newUnsavedHardwareList,
        wsq_id: body.wsq_id
    };
    
    await quarterService.createQtyHardwarePlaceholdersCustomList(qtyWsqHardwareData);
}

module.exports.addAllMissingHardwareComponentsOfWsq = async(body) => {
    var qtyhard_wsqId = body.wsq_id;
    var hardwareList = await this.getListOfMissingActiveHardwareByWsqId(body);

    for(var item of hardwareList){
        let hardwareObj = {
            qtyhard_wsqId: qtyhard_wsqId,
            qtyhard_hwId: item.hw_id,
            qtyhard_status: null,
            qtyhard_brandId: null,
            qtyhard_remarks: null
        }

        await this.createQuarterlyWorkstationHardware(hardwareObj);
    }
}

module.exports.updateHardware = async (body) => {
    const result = await hardwareRepository.updateHardware(body);

    return (result.affectedRows == Constants.HAS_UPDATED_DATA) ? Constants.HAS_UPDATED_DATA : Constants.STATUS_CODE_ERROR;
}

module.exports.updateQuarterlyWorkstationHardwareById = async (body) => {
    return await hardwareRepository.updateQuarterlyWorkstationHardwareById(body);
}

module.exports.updateQuarterlyWorkstationHardwareStatusAndBrandByWsqId = async (body) => {
    return await hardwareRepository.updateQuarterlyWorkstationHardwareStatusAndBrandByWsqId(body);
}

module.exports.getListOfHardware = async () => {
    return await hardwareRepository.getListOfHardware();
}

module.exports.getListOfHardwareByStatusAndOthers = async (body) => {
    return await hardwareRepository.getListOfHardwareByStatusAndOthers(body);
}

module.exports.getListOfHardwareWoOthers = async (body) => {
    return await hardwareRepository.getListOfHardwareWoOthers(body);
}

module.exports.getListOfHardwareWoOthersAndWsqId = async (body) => {
    return await hardwareRepository.getListOfHardwareWoOthersAndWsqId(body);
}

module.exports.getListOfWsHardwareDetailsByWsqId = async (body) => {
    return await hardwareRepository.getListOfWsHardwareDetailsByWsqId(body);
}

module.exports.getWsHardwareDetailsByWsqId = async (body) => {
    return await hardwareRepository.getWsHardwareDetailsByWsqId(body);
}

module.exports.getListOfMissingActiveHardwareByWsqId = async (body) => {
    return await hardwareRepository.getListOfMissingActiveHardwareByWsqId(body);
}

module.exports.getListOfMissingActiveHardwareWithOthersByWsqId = async (body) => {
    return await hardwareRepository.getListOfMissingActiveHardwareWithOthersByWsqId(body);
}

module.exports.getListOfHardwareOnlyByOthersAndWsqId = async (body) => {
    return await hardwareRepository.getListOfHardwareOnlyByOthersAndWsqId(body);
}

module.exports.getListOfHardwareWithRange = async (body) => {
    return await hardwareRepository.getListOfHardwareWithRange(body);
}

module.exports.getListOfWsHardwareByWsqId = async (body) => {
    return await hardwareRepository.getListOfWsHardwareByWsqId(body);
}

module.exports.getListOfHardwareReferenceByWsqId = async (body) => {
    return await hardwareRepository.getListOfHardwareReferenceByWsqId(body);
}

module.exports.getInventoryHardwareReportBySchedIdAndMonthRanges = async (body) => {
    return await hardwareRepository.getInventoryHardwareReportBySchedIdAndMonthRanges(body);
}

module.exports.getInventoryHardwareReportBySchedIdMonthRangesAndItemIds = async (body) => {
    return await hardwareRepository.getInventoryHardwareReportBySchedIdMonthRangesAndItemIds(body);
}

module.exports.getInventoryHardwareReportBySchedIdMonthRangesWsqStatusAndItemIds = async (body) => {
    return await hardwareRepository.getInventoryHardwareReportBySchedIdMonthRangesWsqStatusAndItemIds(body);
}

module.exports.getInventoryHardwareReportBySchedIdMonthRangesWsqStatusAndItemIdsV2 = async (body) => {
    return await hardwareRepository.getInventoryHardwareReportBySchedIdMonthRangesWsqStatusAndItemIdsV2(body);
}

module.exports.getNotIncludedQuarterlyWsHardwareFromMasterlist = async (body) => {
    var hardwareData = {
        hw_isActive: true,
        hw_isOthers: false
    };

    var hardwareList = await this.getListOfHardwareByStatusAndOthers(hardwareData);

    var qtyHardwareData = {
        hw_isOthers: false,
        qtyhard_wsqId: body.wsq_id
    };

    var qtyWsHardwareList = await this.getListOfHardwareOnlyByOthersAndWsqId(qtyHardwareData);
    
    var result =  hardwareList.filter(item => !qtyWsHardwareList.some(hw_item => hw_item.hw_id == item.hw_id));

    return result;
}

module.exports.addHardwareReferenceByWsqId = async (body) => {
    var wsq_id = body.wsq_id;
    var params1 = {
        hw_isOthers: true,
        qtyhard_wsqId: wsq_id
    };
    var listOfQuarterlyOtherHardware = await this.getListOfHardwareWoOthersAndWsqId(params1);
    var listOfHardwareReference = await this.getListOfHardwareReferenceByWsqId(body);

    for(var item of listOfQuarterlyOtherHardware){
        let data = listOfHardwareReference.find(hardwareRef => item.qtyhard_hwId == hardwareRef.refhw_hwId);
            
        if(data == undefined){
            let reference = {
                refhw_hwId: item.qtyhard_hwId,
                refhw_wsqId: wsq_id
            };

            await this.createHardwareReference(reference);
        }
    }
}

module.exports.cloneHardwareReferenceWithWsq = async (body) => {
    var wsq_id = body.old_wsq_id;
    var new_wsq_id = body.new_wsq_id;
    var listOfHardwareReferencePrevWsq = await this.getListOfHardwareReferenceByWsqId({wsq_id: wsq_id});
    var listOfHardwareReferenceNewWsq = await this.getListOfHardwareReferenceByWsqId({wsq_id: new_wsq_id});

    for(var item of listOfHardwareReferencePrevWsq){
        let data = listOfHardwareReferenceNewWsq.find(hardwareRef => item.refhw_hwId == hardwareRef.refhw_hwId);
        
        if(data == undefined){
            let reference = {
                refhw_hwId: item.refhw_hwId,
                refhw_wsqId: new_wsq_id
            };

            await this.createHardwareReference(reference);
        }
    }
}

module.exports.cleanHardwareReferenceByWsqId = async (body) => {
    var wsq_id = body.wsq_id;
    var params1 = {
        hw_isOthers: true,
        qtyhard_wsqId: wsq_id
    };
    var listOfQuarterlyOtherHardware = await this.getListOfHardwareWoOthersAndWsqId(params1);
    var listOfHardwareReference = await this.getListOfHardwareReferenceByWsqId(body);

    for(var item of listOfHardwareReference){
        let data = listOfQuarterlyOtherHardware.find(hardwareRef => item.refhw_hwId == hardwareRef.qtyhard_hwId);
            
        if(data == undefined){
            let reference = {
                refhw_id: item.refhw_id
            };

            await this.deleteHardwareReferenceById(reference);
        }
    }
}

module.exports.deleteWorkstationOtherHardware = async (body) => {
    //Delete first all of its quarterly workstation data
    await this.deleteQtyWorkstationHardwareByHwId(body);

    //Delete the hardware
    var result = await this.deleteHardware(body);

    return result;
}

module.exports.deleteAndCheckWorkstationOtherHardware = async (body) => {
    var result = await this.deleteQtyWorkstationHardwareByHwIdAndWsqId(body);

    await this.deleteHardware({hw_id: body.hw_id});

    return result;
}

module.exports.deleteAndCheckWorkstationOtherHardwareWithRef = async (body) => {
    var result = await this.deleteQtyWorkstationHardwareByHwIdAndWsqId(body);
    await this.deleteHardwareReferenceByHwIdAndWsqId(body);
    await this.deleteHardware({hw_id: body.hw_id});

    return result;
}

module.exports.deleteQtyWorkstationHardwareByHwId = async (body) => {
    const result = await hardwareRepository.deleteQtyWorkstationHardwareByHwId(body);

    return (result.affectedRows == Constants.HAS_NO_DATA_DELETED) ? Constants.STATUS_CODE_ERROR : Constants.STATUS_CODE_SUCCESS;
}

module.exports.deleteQtyWorkstationHardwareByWsqId = async (body) => {
    const result = await hardwareRepository.deleteQtyWorkstationHardwareByWsqId(body);

    return (result.affectedRows == Constants.HAS_NO_DATA_DELETED) ? Constants.STATUS_CODE_ERROR : Constants.STATUS_CODE_SUCCESS;
}

module.exports.deleteQtyWorkstationHardwareByHwIdAndWsqId = async (body) => {
    const result = await hardwareRepository.deleteQtyWorkstationHardwareByHwIdAndWsqId(body);

    return (result.affectedRows == Constants.HAS_NO_DATA_DELETED) ? Constants.STATUS_CODE_ERROR : Constants.STATUS_CODE_SUCCESS;
}

module.exports.deleteHardware = async (body) => {
    var params1 = {
        qtyhard_hwId: body.hw_id,
        refhw_hwId: body.hw_id
    };

    //Cannot delete if data exists on other db tables
    const resultIfExists = await this.checkHardwareExistsOnOtherTables(params1);

    if(resultIfExists[0].isExistsInQtyHw || resultIfExists[0].isExistsInHwRef){
        return Constants.STATUS_CODE_SUBMIT_DENY;   
    }

    const result = await hardwareRepository.deleteHardware(body);

    return (result.affectedRows == Constants.HAS_NO_DATA_DELETED) ? Constants.STATUS_CODE_ERROR : Constants.STATUS_CODE_SUCCESS;
}

module.exports.deleteQtyWsHardwareById = async (body) => {
    const result = await hardwareRepository.deleteQtyWsHardwareById(body);

    return (result.affectedRows == Constants.HAS_NO_DATA_DELETED) ? Constants.STATUS_CODE_ERROR : Constants.STATUS_CODE_SUCCESS;
}

module.exports.deleteHardwareReferenceByHwIdAndWsqId = async (body) => {
    const result = await hardwareRepository.deleteHardwareReferenceByHwIdAndWsqId(body);

    return (result.affectedRows == Constants.HAS_NO_DATA_DELETED) ? Constants.STATUS_CODE_ERROR : Constants.STATUS_CODE_SUCCESS;
}

module.exports.deleteHardwareReferenceById = async (body) => {
    const result = await hardwareRepository.deleteHardwareReferenceById(body);

    return (result.affectedRows == Constants.HAS_NO_DATA_DELETED) ? Constants.STATUS_CODE_ERROR : Constants.STATUS_CODE_SUCCESS;
}

module.exports.checkHardwareExistsOnOtherTables = async(body) => {
    return await hardwareRepository.checkHardwareExistsOnOtherTables(body);
}

module.exports.deleteMultipleHardware = async (body) => {
    var listOfHardware = body.listOfHardware;

    for(var item in listOfHardware){
        await hardwareRepository.deleteHardware({hw_id: listOfHardware[item].hw_id});
    }

    return Constants.STATUS_CODE_SUCCESS;
}




