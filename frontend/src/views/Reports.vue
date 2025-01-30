<script setup>
    import { ref, reactive, watch, onMounted, render } from 'vue';
    import { useDate } from 'vuetify'
    import { useRouter } from 'vue-router';
    import moment from 'moment/moment';
    import { useUserStore } from '@/stores/user';
    import { useUtilStore } from '@/stores/util';
    import { storeToRefs } from 'pinia';
    import Constants from "@/globals";
    import * as Util from '../helpers/helper';
    import { decryptData } from '../helpers/encryptUtil';
    import axios from 'axios';
    import ExcelJS from 'exceljs';
    import ImgVsmmcLogo from '@/assets/img/vsmmc_logo.png'
    import ReportMonthlyBatchComputersGraph from '../components/ReportMonthlyBatchComputersGraph.vue'
    import ReportMonthlyLocationComputerGraph from '../components/ReportMonthlyLocationComputerGraph.vue'
    import ReportDepartmentComputerGraph from '../components/ReportDepartmentComputerGraph.vue'
    import ReportInventoryGraph from '../components/ReportInventoryGraph.vue'
    import ReportInventoryBrandGraph from '../components/ReportInventoryBrandGraph.vue';
   
    //Variables
    const router = useRouter();
    const userStore = useUserStore();
    const utilStore = useUtilStore();
    const { user } = storeToRefs(userStore);
    const _date = useDate();

    //Local Constants
    const REPORT_TYPE_COMP_BY_BATCH = 1;
    const REPORT_TYPE_COMP_BY_LOCATION = 2;
    const REPORT_TYPE_COMP_BY_DEPARTMENT = 3;
    const REPORT_TYPE_INVENTORY = 4;
    const listMappedHardwareBrandOtherDetails = new Map();
    const listMappedSoftwareBrandOtherDetails = new Map();
    const introRowStyle = {
        font: { name: 'Calibri', size: 11 },
        alignment: { vertical: 'center', horizontal: 'center' },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } }
    };

    const tableHeaderStyle = {
        font: { name: 'Calibri', size: 9, bold: true },
        border: { 
            bottom: {style:'thin', color: {argb:'00000000'}},
            right: {style:'thin', color: {argb:'00000000'}}
        },
        alignment: { vertical: 'center', horizontal: 'center' },
    };

    const colDataWithBold = {
        font: { name: 'Calibri', size: 9, bold: true },
        border: { 
            bottom: {style:'thin', color: {argb:'00000000'}},
            right: {style:'thin', color: {argb:'00000000'}},
            top: {style:'thin', color: {argb:'00000000'}},
            left: {style:'thin', color: {argb:'00000000'}}
        },
        alignment: { vertical: 'center', horizontal: 'center' }
    }

    const fillWhite = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb:'FFFFFF' }
    };

    const colData = {
        font: { name: 'Calibri', size: 9 },
        border: { 
            bottom: {style:'thin', color: {argb:'00000000'}},
            right: {style:'thin', color: {argb:'00000000'}},
            top: {style:'thin', color: {argb:'00000000'}},
            left: {style:'thin', color: {argb:'00000000'}}
        }
    }

    const colDataCenter = {
        ...colData,
        alignment: { vertical: 'center', horizontal: 'center' }
    }    
    
    //Model Values
    const workstationDetailsBrandHeader = reactive({
        type: "",
        component: "",
        brand_name: ""
    })
    const errorReportTypeValidationParams = reactive({
        isError: false,
        errorMessage: ""
    });
    const errorYearValidationParams = reactive({
        isError: false,
        errorMessage: ""
    });
    const errorLocationValidationParams = reactive({
        isError: false,
        errorMessage: ""
    });
    const errorMonthlyBatchValidationParams = reactive({
        isError: false,
        errorMessage: ""
    });
    const errorDepartmentValidationParams = reactive({
        isError: false,
        errorMessage: ""
    });
    const errorDateInventoryValidationParams = reactive({
        isError: false,
        errorMessage: ""
    });
    const errorFromDateValidationParams = reactive({
        isError: false,
        errorMessage: ""
    });
    const errorToDateValidationParams = reactive({
        isError: false,
        errorMessage: ""
    });
    const errorMonthsInterchangeValidationParams = reactive({
        isError: false,
        errorMessage: ""
    });

    const listOfDepartment = ref([]);
    const listOfReportType = ref([
                                    {
                                        reportType_id: REPORT_TYPE_COMP_BY_BATCH,
                                        reportType: "Total of Completed Computers by Batch"
                                    },
                                    {
                                        reportType_id: REPORT_TYPE_COMP_BY_LOCATION,
                                        reportType: "Total of Completed Computers by Location"
                                    },
                                    {
                                        reportType_id: REPORT_TYPE_COMP_BY_DEPARTMENT,
                                        reportType: "Total of Completed Computers by Department"
                                    },
                                    {
                                        reportType_id: REPORT_TYPE_INVENTORY,
                                        reportType: "Total Inventory"
                                    }                             
                                ]);
    const listOfYear = ref([]);
    const listLocations = ref([]);
    const listComponents = ref([]);
    const listBatchOtherDetails = ref({
        details: {},
        totals: {
            planned: 0,
            actual: 0,
            deferred: 0
        }
    });
    const listLocationOtherDetails = ref({
        details: {},
        totals: {
            planned: 0,
            actual: 0,
            deferred: 0
        }
    });
    const listDepartmentOtherDetails = ref({
        details: {},
        totals: {
            planned: 0,
            actual: 0,
            deferred: 0
        }
    });
    const listHardwareOtherDetails = ref({
        details: [],
        totals: {
            approvedItems: 0,
            disapprovedItems: 0,
            totalItems: 0
        }
    });
    const listSoftwareOtherDetails = ref({
        details: [],
        totals: {
            approvedItems: 0,
            disapprovedItems: 0,
            totalItems: 0
        }
    });
    const listHardwareBrandOtherDetails = ref({});
    const listSoftwareBrandOtherDetails = ref({});
    const listOfWorkstationDetails = ref({});
    const isButtonLoading = ref(false);
    const isShowBrandWorkstationsDialog = ref(false);
    const batch = ref(null);
    // const dateRange = ref([]);
    const fromMonth = ref(null);
    const toMonth = ref(null);
    const department_id = ref(null);
    const location = ref(null);
    const items = ref(null);
    const imageIconBase64 = ref("");
    const monthly_batch = ref(null);
    const new_result = ref(null);
    const reportType = ref(null);
    const renderComponent = ref(0);
    const year = ref(null);

    //Built-in Functions
    onMounted(async () => {
        if(decryptData(user.value, Constants.USER_SECRET_KEY) !== null){
            await fetchData();
            await getImageBase64("vsmmc_logo.png");
        } else {
            await userStore.logout();
        }

        utilStore.setPageLoading({pIsPageLoading: false});
    });
    
    //User-defined Functions
    const fetchData = async() => {
        await getListOfDepartments();
        await getListOfLocations();
        await getListOfComponents();
        await getListOfYear();
    }

    const getListOfDepartments = async () => {
        var { data } = await axios.get(`/getAllDepartmentsTest`);
        // let { data } = await axios.get(`/get_departments`,{
        //     baseURL: 'http://172.16.1.39:3010/api',
        //     withCredentials: false
        // });
        
        listOfDepartment.value = data;
    }; 

    const getListOfLocations = async () => {
        var result = await axios.get(`/getAllListOfLocation`);
        listLocations.value = result.data.data;
    }; 

    const getListOfComponents = async () => {
        var result_hardware = await axios.get(`/getListOfHardware`);
        var result_software = await axios.get(`/getListOfSoftware`);

        var new_result_software = result_software.data.data.map(item => {
            var description = Util.getPropertyByPosition(item, 1, false);
            var id = Util.getPropertyByPosition(item, 0, false);

            return {id: id, description: description, type: Constants.COMPONENT_TYPE_SOFTWARE};
        });

        var new_result_hardware = result_hardware.data.data.map(item => {
            var description = Util.getPropertyByPosition(item, 1, false);
            var id = Util.getPropertyByPosition(item, 0, false);

            return {id: id, description: description, type: Constants.COMPONENT_TYPE_HARDWARE};
        });

        listComponents.value = [...new_result_software, ...new_result_hardware];
    }; 

    const getListOfYear = async () => {
        let result = await axios.get(`/getListOfSchedule`);

        if(result.data.status == Constants.STATUS_CODE_SUCCESS){
            listOfYear.value = result.data.data;
        } else if(result.data.status == Constants.STATUS_CODE_INVALID_TOKEN){
            userStore.logout();
        }  else {
            logger.error("Error in Fetching list of PMS Year", logger.createErrorContext("fetch-report-year-list", result.data.message));
            utilStore.setSnackBar({
                showModal: true,
                modalDescription: result.data.message
            });
        }
    }

    const getDepartmentAndQuarterDetailsBySchedIdAndBatch = async(params) => {
        var data = {
            sched_id: params.sched_id,
            pdept_batch: params.pdept_batch
        };

        let result = await axios.get(`/getDepartmentAndQuarterDetailsBySchedIdAndBatch`, { params: data });

        if(result.data.status == Constants.STATUS_CODE_SUCCESS){
            return result.data.data;
        } else if(result.data.status == Constants.STATUS_CODE_INVALID_TOKEN){
            userStore.logout();
        } else {
            logger.error("Error in Fetching list of deparmtent and quarter details by sched id and batch", logger.createErrorContext("fetch-report-department-quarter-sb", result.data.message));
            utilStore.setSnackBar({
                showModal: true,
                modalDescription: result.data.message
            });

            return null;
        }
    }

    const getDepartmentAndQuarterDetailsBySchedIdAndLocations = async(params) => {
        var data = {
            sched_id: params.sched_id,
            locations: params.locations
        };

        let result = await axios.get(`/getDepartmentAndQuarterDetailsBySchedIdAndLocations`, { params: data });

        if(result.data.status == Constants.STATUS_CODE_SUCCESS){
            return result.data.data;
        } else if(result.data.status == Constants.STATUS_CODE_INVALID_TOKEN){
            userStore.logout();
        } else {
            logger.error("Error in Fetching department and quarterly details by sched id and locations", logger.createErrorContext("fetch-report-department-quarter-sl", result.data.message));
            utilStore.setSnackBar({
                showModal: true,
                modalDescription: result.data.message
            });

            return null;
        }
    }

    const getDepartmentAndQuarterDetailsBySchedIdAndDepartmentId = async(params) => {
        var data = {
            sched_id: params.sched_id,
            department_id: params.department_id
        };

        let result = await axios.get(`/getDepartmentAndQuarterDetailsBySchedIdAndDepartmentId`, { params: data });

        if(result.data.status == Constants.STATUS_CODE_SUCCESS){
            return result.data.data;
        } else if(result.data.status == Constants.STATUS_CODE_INVALID_TOKEN){
            userStore.logout();
        } else {
            logger.error("Error in Fetching department and quarterly details by sched id and department id", logger.createErrorContext("fetch-department-quarter-sd", result.data.message));
            utilStore.setSnackBar({
                showModal: true,
                modalDescription: result.data.message
            });

            return null;
        }
    }

    const getInventoryHardwareReportBySchedIdAndMonthRanges = async(params) => {
        var data = {
            sched_id: params.sched_id,
            fromMonth: params.fromMonth,
            toMonth: params.toMonth
        };

        let result = await axios.get(`/getInventoryHardwareReportBySchedIdAndMonthRanges`, { params: data });

        if(result.data.status == Constants.STATUS_CODE_SUCCESS){
            return result.data.data;
        } else if(result.data.status == Constants.STATUS_CODE_INVALID_TOKEN){
            userStore.logout();
        } else {
            logger.error("Error in Fetching inventory hardware report by sched id and month ranges", logger.createErrorContext("fetch-report-hardware-inventory-smr", result.data.message));
            utilStore.setSnackBar({
                showModal: true,
                modalDescription: result.data.message
            });

            return null;
        }
    }

    const getInventoryHardwareReportBySchedIdMonthRangesAndItemIds = async(params) => {
        var data = {
            sched_id: params.sched_id,
            hardware_items: params.hardware_items,
            fromMonth: params.fromMonth,
            toMonth: params.toMonth
        };

        let result = await axios.get(`/getInventoryHardwareReportBySchedIdMonthRangesAndItemIds`, { params: data });

        if(result.data.status == Constants.STATUS_CODE_SUCCESS){
            return result.data.data;
        } else if(result.data.status == Constants.STATUS_CODE_INVALID_TOKEN){
            userStore.logout();
        } else {
            logger.error("Error in Fetching inventory hardware by sched id, month ranges and item ids", logger.createErrorContext("fetch-report-hardware-inventory-smi", result.data.message));
            utilStore.setSnackBar({
                showModal: true,
                modalDescription: result.data.message
            });

            return null;
        }
    }

    const getInventoryHardwareReportBySchedIdMonthRangesWsqStatusAndItemIds = async(params) => {
        var data = {
            sched_id: params.sched_id,
            hardware_items: params.hardware_items,
            wsq_resolution: params.wsq_resolution,
            wsq_status: params.wsq_status,
            fromMonth: params.fromMonth,
            toMonth: params.toMonth
        };

        // let result = await axios.get(`/getInventoryHardwareReportBySchedIdMonthRangesWsqStatusAndItemIds`, { params: data });
        let result = await axios.get(`/getInventoryHardwareReportBySchedIdMonthRangesWsqStatusAndItemIdsV2`, { params: data });

        if(result.data.status == Constants.STATUS_CODE_SUCCESS){
            return result.data.data;
        } else if(result.data.status == Constants.STATUS_CODE_INVALID_TOKEN){
            userStore.logout();
        } else {
            logger.error("Error in Fetching hardware inventory report by sched id, month ranges, wsq status and item ids", logger.createErrorContext("fetch-report-hardware-inventory-smwi", result.data.message));
            utilStore.setSnackBar({
                showModal: true,
                modalDescription: result.data.message
            });

            return null;
        }
    }

    const getInventorySoftwareReportBySchedIdAndMonthRanges = async(params) => {
        var data = {
            sched_id: params.sched_id,
            fromMonth: params.fromMonth,
            toMonth: params.toMonth
        };

        let result = await axios.get(`/getInventorySoftwareReportBySchedIdAndMonthRanges`, { params: data });

        if(result.data.status == Constants.STATUS_CODE_SUCCESS){
            return result.data.data;
        } else if(result.data.status == Constants.STATUS_CODE_INVALID_TOKEN){
            userStore.logout();
        } else {
            logger.error("Error in Fetching inventory software by sched id and month ranges", logger.createErrorContext("fetch-report-software-inventory-smr", result.data.message));
            utilStore.setSnackBar({
                showModal: true,
                modalDescription: result.data.message
            });

            return null;
        }
    }

    const getInventorySoftwareReportBySchedIdMonthRangesAndItemIds = async(params) => {
        var data = {
            sched_id: params.sched_id,
            software_items: params.software_items,
            fromMonth: params.fromMonth,
            toMonth: params.toMonth
        };

        let result = await axios.get(`/getInventorySoftwareReportBySchedIdMonthRangesAndItemIds`, { params: data });

        if(result.data.status == Constants.STATUS_CODE_SUCCESS){
            return result.data.data;
        } else if(result.data.status == Constants.STATUS_CODE_INVALID_TOKEN){
            userStore.logout();
        } else {
            logger.error("Error in Fetching inventory software by sched id, month ranges and item ids", logger.createErrorContext("fetch-report-software-inventory-smri", result.data.message));
            utilStore.setSnackBar({
                showModal: true,
                modalDescription: result.data.message
            });

            return null;
        }
    }

    const getInventorySoftwareReportBySchedIdMonthRangesWsqStatusAndItemIds = async(params) => {
        var data = {
            sched_id: params.sched_id,
            software_items: params.software_items,
            wsq_resolution: params.wsq_resolution,
            wsq_status: params.wsq_status,
            fromMonth: params.fromMonth,
            toMonth: params.toMonth
        };

        // let result = await axios.get(`/getInventorySoftwareReportBySchedIdMonthRangesWsqStatusAndItemIds`, { params: data });
        let result = await axios.get(`/getInventorySoftwareReportBySchedIdMonthRangesWsqStatusAndItemIdsV2`, { params: data });

        if(result.data.status == Constants.STATUS_CODE_SUCCESS){
            return result.data.data;
        } else if(result.data.status == Constants.STATUS_CODE_INVALID_TOKEN){
            userStore.logout();
        } else {
            logger.error("Error in Fetching software report by sched id, month ranges, wsq status and item ids", logger.createErrorContext("fetch-report-software-inventory-smwi", result.data.message));
            utilStore.setSnackBar({
                showModal: true,
                modalDescription: result.data.message
            });

            return null;
        }
    }

    const getQuarterlyWorkstationDetailsByWsqIds = async(wsq_ids) => {
        var data = {
            listOfWorkstationIds: wsq_ids
        };

        let result = await axios.get(`/getQuarterlyWorkstationDetailsByWsqIds`, { params: data });

        if(result.data.status == Constants.STATUS_CODE_SUCCESS){
            return result.data.data;
        } else if(result.data.status == Constants.STATUS_CODE_INVALID_TOKEN){
            userStore.logout();
        } else {
            logger.error("Error in Fetching quarterly details", logger.createErrorContext("fetch-report-quarterly-workstation-details", result.data.message));
            utilStore.setSnackBar({
                showModal: true,
                modalDescription: result.data.message
            });

            return null;
        }
    }

    const generateReport = async() => {
        isButtonLoading.value = true;

        switch(reportType.value){
            case REPORT_TYPE_COMP_BY_BATCH: {
                let hasError = hasErrorInGeneratingCompBatchReport();

                if(!hasError){
                    utilStore.setPageLoading({pIsPageLoading: true});

                    let data = {
                        sched_id: year.value,
                        pdept_batch: batch.value
                    };

                    let result = await getDepartmentAndQuarterDetailsBySchedIdAndBatch(data);

                    if(result != null){
                        let new_raw_result = separateDataByQuarter(result);
                        
                        new_result.value = new_raw_result
                        monthly_batch.value = batch.value;
                        listBatchOtherDetails.value.details = createBatchOtherDetailsReport(new_result.value, monthly_batch.value);
                        listBatchOtherDetails.value.totals = computeTotalBatchOtherDetailsReport(listBatchOtherDetails.value.details);
                    }

                    renderComponent.value = REPORT_TYPE_COMP_BY_BATCH;
                } else {
                    utilStore.setPageLoading({pIsPageLoading: false});
                }               
            }break;
            case REPORT_TYPE_COMP_BY_LOCATION: {
                let hasError = hasErrorInGeneratingCompLocationReport();

                if(!hasError){
                    utilStore.setPageLoading({pIsPageLoading: true});

                    let data = {
                        sched_id: year.value,
                        locations: location.value
                    };

                    let result = await getDepartmentAndQuarterDetailsBySchedIdAndLocations(data);

                    if(result != null){
                        new_result.value = separateDataByQuarter(result);
                        listLocationOtherDetails.value.details = createLocationOtherDetailsReport(new_result.value);
                        listLocationOtherDetails.value.totals = computeTotalLocationOtherDetailsReport(listLocationOtherDetails.value.details);                        
                    }

                    renderComponent.value = REPORT_TYPE_COMP_BY_LOCATION;
                } else {
                    utilStore.setPageLoading({pIsPageLoading: false});
                }  
            }break;
            case REPORT_TYPE_COMP_BY_DEPARTMENT: {
                let hasError = hasErrorInGeneratingCompDepartmentReport();

                if(!hasError){
                    utilStore.setPageLoading({pIsPageLoading: true});

                    let data = {
                        sched_id: year.value,
                        department_id: department_id.value
                    };

                    let result = await getDepartmentAndQuarterDetailsBySchedIdAndDepartmentId(data);

                    if(result != null){
                        new_result.value = separateDataByQuarter(result);
                        listDepartmentOtherDetails.value.details = createDepartmentOtherDetailsReport(new_result.value);
                        listDepartmentOtherDetails.value.totals = computeTotalDepartmentOtherDetailsReport(listDepartmentOtherDetails.value.details);
                    }

                    renderComponent.value = REPORT_TYPE_COMP_BY_DEPARTMENT;
                } else {
                    utilStore.setPageLoading({pIsPageLoading: false});
                }                  
            }break;
            case REPORT_TYPE_INVENTORY: {
                let hasError = hasErrorInGeneratingCompInventoryReport();

                if(!hasError){
                    utilStore.setPageLoading({pIsPageLoading: true});

                    var hardware_items = filterListByComponentType(items.value, Constants.COMPONENT_TYPE_HARDWARE).map(item => item.id);
                    var software_items = filterListByComponentType(items.value, Constants.COMPONENT_TYPE_SOFTWARE).map(item => item.id);

                    // let data = {
                    //     sched_id: year.value,
                    //     fromMonth: fromMonth.value,
                    //     toMonth: toMonth.value
                    // };

                    let data_hardware = {
                        sched_id: year.value,
                        hardware_items: hardware_items,
                        wsq_resolution: Constants.WSQ_RESOLUTION_COMPLETE,
                        wsq_status: Constants.WSQ_STATUS_COMPLETE,
                        fromMonth: fromMonth.value,
                        toMonth: toMonth.value
                    };

                    let data_software = {
                        sched_id: year.value,
                        software_items: software_items,
                        wsq_resolution: Constants.WSQ_RESOLUTION_COMPLETE,
                        wsq_status: Constants.WSQ_STATUS_COMPLETE,
                        fromMonth: fromMonth.value,
                        toMonth: toMonth.value
                    };

                    // let result_hardware = await getInventoryHardwareReportBySchedIdAndMonthRanges(data);
                    // let result_software = await getInventorySoftwareReportBySchedIdAndMonthRanges(data);

                    // let result_hardware = await getInventoryHardwareReportBySchedIdMonthRangesAndItemIds(data_hardware);
                    // let result_software = await getInventorySoftwareReportBySchedIdMonthRangesAndItemIds(data_software);

                    let result_hardware = await getInventoryHardwareReportBySchedIdMonthRangesWsqStatusAndItemIds(data_hardware);
                    let result_software = await getInventorySoftwareReportBySchedIdMonthRangesWsqStatusAndItemIds(data_software);

                    let new_hardware_result = groupFilterHardwareDataOfInventory(result_hardware);
                    let new_software_result = groupFilterSoftwareDataOfInventory(result_software);

                    transformHardwareDataForOtherDetails(new_hardware_result);
                    transformSoftwareDataForOtherDetails(new_software_result);

                    // transformHardwareDataForOtherDetails(result_hardware);
                    // transformSoftwareDataForOtherDetails(result_software);

                    // listHardwareBrandOtherDetails.value = processHardwareGroupedByBrandAndHwData(result_hardware);
                    // listSoftwareBrandOtherDetails.value = processSoftwareGroupedByBrandAndHwData(result_software);

                    listHardwareBrandOtherDetails.value = processHardwareGroupedByBrandAndHwData(listMappedHardwareBrandOtherDetails);
                    listSoftwareBrandOtherDetails.value = processSoftwareGroupedByBrandAndSwData(listMappedSoftwareBrandOtherDetails);

                    new_result.value = transformDataOfInventory(new_hardware_result, new_software_result);

                    renderComponent.value = REPORT_TYPE_INVENTORY;
                } else {
                    utilStore.setPageLoading({pIsPageLoading: false});
                }
            }break;
            default: {
                utilStore.setPageLoading({pIsPageLoading: false});
            }
        }

        //Temporary (this should be inside the component, i think??)
        isButtonLoading.value = false;
    }

    const filterListByComponentType = (arr, type) => {
        var result = arr.filter(item => item.type == type);

        return result;
    }

    const separateDataByQuarter = (data) => {
        const separatedData = {
            quarter1: [],
            quarter2: [],
            quarter3: [],
            quarter4: []
        };

        data.forEach(item => {
            const quarterMonth = item.quarter_monthlyQuarter;
            
            if (quarterMonth >= 1 && quarterMonth <= 3) {
                separatedData.quarter1.push(item);
            } else if (quarterMonth >= 4 && quarterMonth <= 6) {
                separatedData.quarter2.push(item);
            } else if (quarterMonth >= 7 && quarterMonth <= 9) {
                separatedData.quarter3.push(item);
            } else if (quarterMonth >= 10 && quarterMonth <= 12) {
                separatedData.quarter4.push(item);
            }
        });

        return separatedData;
    }

    const createBatchOtherDetailsReport = (data, batch) => {
        let obj = {
            month_1: {
                month_name: "",
                planned: 0,
                actual: 0,
                deferred: 0
            },
            month_2: {
                month_name: "",
                planned: 0,
                actual: 0,
                deferred: 0
            },
            month_3: {
                month_name: "",
                planned: 0,
                actual: 0,
                deferred: 0
            },
            month_4: {
                month_name: "",
                planned: 0,
                actual: 0,
                deferred: 0
            }
        }
        
        switch (Number(batch)) {
            case Constants.BATCH_1: {
                obj.month_1.month_name = "January";
                obj.month_2.month_name = "April";
                obj.month_3.month_name = "July";
                obj.month_4.month_name = "October";
            } break;
            case Constants.BATCH_2: {
                obj.month_1.month_name = "February";
                obj.month_2.month_name = "May";
                obj.month_3.month_name = "August";
                obj.month_4.month_name = "November";
            } break;
            case Constants.BATCH_3: {
                obj.month_1.month_name = "March";
                obj.month_2.month_name = "June";
                obj.month_3.month_name = "September";
                obj.month_4.month_name = "December";
            } break;
        }

        data.quarter1.forEach(item => {
            obj.month_1.planned += item.quarter_numPlanned;
            obj.month_1.actual += item.quarter_numActual;
            obj.month_1.deferred += item.quarter_numDeferred;
        });

        data.quarter2.forEach(item => {
            obj.month_2.planned += item.quarter_numPlanned;
            obj.month_2.actual += item.quarter_numActual;
            obj.month_2.deferred += item.quarter_numDeferred;
        });

        data.quarter3.forEach(item => {
            obj.month_3.planned += item.quarter_numPlanned;
            obj.month_3.actual += item.quarter_numActual;
            obj.month_3.deferred += item.quarter_numDeferred;
        });

        data.quarter4.forEach(item => {
            obj.month_4.planned += item.quarter_numPlanned;
            obj.month_4.actual += item.quarter_numActual;
            obj.month_4.deferred += item.quarter_numDeferred;
        });

        return obj;
    }

    const computeTotalBatchOtherDetailsReport = (data) => {
        return {
            planned: data.month_1.planned + data.month_2.planned + data.month_3.planned + data.month_4.planned,
            actual: data.month_1.actual + data.month_2.actual + data.month_3.actual + data.month_4.actual,
            deferred: data.month_1.deferred + data.month_2.deferred + data.month_3.deferred + data.month_4.deferred
        };
    }

    const createLocationOtherDetailsReport = (data) => {
        let obj = {
            quarter_1: {
                quarter_name: "1st Quarter",
                planned: 0,
                actual: 0,
                deferred: 0
            },
            quarter_2: {
                quarter_name: "2nd Quarter",
                planned: 0,
                actual: 0,
                deferred: 0
            },
            quarter_3: {
                quarter_name: "3rd Quarter",
                planned: 0,
                actual: 0,
                deferred: 0
            },
            quarter_4: {
                quarter_name: "4th Quarter",
                planned: 0,
                actual: 0,
                deferred: 0
            }
        }

        data.quarter1.forEach(item => {
            obj.quarter_1.planned += item.quarter_numPlanned;
            obj.quarter_1.actual += item.quarter_numActual;
            obj.quarter_1.deferred += item.quarter_numDeferred;
        });

        data.quarter2.forEach(item => {
            obj.quarter_2.planned += item.quarter_numPlanned;
            obj.quarter_2.actual += item.quarter_numActual;
            obj.quarter_2.deferred += item.quarter_numDeferred;
        });

        data.quarter3.forEach(item => {
            obj.quarter_3.planned += item.quarter_numPlanned;
            obj.quarter_3.actual += item.quarter_numActual;
            obj.quarter_3.deferred += item.quarter_numDeferred;
        });

        data.quarter4.forEach(item => {
            obj.quarter_4.planned += item.quarter_numPlanned;
            obj.quarter_4.actual += item.quarter_numActual;
            obj.quarter_4.deferred += item.quarter_numDeferred;
        });

        return obj;
    }

    const computeTotalLocationOtherDetailsReport = (data) => {
        return {
            planned: data.quarter_1.planned + data.quarter_2.planned + data.quarter_3.planned + data.quarter_4.planned,
            actual: data.quarter_1.actual + data.quarter_2.actual + data.quarter_3.actual + data.quarter_4.actual,
            deferred: data.quarter_1.deferred + data.quarter_2.deferred + data.quarter_3.deferred + data.quarter_4.deferred
        };
    }

    const createDepartmentOtherDetailsReport = (data) => {
        let obj = {
            quarter_1: {
                quarter_name: "1st Quarter",
                planned: 0,
                actual: 0,
                deferred: 0
            },
            quarter_2: {
                quarter_name: "2nd Quarter",
                planned: 0,
                actual: 0,
                deferred: 0
            },
            quarter_3: {
                quarter_name: "3rd Quarter",
                planned: 0,
                actual: 0,
                deferred: 0
            },
            quarter_4: {
                quarter_name: "4th Quarter",
                planned: 0,
                actual: 0,
                deferred: 0
            }
        }

        data.quarter1.forEach(item => {
            obj.quarter_1.planned += item.quarter_numPlanned;
            obj.quarter_1.actual += item.quarter_numActual;
            obj.quarter_1.deferred += item.quarter_numDeferred;
        });

        data.quarter2.forEach(item => {
            obj.quarter_2.planned += item.quarter_numPlanned;
            obj.quarter_2.actual += item.quarter_numActual;
            obj.quarter_2.deferred += item.quarter_numDeferred;
        });

        data.quarter3.forEach(item => {
            obj.quarter_3.planned += item.quarter_numPlanned;
            obj.quarter_3.actual += item.quarter_numActual;
            obj.quarter_3.deferred += item.quarter_numDeferred;
        });

        data.quarter4.forEach(item => {
            obj.quarter_4.planned += item.quarter_numPlanned;
            obj.quarter_4.actual += item.quarter_numActual;
            obj.quarter_4.deferred += item.quarter_numDeferred;
        });

        return obj;
    }

    const computeTotalDepartmentOtherDetailsReport = (data) => {
        return {
            planned: data.quarter_1.planned + data.quarter_2.planned + data.quarter_3.planned + data.quarter_4.planned,
            actual: data.quarter_1.actual + data.quarter_2.actual + data.quarter_3.actual + data.quarter_4.actual,
            deferred: data.quarter_1.deferred + data.quarter_2.deferred + data.quarter_3.deferred + data.quarter_4.deferred
        };
    }

    /* Count with duplicates of items regardless of computer or workstations (The first logic for Report Inventory) */
    // const groupFilterHardwareDataOfInventory = (list_hardware) => {
    //     let new_list_hardware = [];

    //     for(var item of list_hardware){
    //         let new_item = JSON.parse(JSON.stringify(item));

    //         if(new_list_hardware.length === 0){
    //             new_list_hardware.push(new_item);
    //         } else {
    //             let idx = new_list_hardware.findIndex(hardware => hardware.hw_id == new_item.hw_id);

    //             if(idx !== -1){
    //                 new_list_hardware[idx].Ok += new_item.Ok;
    //                 new_list_hardware[idx].Defective += new_item.Defective;
    //                 new_list_hardware[idx].Na += new_item.Na;
    //                 new_list_hardware[idx].totalCount += new_item.totalCount;
    //             } else {
    //                 new_list_hardware.push(new_item);
    //             }
    //         }
    //     }

    //     return new_list_hardware;
    // }

    const groupFilterHardwareDataOfInventory = (list_hardware) => {
        const NEW_ENTRY = 0;
        const UPDATED_ENTRY = 1;
        const NO_ENTRY = 2;
        const ADD_BRAND_COUNT = 1;
        const DEDUCT_BRAND_COUNT = 2;
        const list_latest_computer_quarter = new Map();
        let new_list_hardware = [];

        listMappedHardwareBrandOtherDetails.clear();

        const updateLatestComputerHardwareStatusList = (item) => {
            if(list_latest_computer_quarter.has(`${item.wsq_wsId}-${item.hw_id}`)){
                let comp_data = list_latest_computer_quarter.get(`${item.wsq_wsId}-${item.hw_id}`);
                
                if(item.quarter_monthlyQuarter >= comp_data.month){
                    list_latest_computer_quarter.set(`${item.wsq_wsId}-${item.hw_id}`, {
                                                                        month: item.quarter_monthlyQuarter, 
                                                                        status: item.qtyhard_status,
                                                                        hw_id: item.hw_id,
                                                                        wsq_id: item.wsq_id,
                                                                        brand_id: item.brand_id,
                                                                        brand_name: item.brand_name,
                                                                        Ok: item.Ok,
                                                                        previous_wsq_id: comp_data.wsq_id,
                                                                        previous_brand_id: comp_data.brand_id,
                                                                        previous_brand_name: comp_data.brand_name,
                                                                        previousOk: comp_data.Ok
                                                                    });

                    return UPDATED_ENTRY;
                }
            } else {
                list_latest_computer_quarter.set(`${item.wsq_wsId}-${item.hw_id}`, {
                                                                    month: item.quarter_monthlyQuarter, 
                                                                    status: item.qtyhard_status,
                                                                    hw_id: item.hw_id,
                                                                    wsq_id: item.wsq_id,
                                                                    brand_id: item.brand_id,
                                                                    brand_name: item.brand_name,
                                                                    Ok: 1,
                                                                    previous_wsq_id: null,
                                                                    previous_brand_id: 0,
                                                                    previous_brand_name: "",
                                                                    previousOk: null
                                                                });

                return NEW_ENTRY;
            }

            return NO_ENTRY;
        }

        const updateLatestHardwareBrandOtherDetailsList = (item, action = "") => {
            if(listMappedHardwareBrandOtherDetails.has(`${item.hw_id}-${item.brand_id}`)){
                if(action === ADD_BRAND_COUNT){
                    let comp_data = list_latest_computer_quarter.get(`${item.wsq_wsId}-${item.hw_id}`);
                    let latest_comp_brand_data = listMappedHardwareBrandOtherDetails.get(`${comp_data.hw_id}-${comp_data.brand_id}`);
                    let prev_brand_id = comp_data.previous_brand_id;

                    if(comp_data.previousOk == null || comp_data.previousOk <= 0){                        
                        latest_comp_brand_data.Ok += 1;
                        latest_comp_brand_data.list_workstation_ids.push(comp_data.wsq_id);
                    } else if(comp_data.previousOk > 0) {    
                        let prev_comp_brand_data = listMappedHardwareBrandOtherDetails.get(`${comp_data.hw_id}-${prev_brand_id}`);
                        prev_comp_brand_data.Ok -= 1;
                        let indexToBeDeleted = prev_comp_brand_data.list_workstation_ids.findIndex(item => item == comp_data.previous_wsq_id)
                        prev_comp_brand_data.list_workstation_ids.splice(indexToBeDeleted, 1);

                        latest_comp_brand_data.Ok += 1;
                        latest_comp_brand_data.list_workstation_ids.push(comp_data.wsq_id);
                    } 
                } else if(action === DEDUCT_BRAND_COUNT){
                    let comp_data = list_latest_computer_quarter.get(`${item.wsq_wsId}-${item.hw_id}`);
                    let latest_comp_brand_data = listMappedHardwareBrandOtherDetails.get(`${comp_data.hw_id}-${comp_data.brand_id}`);
                    let prev_brand_id = comp_data.previous_brand_id;

                    if(comp_data.previousOk > 0){
                        if(comp_data.brand_id == prev_brand_id){
                            latest_comp_brand_data.Ok -= 1;
                            let indexToBeDeleted = latest_comp_brand_data.list_workstation_ids.findIndex(item => item == comp_data.wsq_id)
                            latest_comp_brand_data.list_workstation_ids.splice(indexToBeDeleted, 1);
                        } else {
                            let prev_comp_brand_data = listMappedHardwareBrandOtherDetails.get(`${comp_data.hw_id}-${prev_brand_id}`);
                            prev_comp_brand_data.Ok -= 1;
                            let indexToBeDeleted = prev_comp_brand_data.list_workstation_ids.findIndex(item => item == comp_data.previous_wsq_id)
                            prev_comp_brand_data.list_workstation_ids.splice(indexToBeDeleted, 1);
                        }
                    }
                }
            } else {
                listMappedHardwareBrandOtherDetails.set(`${item.hw_id}-${item.brand_id}`, { 
                                                                                            hw_id: item.hw_id,
                                                                                            hw_name: item.hw_name,
                                                                                            brand_id: item.brand_id,
                                                                                            brand_name: item.brand_name,
                                                                                            list_workstation_ids: [],
                                                                                            Ok: 0,
                                                                                            Defective: 0,
                                                                                            Na: 0,
                                                                                            get totalCount() {
                                                                                                return this.Ok + this.Defective + this.Na;
                                                                                            }
                                                                                        });
            }
        }
    
        for(var item of list_hardware){
            updateLatestHardwareBrandOtherDetailsList(JSON.parse(JSON.stringify(item)));
        }
        
        for(var item of list_hardware){
            let new_item = JSON.parse(JSON.stringify(item));

            if(new_list_hardware.length === 0){
                if(new_item.wsq_status == Constants.WSQ_STATUS_COMPLETE && new_item.wsq_resolution == Constants.WSQ_RESOLUTION_COMPLETE){
                    updateLatestComputerHardwareStatusList(new_item);
                    updateLatestHardwareBrandOtherDetailsList(new_item, ADD_BRAND_COUNT);
                    new_list_hardware.push(new_item);
                }
                
            } else {
                if(new_item.wsq_status == Constants.WSQ_STATUS_COMPLETE && new_item.wsq_resolution == Constants.WSQ_RESOLUTION_COMPLETE){
                    let idx = new_list_hardware.findIndex(hardware => hardware.hw_id == new_item.hw_id);

                    if(idx !== -1){
                        let hasUpdateOnExistingData = updateLatestComputerHardwareStatusList(new_item);

                        if(hasUpdateOnExistingData !== NO_ENTRY){
                            let latest_comp_data = list_latest_computer_quarter.get(`${new_item.wsq_wsId}-${new_item.hw_id}`);

                            if(hasUpdateOnExistingData == NEW_ENTRY){
                                new_list_hardware[idx].Ok += 1;
                                updateLatestHardwareBrandOtherDetailsList(new_item, ADD_BRAND_COUNT);       
                            } else if(hasUpdateOnExistingData == UPDATED_ENTRY){
                                if(latest_comp_data.previousOk > 0){
                                    if(latest_comp_data.Ok <= 0){
                                        new_list_hardware[idx].Ok -= 1;
                                        updateLatestHardwareBrandOtherDetailsList(new_item, DEDUCT_BRAND_COUNT);
                                    }
                                } else {
                                    if(latest_comp_data.Ok > 0){
                                        new_list_hardware[idx].Ok += 1;
                                        updateLatestHardwareBrandOtherDetailsList(new_item, ADD_BRAND_COUNT);
                                    }
                                }
                            }
                        }

                        //Retaining this for future purposes
                        new_list_hardware[idx].Defective = 0;
                        new_list_hardware[idx].Na = 0;
                        new_list_hardware[idx].totalCount = 0;
                    } else {
                        if(new_item.wsq_status == Constants.WSQ_STATUS_COMPLETE && new_item.wsq_resolution == Constants.WSQ_RESOLUTION_COMPLETE){
                            updateLatestComputerHardwareStatusList(new_item);
                            updateLatestHardwareBrandOtherDetailsList(new_item, ADD_BRAND_COUNT);
                            new_list_hardware.push(new_item);
                        }
                    }
                }
            }
        }

        return new_list_hardware;
    }

    // const groupFilterSoftwareDataOfInventory = (list_software) => {
    //     let new_list_software = [];

    //     for(var item of list_software){
    //         let new_item = JSON.parse(JSON.stringify(item));

    //         if(new_list_software.length === 0){
    //             new_list_software.push(new_item);
    //         } else {
    //             let idx = new_list_software.findIndex(software => software.sw_id == new_item.sw_id);

    //             if(idx !== -1){
    //                 new_list_software[idx].Ok += new_item.Ok;
    //                 new_list_software[idx].Defective += new_item.Defective;
    //                 new_list_software[idx].Na += new_item.Na;
    //                 new_list_software[idx].totalCount += new_item.totalCount;
    //             } else {
    //                 new_list_software.push(new_item);
    //             }
    //         }
    //     }

    //     return new_list_software;
    // }

    const groupFilterSoftwareDataOfInventory = (list_software) => {
        const NEW_ENTRY = 0;
        const UPDATED_ENTRY = 1;
        const NO_ENTRY = 2;
        const ADD_BRAND_COUNT = 1;
        const DEDUCT_BRAND_COUNT = 2;
        const list_latest_computer_quarter = new Map();
        let new_list_software = [];

        listMappedSoftwareBrandOtherDetails.clear();

        const updateLatestComputerSoftwareStatusList = (item) => {
            if(list_latest_computer_quarter.has(`${item.wsq_wsId}-${item.sw_id}`)){
                let comp_data = list_latest_computer_quarter.get(`${item.wsq_wsId}-${item.sw_id}`);
                
                if(item.quarter_monthlyQuarter >= comp_data.month){
                    list_latest_computer_quarter.set(`${item.wsq_wsId}-${item.sw_id}`, {
                                                                        month: item.quarter_monthlyQuarter, 
                                                                        status: item.qtysoft_status,
                                                                        sw_id: item.sw_id,
                                                                        wsq_id: item.wsq_id,
                                                                        brand_id: item.brand_id,
                                                                        brand_name: item.brand_name,
                                                                        Ok: item.Ok,
                                                                        previous_wsq_id: comp_data.wsq_id,
                                                                        previous_brand_id: comp_data.brand_id,
                                                                        previous_brand_name: comp_data.brand_name,
                                                                        previousOk: comp_data.Ok
                                                                    });

                    return UPDATED_ENTRY;
                }
            } else {
                list_latest_computer_quarter.set(`${item.wsq_wsId}-${item.sw_id}`, {
                                                                    month: item.quarter_monthlyQuarter, 
                                                                    status: item.qtysoft_status,
                                                                    sw_id: item.sw_id,
                                                                    wsq_id: item.wsq_id,
                                                                    brand_id: item.brand_id,
                                                                    brand_name: item.brand_name,
                                                                    Ok: 1,
                                                                    previous_wsq_id: null,
                                                                    previous_brand_id: 0,
                                                                    previous_brand_name: "",
                                                                    previousOk: null
                                                                });

                return NEW_ENTRY;
            }

            return NO_ENTRY;
        }

        const updateLatestSoftwareBrandOtherDetailsList = (item, action = "") => {
            if(listMappedSoftwareBrandOtherDetails.has(`${item.sw_id}-${item.brand_id}`)){
                if(action === ADD_BRAND_COUNT){
                    let comp_data = list_latest_computer_quarter.get(`${item.wsq_wsId}-${item.sw_id}`);
                    let latest_comp_brand_data = listMappedSoftwareBrandOtherDetails.get(`${comp_data.sw_id}-${comp_data.brand_id}`);
                    let prev_brand_id = comp_data.previous_brand_id;

                    if(comp_data.previousOk == null || comp_data.previousOk <= 0){                        
                        latest_comp_brand_data.Ok += 1;
                        latest_comp_brand_data.list_workstation_ids.push(comp_data.wsq_id);
                    } else if(comp_data.previousOk > 0) {    
                        let prev_comp_brand_data = listMappedSoftwareBrandOtherDetails.get(`${comp_data.sw_id}-${prev_brand_id}`);
                        prev_comp_brand_data.Ok -= 1;      
                        let indexToBeDeleted = prev_comp_brand_data.list_workstation_ids.findIndex(item => item == comp_data.previous_wsq_id)
                        prev_comp_brand_data.list_workstation_ids.splice(indexToBeDeleted, 1);

                        latest_comp_brand_data.Ok += 1;
                        latest_comp_brand_data.list_workstation_ids.push(comp_data.wsq_id);
                    } 
                } else if(action === DEDUCT_BRAND_COUNT){
                    let comp_data = list_latest_computer_quarter.get(`${item.wsq_wsId}-${item.sw_id}`);
                    let latest_comp_brand_data = listMappedSoftwareBrandOtherDetails.get(`${comp_data.sw_id}-${comp_data.brand_id}`);
                    let prev_brand_id = comp_data.previous_brand_id;

                    if(comp_data.previousOk > 0){
                        if(comp_data.brand_id == prev_brand_id){
                            latest_comp_brand_data.Ok -= 1;
                            let indexToBeDeleted = latest_comp_brand_data.list_workstation_ids.findIndex(item => item == comp_data.wsq_id)
                            latest_comp_brand_data.list_workstation_ids.splice(indexToBeDeleted, 1);
                        } else {
                            let prev_comp_brand_data = listMappedSoftwareBrandOtherDetails.get(`${comp_data.sw_id}-${prev_brand_id}`);
                            prev_comp_brand_data.Ok -= 1; 
                            let indexToBeDeleted = prev_comp_brand_data.list_workstation_ids.findIndex(item => item == comp_data.previous_wsq_id)
                            prev_comp_brand_data.list_workstation_ids.splice(indexToBeDeleted, 1);
                        }
                    }
                }
            } else {
                listMappedSoftwareBrandOtherDetails.set(`${item.sw_id}-${item.brand_id}`, { 
                                                                                            sw_id: item.sw_id,
                                                                                            sw_name: item.sw_name,
                                                                                            brand_id: item.brand_id,
                                                                                            brand_name: item.brand_name,
                                                                                            list_workstation_ids: [],
                                                                                            Ok: 0,
                                                                                            Defective: 0,
                                                                                            Na: 0,
                                                                                            get totalCount() {
                                                                                                return this.Ok + this.Defective + this.Na;
                                                                                            }
                                                                                        });
            }
        }
    
        for(var item of list_software){
            updateLatestSoftwareBrandOtherDetailsList(JSON.parse(JSON.stringify(item)));
        }
        
        for(var item of list_software){
            let new_item = JSON.parse(JSON.stringify(item));

            if(new_list_software.length === 0){
                if(new_item.wsq_status == Constants.WSQ_STATUS_COMPLETE && new_item.wsq_resolution == Constants.WSQ_RESOLUTION_COMPLETE){
                    updateLatestComputerSoftwareStatusList(new_item);
                    updateLatestSoftwareBrandOtherDetailsList(new_item, ADD_BRAND_COUNT);
                    new_list_software.push(new_item);
                }
                
            } else {
                if(new_item.wsq_status == Constants.WSQ_STATUS_COMPLETE && new_item.wsq_resolution == Constants.WSQ_RESOLUTION_COMPLETE){
                    let idx = new_list_software.findIndex(software => software.sw_id == new_item.sw_id);

                    if(idx !== -1){
                        let hasUpdateOnExistingData = updateLatestComputerSoftwareStatusList(new_item);

                        if(hasUpdateOnExistingData !== NO_ENTRY){
                            let latest_comp_data = list_latest_computer_quarter.get(`${new_item.wsq_wsId}-${new_item.sw_id}`);

                            if(hasUpdateOnExistingData == NEW_ENTRY){
                                new_list_software[idx].Ok += 1;
                                updateLatestSoftwareBrandOtherDetailsList(new_item, ADD_BRAND_COUNT);       
                            } else if(hasUpdateOnExistingData == UPDATED_ENTRY){
                                if(latest_comp_data.previousOk > 0){
                                    if(latest_comp_data.Ok <= 0){
                                        new_list_software[idx].Ok -= 1;
                                        updateLatestSoftwareBrandOtherDetailsList(new_item, DEDUCT_BRAND_COUNT);
                                    }
                                } else {
                                    if(latest_comp_data.Ok > 0){
                                        new_list_software[idx].Ok += 1;
                                        updateLatestSoftwareBrandOtherDetailsList(new_item, ADD_BRAND_COUNT);
                                    }
                                }
                            }
                        }

                        //Retaining this for future purposes
                        new_list_software[idx].Defective = 0;
                        new_list_software[idx].Na = 0;
                        new_list_software[idx].totalCount = 0;
                    } else {
                        if(new_item.wsq_status == Constants.WSQ_STATUS_COMPLETE && new_item.wsq_resolution == Constants.WSQ_RESOLUTION_COMPLETE){
                            updateLatestComputerSoftwareStatusList(new_item);
                            updateLatestSoftwareBrandOtherDetailsList(new_item, ADD_BRAND_COUNT);
                            new_list_software.push(new_item);
                        }
                    }
                }
            }
        }

        return new_list_software;
    }

    /* Count with duplicates of items regardless of computer or workstations (The first logic for Report Inventory) */
    // const transformHardwareDataForOtherDetails = (list_hardware) => {
    //     listHardwareOtherDetails.value.totals.approvedItems = 0;
    //     listHardwareOtherDetails.value.totals.disapprovedItems = 0;
    //     listHardwareOtherDetails.value.totals.totalItems = 0;

    //     listHardwareOtherDetails.value.details = list_hardware.filter((item, index, self) => index === self.findIndex((t) => t.hw_id === item.hw_id))
    //                                             .map(item => {
    //                                                 let hw_data_approved = list_hardware.filter(hw => hw.wsq_status == Constants.WSQ_STATUS_COMPLETE && hw.hw_id == item.hw_id);
    //                                                 let hw_data_notApproved = list_hardware.filter(hw => (hw.wsq_status == Constants.WSQ_STATUS_PENDING || hw.wsq_status == Constants.WSQ_STATUS_FOR_APPROVAL) && hw.hw_id == item.hw_id);

    //                                                 let hw_data_Approved_count = hw_data_approved.reduce((accumulator, currentValue) => {
    //                                                     return accumulator + currentValue.totalCount
    //                                                 }, 0);

    //                                                 let hw_data_combinedNotApproved_count = hw_data_notApproved.reduce((accumulator, currentValue) => {
    //                                                     return accumulator + currentValue.totalCount
    //                                                 }, 0);

    //                                                 listHardwareOtherDetails.value.totals.approvedItems += hw_data_Approved_count;
    //                                                 listHardwareOtherDetails.value.totals.disapprovedItems += hw_data_combinedNotApproved_count;
    //                                                 listHardwareOtherDetails.value.totals.totalItems += hw_data_Approved_count + hw_data_combinedNotApproved_count;

    //                                                 return {
    //                                                     hw_id: item.hw_id,
    //                                                     hw_name: item.hw_name,
    //                                                     approvedCount: hw_data_Approved_count,
    //                                                     disapprovedCount: hw_data_combinedNotApproved_count,
    //                                                     total: hw_data_Approved_count + hw_data_combinedNotApproved_count
    //                                                 };
    //                                             });
    // }

    const transformHardwareDataForOtherDetails = (list_hardware) => {
        listHardwareOtherDetails.value.totals.approvedItems = 0;
        listHardwareOtherDetails.value.totals.disapprovedItems = 0;
        listHardwareOtherDetails.value.totals.totalItems = 0;

        listHardwareOtherDetails.value.details = list_hardware.map(item => {
                                                                    let totalDisapprovedItemCount = (item.Defective + item.Na);

                                                                    listHardwareOtherDetails.value.totals.approvedItems += item.Ok;
                                                                    listHardwareOtherDetails.value.totals.disapprovedItems += totalDisapprovedItemCount;
                                                                    listHardwareOtherDetails.value.totals.totalItems += (item.Ok + totalDisapprovedItemCount);

                                                                    return {
                                                                        hw_id: item.hw_id,
                                                                        hw_name: item.hw_name,
                                                                        approvedCount: item.Ok,
                                                                        disapprovedCount: totalDisapprovedItemCount,
                                                                        total: item.Ok + totalDisapprovedItemCount
                                                                    };
                                                                });
    }

    /* Count with duplicates of items regardless of computer or workstations (The first logic for Report Inventory) */
    // const transformSoftwareDataForOtherDetails = (list_software) => {
    //     listSoftwareOtherDetails.value.totals.approvedItems = 0;
    //     listSoftwareOtherDetails.value.totals.disapprovedItems = 0;
    //     listSoftwareOtherDetails.value.totals.totalItems = 0;

    //     listSoftwareOtherDetails.value.details = list_software.filter((item, index, self) => index === self.findIndex((t) => t.sw_id === item.sw_id))
    //                                             .map(item => {
    //                                                 let sw_data_approved = list_software.filter(sw => sw.wsq_status == Constants.WSQ_STATUS_COMPLETE && sw.sw_id == item.sw_id);
    //                                                 let sw_data_notApproved = list_software.filter(sw => (sw.wsq_status == Constants.WSQ_STATUS_PENDING || sw.wsq_status == Constants.WSQ_STATUS_FOR_APPROVAL) && sw.sw_id == item.sw_id);                                              

    //                                                 let sw_data_combinedNotApproved_count = sw_data_notApproved.reduce((accumulator, currentValue) => {
    //                                                     return accumulator + currentValue.totalCount
    //                                                 }, 0);

    //                                                 let sw_data_Approved_count = sw_data_approved.reduce((accumulator, currentValue) => {
    //                                                     return accumulator + currentValue.totalCount
    //                                                 }, 0);

    //                                                 listSoftwareOtherDetails.value.totals.approvedItems += sw_data_Approved_count;
    //                                                 listSoftwareOtherDetails.value.totals.disapprovedItems += sw_data_combinedNotApproved_count;
    //                                                 listSoftwareOtherDetails.value.totals.totalItems += sw_data_Approved_count + sw_data_combinedNotApproved_count;

    //                                                 return {
    //                                                     sw_id: item.sw_id,
    //                                                     sw_name: item.sw_name,
    //                                                     approvedCount: sw_data_Approved_count,
    //                                                     disapprovedCount: sw_data_combinedNotApproved_count,
    //                                                     total: sw_data_Approved_count + sw_data_combinedNotApproved_count
    //                                                 };
    //                                             });
    // }

    const transformSoftwareDataForOtherDetails = (list_software) => {
        listSoftwareOtherDetails.value.totals.approvedItems = 0;
        listSoftwareOtherDetails.value.totals.disapprovedItems = 0;
        listSoftwareOtherDetails.value.totals.totalItems = 0;

        listSoftwareOtherDetails.value.details = list_software.map(item => {
                                                                    let totalDisapprovedItemCount = (item.Defective + item.Na);

                                                                    listSoftwareOtherDetails.value.totals.approvedItems += item.Ok;
                                                                    listSoftwareOtherDetails.value.totals.disapprovedItems += totalDisapprovedItemCount;
                                                                    listSoftwareOtherDetails.value.totals.totalItems += (item.Ok + totalDisapprovedItemCount);

                                                                    return {
                                                                        sw_id: item.sw_id,
                                                                        sw_name: item.sw_name,
                                                                        approvedCount: item.Ok,
                                                                        disapprovedCount: totalDisapprovedItemCount,
                                                                        total: item.Ok + totalDisapprovedItemCount
                                                                    };
                                                                });
    }

    /* Count with duplicates of items regardless of computer or workstations (The first logic for Report Inventory) */
    // function processSoftwareGroupedByBrandAndHwData(data) {
    //     const groupedData = data.reduce((acc, item) => {
    //         const key = `${item.sw_id}-${item.brand_id}`;

    //         if (!acc[key]) {
    //             acc[key] = {
    //                 sw_id: item.sw_id,
    //                 sw_name: item.sw_name,
    //                 brand_id: item.brand_id,
    //                 brand_name: item.brand_name,
    //                 totalCount: 0,
    //                 Ok: 0,
    //                 Defective: 0,
    //                 Na: 0
    //             };
    //         }

    //         acc[key].totalCount += item.totalCount;
    //         acc[key].Ok += item.Ok;
    //         acc[key].Defective += item.Defective;
    //         acc[key].Na += item.Na;

    //         return acc;
    //     }, {});

    //     return Object.values(groupedData);
    // }

    function processSoftwareGroupedByBrandAndSwData(dataMap) {
        const groupedData = new Map();

        for (const [_, item] of dataMap) {
            const key = `${item.sw_id}-${item.brand_id}`;
            
            if (!groupedData.has(key)) {
                groupedData.set(key, {
                    sw_id: item.sw_id,
                    sw_name: item.sw_name,
                    brand_id: item.brand_id,
                    brand_name: item.brand_name,
                    totalCount: 0,
                    Ok: 0,
                    Defective: 0,
                    Na: 0
                });
            }

            const currentData = groupedData.get(key);

            currentData.totalCount += item.totalCount;
            currentData.Ok += item.Ok;
            currentData.Defective += item.Defective;
            currentData.Na += item.Na;
        }

        const list = Array.from(groupedData.values());

        const sortedArray = list.sort((a, b) => {
            // First compare software name
            const swNameComparison = a.sw_name.localeCompare(b.sw_name);
            if (swNameComparison !== 0) return swNameComparison;

            // Handle null brand_name cases
            // Null will be sorted to the end
            if (a.brand_name === null && b.brand_name === null) return 0;
            if (a.brand_name === null) return 1;
            if (b.brand_name === null) return -1;

            // Compare brand_name if neither is null
            return a.brand_name.localeCompare(b.brand_name);
        });
        
        return sortedArray;
    }

    /* Count with duplicates of items regardless of computer or workstations (The first logic for Report Inventory) */
    // function processHardwareGroupedByBrandAndHwData(data) {
    //     const groupedData = data.reduce((acc, item) => {
    //         const key = `${item.hw_id}-${item.brand_id}`;

    //         if (!acc[key]) {
    //             acc[key] = {
    //                 hw_id: item.hw_id,
    //                 hw_name: item.hw_name,
    //                 brand_id: item.brand_id,
    //                 brand_name: item.brand_name,
    //                 totalCount: 0,
    //                 Ok: 0,
    //                 Defective: 0,
    //                 Na: 0
    //             };
    //         }

    //         acc[key].totalCount += item.totalCount;
    //         acc[key].Ok += item.Ok;
    //         acc[key].Defective += item.Defective;
    //         acc[key].Na += item.Na;

    //         return acc;
    //     }, {});

    //     return Object.values(groupedData);
    // }

    function processHardwareGroupedByBrandAndHwData(dataMap) {
        const groupedData = new Map();

        for (const [_, item] of dataMap) {
            const key = `${item.hw_id}-${item.brand_id}`;
            
            if (!groupedData.has(key)) {
                groupedData.set(key, {
                    hw_id: item.hw_id,
                    hw_name: item.hw_name,
                    brand_id: item.brand_id,
                    brand_name: item.brand_name,
                    totalCount: 0,
                    Ok: 0,
                    Defective: 0,
                    Na: 0
                });
            }

            const currentData = groupedData.get(key);

            currentData.totalCount += item.totalCount;
            currentData.Ok += item.Ok;
            currentData.Defective += item.Defective;
            currentData.Na += item.Na;
        }

        const list = Array.from(groupedData.values());

        const sortedArray = list.sort((a, b) => {
            // First compare hardware name
            const hwNameComparison = a.hw_name.localeCompare(b.hw_name);
            if (hwNameComparison !== 0) return hwNameComparison;

            // Handle null brand_name cases
            // Null will be sorted to the end
            if (a.brand_name === null && b.brand_name === null) return 0;
            if (a.brand_name === null) return 1;
            if (b.brand_name === null) return -1;

            // Compare brand_name if neither is null
            return a.brand_name.localeCompare(b.brand_name);
        });
        
        return sortedArray;
    }



    const transformDataOfInventory = (list_hardware, list_software) => {
        let hardware = {
            labels: [],
            Ok: [],
            Defective: [],
            Na: []
        };

        let software = {
            labels: [],
            Ok: [],
            Defective: [],
            Na: []
        };
       
        for(var item of list_hardware){
            hardware.labels.push(item.hw_name);
            hardware.Ok.push(item.Ok);
            hardware.Defective.push(item.Defective);
            hardware.Na.push(item.Na);
        }

        for(var item of list_software){
            software.labels.push(item.sw_name);
            software.Ok.push(item.Ok);
            software.Defective.push(item.Defective);
            software.Na.push(item.Na);
        }

        return {hardware, software};
    }

    const hasErrorInGeneratingCompBatchReport = () => {
        let hasError = false;
        
        if(year.value == null){
            errorYearValidationParams.isError = true;
            errorYearValidationParams.errorMessage = "Year must not be empty";
            hasError = true;
        } else {
            errorYearValidationParams.isError = false;
            errorYearValidationParams.errorMessage = "";
        }

        if(batch.value == null){
            errorMonthlyBatchValidationParams.isError = true;
            errorMonthlyBatchValidationParams.errorMessage = "Batch must not be empty";
            hasError = true;
        } else {
            errorMonthlyBatchValidationParams.isError = false;
            errorMonthlyBatchValidationParams.errorMessage = "";
        }

        return hasError;
    }

    const hasErrorInGeneratingCompLocationReport = () => {
        let hasError = false;
        
        if(year.value == null){
            errorYearValidationParams.isError = true;
            errorYearValidationParams.errorMessage = "Year must not be empty";
            hasError = true;
        } else {
            errorYearValidationParams.isError = false;
            errorYearValidationParams.errorMessage = "";
        }

        if(location.value == null){
            errorLocationValidationParams.isError = true;
            errorLocationValidationParams.errorMessage = "Location must not be empty";
            hasError = true;
        } else {
            errorLocationValidationParams.isError = false;
            errorLocationValidationParams.errorMessage = "";
        }

        return hasError;
    }

    const hasErrorInGeneratingCompDepartmentReport = () => {
        let hasError = false;

        if(year.value == null){
            errorYearValidationParams.isError = true;
            errorYearValidationParams.errorMessage = "Year must not be empty";
            hasError = true;
        } else {
            errorYearValidationParams.isError = false;
            errorYearValidationParams.errorMessage = "";
        }
        
        if(department_id.value == null){
            errorDepartmentValidationParams.isError = true;
            errorDepartmentValidationParams.errorMessage = "Department must not be empty";
            hasError = true;
        } else {
            errorDepartmentValidationParams.isError = false;
            errorDepartmentValidationParams.errorMessage = "";
        }

        return hasError;
    }

    const hasErrorInGeneratingCompInventoryReport = () => {
        let hasError = false;

        if(year.value == null){
            errorYearValidationParams.isError = true;
            errorYearValidationParams.errorMessage = "Year must not be empty";
            hasError = true;
        } else {
            errorYearValidationParams.isError = false;
            errorYearValidationParams.errorMessage = "";
        }

        if(fromMonth.value == null){
            errorFromDateValidationParams.isError = true;
            errorFromDateValidationParams.errorMessage = "Date (From) must not be empty";
            hasError = true;
        } else {
            errorFromDateValidationParams.isError = false;
            errorFromDateValidationParams.errorMessage = "";
        }

        if(toMonth.value == null){
            errorToDateValidationParams.isError = true;
            errorToDateValidationParams.errorMessage = "Date (To) must not be empty";
            hasError = true;
        } else {
            errorToDateValidationParams.isError = false;
            errorToDateValidationParams.errorMessage = "";
        }

        if(fromMonth.value != null && toMonth.value != null){
            if(toMonth.value < fromMonth.value){
                errorMonthsInterchangeValidationParams.isError = true;
                errorMonthsInterchangeValidationParams.errorMessage = "Months from and to must not interchange";
                hasError = true;
            } else {
                errorMonthsInterchangeValidationParams.isError = false;
                errorMonthsInterchangeValidationParams.errorMessage = "";
            }
        } else {
            errorMonthsInterchangeValidationParams.isError = false;
            errorMonthsInterchangeValidationParams.errorMessage = "";
        }
        
        return hasError;
    }

    const viewWorkstationsOfBrand = async (id, brand_id, type) => {
        let workstationIdsList = null;
        
        if(type === Constants.COMPONENT_TYPE_HARDWARE){
            if(listMappedHardwareBrandOtherDetails.has(`${id}-${brand_id}`)){
                let data = listMappedHardwareBrandOtherDetails.get(`${id}-${brand_id}`);

                workstationDetailsBrandHeader.type = "Hardware";
                workstationDetailsBrandHeader.component = data.hw_name;
                workstationDetailsBrandHeader.brand_name = data.brand_name;

                workstationIdsList = data.list_workstation_ids
            }
        } else {
            if(listMappedSoftwareBrandOtherDetails.has(`${id}-${brand_id}`)){
                let data = listMappedSoftwareBrandOtherDetails.get(`${id}-${brand_id}`);

                workstationDetailsBrandHeader.type = "Software";
                workstationDetailsBrandHeader.component = data.sw_name;
                workstationDetailsBrandHeader.brand_name = data.brand_name;

                workstationIdsList = data.list_workstation_ids
            }
        }

        if(workstationIdsList != null && workstationIdsList.length !== 0){
            let result = await getQuarterlyWorkstationDetailsByWsqIds(workstationIdsList);
            listOfWorkstationDetails.value = result;
        }
        
        isShowBrandWorkstationsDialog.value = true;
    }

    const createWorksheet = (workbook, name) => {
      const worksheet = workbook.addWorksheet(name);

      // Adjust Column Width
      worksheet.columns = [
        { width: 50 },
        { width: 26 },
        { width: 26 },
        { width: 26 },
        { width: 26 }
      ];

      return worksheet;
    }

    const setMergedCells = (worksheet) => {
      worksheet.mergeCells('A1:E1');
      worksheet.mergeCells('A6:E6');
      worksheet.mergeCells('A7:E7');
      worksheet.mergeCells('A8:E8');
    }

    const applyCellStyles = (worksheet) => {
      worksheet.getCell('C2').style = introRowStyle;
      worksheet.getCell('C3').style = introRowStyle;
      worksheet.getCell('C5').style = introRowStyle;

      worksheet.getCell('A9').style = tableHeaderStyle;
      worksheet.getCell('B9').style = tableHeaderStyle;
      worksheet.getCell('C9').style = tableHeaderStyle;
      worksheet.getCell('D9').style = tableHeaderStyle;
      worksheet.getCell('E9').style = tableHeaderStyle;

      worksheet.getCell('A2').fill = fillWhite;
      worksheet.getCell('B2').fill = fillWhite;
      worksheet.getCell('C2').fill = fillWhite;
      worksheet.getCell('D2').fill = fillWhite;
      worksheet.getCell('E2').fill = fillWhite;
      worksheet.getCell('A3').fill = fillWhite;
      worksheet.getCell('B3').fill = fillWhite;
      worksheet.getCell('C3').fill = fillWhite;
      worksheet.getCell('D3').fill = fillWhite;
      worksheet.getCell('E3').fill = fillWhite;
      worksheet.getCell('A4').fill = fillWhite;
      worksheet.getCell('B4').fill = fillWhite;
      worksheet.getCell('C4').fill = fillWhite;
      worksheet.getCell('D4').fill = fillWhite;
      worksheet.getCell('E4').fill = fillWhite;
      worksheet.getCell('A5').fill = fillWhite;
      worksheet.getCell('B5').fill = fillWhite;
      worksheet.getCell('C5').fill = fillWhite;
      worksheet.getCell('D5').fill = fillWhite;
      worksheet.getCell('E5').fill = fillWhite;

      worksheet.getCell('C4').style = {
        font: { name: 'Calibri', size: 11, bold: true },
        alignment: { vertical: 'center', horizontal: 'center' },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } }
      };

      worksheet.getCell('A7').style = {
        font: { name: 'Calibri', size: 16, bold: true, underline: true },
        alignment: { vertical: 'center', horizontal: 'center' },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } }
      };

      worksheet.getCell('A8').border = {
        bottom: {style:'thick', color: {argb:'00000000'}}
      };
    }

    const addImage = (worksheet, workbook, imageIconBase64) => {
      const imageId = workbook.addImage({
        base64: imageIconBase64,
        extension: 'png',
      });

      worksheet.addImage(imageId, {
        tl: { col: 1.50, row: 1.00 },
        ext: { width: 105, height: 90 }
      });
    }

    const insertHeaderData = (worksheet, name) => {
      /* Main Header */
      worksheet.getCell('C2').value = 'Republic of the Philippines';
      worksheet.getCell('C3').value = 'Department of Health';
      worksheet.getCell('C4').value = 'VICENTE SOTTO MEMORIAL MEDICAL CENTER';
      worksheet.getCell('C5').value = 'B.Rodriguez St. Cebu City';
      worksheet.getCell('A7').value = name;

      /* Table Header */
      insertTableHeaderData(worksheet);
    }

    const insertTableHeaderData = (worksheet) => {
        switch(renderComponent.value){
            case REPORT_TYPE_COMP_BY_BATCH: 
            case REPORT_TYPE_COMP_BY_LOCATION:
            case REPORT_TYPE_COMP_BY_DEPARTMENT:{
                setTableHeaderForWorkstation(worksheet);
            } break;
            case REPORT_TYPE_INVENTORY:{
                setTableHeaderForInventory(worksheet);
            } break;
        }
    }

    const setTableHeaderForWorkstation = (worksheet) => {
        worksheet.getCell('A9').value = 'Location';
        worksheet.getCell('B9').value = 'Planned';
        worksheet.getCell('C9').value = 'Actual';
        worksheet.getCell('D9').value = 'Deferred';
        worksheet.getCell('E9').value = 'Total';
    }

    const setTableHeaderForInventory = (worksheet) => {
        worksheet.getCell('A9').value = 'Inventory Name';
        worksheet.getCell('B9').value = 'Ok';
        worksheet.getCell('C9').value = 'Defective';
        worksheet.getCell('D9').value = 'N/A';
        worksheet.getCell('E9').value = 'Total';
    }

    const insertData = (worksheet, data) => {
      const startRow = 10;
      let endRow = 0;

      for(var i = 0; i < data.length; i++){
        const currentRow = startRow + i;
        const worksheetRow = worksheet.getRow(currentRow);

        worksheetRow.getCell(1).value = data[i].location_name;
        worksheetRow.getCell(2).value = data[i].quarter_numPlanned;
        worksheetRow.getCell(3).value = data[i].quarter_numActual;
        worksheetRow.getCell(4).value = data[i].quarter_numDeferred;
        worksheetRow.getCell(5).value = {
            formula: `SUM(B${currentRow}:D${currentRow})`
        };

        worksheetRow.getCell(1).style = colData;
        worksheetRow.getCell(2).style = colDataCenter;
        worksheetRow.getCell(3).style = colDataCenter;
        worksheetRow.getCell(4).style = colDataCenter;
        worksheetRow.getCell(5).style = colDataCenter;

        endRow = currentRow;
      }

      const totalRow = worksheet.getRow(endRow + 1);

      totalRow.getCell(1).value = "Total";
      totalRow.getCell(2).value = { formula: `SUM(B${startRow}:B${endRow})` };
      totalRow.getCell(3).value = { formula: `SUM(C${startRow}:C${endRow})` };
      totalRow.getCell(4).value = { formula: `SUM(D${startRow}:D${endRow})` };
      totalRow.getCell(5).value = { formula: `SUM(E${startRow}:E${endRow})` };

      totalRow.getCell(1).style = colDataWithBold;
      totalRow.getCell(2).style = colDataWithBold;
      totalRow.getCell(3).style = colDataWithBold;
      totalRow.getCell(4).style = colDataWithBold;
      totalRow.getCell(5).style = colDataWithBold;
    }

    const insertDataInventory = (worksheet, data) => {
      const listLabels = data.labels;
      const listDefective = data.Defective;
      const listNa = data.Na;
      const listOk = data.Ok;

      const startRow = 10;
      let endRow = 0;

      for(var i = 0; i < listLabels.length; i++){
        const currentRow = startRow + i;
        const worksheetRow = worksheet.getRow(currentRow);

        worksheetRow.getCell(1).value = listLabels[i];
        worksheetRow.getCell(2).value = listOk[i];
        worksheetRow.getCell(3).value = listDefective[i];
        worksheetRow.getCell(4).value = listNa[i];
        worksheetRow.getCell(5).value = {
            formula: `SUM(B${currentRow}:D${currentRow})`
        };

        worksheetRow.getCell(1).style = colData;
        worksheetRow.getCell(2).style = colDataCenter;
        worksheetRow.getCell(3).style = colDataCenter;
        worksheetRow.getCell(4).style = colDataCenter;
        worksheetRow.getCell(5).style = colDataCenter;

        endRow = currentRow;
      }

      const totalRow = worksheet.getRow(endRow + 1);

      totalRow.getCell(1).value = "Total";
      totalRow.getCell(2).value = { formula: `SUM(B${startRow}:B${endRow})` };
      totalRow.getCell(3).value = { formula: `SUM(C${startRow}:C${endRow})` };
      totalRow.getCell(4).value = { formula: `SUM(D${startRow}:D${endRow})` };
      totalRow.getCell(5).value = { formula: `SUM(E${startRow}:E${endRow})` };

      totalRow.getCell(1).style = colDataWithBold;
      totalRow.getCell(2).style = colDataWithBold;
      totalRow.getCell(3).style = colDataWithBold;
      totalRow.getCell(4).style = colDataWithBold;
      totalRow.getCell(5).style = colDataWithBold;
    }

    const getImageBase64 = async(imageFileName) => {
        // Load the image and convert to base64
        const imagePath = new URL(ImgVsmmcLogo, import.meta.url).href
        const response = await fetch(imagePath)
        const blob = await response.blob()
        
        // Convert blob to base64
        imageIconBase64.value = await new Promise((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result.split(',')[1])
          reader.readAsDataURL(blob)
        })
    }

    const exportToExcel = async () => {
        switch(renderComponent.value){
            case REPORT_TYPE_COMP_BY_BATCH: {
                await exportReportByBatchExcel(listBatchOtherDetails.value, new_result.value, imageIconBase64.value);
            } break;
            case REPORT_TYPE_COMP_BY_LOCATION: {
                await exportReportByLocationExcel(listLocationOtherDetails.value, new_result.value, imageIconBase64.value);
            } break;
            case REPORT_TYPE_COMP_BY_DEPARTMENT: {
                await exportReportByDepartmentExcel(listDepartmentOtherDetails.value, new_result.value, imageIconBase64.value);
            } break;
            case REPORT_TYPE_INVENTORY: {
                await exportReportByInventoryExcel(new_result.value, imageIconBase64.value);
            } break;
        }
    }

    const exportReportByBatchExcel = async (listBatchOtherDetails, new_result, imageIconBase64) => {
      const workbook = new ExcelJS.Workbook()

      const worksheets = ['month_1', 'month_2', 'month_3', 'month_4'].map(month => {
        const worksheet = createWorksheet(workbook, listBatchOtherDetails.details[month].month_name);

        setMergedCells(worksheet);
        applyCellStyles(worksheet);
        addImage(worksheet, workbook, imageIconBase64);
        insertHeaderData(worksheet, `Completed Computers of Month (${listBatchOtherDetails.details[month].month_name})`);
        insertData(worksheet, new_result[`quarter${month.slice(-1)}`]);

        return worksheet;
      });

      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(blob)

      const link = document.createElement('a');
      link.href = url;
      link.download = `ReportBatchByComputersList.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    }

    const exportReportByLocationExcel = async (listLocationOtherDetails, new_result, imageIconBase64) => {
      const workbook = new ExcelJS.Workbook()

      const worksheets = ['quarter_1', 'quarter_2', 'quarter_3', 'quarter_4'].map(quarter => {
        const worksheet = createWorksheet(workbook, listLocationOtherDetails.details[quarter].quarter_name);

        setMergedCells(worksheet);
        applyCellStyles(worksheet);
        addImage(worksheet, workbook, imageIconBase64);
        insertHeaderData(worksheet, `Completed Computers by Locations of the Quarter (${listLocationOtherDetails.details[quarter].quarter_name})`);
        insertData(worksheet, new_result[`quarter${quarter.slice(-1)}`]);

        return worksheet;
      });

      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(blob)

      const link = document.createElement('a');
      link.href = url;
      link.download = `ReportBatchByLocationList.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    }

    const exportReportByDepartmentExcel = async (listDepartmentOtherDetails, new_result, imageIconBase64) => {
      const workbook = new ExcelJS.Workbook()

      const worksheets = ['quarter_1', 'quarter_2', 'quarter_3', 'quarter_4'].map(quarter => {
        const worksheet = createWorksheet(workbook, listDepartmentOtherDetails.details[quarter].quarter_name);

        setMergedCells(worksheet);
        applyCellStyles(worksheet);
        addImage(worksheet, workbook, imageIconBase64);
        insertHeaderData(worksheet, `Completed Computers by Department of the Quarter (${listDepartmentOtherDetails.details[quarter].quarter_name})`);
        insertData(worksheet, new_result[`quarter${quarter.slice(-1)}`]);

        return worksheet;
      });

      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(blob)

      const link = document.createElement('a');
      link.href = url;
      link.download = `ReportBatchByDepartmentList.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    }

    const exportReportByInventoryExcel = async (new_result, imageIconBase64) => {
      const workbook = new ExcelJS.Workbook()

      const worksheets = ['hardware','software'].map(componentType => {
        let newTitle = componentType.charAt(0).toUpperCase() + componentType.slice(1);
        let objYear = listOfYear.value.filter(item => item.sched_id == year.value);
        let objFromMonth = Constants.arrOfFullNameMonths.filter(item => item.id == fromMonth.value);
        let objToMonth = Constants.arrOfFullNameMonths.filter(item => item.id == toMonth.value);

        const worksheet = createWorksheet(workbook, newTitle);

        setMergedCells(worksheet);
        applyCellStyles(worksheet);
        addImage(worksheet, workbook, imageIconBase64);
        insertHeaderData(worksheet, `${newTitle} Inventory ${objYear[0].sched_year} (${objFromMonth[0].name} - ${objToMonth[0].name})`);
        insertDataInventory(worksheet, new_result[componentType]);

        return worksheet;
      });

      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(blob)

      const link = document.createElement('a');
      link.href = url;
      link.download = `ReportInventoryItemsList.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    }
</script>

<template>
    <v-row>
        <v-col
            cols="6"
            md="6"
            sm="12"
        >
            <div class="font-size-32px font-weight-500 mb-3">
                <v-icon
                    class="me-1"
                    size="x-small"
                    icon="mdi-chart-bar"
                >
                </v-icon>
                <span>Reports</span>
            </div>
        </v-col>
        <v-col
            cols="12"
        >
            <v-divider></v-divider>
        </v-col>
        <v-col
            cols="12"
            xl="6"
            lg="6"
            md="6"
            sm="12"
            xs="12"
        >
            <v-sheet
                class="pa-4 min-height-sheet"
                elevation="2"   
                rounded="lg" 
                height="100%"
                width="100%"
            >
                <div class="font-size-16px">
                    <span class="font-weight-medium text-decoration-underline">Other Details and Options:</span>
                </div>
                <div 
                    v-if = "renderComponent == REPORT_TYPE_COMP_BY_BATCH"
                    class="mt-2"
                >
                    <v-table
                        class="table-striped"
                        height="300px"
                        density="comfortable"
                    >
                        <thead
                            class="font-size-14px"
                        >
                            <tr>
                                <th 
                                    class="text-left"
                                    width="45%"                                    
                                >
                                    Month
                                </th>
                                <th 
                                    class="text-left"
                                >
                                    Planned
                                </th>
                                <th 
                                    class="text-left"
                                >
                                    Actual
                                </th>         
                                <th 
                                    class="text-left"
                                >
                                    Deferred
                                </th>        
                                <th 
                                    class="text-left"
                                >
                                    Total
                                </th>                 
                            </tr>
                        </thead>
                        <tbody>
                            <tr            
                                v-for = "item in listBatchOtherDetails.details"                
                                class="font-size-14px"                             
                            >
                                <td>{{ item.month_name }}</td>
                                <td>{{ item.planned }}</td>   
                                <td>{{ item.actual }}</td> 
                                <td>{{ item.deferred }}</td>   
                                <td class="font-weight-bold">{{ (item.planned + item.actual + item.deferred) }}</td>                             
                            </tr>
                            <tr                      
                                class="font-size-14px"                             
                            >
                                <td class="font-weight-bold border-t-lg">Total</td>
                                <td class="font-weight-bold border-t-lg">{{ listBatchOtherDetails.totals.planned }}</td>   
                                <td class="font-weight-bold border-t-lg">{{ listBatchOtherDetails.totals.actual }}</td> 
                                <td class="font-weight-bold border-t-lg">{{ listBatchOtherDetails.totals.deferred }}</td>
                                <td class="font-weight-bold border-t-lg">{{ (listBatchOtherDetails.totals.planned + listBatchOtherDetails.totals.actual + listBatchOtherDetails.totals.deferred) }}</td>                            
                            </tr>
                        </tbody>
                    </v-table>
                </div>       
                <div 
                    v-if = "renderComponent == REPORT_TYPE_COMP_BY_LOCATION"
                    class="mt-2"
                >
                    <v-table
                        class="table-striped"
                        height="300px"
                        density="comfortable"
                    >
                        <thead
                            class="font-size-14px"
                        >
                            <tr>
                                <th 
                                    class="text-left"
                                    width="45%"                                    
                                >
                                    Month
                                </th>
                                <th 
                                    class="text-left"
                                >
                                    Planned
                                </th>
                                <th 
                                    class="text-left"
                                >
                                    Actual
                                </th>         
                                <th 
                                    class="text-left"
                                >
                                    Deferred
                                </th>
                                <th 
                                    class="text-left"
                                >
                                    Total
                                </th>                 
                            </tr>
                        </thead>
                        <tbody>
                            <tr            
                                v-for = "item in listLocationOtherDetails.details"                
                                class="font-size-14px"                             
                            >
                                <td>{{ item.quarter_name }}</td>
                                <td>{{ item.planned }}</td>   
                                <td>{{ item.actual }}</td> 
                                <td>{{ item.deferred }}</td>
                                <td class="font-weight-bold">{{ (item.planned + item.actual + item.deferred) }}</td>                            
                            </tr>
                            <tr                      
                                class="font-size-14px"                             
                            >
                                <td class="font-weight-bold border-t-lg">Total</td>
                                <td class="font-weight-bold border-t-lg">{{ listLocationOtherDetails.totals.planned }}</td>   
                                <td class="font-weight-bold border-t-lg">{{ listLocationOtherDetails.totals.actual }}</td> 
                                <td class="font-weight-bold border-t-lg">{{ listLocationOtherDetails.totals.deferred }}</td>
                                <td class="font-weight-bold border-t-lg">{{ (listLocationOtherDetails.totals.planned + listLocationOtherDetails.totals.actual + listLocationOtherDetails.totals.deferred) }}</td>                             
                            </tr>
                        </tbody>
                    </v-table>
                </div>   
                <div 
                    v-if = "renderComponent == REPORT_TYPE_COMP_BY_DEPARTMENT"
                    class="mt-2"
                >
                    <v-table
                        class="table-striped"
                        height="300px"
                        density="comfortable"
                    >
                        <thead
                            class="font-size-14px"
                        >
                            <tr>
                                <th 
                                    class="text-left"
                                    width="45%"                                    
                                >
                                    Month
                                </th>
                                <th 
                                    class="text-left"
                                >
                                    Planned
                                </th>
                                <th 
                                    class="text-left"
                                >
                                    Actual
                                </th>         
                                <th 
                                    class="text-left"
                                >
                                    Deferred
                                </th>
                                <th 
                                    class="text-left"
                                >
                                    Total
                                </th>                    
                            </tr>
                        </thead>
                        <tbody>
                            <tr            
                                v-for = "item in listDepartmentOtherDetails.details"                
                                class="font-size-14px"                             
                            >
                                <td>{{ item.quarter_name }}</td>
                                <td>{{ item.planned }}</td>   
                                <td>{{ item.actual }}</td> 
                                <td>{{ item.deferred }}</td>
                                <td class="font-weight-bold">{{ (item.planned + item.actual + item.deferred) }}</td>                         
                            </tr>
                            <tr                      
                                class="font-size-14px"                             
                            >
                                <td class="font-weight-bold border-t-lg">Total</td>
                                <td class="font-weight-bold border-t-lg">{{ listDepartmentOtherDetails.totals.planned }}</td>   
                                <td class="font-weight-bold border-t-lg">{{ listDepartmentOtherDetails.totals.actual }}</td> 
                                <td class="font-weight-bold border-t-lg">{{ listDepartmentOtherDetails.totals.deferred }}</td>
                                <td class="font-weight-bold border-t-lg">{{ (listDepartmentOtherDetails.totals.planned + listDepartmentOtherDetails.totals.actual + listDepartmentOtherDetails.totals.deferred) }}</td>                            
                            </tr>
                        </tbody>
                    </v-table>
                </div>
                <div 
                    v-if = "renderComponent == REPORT_TYPE_INVENTORY"
                    class="mt-4 scrollable-div-300px"
                >
                    <div>
                        <div class="font-size-14px">
                            <span class="font-weight-medium">Hardware:</span>
                        </div>
                        <v-table
                            class="table-striped mb-10"
                            density="comfortable"
                        >
                            <thead
                                class="font-size-14px"
                            >
                                <tr>
                                    <th 
                                        class="text-left"
                                        width="45%"                                    
                                    >
                                        Items
                                    </th>
                                    <th 
                                        class="text-left"
                                    >
                                        Approved
                                    </th>
                                    <th 
                                        class="text-left"
                                    >
                                        Not Yet Approved
                                    </th>         
                                    <th 
                                        class="text-left"
                                    >
                                        Total
                                    </th>                     
                                </tr>
                            </thead>
                            <tbody>
                                <tr            
                                    v-for = "item in listHardwareOtherDetails.details"
                                    :key="item.hw_id"          
                                    class="font-size-14px"                   
                                >
                                    <td>{{ item.hw_name }}</td>
                                    <td>{{ item.approvedCount }}</td>   
                                    <td>{{ item.disapprovedCount }}</td> 
                                    <td class="font-weight-bold">{{ item.total }}</td>                              
                                </tr>
                                <tr                      
                                    class="font-size-14px"                             
                                >
                                    <td class="font-weight-bold border-t-lg">Total</td>
                                    <td class="font-weight-bold border-t-lg">{{ listHardwareOtherDetails.totals.approvedItems }}</td>   
                                    <td class="font-weight-bold border-t-lg">{{ listHardwareOtherDetails.totals.disapprovedItems }}</td> 
                                    <td class="font-weight-bold border-t-lg">{{ listHardwareOtherDetails.totals.totalItems }}</td>                              
                                </tr>                               
                            </tbody>
                        </v-table>
                    </div>
                    <div>
                        <div class="font-size-14px">
                            <span class="font-weight-medium">Software:</span>
                        </div>
                        <v-table
                            class="table-striped mb-10"
                            density="comfortable"
                        >
                            <thead
                                class="font-size-14px"
                            >
                                <tr>
                                    <th 
                                        class="text-left"
                                        width="45%"                                    
                                    >
                                        Items
                                    </th>
                                    <th 
                                        class="text-left"
                                    >
                                        Approved
                                    </th>
                                    <th 
                                        class="text-left"
                                    >
                                        Not Yet Approved
                                    </th>         
                                    <th 
                                        class="text-left"
                                    >
                                        Total
                                    </th>                     
                                </tr>
                            </thead>
                            <tbody>
                                <tr            
                                    v-for = "item in listSoftwareOtherDetails.details"
                                    :key="item.sw_id"          
                                    class="font-size-14px"                         
                                >
                                    <td>{{ item.sw_name }}</td>
                                    <td>{{ item.approvedCount }}</td>   
                                    <td>{{ item.disapprovedCount }}</td> 
                                    <td class="font-weight-bold">{{ item.total }}</td>                              
                                </tr>
                                <tr                      
                                    class="font-size-14px"                             
                                >
                                    <td class="font-weight-bold border-t-lg">Total</td>
                                    <td class="font-weight-bold border-t-lg">{{ listSoftwareOtherDetails.totals.approvedItems }}</td>   
                                    <td class="font-weight-bold border-t-lg">{{ listSoftwareOtherDetails.totals.disapprovedItems }}</td> 
                                    <td class="font-weight-bold border-t-lg">{{ listSoftwareOtherDetails.totals.totalItems }}</td>                              
                                </tr> 
                            </tbody>
                        </v-table>
                    </div>
                    <div>
                        <div class="font-size-14px">
                            <span class="font-weight-medium">Hardware by Brand:</span>
                        </div>
                        <v-table
                            class="table-striped mb-10"
                            density="comfortable"
                        >
                            <thead
                                class="font-size-14px"
                            >
                                <tr>
                                    <th 
                                        class="text-left"
                                        width="30%"                                    
                                    >
                                        Items
                                    </th>
                                    <th 
                                        class="text-left"
                                    >
                                        Brand
                                    </th>
                                    <th 
                                        class="text-left"
                                    >
                                        Ok
                                    </th>     
                                    <th 
                                        class="text-left"
                                    >
                                        Defective
                                    </th>     
                                    <th 
                                        class="text-left"
                                    >
                                        N/A
                                    </th>    
                                    <th 
                                        class="text-left"
                                    >
                                        Total
                                    </th>                     
                                </tr>
                            </thead>
                            <tbody>
                                <tr            
                                    v-for = "item in listHardwareBrandOtherDetails"
                                    :key="`${item.hw_id}-${item.brand_id}`"          
                                    class="font-size-14px clickable-row-blue-lighten"
                                    @click="viewWorkstationsOfBrand(item.hw_id, item.brand_id, Constants.COMPONENT_TYPE_HARDWARE)"                   
                                >
                                    <td>{{ item.hw_name }}</td>
                                    <td>{{ item.brand_name }}</td>   
                                    <td>{{ item.Ok }}</td> 
                                    <td>{{ item.Defective }}</td>
                                    <td>{{ item.Na }}</td>
                                    <td class="font-weight-bold">{{ item.totalCount }}</td>                              
                                </tr>
                            </tbody>
                        </v-table>
                    </div>
                    <div>
                        <div class="font-size-14px">
                            <span class="font-weight-medium">Software by Brand:</span>
                        </div>
                        <v-table
                            class="table-striped mb-10"
                            density="comfortable"
                        >
                            <thead
                                class="font-size-14px"
                            >
                                <tr>
                                    <th 
                                        class="text-left"
                                        width="30%"                                    
                                    >
                                        Items
                                    </th>
                                    <th 
                                        class="text-left"
                                    >
                                        Brand
                                    </th>
                                    <th 
                                        class="text-left"
                                    >
                                        Ok
                                    </th>     
                                    <th 
                                        class="text-left"
                                    >
                                        Defective
                                    </th>     
                                    <th 
                                        class="text-left"
                                    >
                                        N/A
                                    </th>    
                                    <th 
                                        class="text-left"
                                    >
                                        Total
                                    </th>                     
                                </tr>
                            </thead>
                            <tbody>
                                <tr            
                                    v-for = "item in listSoftwareBrandOtherDetails"
                                    :key="`${item.sw_id}-${item.brand_id}`"          
                                    class="font-size-14px clickable-row-blue-lighten"
                                    @click="viewWorkstationsOfBrand(item.sw_id, item.brand_id, Constants.COMPONENT_TYPE_SOFTWARE)"                      
                                >
                                    <td>{{ item.sw_name }}</td>
                                    <td>{{ item.brand_name }}</td>   
                                    <td>{{ item.Ok }}</td> 
                                    <td>{{ item.Defective }}</td>
                                    <td>{{ item.Na }}</td>
                                    <td class="font-weight-bold">{{ item.totalCount }}</td>                              
                                </tr>
                            </tbody>
                        </v-table>
                    </div>
                </div>       
            </v-sheet>
        </v-col>
        <v-col
            cols="12"
            xl="6"
            lg="6"
            md="6"
            sm="12"
            xs="12"
        >
            <div>
                <v-autocomplete
                    clearable
                    variant="underlined"
                    density="comfortable"
                    label="Report Type"
                    v-model="reportType"
                    item-title="reportType"
                    item-value="reportType_id"
                    :items="listOfReportType"
                    :error="errorReportTypeValidationParams.isError"
                    :error-messages="errorReportTypeValidationParams.errorMessage"
                >
                </v-autocomplete>
                <v-autocomplete
                    v-if="reportType == REPORT_TYPE_COMP_BY_BATCH || reportType == REPORT_TYPE_COMP_BY_DEPARTMENT || reportType == REPORT_TYPE_COMP_BY_LOCATION || reportType == REPORT_TYPE_INVENTORY"
                    clearable
                    variant="underlined"
                    density="comfortable"
                    label="Year"
                    v-model="year"
                    item-title="sched_year"
                    item-value="sched_id"
                    :items="listOfYear"
                    :error="errorYearValidationParams.isError"
                    :error-messages="errorYearValidationParams.errorMessage"
                >
                </v-autocomplete>
                <v-autocomplete
                    v-if="reportType == REPORT_TYPE_COMP_BY_BATCH"
                    clearable
                    variant="underlined"
                    density="comfortable"
                    label="Monthly Batch"
                    v-model="batch"
                    item-title="name"
                    item-value="id"
                    :items="Constants.arrOfMonthlyBatch"
                    :error="errorMonthlyBatchValidationParams.isError"
                    :error-messages="errorMonthlyBatchValidationParams.errorMessage"
                >
                </v-autocomplete>
                <v-autocomplete
                    v-if="reportType == REPORT_TYPE_COMP_BY_LOCATION"
                    clearable
                    chips
                    multiple
                    variant="underlined"
                    density="comfortable"
                    label="Location"
                    v-model="location"
                    item-title="location_name"
                    item-value="location_id"
                    :items="listLocations"
                    :error="errorLocationValidationParams.isError"
                    :error-messages="errorLocationValidationParams.errorMessage"
                >
                </v-autocomplete>
                <v-autocomplete
                    v-if="reportType == REPORT_TYPE_INVENTORY"
                    clearable
                    chips
                    multiple
                    return-object
                    variant="underlined"
                    density="comfortable"
                    label="Components"
                    v-model="items"
                    item-title="description"
                    :items="listComponents"
                    :error="errorDateInventoryValidationParams.isError"
                    :error-messages="errorDateInventoryValidationParams.errorMessage"
                >
                </v-autocomplete>
                <v-autocomplete
                    v-if="reportType == REPORT_TYPE_COMP_BY_DEPARTMENT"
                    clearable
                    variant="underlined"
                    density="comfortable"
                    label="Department"
                    v-model="department_id"
                    item-title="dept_name"
                    item-value="id"
                    :items="listOfDepartment"
                    :error="errorDepartmentValidationParams.isError"
                    :error-messages="errorDepartmentValidationParams.errorMessage"
                >
                </v-autocomplete>
                <v-row
                    v-if="reportType == REPORT_TYPE_INVENTORY"
                >
                    <v-col
                        v-if="errorMonthsInterchangeValidationParams.isError"
                        cols="12"
                    >
                        <p
                            class="font-size-12px ms-n2 mt-1 text-red"
                        >
                            {{ errorMonthsInterchangeValidationParams.errorMessage }}
                        </p>
                    </v-col>
                    <v-col
                        cols="12"
                        xl="6"
                        lg="6"
                        md="6"
                        sm="12"
                        xs="12"
                    >
                        <v-select
                            clearable
                            variant="underlined"
                            density="comfortable"
                            label="From (Month)"
                            v-model="fromMonth"
                            item-title="name"
                            item-value="id"
                            :items="Constants.arrOfFullNameMonths"
                            :error="errorFromDateValidationParams.isError"
                            :error-messages="errorFromDateValidationParams.errorMessage"
                        >
                        </v-select>
                    </v-col>
                    <v-col
                        cols="12"
                        xl="6"
                        lg="6"
                        md="6"
                        sm="12"
                        xs="12"
                    >
                        <v-select
                            clearable
                            variant="underlined"
                            density="comfortable"
                            label="To (Month)"
                            v-model="toMonth"
                            item-title="name"
                            item-value="id"
                            :items="Constants.arrOfFullNameMonths"
                            :error="errorToDateValidationParams.isError"
                            :error-messages="errorToDateValidationParams.errorMessage"
                        >
                        </v-select>
                    </v-col>
                </v-row>
            </div>
            <div class="d-flex flex-row-reverse">
                <v-btn
                    class="font-weight-bold bg-blue-lighten-1"
                    variant="elevated"
                    :loading="isButtonLoading"
                    @click="generateReport"
                >
                    Generate Report
                </v-btn>
                <v-btn
                    v-if="new_result != null"
                    class="font-weight-bold bg-blue-lighten-1 me-2"
                    variant="elevated"
                    @click="exportToExcel(listBatchOtherDetails, new_result, imageIconBase64)"
                >
                    Export Report
                </v-btn>
            </div>
        </v-col>
    </v-row>

    <ReportMonthlyBatchComputersGraph 
        v-show="renderComponent == REPORT_TYPE_COMP_BY_BATCH"
        :batch="monthly_batch"
        :result="new_result"
        :isActive="renderComponent == REPORT_TYPE_COMP_BY_BATCH"
    />
    <ReportMonthlyLocationComputerGraph 
        v-show="renderComponent == REPORT_TYPE_COMP_BY_LOCATION"
        :result="new_result"
        :isActive="renderComponent == REPORT_TYPE_COMP_BY_LOCATION"
    />
    <ReportDepartmentComputerGraph 
        v-show="renderComponent == REPORT_TYPE_COMP_BY_DEPARTMENT"
        :result="new_result"
        :isActive="renderComponent == REPORT_TYPE_COMP_BY_DEPARTMENT"
    />
    <ReportInventoryGraph 
        v-show="renderComponent == REPORT_TYPE_INVENTORY"
        :result="new_result"
        :isActive="renderComponent == REPORT_TYPE_INVENTORY"
    />

    <!-- ************* Dialogs ************* -->
    <v-dialog
        v-model="isShowBrandWorkstationsDialog"
        width="75%"
        :persistent="isButtonLoading"
    >
        <v-card 
            class="pa-5"
        >
            <v-card-title
                class="font-weight-medium d-flex"
                tag="div"
            >
                <div 
                    class="d-inline"
                >
                    View Workstations
                </div>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
                <v-container>
                    <v-row>
                        <v-col
                            cols="12"
                        >
                            <div
                                class="d-flex justify-space-evenly flex-wrap font-size-16px ms-n2"
                            >
                                <div>
                                    Type:
                                    <span class="font-size-14px ms-1 font-weight-bold">{{ workstationDetailsBrandHeader.type }}</span>
                                </div>
                                <div>
                                    Component: 
                                    <span class="text-blue-darken-3 font-size-14px ms-1 font-weight-bold">{{ workstationDetailsBrandHeader.component }}</span>
                                </div>
                                <div>
                                    Brand:
                                    <span class="font-size-14px ms-1 font-weight-bold">{{ workstationDetailsBrandHeader.brand_name }}</span>
                                </div>
                            </div>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-spacer
                            class="mb-3"
                        >
                        </v-spacer>
                    </v-row>
                    <v-row>    
                        <v-col
                            cols="12"
                            class="search-container"
                        >
                            <v-table
                                class="table-striped"                                
                                fixed-header
                                height="250px"
                                density="comfortable"
                            >
                                <thead
                                    class="font-size-14px"
                                >
                                    <tr>
                                        <th class="text-left text-black" width="5%">
                                            Id
                                        </th>
                                        <th class="text-left text-black" width="21%">
                                            Name
                                        </th>
                                        <th class="text-left text-black" width="19%">
                                            Computer
                                        </th>
                                        <th class="text-left text-black" width="21%">
                                            Location
                                        </th>
                                        <th class="text-left text-black" width="14%">
                                            Month
                                        </th>
                                        <th class="text-center text-black" width="5%">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr
                                        v-for="item in listOfWorkstationDetails"
                                        class="font-size-14px"
                                        :key="item.wsq_id"
                                    >
                                        <td>{{ item.wsq_id }}</td>
                                        <td>{{ item.ws_userName }}</td>
                                        <td>{{ item.ws_computerName }}</td>
                                        <td>{{ item.location_name }}</td>
                                        <td>{{ item.month_name }}</td>
                                        <td>
                                            <v-btn 
                                                class="font-weight-bold bg-blue-lighten-1 me-2"
                                                variant="elevated"
                                                density="comfortable"
                                                prepend-icon="mdi-eye"
                                                @click="router.push(`/WorkstationDetails/${item.wsq_id}`);"
                                            >
                                            View
                                            </v-btn>
                                        </td>
                                    </tr>                                   
                                </tbody>
                            </v-table>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    :loading="isButtonLoading"
                    class="font-weight-bold"
                    color="grey-darken-4 me-5"
                    variant="outlined"
                    @click="isShowBrandWorkstationsDialog = false"
                >
                    Close
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

</template>

<style scoped>
    .search-container {
        border: solid 2px rgb(236, 232, 232);
        border-radius: 5px;
    }

    .v-date-picker {
        width: 100%;
    }

    .min-height-sheet {
        min-height: 200px;
    }

    .scrollable-div-300px {
      max-height: 300px;
      overflow-y: auto;
    }
</style>