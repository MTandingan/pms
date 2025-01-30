var express = require('express');
var router = express.Router();
var userController = require('../controller/userController');
var computerController = require('../controller/computerController');
var hardwareController = require('../controller/hardwareController');
var softwareController = require('../controller/softwareController');
var quarterController = require('../controller/quarterController');
var pmsController = require('../controller/pmsController');
var workStationController = require('../controller/workStationController');
var brandController = require('../controller/brandController');
var locationController = require('../controller/locationController');
var departmentController = require('../controller/departmentController');
var facaController = require('../controller/facaController');
var accessRightsController = require('../controller/accessRightsController');
var auditController = require('../controller/auditTrailController');
var computerAuditTrailController = require('../controller/computerAuditTrailController');
var workstationRightsController = require('../controller/workstationRightsController');
var internalCommentController = require('../controller/internalCommentController');
var checklistItemController = require('../controller/checklistItemController');
var auth = require('../helper/auth');

/* User */
router.get("/login", userController.login);
router.get("/logout", userController.logout);
router.post("/createSession", userController.createSession);
/* End of User */

/* Development Purposes */
router.get("/getLoginTest", userController.getLoginTest);
router.get("/getAllDepartmentsTest", userController.getAllDepartmentsTest);
router.get("/getAllEmployeesTest", userController.getAllEmployeesTest);
/* End of Development Purposes */

/* Department */
router.get("/getDepartmentBySchedId", departmentController.getDepartmentBySchedId);
router.get("/getDepartmentAndQuarterDetailsByYearAndBatch", departmentController.getDepartmentAndQuarterDetailsByYearAndBatch);
router.get("/getDepartmentAndQuarterDetailsBySchedIdAndBatch", departmentController.getDepartmentAndQuarterDetailsBySchedIdAndBatch);
router.get("/getDepartmentAndQuarterDetailsBySchedIdAndLocations", departmentController.getDepartmentAndQuarterDetailsBySchedIdAndLocations);
router.get("/getDepartmentAndQuarterDetailsBySchedIdAndDepartmentId", departmentController.getDepartmentAndQuarterDetailsBySchedIdAndDepartmentId);
/* End of Department */

/* Computer */
router.post("/createComputer", auth.authenticateCanManageComputer, computerController.createComputer);
router.put("/updateComputer", auth.authenticateCanManageComputer, computerController.updateComputer);
router.delete("/deleteComputer/:id", auth.authenticateCanManageComputer, computerController.deleteComputer);
router.get("/getListOfComputer", computerController.getListOfComputer);
router.get("/getListOfComputerNotStatus", computerController.getListOfComputerNotStatus);
router.get("/getListOfComputerByStatus", computerController.getListOfComputerByStatus);
router.get("/getListOfComputerWithRange", computerController.getListOfComputerWithRange);
router.get("/getWsqDetailsByParams", computerController.getWsqDetailsByParams);
/* End of Computer */

/* Brand */
router.post("/createBrand", auth.authenticateCanManageBrand, brandController.createBrand);
router.put("/updateBrand", auth.authenticateCanManageBrand, brandController.updateBrand);
router.delete("/deleteBrand/:id", auth.authenticateCanManageBrand, brandController.deleteBrand);
router.get("/getListOfBrandWithRange", brandController.getListOfBrandWithRange);
router.get("/getListOfBrand", brandController.getListOfBrand);
router.get("/getListOfBrandByStatus", brandController.getListOfBrandByStatus);
/* End of Brand */

/* Hardware */
router.post("/createHardware", auth.authenticateCanManageHardware, hardwareController.createHardware);
router.post("/createMultipleNewRefQuarterlyWsHardware", auth.authenticateCanManageHardware, hardwareController.createMultipleNewRefQuarterlyWsHardware);
router.post("/createQtyHardwarePlaceholdersCustomListIndex", auth.authenticateCanManageHardware, hardwareController.createQtyHardwarePlaceholdersCustomListIndex);
router.post("/addQtyHardwarePlaceholdersCustomListIndex", auth.authenticateCanManageHardware, hardwareController.addQtyHardwarePlaceholdersCustomListIndex);
router.put("/updateHardware", auth.authenticateCanManageHardware, hardwareController.updateHardware);
router.delete("/deleteHardware/:id", auth.authenticateCanManageHardware, hardwareController.deleteHardware);
router.delete("/deleteQtyWsHardwareById/:id", auth.authenticateCanManageHardware, hardwareController.deleteQtyWsHardwareById);
router.delete("/deleteWorkstationOtherHardware/:id", hardwareController.deleteWorkstationOtherHardware);
router.delete("/deleteAndCheckWorkstationOtherHardware/:hw_id/:wsq_id", hardwareController.deleteAndCheckWorkstationOtherHardware);
router.delete("/deleteAndCheckWorkstationOtherHardwareWithRef/:hw_id/:wsq_id", hardwareController.deleteAndCheckWorkstationOtherHardwareWithRef);
router.get("/getListOfHardwareWithRange", hardwareController.getListOfHardwareWithRange);
router.get("/getListOfWsHardwareDetailsByWsqId", hardwareController.getListOfWsHardwareDetailsByWsqId);
router.get("/getListOfHardware", hardwareController.getListOfHardware);
router.get("/getListOfMissingActiveHardwareByWsqId", hardwareController.getListOfMissingActiveHardwareByWsqId);
router.get("/getListOfMissingActiveHardwareWithOthersByWsqId", hardwareController.getListOfMissingActiveHardwareWithOthersByWsqId);
router.get("/getInventoryHardwareReportBySchedIdAndMonthRanges", hardwareController.getInventoryHardwareReportBySchedIdAndMonthRanges);
router.get("/getInventoryHardwareReportBySchedIdMonthRangesAndItemIds", hardwareController.getInventoryHardwareReportBySchedIdMonthRangesAndItemIds);
router.get("/getInventoryHardwareReportBySchedIdMonthRangesWsqStatusAndItemIds", hardwareController.getInventoryHardwareReportBySchedIdMonthRangesWsqStatusAndItemIds);
router.get("/getInventoryHardwareReportBySchedIdMonthRangesWsqStatusAndItemIdsV2", hardwareController.getInventoryHardwareReportBySchedIdMonthRangesWsqStatusAndItemIdsV2);
/* End of Hardware */

/* Software */
router.post("/createSoftware", auth.authenticateCanManageSoftware, softwareController.createSoftware);
router.post("/createMultipleNewRefQuarterlyWsSoftware", auth.authenticateCanManageSoftware, softwareController.createMultipleNewRefQuarterlyWsSoftware);
router.post("/addQtySoftwarePlaceholdersCustomListIndex", auth.authenticateCanManageSoftware, softwareController.addQtySoftwarePlaceholdersCustomListIndex);
router.put("/updateSoftware", auth.authenticateCanManageSoftware, softwareController.updateSoftware);
router.delete("/deleteSoftware/:id", auth.authenticateCanManageSoftware, softwareController.deleteSoftware);
router.delete("/deleteQtyWsSoftwareById/:id", auth.authenticateCanManageSoftware, softwareController.deleteQtyWsSoftwareById);
router.delete("/deleteWorkstationOtherSoftware/:id", softwareController.deleteWorkstationOtherSoftware);
router.delete("/deleteAndCheckWorkstationOtherSoftware/:sw_id/:wsq_id", softwareController.deleteAndCheckWorkstationOtherSoftware);
router.delete("/deleteAndCheckWorkstationOtherSoftwareWithRef/:sw_id/:wsq_id", softwareController.deleteAndCheckWorkstationOtherSoftwareWithRef);
router.get("/getListOfSoftwareWithRange", softwareController.getListOfSoftwareWithRange);
router.get("/getListOfWsSoftwareDetailsByWsqId", softwareController.getListOfWsSoftwareDetailsByWsqId);
router.get("/getListOfSoftware", softwareController.getListOfSoftware);
router.get("/getListOfMissingActiveSoftwareByWsqId", softwareController.getListOfMissingActiveSoftwareByWsqId);
router.get("/getListOfMissingActiveSoftwareWithOthersByWsqId", softwareController.getListOfMissingActiveSoftwareWithOthersByWsqId);
router.get("/getInventorySoftwareReportBySchedIdAndMonthRanges", softwareController.getInventorySoftwareReportBySchedIdAndMonthRanges);
router.get("/getInventorySoftwareReportBySchedIdMonthRangesAndItemIds", softwareController.getInventorySoftwareReportBySchedIdMonthRangesAndItemIds);
router.get("/getInventorySoftwareReportBySchedIdMonthRangesWsqStatusAndItemIds", softwareController.getInventorySoftwareReportBySchedIdMonthRangesWsqStatusAndItemIds);
router.get("/getInventorySoftwareReportBySchedIdMonthRangesWsqStatusAndItemIdsV2", softwareController.getInventorySoftwareReportBySchedIdMonthRangesWsqStatusAndItemIdsV2);
/* End of Software */

/* PMS */
router.post("/createPmsSchedule", auth.authenticateCanManagePmsSchedule, pmsController.createPmsSchedule);
router.put("/updateCloningOfPrevYearDeptsBySchedId", auth.authenticateCanManagePmsSchedule, pmsController.updateCloningOfPrevYearDeptsBySchedId);
router.put("/addDepartmentBySchedId", auth.authenticateCanManagePmsSchedule, pmsController.addDepartmentBySchedId);
router.get("/getListOfSchedule", pmsController.getListOfSchedule);
router.get("/getPmsScheduleByYear", pmsController.getPmsScheduleByYear);
router.get("/getPmsScheduleById", pmsController.getPmsScheduleById);
/* End of PMS */

/* Quarter */
router.post("/createQuarterlyWorkstation", auth.authenticateCanManageQuarterlyWorkstation, quarterController.createQuarterlyWorkstation);
router.post("/createQuarterlyWorkstationRecordCompAuditTrail", auth.authenticateCanManageQuarterlyWorkstation, quarterController.createQuarterlyWorkstationRecordCompAuditTrail);
router.post("/createQuarterlyWorkstationRecordCompAuditTrailWithWsId", auth.authenticateCanManageQuarterlyWorkstation, quarterController.createQuarterlyWorkstationRecordCompAuditTrailWithWsId);
router.post("/addQuarterlyWorkstationLastPrevRecord", quarterController.addQuarterlyWorkstationLastPrevRecord)
router.post("/addMultipleQuarterlyWorkStation", auth.authenticateCanManageQuarterlyWorkstation, quarterController.addMultipleQuarterlyWorkStation);
router.put("/updateQuarterlyWorkstation", auth.authenticateCanManageQuarterlyWorkstation, quarterController.updateQuarterlyWorkstation);
router.put("/updateQuarterlyWorkstationStatusById", auth.authenticateCanManageQuarterlyWorkstation, quarterController.updateQuarterlyWorkstationStatusById);
router.put("/updateQuarterlyWorkstationStatusAndResolutionById", auth.authenticateCanManageQuarterlyWorkstation, quarterController.updateQuarterlyWorkstationStatusAndResolutionById);
router.put("/updateConductedByWsqId", quarterController.updateConductedByWsqId);
router.put("/updateWsqHasConducted", quarterController.updateWsqHasConducted);
router.put("/approveQuarterlyWorkstation", auth.authenticateCanManageApprovalQuarterlyWorkstation, quarterController.approveQuarterlyWorkstation);
router.put("/disapproveQuarterlyWorkstation", auth.authenticateCanManageApprovalQuarterlyWorkstation, quarterController.disapproveQuarterlyWorkstation);
router.put("/revertQuarterlyWorkstation", auth.authenticateCanRevertQuarterlyWorkstation, quarterController.revertQuarterlyWorkstation);
router.delete("/deleteWorkstationQuarterly/:id", auth.authenticateCanManageQuarterlyWorkstation, quarterController.deleteWorkstationQuarterly);
router.delete("/deleteWorkstationQuarterlyCheckPrevRec/:id", auth.authenticateCanManageQuarterlyWorkstation, quarterController.deleteWorkstationQuarterlyCheckPrevRec);
router.delete("/deleteLocationOfPmsSchedule/:sched_id/:location_id", auth.authenticateCanManageQuarterlyWorkstation, quarterController.deleteLocationOfPmsSchedule);
router.get("/getListOfQuarterlyByYearAndMonth", quarterController.getListOfQuarterlyByYearAndMonth);
router.get("/getDepartmentAndQuarterlyDetailsById", quarterController.getDepartmentAndQuarterlyDetailsById);
router.get("/getDepartmentWorkstationQuarterlyDetailsByWsqId", quarterController.getDepartmentWorkstationQuarterlyDetailsByWsqId);
router.get("/getQuarterlyWorkstationOnly", quarterController.getQuarterlyWorkstationOnly);
router.get("/getQuarterlyWorkstationAndWsOnly", quarterController.getQuarterlyWorkstationAndWsOnly);
router.get("/getListOfQuarterlyWorkstationById", quarterController.getListOfQuarterlyWorkstationById);
router.get("/getQuarterByPmsDeptIdAndMonthlyQuarter", quarterController.getQuarterByPmsDeptIdAndMonthlyQuarter);
router.get("/getListOfQuarterlyWorkstationBySchedIdAndMonthlyQuarters", quarterController.getListOfQuarterlyWorkstationBySchedIdAndMonthlyQuarters);
router.get("/checkWorkstationIsCompleteBySchedId", quarterController.checkWorkstationIsCompleteBySchedId);
router.get("/checkIfWsqHasConducted", quarterController.checkIfWsqHasConducted);
router.get("/getListOfWorkstationsByQtrStatusAndSchedId", quarterController.getListOfWorkstationsByQtrStatusAndSchedId);
router.get("/getListOfWorkstationsByQtrNotStatusAndSchedId", quarterController.getListOfWorkstationsByQtrNotStatusAndSchedId);
router.get("/getListOfQuarterlyWorkstationByCompIdAndNotStatus", quarterController.getListOfQuarterlyWorkstationByCompIdAndNotStatus);
router.get("/getQuarterlyWorkstationByDeptDetailsAndMonth", quarterController.getQuarterlyWorkstationByDeptDetailsAndMonth);
router.get("/getQuarterlyWorkstationDetailsByWsqIds", quarterController.getQuarterlyWorkstationDetailsByWsqIds);
/* End of Quarter */

/* Workstation */
router.get("/getListOfWorkstations", workStationController.getListOfWorkstations);
router.get("/getListOfWorkstationsByStatus", workStationController.getListOfWorkstationsByStatus);
router.get("/getListOfUserWorkstationWithRange", workStationController.getListOfUserWorkstationWithRange);
router.get("/getListOfUserOthersWorkstationWithRange", workStationController.getListOfUserOthersWorkstationWithRange);
router.get("/getListOfUserWorkstationDeviceWithRange", workStationController.getListOfUserWorkstationDeviceWithRange);
/* End of Workstation */

/* Location */
router.post("/createLocation", auth.authenticateCanManageBrand, locationController.createLocation);
router.put("/updateLocation", auth.authenticateCanManageBrand, locationController.updateLocation);
router.delete("/deleteLocation/:id", auth.authenticateCanManageBrand, locationController.deleteLocation);
router.get("/getAllListOfLocation", locationController.getAllListOfLocation);
router.get("/getAllListOfLocationWithMonthlyBatchBySchedId", locationController.getAllListOfLocationWithMonthlyBatchBySchedId);
router.get("/getlistOfLocationWithRange", locationController.getlistOfLocationWithRange);
/* End of Location */

/* Computer Audit Trail */
router.get("/getComputerAuditTrailByCompId", computerAuditTrailController.getComputerAuditTrailByCompId);
/* End of Computer Audit Trail */

/* Faca */
router.get("/getListOfFacaByWsqId", facaController.getListOfFacaByWsqId);
router.delete("/deleteFaca/:id", auth.authenticateCanManageFaca, facaController.deleteFaca);
/* End of Faca */

/* Access Rights */
router.get("/getAccessRights", accessRightsController.getAccessRights);
/* End of Access Rights */

/* Workstation Quarterly Audit Trail */
router.get("/getWorkstationQuarterlyAuditTrail", auditController.getWorkstationQuarterlyAuditTrail);
router.post("/createAuditTrail", auditController.createAuditTrail);
router.post("/createAuditTrailStructured", auditController.createAuditTrailStructured);
/* End of Workstation Quarterly Audit Trail */

/* Internal Comment */
router.post("/addComment", internalCommentController.addComment);
router.put("/updateComment", internalCommentController.updateComment);
router.delete("/deleteComment/:id", internalCommentController.deleteComment);
router.get("/getListOfCommentsByWsqId", internalCommentController.getListOfCommentsByWsqId);
router.get("/getListOfCommentsAndWsqByCompId", internalCommentController.getListOfCommentsAndWsqByCompId);
/* End of Internal Comment */

/* Checklist Item */
router.post("/createChecklistItem", checklistItemController.createChecklistItem);
router.post("/addQtyChecklistItemsPlaceholdersCustomListIndex", checklistItemController.addQtyChecklistItemsPlaceholdersCustomListIndex);
router.put("/updateChecklistItem", checklistItemController.updateChecklistItem);
router.delete("/deleteChecklistItem/:id", checklistItemController.deleteChecklistItem);
router.delete("/deleteQtyWsChecklistItemById/:id", checklistItemController.deleteQtyWsChecklistItemById);
router.delete("/deleteQtyWsChecklistItemByWsqIdAndId/:id/:wsq_id", checklistItemController.deleteQtyWsChecklistItemByWsqIdAndId);
router.get("/getListOfChecklistItemWithRange", checklistItemController.getListOfChecklistItemWithRange);
router.get("/getWorkstationQuarterlyChecklistItemsByWsqId", checklistItemController.getWorkstationQuarterlyChecklistItemsByWsqId);
router.get("/getListOfMissingActiveChecklistItemsByWsqId", checklistItemController.getListOfMissingActiveChecklistItemsByWsqId);
/* End of Checklist Item */

/* User Workstation Rights */
router.post("/createWorkstationRights", workstationRightsController.createWorkstationRights);
router.post("/createMultipleUserWorkstationRights", workstationRightsController.createMultipleUserWorkstationRights);
router.delete("/deleteUserWorkstationRightsById/:id", workstationRightsController.deleteUserWorkstationRightsById);
router.get("/getListOfUserWorkstationRights", workstationRightsController.getListOfUserWorkstationRights);
router.get("/getListOfUserWorkstationRightsByWsqId", workstationRightsController.getListOfUserWorkstationRightsByWsqId);
router.get("/getListOfUserWorkstationRightsByWsqIdAndUserId", workstationRightsController.getListOfUserWorkstationRightsByWsqIdAndUserId);
router.get("/getUserWorkstationRightsByWsqIdAndUserIdWithAccess", workstationRightsController.getUserWorkstationRightsByWsqIdAndUserIdWithAccess);
/* End of User Workstation Rights */

module.exports = router;