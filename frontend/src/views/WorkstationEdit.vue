<script setup>
    import { ref, reactive, onMounted, watch, computed } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import { useUserStore } from '@/stores/user';
    import { useUtilStore } from '@/stores/util';
    import { storeToRefs } from 'pinia';
    import moment from 'moment/moment'
    import Constants from '../globals';
    import axios from 'axios';
    import * as Util from '../helpers/helper';
    import { decryptData } from '../helpers/encryptUtil'
    import WorkstationRowForm from '../components/WorkstationRowForm.vue';
    import SystemComponentForm from '../components/SystemComponentForm.vue';
    import ChecklistItemsForm from '../components/ChecklistItemsForm.vue';
    import ConductConfirmationDialog from '../components/ConductConfirmationDialog.vue';
    import { QuillEditor } from '@vueup/vue-quill'
    import '@vueup/vue-quill/dist/vue-quill.snow.css';

    //Variables
    var currentMonth = 0;
    const route = useRoute();
    const router = useRouter();
    const wsq_id = route.params.id;
    const userStore = useUserStore();
    const utilStore = useUtilStore();
    const { customDialog } = storeToRefs(utilStore);
    const { user } = storeToRefs(userStore);

    //Local Constants
    const COMMENT_LENGTH = 255;
    const standardRule = [
                            v => !!v || 'Please enter the required item'
                        ];
    const resolutionGuidelines = {
        1: "Complete is a resolution where the workstation has been approved and completed, therefore the data will carry over to the next quarter with the same owner and PC hardware.",
        2: "Condemned is a resolution where the workstation is condemned and its data will not carry over to the next quarter, therefore the PC hardware can't be used anymore or assigned with a user in the future.",
        3: "Transferred is a resolution where the workstation is transferred and its data will not carry over to the next quarter, therefore the PC hardware has been detached from its previous owner and can be assigned to another user in the future.",
        4: "Deferred is a resolution where the workstation is deferred and its data will still carry over to the next quarter. The data will retain with the same owner and PC hardware",
        5: "Dropped is a resolution where the workstation is dropped. This is mostly used if the data is already abandoned or closed, and cannot be used on the current month. The data will retain with the same owner and PC hardware"
    }
    
    //Model Values
    const counterNewItem = ref(0);                                  //Used to create fake ID for newly created items that are not yet saved for editing purposes
    const comment = ref(null);
    const currentItemToUpdate = ref(null);
    const currentItemToDelete = ref(null);
    const errorAddHardwareOthersValidationParams = reactive({
        isError: false,
        errorMessage: ""
    });
    const errorAddSoftwareOthersValidationParams = reactive({
        isError: false,
        errorMessage: ""
    });
    const errorCommentEditorValidationParams = reactive({
        isError: false,
        errorMessage: ""
    });
    const hasStatusOfNullOnHardware = ref(false);
    const hasStatusOfNullOnSoftware = ref(false);
    const hasStatusOfNullOnResolution = ref(false);
    const hasConducted = ref(false);
    const isCommentEdit = ref(false);
    const isButtonLoading = ref(false);
    const isRemarksEmpty = ref(false);
    const isUiLock = ref(false);
    const listBrand = ref([]);
    const listComments = ref([]);
    const listHardware = ref([]);
    const listSoftware = ref([]);
    const listChecklistItems = ref([]);
    const listSystemComponent = ref([]);
    const listToBeAddedChecklistItems = ref([]);
    const listToBeAddedSystemComponent = ref([]);
    const facaCreateForm = ref(null);
    const formData = reactive({
        wsq_id: Number(wsq_id),
        hardwareForm: [],
        softwareForm: [],
        checklistForm: [],
        facaForm: [],
        wsq_status: "",
        wsq_remarks: "",
        wsq_resolution: null
    });
    const newFacaData = reactive({
        faca_date: null,
        faca_findings: null,
        faca_recommendation: null,
        faca_ticketNum: null
    })
    const newHardwareName = ref(null);
    const newSoftwareName = ref(null);
    const quillEditor = ref(null);
    const resolutionGuidelineDescription = ref("");
    const showAddHardwareDialog = ref(false);
    const showSystemComponentDialog = ref(false);
    const showChecklistItemsDialog = ref(false);
    const showAddSoftwareDialog = ref(false);
    const showAddFacaDialog = ref(false);
    const showSubmitDialog = ref(false);
    const showRefreshHardwareDialog = ref(false);
    const showRefreshSoftwareDialog = ref(false);
    const showInternalCommentDialog = ref(false);
    const showDeleteConfirmationCommentDialog = ref(false);
    const systemCompDialogElements = reactive({
        title: "",
        type: 0
    });
    const workstationQuarterlyAuditTrail = ref(null);
    const wsqDetails = ref(null);
    
    //Built-in Functions
    onMounted( async() => {
        if(decryptData(user.value, Constants.USER_SECRET_KEY) === null){
            await userStore.logout();
        } else {
           await fetchData();
        }

       utilStore.setPageLoading({pIsPageLoading: false});
    });

    const quillEditorInstance = computed(() => {
        return quillEditor.value ? quillEditor.value : null
    });

    watch(() => showAddHardwareDialog.value, (newValue, oldValue) => {
        if(newValue == false){
            clear();
        }
    });

    watch(() => showAddSoftwareDialog.value, (newValue, oldValue) => {
        if(newValue == false){
            clear();
        }
    });

    watch(() => showAddFacaDialog.value, (newValue, oldValue) => {
        if(newValue == false){
            clear();
        }
    });

    watch(() => showInternalCommentDialog.value, (newValue, oldValue) => {
        if(newValue == false){
            clearAllCommentDialogData();
        }
    });

    watch(() => showSubmitDialog.value, (newValue, oldValue) => {
        if(newValue == false){
            hasStatusOfNullOnHardware.value = false;
            isRemarksEmpty.value = false;
            hasStatusOfNullOnSoftware.value = false;
            hasStatusOfNullOnResolution.value = false;
        }
    });

    watch(() => customDialog.value.showDialog, (newValue, oldValue) => {
        if(newValue == false){
            customDialog.value.showDialog = false;
            router.push(`/WorkstationDetails/${wsq_id}`);
        }
    });

    watch(() => formData.wsq_resolution, (newValue, oldValue) => {
        if(newValue != undefined && newValue != null){
            resolutionGuidelineDescription.value = resolutionGuidelines[newValue];
        } else {
            resolutionGuidelineDescription.value = Constants.N_A;
        }
    });

    //User-defined Functions
    const fetchData = async() => {
        await getDepartmentWorkstationQuarterlyDetailsByWsqId();
        await getListOfHardware();
        await getListOfSoftware();
        await getListOfFacaByWsqId();
        await getListOfBrand();
        await getListOfComment();
        await getWorkstationQuarterlyAuditTrail();
        await getWorkstationQuarterlyChecklistItems();
        setUiValues();
    }

    const setUiValues = () => {
        currentMonth = moment().month() + 1;
        let currentYear = moment().year();

        //Can't edit if the scheduled month is not the current month or previous month of the year scheduled
        if(currentYear == wsqDetails.value.sched_year){
            if(currentMonth < wsqDetails.value.quarter_monthlyQuarter){
                isUiLock.value = true;
            } else {
                isUiLock.value = false;
            }
        } else {
            isUiLock.value = true;
        }

        /* UNCOMMENT THESE CODES IF YOU WANT TO TEST */
        // isUiLock.value = false;

        if(wsqDetails.value.wsq_hasConducted == true || wsqDetails.value.wsq_status == Constants.WSQ_STATUS_COMPLETE){
            hasConducted.value = true;
        }
    }

    const getDepartmentWorkstationQuarterlyDetailsByWsqId = async () => {
        var data = {
            wsq_id: wsq_id
        };

        const params = new URLSearchParams(data);
        var result = await axios.get(`/getDepartmentWorkstationQuarterlyDetailsByWsqId?${params}`);

        wsqDetails.value = result.data.data[0];
        formData.wsq_resolution = result.data.data[0].wsq_resolution;
        formData.wsq_remarks = result.data.data[0].wsq_remarks;
    }; 

    const getListOfHardware = async () => {
        var data = {
            qtyhard_wsqId: wsq_id
        };

        const params = new URLSearchParams(data)
        var result = await axios.get(`/getListOfWsHardwareDetailsByWsqId?${params}`);

        listHardware.value = result.data.data;
        formData.hardwareForm = listHardware.value;
    }; 

    const addNewListedHardwareInFormData = () => {
        var tempListOfHardware = [];
        
        for(var item of listHardware.value){
            let data = formData.hardwareForm.find(hardware => item.qtyhard_hwId == hardware.qtyhard_hwId);
            
            if(data == undefined){
                tempListOfHardware.push(item);
            }
        }

        formData.hardwareForm = [
            ...tempListOfHardware,
            ...formData.hardwareForm
        ];
    }; 

    const addNewListedSoftwareInFormData = () => {
        var tempListOfSoftware = [];
        
        for(var item of listSoftware.value){
            let data = formData.softwareForm.find(software => item.qtysoft_swId == software.qtysoft_swId);
            
            if(data == undefined){
                tempListOfSoftware.push(item);
            }
        }

        formData.softwareForm = [
            ...tempListOfSoftware,
            ...formData.softwareForm
        ];
    }; 

    const getListOfSoftware = async () => {
        var data = {
            qtysoft_wsqId: wsq_id
        };
        
        const params = new URLSearchParams(data)
        var result = await axios.get(`/getListOfWsSoftwareDetailsByWsqId?${params}`);

        listSoftware.value = result.data.data;
        formData.softwareForm = listSoftware.value;
    }; 

    const getListOfFacaByWsqId = async () => {
        var data = {
            faca_wsqId: wsq_id
        };
        
        const params = new URLSearchParams(data)
        var result = await axios.get(`/getListOfFacaByWsqId?${params}`);

        formData.facaForm = result.data.data;
    };     

    const getListOfBrand = async () => {
        var data = {
            brand_isActive: Constants.ACTIVE_TRUE
        };
        
        const params = new URLSearchParams(data)

        var result = await axios.get(`/getListOfBrandByStatus?${params}`);
        listBrand.value = result.data.data;
    }; 

    const getListOfComment = async () => {
        var data = {
            ic_wsqId: wsq_id
        };
        
        const params = new URLSearchParams(data)

        var result = await axios.get(`/getListOfCommentsByWsqId?${params}`);
        listComments.value = result.data.data;
    }; 

    const onChangeHardwareFormData = (hwFormData) => {
        var index = formData.hardwareForm.findIndex(item => item.qtyhard_hwId == hwFormData.id);

        if(index !== -1){
            formData.hardwareForm[index].qtyhard_status = hwFormData.status;
            formData.hardwareForm[index].qtyhard_brandId = hwFormData.brand;
            formData.hardwareForm[index].qtyhard_remarks = hwFormData.remarks;
        }
    }

    const onChangeUpdateSystemComponentList = (listOfSystemComponent) => {
        listToBeAddedSystemComponent.value = listOfSystemComponent.listForm;
    }

    const onChangeUpdateChecklist = (listOfChecklistItem) => {
        listToBeAddedChecklistItems.value = listOfChecklistItem.listForm;
    }

    const addNewSystemComponentsInWsq = async() => {
        if(listToBeAddedSystemComponent.value.length === 0){
            showSystemComponentDialog.value = false;
            return;
        }

        switch(systemCompDialogElements.type){
            case Constants.DIALOG_SYSCOMP_HARDWARE: {
                var data = {
                    wsq_id: wsq_id,
                    hardwareList: listToBeAddedSystemComponent.value
                };

                let result = await axios.post("/addQtyHardwarePlaceholdersCustomListIndex", data);

                if(result.data.data.length != 0){
                    listHardware.value = [
                        ...listHardware.value,
                        ...result.data.data
                    ];
                    
                    addNewListedHardwareInFormData();
                }

                showSystemComponentDialog.value = false;
            }break;
            case Constants.DIALOG_SYSCOMP_SOFTWARE: {
                var data = {
                    wsq_id: wsq_id,
                    softwareList: listToBeAddedSystemComponent.value
                };

                let result = await axios.post("/addQtySoftwarePlaceholdersCustomListIndex", data);

                if(result.data.data.length != 0){
                    listSoftware.value = [
                        ...listSoftware.value,
                        ...result.data.data
                    ];
                    
                    addNewListedSoftwareInFormData();
                }

                showSystemComponentDialog.value = false;
            }break;
        }
    }

    const addNewChecklistItemsInWsq = async() => {
        if(listToBeAddedChecklistItems.value.length === 0){
            showChecklistItemsDialog.value = false;
            return;
        }

        var data = {
            wsq_id: wsq_id,
            checklistItems: listToBeAddedChecklistItems.value
        };

        let result = await axios.post("/addQtyChecklistItemsPlaceholdersCustomListIndex", data);

        if(result.data.data.length != 0){
            addNewListedChecklistItemsInFormData(result.data.data);
        }

        showChecklistItemsDialog.value = false;
    }

    const addNewListedChecklistItemsInFormData = (addedChecklistItems) => {
        var tempListOfChecklistItems = [];
        
        for(var item of addedChecklistItems){
            let data = formData.checklistForm.find(checklistItem => item.qtychk_chkId == checklistItem.qtychk_chkId);
            
            if(data == undefined){
                tempListOfChecklistItems.push(item);
            }
        }

        formData.checklistForm = [
            ...tempListOfChecklistItems,
            ...formData.checklistForm
        ];
    };

    const getWorkstationQuarterlyAuditTrail = async () => {
        var data = {
            audit_wsqId: wsq_id
        };
        
        const params = new URLSearchParams(data)
        var result = await axios.get(`/getWorkstationQuarterlyAuditTrail?${params}`);

        workstationQuarterlyAuditTrail.value = result.data.data;
    };

    const getWorkstationQuarterlyChecklistItems = async () => {
        var data = {
            qtychk_wsqId: wsq_id
        };
        
        const params = new URLSearchParams(data)
        var result = await axios.get(`/getWorkstationQuarterlyChecklistItemsByWsqId?${params}`);

        formData.checklistForm = result.data.data;
    };

    const onRemoveOtherHardwareData = async(index) => {
        if(await isQuarterlyWorkstationEditable() == false){
            utilStore.setSnackBar({
                showModal: true,
                modalDescription: "Workstation can't be edited anymore. Please refresh the page"
            });
            return;
        }

        if(!listHardware.value[index].hw_isNew){
            //Delete it first from the db            
            let result = await axios.delete(`/deleteAndCheckWorkstationOtherHardware/${listHardware.value[index].hw_id}/${wsq_id}`);
            
            if(result.data.status == Constants.STATUS_CODE_SUCCESS){
                utilStore.setSnackBar({
                    showModal: true,
                    modalDescription: result.data.message
                });
            } else {
                utilStore.setSnackBar({
                    showModal: true,
                    modalDescription: result.data.message
                });
            }
        } else if(listHardware.value[index].hasOwnProperty('hw_isNew')){
            utilStore.setSnackBar({
                showModal: true,
                modalDescription: "Successfully deleted the hardware in the checklist"
            });
        }

        listHardware.value.splice(index, 1);
    }

    const onRemoveExistHardwareData = async(index) => {
        if(await isQuarterlyWorkstationEditable() == false){
            utilStore.setSnackBar({
                showModal: true,
                modalDescription: "Workstation can't be edited anymore. Please refresh the page"
            });
            return;
        }
        
        var data = listHardware.value[index];
        let result = await axios.delete(`/deleteQtyWsHardwareById/${data.qtyhard_id}`);

        if(result.data.status == Constants.STATUS_CODE_SUCCESS){
            listHardware.value.splice(index, 1);

            let formDataHardwareIndex = formData.hardwareForm.findIndex(hardware => data.qtyhard_id == hardware.qtyhard_id);

            if(formDataHardwareIndex !== -1){
                formData.hardwareForm.splice(formDataHardwareIndex, 1);
            }

            utilStore.setSnackBar({
                showModal: true,
                modalDescription: result.data.message
            });
        } else {
            utilStore.setSnackBar({
                showModal: true,
                modalDescription: result.data.message
            });
        }
    }

    const onRemoveExistSoftwareData = async(index) => {
        if(await isQuarterlyWorkstationEditable() == false){
            utilStore.setSnackBar({
                showModal: true,
                modalDescription: "Workstation can't be edited anymore. Please refresh the page"
            });
            return;
        }

        var data = listSoftware.value[index];
        let result = await axios.delete(`/deleteQtyWsSoftwareById/${data.qtysoft_id}`);

        if(result.data.status == Constants.STATUS_CODE_SUCCESS){
            listSoftware.value.splice(index, 1);

            let formDataSoftwareIndex = formData.softwareForm.findIndex(software => data.qtysoft_id == software.qtysoft_id);
            
            if(formDataSoftwareIndex !== -1){
                formData.softwareForm.splice(formDataSoftwareIndex, 1);
            }

            utilStore.setSnackBar({
                showModal: true,
                modalDescription: result.data.message
            });
        } else {
            utilStore.setSnackBar({
                showModal: true,
                modalDescription: result.data.message
            });
        }
    }

    const onRemoveOtherSoftwareData = async(index) => {
        if(await isQuarterlyWorkstationEditable() == false){
            utilStore.setSnackBar({
                showModal: true,
                modalDescription: "Workstation can't be edited anymore. Please refresh the page"
            });
            return;
        }

        if(!listSoftware.value[index].sw_isNew){
            //Delete it first from the db            
            let result = await axios.delete(`/deleteAndCheckWorkstationOtherSoftware/${listSoftware.value[index].sw_id}/${wsq_id}`);
            
            if(result.data.status == Constants.STATUS_CODE_SUCCESS){
                utilStore.setSnackBar({
                    showModal: true,
                    modalDescription: result.data.message
                });
            } else {
                utilStore.setSnackBar({
                    showModal: true,
                    modalDescription: result.data.message
                });
            }
        } else if(listSoftware.value[index].hasOwnProperty('sw_isNew')){
            utilStore.setSnackBar({
                showModal: true,
                modalDescription: "Successfully deleted the software in the checklist"
            });
        }

        listSoftware.value.splice(index, 1);
    }

    const onRemoveChecklistItemData = async(qtychk_id) => {
        if(await isQuarterlyWorkstationEditable() == false){
            utilStore.setSnackBar({
                showModal: true,
                modalDescription: "Workstation can't be edited anymore. Please refresh the page"
            });
            return;
        }

        var data = formData.checklistForm.find(item => item.qtychk_id == qtychk_id);

        let result = await axios.delete(`/deleteQtyWsChecklistItemByWsqIdAndId/${data.qtychk_id}/${wsq_id}`);

        if(result.data.status == Constants.STATUS_CODE_SUCCESS){
            let formDataChecklistItemIndex = formData.checklistForm.findIndex(item => data.qtychk_id == item.qtychk_id);
            
            if(formDataChecklistItemIndex !== -1){
                formData.checklistForm.splice(formDataChecklistItemIndex, 1);
            }

            utilStore.setSnackBar({
                showModal: true,
                modalDescription: result.data.message
            });
        } else {
            utilStore.setSnackBar({
                showModal: true,
                modalDescription: result.data.message
            });
        }
    }

    const onChangeSoftwareFormData = (swFormData) => {
        var index = formData.softwareForm.findIndex(item => item.qtysoft_swId == swFormData.id);

        if(index !== -1){
            formData.softwareForm[index].qtysoft_status = swFormData.status;
            formData.softwareForm[index].qtysoft_brandId = swFormData.brand;
            formData.softwareForm[index].qtysoft_remarks = swFormData.remarks;
        }
    }

    const onChangeStartConducting = async(willStartConducting) => {
        if(willStartConducting == true){
            let data = {
                wsq_hasConducted: willStartConducting,
                wsq_id: wsq_id
            };

            let hasConductUpdated = await updateWsqHasConducted(data);

            if(hasConductUpdated == Constants.STATUS_CODE_SUCCESS){
                await refreshDataAndUpdateConductedVariable(true);
            }
        } else {
            await refreshDataAndUpdateConductedVariable(true);
        }
    }

    const refreshDataAndUpdateConductedVariable = async(_hasConducted) => {
        hasConducted.value = _hasConducted;

        await fetchData();
    }

    const addFaca = async() => {
        if(await isQuarterlyWorkstationEditable() == false){
            utilStore.setSnackBar({
                showModal: true,
                modalDescription: "Workstation can't be edited anymore. Please refresh the page"
            });
            return;
        }

       const { valid } = await facaCreateForm.value.validate();
       const validate = await facaCreateForm.value.validate();

       if(valid){
            formData.facaForm.push({
                faca_date: Util.getCurrentDateAndTime(),
                faca_findings: newFacaData.faca_findings,
                faca_recommendation: newFacaData.faca_recommendation,
                faca_ticketNum: newFacaData.faca_ticketNum,
                faca_isNew: true    //Distinguishes that the Faca is new and not yet recorded from the DB as there are other Faca that are already in the DB
            });

            showAddFacaDialog.value = false;
       }
    }

    const removeFaca = async(faca, index) => {
        if(await isQuarterlyWorkstationEditable() == false){
            utilStore.setSnackBar({
                showModal: true,
                modalDescription: "Workstation can't be edited anymore. Please refresh the page"
            });
            return;
        }
        
        if(!faca.faca_isNew){
            //Delete it first from the db            
            let result = await axios.delete(`/deleteFaca/${faca.faca_id}`);

            if(result.data.status == Constants.STATUS_CODE_SUCCESS){
                utilStore.setSnackBar({
                    showModal: true,
                    modalDescription: result.data.message
                });
            } else {
                utilStore.setSnackBar({
                    showModal: true,
                    modalDescription: result.data.message
                });
            }
        } else if(faca.hasOwnProperty('faca_isNew')){
            utilStore.setSnackBar({
                showModal: true,
                modalDescription: "Successfully deleted the faca in the checklist"
            });
        }

        formData.facaForm.splice(index, 1);
    }

    const addNewHardware = async() => {
        if(await isQuarterlyWorkstationEditable() == false){
            utilStore.setSnackBar({
                showModal: true,
                modalDescription: "Workstation can't be edited anymore. Please refresh the page"
            });
            return;
        }

        if(newHardwareName.value !== null && newHardwareName.value !== ""){
            var fake_id = moment().format('YYYYMMDDHHmmss') + counterNewItem.value++;

            listHardware.value.push({
                hw_id: fake_id,
                hw_name: newHardwareName.value,
                hw_description: newHardwareName.value,
                hw_isActive: true,
                hw_isNew: true,
                hw_isOthers: true,
                qtyhard_brandId: null,
                qtyhard_hwId: fake_id,
                qtyhard_id: fake_id,
                qtyhard_status: null,
                qtyhard_remarks: null,
                qtyhard_wsqId: wsq_id
            });

            showAddHardwareDialog.value = false;
            clear();
        } else {
            errorAddHardwareOthersValidationParams.isError = true;
            errorAddHardwareOthersValidationParams.errorMessage = "Please enter the required item"
        }
    }

    const addNewSoftware = async() => {
        if(await isQuarterlyWorkstationEditable() == false){
            utilStore.setSnackBar({
                showModal: true,
                modalDescription: "Workstation can't be edited anymore. Please refresh the page"
            });
            return;
        }

        if(newSoftwareName.value !== null && newSoftwareName.value !== ""){
            var fake_id = moment().format('YYYYMMDDHHmmss') + counterNewItem.value++;

            listSoftware.value.push({
                sw_id: fake_id,
                sw_name: newSoftwareName.value,
                sw_description: newSoftwareName.value,
                sw_isActive: true,
                sw_isNew: true,
                sw_isOthers: true,
                qtysoft_brandId: null,
                qtysoft_swId: fake_id,
                qtysoft_id: fake_id,
                qtysoft_status: null,
                qtysoft_remarks: null,
                qtysoft_wsqId: wsq_id
            });

            showAddSoftwareDialog.value = false;
            clear();
        } else {
            errorAddSoftwareOthersValidationParams.isError = true;
            errorAddSoftwareOthersValidationParams.errorMessage = "Please enter the required item"
        }   
    }

    const changeValuesBeforeSaving = () => {
        formData.wsq_remarks = formData.wsq_remarks == "" ? null : formData.wsq_remarks;
    }

    const updateQuarterlyWorkstation = async() => {
        if(await isQuarterlyWorkstationEditable() == false){
            utilStore.setSnackBar({
                showModal: true,
                modalDescription: "Workstation can't be edited anymore. Please refresh the page"
            });
            return;
        }

        changeValuesBeforeSaving();

        formData.wsq_status = Constants.WSQ_STATUS_PENDING;

        isButtonLoading.value = true;

        let result = await axios.put("/updateQuarterlyWorkstation", formData);

        if(result.data.status == Constants.STATUS_CODE_SUCCESS){
            utilStore.setSnackBar({
                showModal: true,
                modalDescription: result.data.message
            });

            await fetchData();
        } else {
            logger.error("Error in Updating a quarterly workstation", logger.createErrorContext("update-workstation", result.data.message));
            utilStore.setSnackBar({
                showModal: true,
                modalDescription: result.data.message
            });
        }

        isButtonLoading.value = false;
    }

    const updateConductedByWsqId = async(_data) => {
        let result = await axios.put("/updateConductedByWsqId", _data);

        if(result.data.status != Constants.STATUS_CODE_SUCCESS){
            utilStore.setSnackBar({
                showModal: true,
                modalDescription: result.data.message
            })
        } 

        return result.data.status;
    }

    const updateWsqHasConducted = async(_data) => {
        let result = await axios.put("/updateWsqHasConducted", _data);

        if(result.data.status != Constants.STATUS_CODE_SUCCESS){
            utilStore.setSnackBar({
                showModal: true,
                modalDescription: result.data.message
            })
        } 

        return result.data.status;
    }    

    const updateQuarterlyWorkstationWoSnackbar = async() => {
        changeValuesBeforeSaving();

        formData.wsq_status = Constants.WSQ_STATUS_PENDING;

        isButtonLoading.value = true;

        let result = await axios.put("/updateQuarterlyWorkstation", formData);

        isButtonLoading.value = false;

        return result.data.status;
    }

    const updateStatus = async(status) => {
        if(checkFormIsIncompleteBeforeSubmission() == false){

            if(await isQuarterlyWorkstationEditable() == false){
                utilStore.setSnackBar({
                    showModal: true,
                    modalDescription: "Workstation can't be edited anymore. Please refresh the page"
                });
                return;
            }

            isButtonLoading.value = true;

            let data = {
                wsq_status: status,
                wsq_resolution: formData.wsq_resolution,
                wsq_remarks: formData.wsq_remarks,
                wsq_id: wsq_id
            };

            //Save before submission
            await updateQuarterlyWorkstationWoSnackbar();

            let result = await axios.put("/updateQuarterlyWorkstationStatusAndResolutionById", data);

            if(result.data.status == Constants.STATUS_CODE_SUCCESS){
                if(formData.wsq_resolution != Constants.WSQ_RESOLUTION_DROPPED){
                    utilStore.setCustomDialog({
                        showDialog: true,
                        modalTitle: "Update Success",
                        modalDescription: "Successfully updated the workstation."
                    });
                } else {
                    approveQuarterlyWorkstation();
                }

                showSubmitDialog.value = false;
            } else {
                logger.error("Error in Updating status of workstation quarterly", logger.createErrorContext("update-workstation-status", result.data.message));
                utilStore.setSnackBar({
                    showModal: true,
                    modalDescription: result.data.message
                });
            }
        }
    }

    const isQuarterlyWorkstationEditable = async() => {
        var params = {
            wsq_id: wsq_id
        };

        var result = await axios.get(`/getQuarterlyWorkstationOnly`, {params: params});
        var data = result.data.data[0];

        if(data.wsq_status == Constants.WSQ_STATUS_PENDING || data.wsq_status == Constants.WSQ_STATUS_DISAPPROVE){
            return true;
        } else {
            return false;
        }
    }

    const approveQuarterlyWorkstation = async() => {
        var data = {
            quarter_id: wsqDetails.value.quarter_id,
            wsq_remarks: formData.wsq_remarks,
            wsq_resolution: formData.wsq_resolution,
            wsq_wsId: wsqDetails.value.wsq_wsId,
            wsq_id: wsq_id
        };

        let result = await axios.put("/approveQuarterlyWorkstation", data);

        if(result.data.status == Constants.STATUS_CODE_SUCCESS){
            utilStore.setCustomDialog({
                showDialog: true,
                modalTitle: "Update Success",
                modalDescription: result.data.message
            });
        } else {
            logger.error("Error in Approving a quarterly workstation", logger.createErrorContext("workstation-edit-approve", result.data.message));
            utilStore.setSnackBar({
                showModal: true,
                modalDescription: result.data.message
            });
        }

        isButtonLoading.value = false;
    }

    const checkFormIsIncompleteBeforeSubmission = () => {
        if(checkResolutionInFormIsNull() == true){
            return true;
        }

        if(checkRemarksInFormIsNull() == true){
            return true;
        }

        if(formData.wsq_resolution == Constants.WSQ_RESOLUTION_COMPLETE){
            if(checkHardwareChecklistInFormIsNull() == true){
                return true;
            }
            
            if(checkSoftwareChecklistInFormIsNull() == true){
                return true;
            }
        }

        if(formData.wsq_resolution == Constants.WSQ_RESOLUTION_DROPPED && wsqDetails.value.quarter_monthlyQuarter == currentMonth){
            utilStore.setSnackBar({
                showModal: true,
                modalDescription: "\'Dropped\' cannot be set in the present month"
            });

            return true;
        }
        
        return false;
    }

    const checkRemarksInFormIsNull = () => {
        if(formData.wsq_remarks == "" || formData.wsq_remarks == null){
            isRemarksEmpty.value = true;
            return true;
        }

        isRemarksEmpty.value = false;
        return false;
    }

    const checkSoftwareChecklistInFormIsNull = () => {
        let hasSoftwareStatusNull = formData.softwareForm.some(item => item.qtysoft_status == null);

        if(hasSoftwareStatusNull == true){
            hasStatusOfNullOnSoftware.value = true;
            return true;
        }

        hasStatusOfNullOnSoftware.value = false;
        return false;
    }

    const checkHardwareChecklistInFormIsNull = () => {
        var hasHardwareStatusNull = formData.hardwareForm.some(item => item.qtyhard_status == null || item.qtyhard_brandId == null);

        if(hasHardwareStatusNull == true){
            hasStatusOfNullOnHardware.value = true;
            return true;
        }

        hasStatusOfNullOnHardware.value = false;
        return false;
    }

    const checkResolutionInFormIsNull = () => {
        if(formData.wsq_resolution == null){
            hasStatusOfNullOnResolution.value = true;
            return true;
        } 

        hasStatusOfNullOnResolution.value = false;
        return false;
    }

    const clear = () => {
        errorAddHardwareOthersValidationParams.isError = false;
        errorAddSoftwareOthersValidationParams.isError = false;
        errorAddHardwareOthersValidationParams.errorMessage = "";
        errorAddSoftwareOthersValidationParams.errorMessage = "";
        newHardwareName.value = "";
        newSoftwareName.value = "";
        newFacaData.faca_date = null;
        newFacaData.faca_findings = null;
        newFacaData.faca_recommendation = null;
        newFacaData.faca_ticketNum = null;
    }

    const refreshNewHardwareItems = async() => {
        if(await isQuarterlyWorkstationEditable() == false){
            utilStore.setSnackBar({
                showModal: true,
                modalDescription: "Workstation can't be edited anymore. Please refresh the page"
            });
            return;
        }

        isButtonLoading.value = true;
        
        let data = {
            wsq_id: wsq_id
        };

        let result = await axios.post("/createMultipleNewRefQuarterlyWsHardware", data);

        if(result.data.status == Constants.STATUS_CODE_SUCCESS){
            let hardwareData = formData.hardwareForm;

            await getListOfHardware();

            formData.hardwareForm = hardwareData;

            addNewListedHardwareInFormData();

            showRefreshHardwareDialog.value = false;

            utilStore.setSnackBar({
                showModal: true,
                modalDescription: result.data.message
            });
        } else {
            logger.error("Error in Refereshing new hardware items", logger.createErrorContext("refresh-new-hardware-items", result.data.message));
            utilStore.setSnackBar({
                showModal: true,
                modalDescription: result.data.message
            });
        }

        isButtonLoading.value = false;
    }

    const refreshNewSoftwareItems = async() => {
        if(await isQuarterlyWorkstationEditable() == false){
            utilStore.setSnackBar({
                showModal: true,
                modalDescription: "Workstation can't be edited anymore. Please refresh the page"
            });
            return;
        }

        isButtonLoading.value = true;
        
        let data = {
            wsq_id: wsq_id
        };

        let result = await axios.post("/createMultipleNewRefQuarterlyWsSoftware", data);

        if(result.data.status == Constants.STATUS_CODE_SUCCESS){
            let softwareData = formData.softwareForm;

            await getListOfSoftware();
            
            formData.softwareForm = softwareData;

            addNewListedSoftwareInFormData();

            showRefreshSoftwareDialog.value = false;

            utilStore.setSnackBar({
                showModal: true,
                modalDescription: result.data.message
            });
        } else {
            logger.error("Error in Refreshing new software items", logger.createErrorContext("refresh-new-software-items", result.data.message));
            utilStore.setSnackBar({
                showModal: true,
                modalDescription: result.data.message
            });
        }

        isButtonLoading.value = false;
    }

    const openSystemComponentDialog = async(body) => {
        listToBeAddedSystemComponent.value = [];
        systemCompDialogElements.type = 0;
        systemCompDialogElements.title = "";

        switch(body.type){
            case Constants.DIALOG_SYSCOMP_SOFTWARE: {
                systemCompDialogElements.title = "Software";
                systemCompDialogElements.type = Constants.DIALOG_SYSCOMP_SOFTWARE;
                let rawlistSystemComponent = (await getListOfMissingActiveSoftwareByWsqId()).data.data;
                let convertedListSystemComponent = rawlistSystemComponent.map(mapConvertSoftwareItemNaming);
                listSystemComponent.value = convertedListSystemComponent;
            }break;
            case Constants.DIALOG_SYSCOMP_HARDWARE: {
                systemCompDialogElements.title = "Hardware";
                systemCompDialogElements.type = Constants.DIALOG_SYSCOMP_HARDWARE;
                let rawlistSystemComponent = (await getListOfMissingActiveHardwareByWsqId()).data.data;
                let convertedListSystemComponent = rawlistSystemComponent.map(mapConvertHardwareItemNaming);
                listSystemComponent.value = convertedListSystemComponent;
            }break;
        }

        showSystemComponentDialog.value = true;
    }

    const openManageChecklistDialog = async() => {
        listToBeAddedChecklistItems.value = [];
        
        let rawlistChecklistItems = (await getListOfMissingActiveChecklistItemsByWsqId()).data.data;
        let convertedListChecklistItems = rawlistChecklistItems.map(mapConvertChecklistItemNaming);
        listChecklistItems.value = convertedListChecklistItems;

        showChecklistItemsDialog.value = true;
    }

    const mapConvertHardwareItemNaming = (item) => {
        return {
            id: item.hw_id,
            name: item.hw_name
        };
    }

    const mapConvertSoftwareItemNaming = (item) => {
        return {
            id: item.sw_id,
            name: item.sw_name
        };
    }

    const mapConvertChecklistItemNaming = (item) => {
        return {
            id: item.chk_id,
            name: item.chk_description
        };
    }

    const getListOfMissingActiveHardwareByWsqId = async() => {
        const params = {
            qtyhard_wsqId: wsq_id,
            hw_isActive: 1, //True
            hw_isOthers: 0  //False
        };

        var result = await axios.get("/getListOfMissingActiveHardwareWithOthersByWsqId", {params: params}); 

        return result;
    }

    const getListOfMissingActiveSoftwareByWsqId = async() => {
        const params = {
            qtysoft_wsqId: wsq_id,
            sw_isActive: 1, //True
            sw_isOthers: 0, //False
        };

        var result = await axios.get("/getListOfMissingActiveSoftwareWithOthersByWsqId", {params: params}); 

        return result;
    }

    const getListOfMissingActiveChecklistItemsByWsqId = async() => {
        const params = {
            qtychk_wsqId: wsq_id,
            chk_isActive: 1    //True
        };

        var result = await axios.get("/getListOfMissingActiveChecklistItemsByWsqId", {params: params}); 

        return result;
    }

    const editComment = (data) => {
        isCommentEdit.value = true;
        comment.value = data.ic_description;
        currentItemToUpdate.value = data;
    }

    const removeComment = (data) => {
        showDeleteConfirmationCommentDialog.value = true;
        currentItemToDelete.value = data;
    }

    const clearAllCommentDialogData = () => {
        comment.value = null;
        isCommentEdit.value = false;
        showDeleteConfirmationCommentDialog.value = false;
        showInternalCommentDialog.value = false;

        errorCommentEditorValidationParams.isError = false;
        errorCommentEditorValidationParams.errorMessage = "";
    }

    const clearEditComment = () => {
        comment.value = null;
        isCommentEdit.value = false;
        quillEditorInstance.value.setText('');

        errorCommentEditorValidationParams.isError = false;
        errorCommentEditorValidationParams.errorMessage = "";
    }

    const addComment = async() => {
        isButtonLoading.value = true;

        let hasError = checkhasErrorinAddingComment();

        if(!hasError){
            let data = {
                ic_wsqId: wsq_id,
                ic_description: comment.value,
                ic_createdAt: null,
                ic_createdBy: null,
                ic_createdByUsername: null,
                ic_updatedAt: null,
                ic_updatedBy: null,
                ic_updatedByUsername: null,
                ic_hasDeleted: false
            };

            let result = await axios.post("/addComment", data);

            if(result.data.status == Constants.STATUS_CODE_SUCCESS){
                utilStore.setSnackBar({
                    showModal: true,
                    modalDescription: result.data.message
                });

                clearEditComment();

                await getListOfComment();
            } else if(result.data.status == Constants.STATUS_CODE_INVALID_TOKEN){
                userStore.logout();
            } else {
                logger.error("Error in Adding a comment", logger.createErrorContext("workstation-edit-add-comment", result.data.message));
                utilStore.setSnackBar({
                    showModal: true,
                    modalDescription: result.data.message
                });
            }
        }       

        isButtonLoading.value = false;
    }

    const checkhasErrorinAddingComment = () => {
        let hasError = false;

        if(quillEditorInstance.value.getText().trim().length == 0){
            hasError = true;
            errorCommentEditorValidationParams.isError = true;
            errorCommentEditorValidationParams.errorMessage = "Please enter a comment";
        } else {
            hasError = false;
            errorCommentEditorValidationParams.isError = false;
            errorCommentEditorValidationParams.errorMessage = "";
        }

        return hasError;
    }

    const updateComment = async() => {
        let hasError = checkhasErrorinAddingComment();

        if(!hasError){
            let data = {
                ic_id: currentItemToUpdate.value.ic_id,
                ic_description: comment.value,
                ic_updatedAt: null,
                ic_updatedBy: null,
                ic_updatedByUsername: null
            };

            let result = await axios.put("/updateComment", data);

            if(result.data.status == Constants.STATUS_CODE_SUCCESS){
                utilStore.setSnackBar({
                    showModal: true,
                    modalDescription: result.data.message
                });

                clearEditComment();

                await getListOfComment();
            } else if(result.data.status == Constants.STATUS_CODE_INVALID_TOKEN){
                userStore.logout();
            } else {
                logger.error("Error in Updating a comment", logger.createErrorContext("workstation-edit-update-comment", result.data.message));
                utilStore.setSnackBar({
                    showModal: true,
                    modalDescription: result.data.message
                });
            }
        }

        isButtonLoading.value = false
    }

    const deleteComment = async() => {
        isButtonLoading.value = true;

        let result = await axios.delete(`/deleteComment/${currentItemToDelete.value.ic_id}`);

        if(result.data.status == Constants.STATUS_CODE_SUCCESS){
            showDeleteConfirmationCommentDialog.value = false;
            
            utilStore.setSnackBar({
                showModal: true,
                modalDescription: result.data.message
            });

            clearEditComment();

            await getListOfComment();
        } else if(result.data.status == Constants.STATUS_CODE_INVALID_TOKEN){
            userStore.logout();
        } else {
            utilStore.setSnackBar({
                showModal: true,
                modalDescription: result.data.message
            });
        }

        isButtonLoading.value = false;
    }

    const isChecked = (item) => {
        return item.qtychk_status == "1"
    };

    const updateCheckbox = (item, value) => {
        item.qtychk_status = value ? "1" : "0";
    };

</script>

<template>
    <v-row>
        <v-col
            class="d-flex"
            cols="12"
        >
            <div class="font-size-32px me-auto pe-5">
                <v-icon
                    class="me-1"
                    size="x-small"
                    icon="mdi-desktop-tower-monitor"
                >
                </v-icon>
                Workstation
            </div>
            <div>
                <v-btn
                    class="font-weight-bold mt-3 me-2"
                    variant="elevated"
                    color="blue-lighten-1"            
                    prepend-icon="mdi-plus"
                    @click="showInternalCommentDialog = true"
                >
                    Internal Comment
                </v-btn>
                <v-btn
                    class="font-weight-bold mt-3 me-2"
                    variant="outlined"       
                    prepend-icon="mdi-arrow-left"
                    @click="router.push(`/PmsSummary/${wsqDetails.quarter_id}`)"
                >
                    Back To Summary
                </v-btn>
            </div>
        </v-col>
        <v-col
            cols="12"
        >
            <v-divider></v-divider>
        </v-col>
        <v-col
            cols="12"
            xl="4"
            lg="4"
            md="4"
            sm="12"
            xs="12"
        >
            <div class="font-size-16px">
                <span class="font-weight-medium">Workstation Id:</span> {{ wsq_id }}
            </div>
            <div class="font-size-16px">
                <span class="font-weight-medium">Owner Name:</span> {{ (wsqDetails === null) ? Constants.N_A : wsqDetails.ws_userName }}
            </div>
            <div class="font-size-16px">
                <span class="font-weight-medium">Computer Name:</span> {{ (wsqDetails === null) ? Constants.N_A : wsqDetails.ws_computerName }}
            </div>
            <div class="font-size-16px">
                <span class="font-weight-medium">PC Hardware Name:</span> {{ (wsqDetails === null) ? Constants.N_A : wsqDetails.comp_name }}
            </div>
            <div class="font-size-16px">
                <span class="font-weight-medium">IP Type:</span> {{ (wsqDetails == null) ? Constants.N_A : Util.getIpTypeTextByIpType(wsqDetails.ws_ipType) }}
            </div>
            <div class="font-size-16px">
                <span class="font-weight-medium">IP Address:</span> {{ (wsqDetails == null) ? Constants.N_A : ((wsqDetails.ws_ipAddress === "" || wsqDetails.ws_ipAddress === null) ? Constants.N_A : wsqDetails.ws_ipAddress) }}
            </div>
        </v-col>
        <v-col
            cols="12"
            xl="4"
            lg="4"
            md="4"
            sm="12"
            xs="12"
        >
            <div class="font-size-16px">
                <span class="font-weight-medium">Year:</span> {{ (wsqDetails === null) ? Constants.N_A : wsqDetails.sched_year }}
            </div>
            <div class="font-size-16px">
                <span class="font-weight-medium">Quarter:</span> {{ (wsqDetails === null) ? Constants.N_A : Util.getQuarterTextByMonthPosition(wsqDetails.quarter_monthlyQuarter) }}
            </div>
            <div class="font-size-16px">
                <span class="font-weight-medium">Month:</span> {{ (wsqDetails === null) ? Constants.N_A : Util.getFullMonthNameByMonthPosition(wsqDetails.quarter_monthlyQuarter) }}
            </div>
        </v-col>
        <v-col
            cols="12"
            xl="4"
            lg="4"
            md="4"
            sm="12"
            xs="12"
        >
            <div class="font-size-16px">
                <span class="font-weight-medium">Location:</span> {{ (wsqDetails === null) ? Constants.N_A : wsqDetails.location_name }}
            </div>
            <div class="font-size-16px">
                <span class="font-weight-medium">Area Resided:</span> {{ (wsqDetails === null) ? Constants.N_A : ((wsqDetails.ws_location === "" || wsqDetails.ws_location === null) ? Constants.N_A : wsqDetails.ws_location) }}
            </div>
            <div class="font-size-16px">
                <span class="font-weight-medium">Status:</span> {{ (wsqDetails === null) ? Constants.N_A : Util.getWsqStatusTextByStatusId(wsqDetails.wsq_status) }}
            </div>
            <div class="font-size-16px">
                <span class="font-weight-medium">Resolution:</span> {{ (wsqDetails === null) ? Constants.N_A : Util.getWsqResolutionTextByResolutionId(wsqDetails.wsq_resolution) }}
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
            <div class="font-size-16px">
                <span class="font-weight-medium">Checked By:</span> {{ (wsqDetails === null) ? Constants.N_A : (wsqDetails.wsq_checkedByUserName === null || wsqDetails.wsq_checkedByUserName === "") ? Constants.N_A : wsqDetails.wsq_checkedByUserName }}
            </div>
            <div class="font-size-16px">
                <span class="font-weight-medium">Last Date Checked:</span> {{ (wsqDetails === null) ? Constants.N_A : (wsqDetails.wsq_checkedAt === null) ? Constants.N_A : moment(wsqDetails.wsq_checkedAt).format("LLL") }} 
            </div>
        </v-col>
        <v-col
            cols="12"
            xl="6"
            lg="6"
            md="6"
            sm="12"
            xs="12"
        >
            <div class="font-size-16px">
                <span class="font-weight-medium">Acknowledged By:</span> {{ (wsqDetails === null) ? Constants.N_A : (wsqDetails.wsq_acknowledgedByUserName === null || wsqDetails.wsq_acknowledgedByUserName === "") ? Constants.N_A : wsqDetails.wsq_acknowledgedByUserName }}
            </div>
            <div class="font-size-16px">
                <span class="font-weight-medium">Last Date Acknowledged:</span> {{ (wsqDetails === null) ? Constants.N_A : (wsqDetails.wsq_acknowledgedAt === null) ? Constants.N_A : moment(wsqDetails.wsq_acknowledgedAt).format("LLL") }}
            </div>
        </v-col>
        <v-col
            cols="12"
        >
            <v-divider></v-divider>
            
        </v-col>
        <v-col
            cols="12"
            xl="10"
            lg="10"
            md="10"
            sm="12"
            xs="12"
        >
            <div 
                class="font-size-16px d-flex flex-column"
            >
                <span 
                    class="font-weight-medium"
                >
                    Latest Remarks:
                </span>
                <span
                    class="font-italic"
                >
                    "{{ (wsqDetails === null) ? Constants.N_A : wsqDetails.wsq_remarks }}"
                </span>
            </div>
        </v-col>
    </v-row>
    <v-row>
        <v-col
            cols="12"
        >
            <v-divider></v-divider>
            
        </v-col>
    </v-row>
    <ConductConfirmationDialog 
        v-if="hasConducted == false"
        :wsq-id="wsq_id"
        @start-conducting="onChangeStartConducting"
    />
    <div
        v-if="hasConducted == true"
    >
    <v-row
        class="mt-5"
    >
        <v-col
            class="mb-5 d-flex flex-wrap"
            cols="12"
        >
            <div 
                class="font-size-20px font-weight-medium me-auto"
            >
                <v-icon
                    class="me-1"
                    size="x-small"
                    icon="mdi-desktop-classic"
                >
                </v-icon>
                HARDWARE
            </div>
            <!-- <div
                v-if="isUiLock == false"
                class="me-3"
            >
                <v-btn
                    class="font-weight-bold"
                    variant="outlined"
                    color="blue-lighten-1"            
                    prepend-icon="mdi-refresh"
                    @click="showRefreshHardwareDialog = true"
                >
                    Refresh New Items
                </v-btn>
            </div> -->
            <div
                v-if="isUiLock == false"
                class="me-3"
            >
                <v-btn
                    class="font-weight-bold"
                    variant="elevated"
                    color="blue-lighten-1"            
                    prepend-icon="mdi-plus"
                    @click="showAddHardwareDialog = true"
                >
                    Other Hardware
                </v-btn>
            </div>
            <div
                v-if="isUiLock == false"
                class="me-3"
            >
                <v-btn
                    class="font-weight-bold"
                    variant="elevated"
                    color="blue-lighten-1"            
                    prepend-icon="mdi-plus"
                    @click="openSystemComponentDialog({type: Constants.DIALOG_SYSCOMP_HARDWARE})"
                >
                    Add
                </v-btn>
            </div>
        </v-col>
        <v-col 
            class="my-n4 pa-5" 
            cols="12"
        >
            <v-table
                class="table-striped"
                fixed-header
                height="500px"
                density="comfortable"
            >
                <thead
                    class="font-size-14px"
                >
                    <tr>
                        <th 
                            class="text-center text-black font-weight-bold"
                        >
                            Description
                        </th>
                        <th 
                            class="text-center text-black font-weight-bold"
                        >
                            Details
                        </th>
                        <th 
                            class="text-center text-black font-weight-bold"
                        >
                            Remarks
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <WorkstationRowForm 
                        v-for="(item, index) in listHardware"
                        :key="item.hw_id"
                        :label-title="item.hw_name"
                        :item-id="item.hw_id"
                        :brand-list="listBrand"
                        :status="item.qtyhard_status"
                        :brand-id="item.qtyhard_brandId"
                        :is-others="item.hw_isOthers ? (item.hw_isOthers == true ? true : false ) : false"
                        :index="index"
                        :is-ui-lock="isUiLock"
                        :remarks="item.qtyhard_remarks"
                        @change-form-data="onChangeHardwareFormData"
                        @remove-data="onRemoveOtherHardwareData"
                        @remove-exist-data="onRemoveExistHardwareData"
                    />
                </tbody>
            </v-table> 
        </v-col>
    </v-row>
    <v-row>
        <v-col
            class="mt-10"
            cols="12"
        >
            <v-divider></v-divider>
            
        </v-col>
    </v-row>
    <v-row class="mt-5">
        <v-col
            class="mb-5 d-flex flex-wrap"
            cols="12"
        >
            <div 
                class="font-size-20px font-weight-medium me-auto">
                <v-icon
                    class="me-1"
                    size="x-small"
                    icon="mdi-desktop-classic"
                >
                </v-icon>
                SOFTWARE
            </div>
            <!-- <div
                v-if="isUiLock == false"
                class="me-3"
            >
                <v-btn
                    class="font-weight-bold"
                    variant="outlined"
                    color="blue-lighten-1"            
                    prepend-icon="mdi-refresh"
                    @click="showRefreshSoftwareDialog = true"
                >
                    Refresh New Items
                </v-btn>
            </div> -->
            <div
                v-if="isUiLock == false"
                class="me-3"
            >
                <v-btn
                    class="font-weight-bold"
                    variant="elevated"
                    color="blue-lighten-1"            
                    prepend-icon="mdi-plus"
                    @click="showAddSoftwareDialog = true"
                >
                    Other Software
                </v-btn>
            </div>
            <div
                v-if="isUiLock == false"
                class="me-3"
            >
                <v-btn
                    class="font-weight-bold"
                    variant="elevated"
                    color="blue-lighten-1"            
                    prepend-icon="mdi-plus"
                    @click="openSystemComponentDialog({type: Constants.DIALOG_SYSCOMP_SOFTWARE})"
                >
                    Add
                </v-btn>
            </div>
        </v-col>
        <v-col 
            class="my-n4 pa-5" 
            cols="12"
        >
            <v-table
                class="table-striped"
                fixed-header
                height="500px"
                density="comfortable"
            >
                <thead
                    class="font-size-14px"
                >
                    <tr>
                        <th 
                            class="text-center text-black font-weight-bold"
                        >
                            Description
                        </th>
                        <th 
                            class="text-center text-black font-weight-bold"
                        >
                            Details
                        </th>
                        <th 
                            class="text-center text-black font-weight-bold"
                        >
                            Remarks
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <WorkstationRowForm 
                        v-for="(item, index) in listSoftware"
                        :key="item.sw_id"
                        :label-title="item.sw_name"
                        :item-id="item.sw_id"
                        :brand-list="listBrand"
                        :status="item.qtysoft_status"
                        :brand-id="item.qtysoft_brandId"
                        :is-others="item.sw_isOthers ? (item.sw_isOthers == true ? true : false ) : false"
                        :index="index"
                        :is-ui-lock="isUiLock"
                        :remarks="item.qtysoft_remarks"
                        @change-form-data="onChangeSoftwareFormData"
                        @remove-data="onRemoveOtherSoftwareData"
                        @remove-exist-data="onRemoveExistSoftwareData"
                    />
                </tbody>
            </v-table> 
        </v-col>
    </v-row>
    <v-row>
        <v-col
            class="mt-10"
            cols="12"
        >
            <v-divider></v-divider>
            
        </v-col>
    </v-row>
    <v-row class="mt-5">
        <v-col
            class="mb-5 d-flex"
            cols="12"
        >
            <div 
                class="font-size-20px font-weight-medium me-auto">
                <v-icon
                    class="me-1"
                    size="x-small"
                    icon="mdi-desktop-classic"
                >
                </v-icon>
                FINDINGS AND CORRECTIVE ACTION
            </div>
            <div
                v-if="isUiLock == false"
                class="me-3"
            >
                <v-btn
                    class="font-weight-bold"
                    variant="elevated"
                    color="blue-lighten-1"            
                    prepend-icon="mdi-plus"
                    @click="showAddFacaDialog = true"
                >
                    Add Faca
                </v-btn>
            </div>
        </v-col>
        <v-col 
            class="my-n4 pa-5" 
            cols="12"
        >
            <v-table
                class="table-striped"
                fixed-header
                height="255px"
                density="comfortable"
            >
                <thead
                    class="font-size-14px"
                >
                    <tr>
                        <th 
                            class="text-left text-black font-weight-bold"
                        >
                            Date
                        </th>
                        <th 
                            class="text-left text-black font-weight-bold"
                        >
                            Findings
                        </th>
                        <th 
                            class="text-left text-black font-weight-bold"
                        >
                            Recommended Corrective Action
                        </th>
                        <th 
                            class="text-left text-black font-weight-bold"
                        >
                            Ticket Number
                        </th>
                        <th
                            class="text-left text-black font-weight-bold"
                        >
                            Action
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="(item, index) in formData.facaForm"
                        class="font-size-16px"
                    >
                        <td>{{ moment(item.faca_date).format("LLL") }}</td>
                        <td>{{ item.faca_findings }}</td>
                        <td>{{ item.faca_recommendation }}</td>
                        <td>{{ item.faca_ticketNum == null ? Constants.N_A : item.faca_ticketNum }}</td>
                        <td>
                            <v-btn 
                                class="font-weight-bold bg-red"
                                density="comfortable"
                                prepend-icon="mdi-file-document-remove"
                                variant="elevated"
                                @click="removeFaca(item, index)"
                            >
                                Remove
                            </v-btn>
                        </td>
                    </tr>
                </tbody>
            </v-table>
        </v-col>
    </v-row>
    <v-row>
        <v-col
            class="mt-10"
            cols="12"
        >
            <v-divider></v-divider>
            
        </v-col>
    </v-row>
    <v-row class="mt-5">
        <v-col
            class="mb-5 d-flex"
            cols="12"
        >
            <div 
                class="font-size-20px font-weight-medium me-auto">
                <v-icon
                    class="me-1"
                    size="x-small"
                    icon="mdi-desktop-classic"
                >
                </v-icon>
                CHECKLIST ITEMS
            </div>
            <div
                v-if="isUiLock == false"
                class="me-3"
            >
                <v-btn
                    class="font-weight-bold"
                    variant="elevated"
                    color="blue-lighten-1"            
                    prepend-icon="mdi-plus"
                    @click="openManageChecklistDialog()"                
                >
                    Add Items
                </v-btn>
            </div>
        </v-col>
        <v-col 
            class="my-n4 pa-5" 
            cols="12"
        >
            <v-table
                class="table-striped"
                fixed-header
                height="255px"
                density="comfortable"
            >
                <thead
                    class="font-size-14px"
                >
                    <tr>
                        <th 
                            class="text-left text-black font-weight-bold"
                        >
                            Description
                        </th>
                        <th 
                            class="text-center text-black font-weight-bold"
                        >
                            is Approved
                        </th>
                        <th 
                            class="text-left text-black font-weight-bold"
                        >
                            Actions
                        </th>                       
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="(item, index) in formData.checklistForm"
                        class="font-size-16px"
                    >
                        <td>{{ item.chk_description }}</td>
                        <td>
                            <v-checkbox
                                :model-value="isChecked(item)"
                                class="ms-n2 mt-2 d-flex justify-center"
                                color="blue-lighten-1"
                                density="compact"
                                @update:model-value="updateCheckbox(item, $event)"
                            ></v-checkbox>
                        </td>                        
                        <td>
                            <v-btn 
                                class="font-weight-bold bg-red"
                                density="comfortable"
                                prepend-icon="mdi-file-document-remove"
                                variant="elevated"
                                @click="onRemoveChecklistItemData(item.qtychk_id)"
                            >
                                Remove
                            </v-btn>
                        </td>
                    </tr>
                </tbody>
            </v-table>
        </v-col>
    </v-row>
    <v-row>
        <v-col
            class="mt-10"
            cols="12"
        >
            <v-divider></v-divider>
            
        </v-col>
    </v-row>
    <v-row class="mt-5">
        <v-col
            class="mb-5 d-flex"
            cols="12"
        >
            <div 
                class="font-size-20px font-weight-medium me-auto">
                <v-icon
                    class="me-1"
                    size="x-small"
                    icon="mdi-folder-information"
                >
                </v-icon>
                OTHERS
            </div>
        </v-col>
        <v-col 
            class="my-n4 pa-5" 
            cols="12"
            xl="6"
            lg="6"
            md="6"
            sm="12"
            xs="12"
        >
            <v-autocomplete
                clearable
                v-model="formData.wsq_resolution"
                variant="underlined"
                density="comfortable"
                label="Resolution"
                item-value="id"
                item-title="name"
                :items="Constants.arrOfResolution"
                :disabled="isUiLock"
            >
            </v-autocomplete>
            <div class="mb-2">
                <span class="font-size-16px font-weight-bold">Guideline:</span>
                <p class="font-size-16px">{{ resolutionGuidelineDescription }}</p>
            </div>
        </v-col>
        <v-col 
            class="my-n4 pa-5" 
            cols="12"
            xl="6"
            lg="6"
            md="6"
            sm="12"
            xs="12"
        >
            <v-textarea
                counter
                v-model.trim="formData.wsq_remarks"
                placeholder="Enter comments / remarks"
                variant="outlined"
                :maxlength="255"
                :disabled="isUiLock"
            >
            </v-textarea>
        </v-col>
    </v-row>
    <v-row>
        <v-col
            cols="12"
        >
            <v-divider></v-divider>
        </v-col>
    </v-row>
    <v-row>
        <v-col
            cols="12"
            xl="9"
            lg="9"
            md="12"
            sm="12"
            xs="12"
        >
            <v-alert
                    class="mb-5"
                    color="blue-darken-1"
                    theme="light"
                    icon="mdi-alert-circle"
                    density="compact"
                    border="start"
                >
                <span class="font-weight-medium">NOTE</span> - Removing a hardware, software, checklist item and F.A.C.A will be a permanent delete from the system regardless of not clicking the save button
            </v-alert>
        </v-col>
    </v-row>
    <v-row
        v-if="isUiLock == false"
        class="d-flex flex-row-reverse mb-5"   
    >
        <div
            class="me-5"
        >
            <v-btn 
                class="font-weight-bold"
                variant="outlined"
                color="blue-lighten-1"
                :loading="isButtonLoading"
                @click="updateQuarterlyWorkstation"
            >
                Save
            </v-btn>
            <v-btn 
                class="font-weight-bold me-2 ms-2"
                variant="elevated"
                color="blue-lighten-1"
                @click="showSubmitDialog = true"
            >
                Submit
            </v-btn>
        </div>
    </v-row>
    </div>
    <v-row class="mt-5">
        <v-col
            cols="12"
            sm="12"
        >
            <v-divider></v-divider>
        </v-col>
        <v-col
            cols="12"
            sm="12"
        >
            <v-expansion-panels>
                <v-expansion-panel>
                    <v-expansion-panel-title
                        color="blue-lighten-1"
                    >
                        Audit Trail
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                        <v-timeline
                            density="compact"
                            side="end"
                        >
                            <v-timeline-item
                                v-for="item in workstationQuarterlyAuditTrail"
                                class="mb-4"
                                dot-color="#616161"
                                size="small"
                            >
                                <div class="d-flex justify-space-between flex-grow-1">
                                    <div>{{ item.audit_message }} <span class="flex-shrink-0 ms-5 font-weight-medium">{{ moment(item.audit_updatedAt).format('LLL') }}</span></div>
                                </div>
                                <div class="text-medium-emphasis font-italic font-size-14px">
                                    "{{ item.audit_remarks }}"
                                </div>
                            </v-timeline-item>
                        </v-timeline>
                    </v-expansion-panel-text>
                </v-expansion-panel>
            </v-expansion-panels>
        </v-col>
    </v-row>

    <v-dialog
        v-model="showAddHardwareDialog"
        width="75%"
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
                    Add Hardware
                </div>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
                <v-container>
                    <v-row>
                        <v-col
                            cols="12"
                        >
                            <v-text-field
                                clearable
                                class="ms-3"
                                variant="underlined"
                                placeholder="Mouse, Keyboard, Headphones, etc."
                                density="comfortable"
                                label="Hardware Name"
                                maxlength="255"
                                v-model.trim="newHardwareName"
                                :error="errorAddHardwareOthersValidationParams.isError"
                                :error-messages="errorAddHardwareOthersValidationParams.errorMessage"
                            >
                            </v-text-field>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    class="font-weight-bold me-2"
                    color="grey-darken-4"
                    variant="outlined"
                    @click="showAddHardwareDialog = false"
                >
                    Close
                </v-btn>
                <v-btn
                    class="font-weight-bold bg-blue-lighten-1"
                    variant="elevated"
                    @click="addNewHardware"
                >
                    Add
                </v-btn> 
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog
        v-model="showAddSoftwareDialog"
        width="75%"
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
                        Add Software
                    </div>
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text>
                    <v-container>
                        <v-row>
                            <v-col
                                cols="12"
                            >
                                <v-text-field
                                    clearable
                                    class="ms-3"
                                    variant="underlined"
                                    placeholder="E-PPMP, E-LDS, MS OFFICE, etc."
                                    density="comfortable"
                                    label="Software Name"
                                    maxlength="255"
                                    v-model.trim="newSoftwareName"
                                    :error="errorAddSoftwareOthersValidationParams.isError"
                                    :error-messages="errorAddSoftwareOthersValidationParams.errorMessage"
                                >
                                </v-text-field>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        class="font-weight-bold me-2"
                        color="grey-darken-4"
                        variant="outlined"
                        @click="showAddSoftwareDialog = false"
                    >
                        Close
                    </v-btn>
                    <v-btn
                        class="font-weight-bold bg-blue-lighten-1"
                        variant="elevated"
                        @click="addNewSoftware"
                    >
                        Add
                    </v-btn> 
                </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog
        v-model="showAddFacaDialog"
        width="75%"
    >
        <v-card 
            class="pa-5"
        >
            <v-form
                ref="facaCreateForm"
                @submit.prevent
            >
                <v-card-title
                    class="font-weight-medium d-flex"
                    tag="div"
                >
                    <div 
                        class="d-inline"
                    >
                        Add Findings and Corrective Action
                    </div>
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text>
                    <v-container>
                        <v-row>
                            <v-col
                                cols="12"
                            >
                                <v-text-field
                                    clearable
                                    class="ms-3"
                                    variant="underlined"
                                    placeholder="Findings description..."
                                    density="comfortable"
                                    label="Findings"
                                    maxlength="255"
                                    v-model.trim="newFacaData.faca_findings"
                                    :rules="standardRule"
                                >
                                </v-text-field>
                                <v-text-field
                                    clearable
                                    class="ms-3"
                                    variant="underlined"
                                    placeholder="Recommended corrective action description..."
                                    density="comfortable"
                                    label="Recommended Corrective Action"
                                    maxlength="255"
                                    v-model.trim="newFacaData.faca_recommendation"
                                    :rules="standardRule"
                                >
                                </v-text-field>
                                <v-text-field
                                    clearable
                                    class="ms-3"
                                    variant="underlined"
                                    placeholder="5001, 5002, 5003, etc."
                                    density="comfortable"
                                    label="Ticket No.#"
                                    maxlength="255"
                                    v-model.trim="newFacaData.faca_ticketNum"
                                    @keypress="Util.checkNumbersOnly($event)"
                                >
                                </v-text-field>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        class="font-weight-bold me-2"
                        color="grey-darken-4"
                        variant="outlined"
                        @click="showAddFacaDialog = false"
                    >
                        Close
                    </v-btn>
                    <v-btn
                        class="font-weight-bold bg-blue-lighten-1"
                        variant="elevated"
                        @click="addFaca"
                    >
                        Add
                    </v-btn> 
                </v-card-actions>
            </v-form>
        </v-card>
    </v-dialog>

    <v-dialog
        v-model="showSubmitDialog"
        width="75%"
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
                    Submit Confirmation
                </div>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
                <v-container>
                    <v-row>
                        <v-col
                            cols="12"
                        >
                            <div class="text-center">
                                Are you sure you want to submit? Once it's done it will proceed to the user's approval and it cannot be undone.
                            </div>
                            <div
                                v-if="hasStatusOfNullOnHardware || hasStatusOfNullOnSoftware || hasStatusOfNullOnResolution || isRemarksEmpty"
                                class="text-center font-size-12px text-red"
                            >
                                Please provide values to all the hardware, software, resolution and remarks before submitting the request to the user
                            </div>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    class="font-weight-bold me-2"
                    color="grey-darken-4"
                    variant="outlined"
                    @click="showSubmitDialog = false"
                >
                    Close
                </v-btn>
                <v-btn
                    class="font-weight-bold bg-blue-lighten-1"
                    variant="elevated"
                    :loading="isButtonLoading"
                    @click="updateStatus(Constants.WSQ_STATUS_FOR_APPROVAL)"
                >
                    Confirm
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog
        v-model="showRefreshHardwareDialog"
        width="75%"
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
                    Refresh Confirmation
                </div>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
                <v-container>
                    <v-row>
                        <v-col
                            cols="12"
                        >
                            <div class="text-center">
                                Are you sure you want to refresh the hardware checklist? Unsaved changes will not be saved and once it's done it cannot be undone
                            </div>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    class="font-weight-bold me-2"
                    color="grey-darken-4"
                    variant="outlined"
                    @click="showRefreshHardwareDialog = false"
                >
                    Close
                </v-btn>
                <v-btn
                    class="font-weight-bold bg-blue-lighten-1"
                    variant="elevated"
                    :loading="isButtonLoading"
                    @click="refreshNewHardwareItems()"
                >
                    Confirm
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog
        v-model="showRefreshSoftwareDialog"
        width="75%"
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
                    Refresh Confirmation
                </div>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
                <v-container>
                    <v-row>
                        <v-col
                            cols="12"
                        >
                            <div class="text-center">
                                Are you sure you want to refresh the software checklist? Unsaved changes will not be saved and once it's done it cannot be undone
                            </div>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    class="font-weight-bold me-2"
                    color="grey-darken-4"
                    variant="outlined"
                    @click="showRefreshSoftwareDialog = false"
                >
                    Close
                </v-btn>
                <v-btn
                    class="font-weight-bold bg-blue-lighten-1"
                    variant="elevated"
                    :loading="isButtonLoading"
                    @click="refreshNewSoftwareItems()"
                >
                    Confirm
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog
        v-model="showSystemComponentDialog"
        width="75%"
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
                        Add More {{ systemCompDialogElements.title }}
                    </div>
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text>
                    <SystemComponentForm 
                        :list-system-components="listSystemComponent"
                        :type="systemCompDialogElements.type"
                        @update-list-data="onChangeUpdateSystemComponentList"
                    />
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        class="font-weight-bold me-2"
                        color="grey-darken-4"
                        variant="outlined"
                        @click="showSystemComponentDialog = false"
                    >
                        Close
                    </v-btn>
                    <v-btn
                        class="font-weight-bold bg-blue-lighten-1"
                        variant="elevated"
                        @click="addNewSystemComponentsInWsq"
                    >
                        Add
                    </v-btn> 
                </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog
        v-model="showChecklistItemsDialog"
        width="75%"
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
                        Add more items
                    </div>
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text>
                    <ChecklistItemsForm 
                        :list-checklist-items="listChecklistItems"
                        @update-list-data="onChangeUpdateChecklist"
                    />
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        class="font-weight-bold me-2"
                        color="grey-darken-4"
                        variant="outlined"
                        @click="showChecklistItemsDialog = false"
                    >
                        Close
                    </v-btn>
                    <v-btn
                        class="font-weight-bold bg-blue-lighten-1"
                        variant="elevated"
                        @click="addNewChecklistItemsInWsq"
                    >
                        Add
                    </v-btn> 
                </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog
        v-model="showInternalCommentDialog"
        width="75%"
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
                    Internal Comment
                </div>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
                <v-container>
                    <v-row
                    >
                        <v-col
                            v-if="errorCommentEditorValidationParams.isError"
                            cols="12"
                        >
                            <p
                                class="font-size-12px mt-1 text-red"
                            >
                                {{ errorCommentEditorValidationParams.errorMessage }}
                            </p>
                        </v-col>
                        <v-col
                            cols="12"
                            class="mb-9"
                        >
                            <QuillEditor 
                                v-model:content="comment"
                                ref="quillEditor"
                                theme="snow" 
                                placeholder="Enter comment..."
                                content-type="html"
                            />
                        </v-col>
                        <v-col
                            class="d-flex flex-row-reverse mt-10"
                            cols="12"
                        >
                            <v-btn
                                v-if="isCommentEdit"
                                class="font-weight-bold bg-blue-lighten-1"
                                variant="elevated"
                                :loading="isButtonLoading"
                                @click="updateComment()"
                            >
                                Save Comment
                            </v-btn>
                            <v-btn
                                v-if="isCommentEdit"
                                class="font-weight-bold me-2"
                                variant="outlined"          
                                color="red"
                                :loading="isButtonLoading"
                                @click="clearEditComment()"
                            >
                                Cancel Edit
                            </v-btn>
                            <v-btn
                                v-else
                                class="font-weight-bold bg-blue-lighten-1"
                                variant="elevated"
                                :loading="isButtonLoading"
                                @click="addComment()"
                            >
                                Add Comment
                            </v-btn>
                        </v-col>
                    </v-row>
                    <v-row class="my-5">
                        <v-divider></v-divider>
                    </v-row>
                    <v-row>
                        <v-col
                            class="my-n4 pa-2"
                            cols="12"
                        >
                            <v-table
                                class="table-striped"
                                fixed-header
                                height="500px"
                                density="comfortable"
                            >
                                <thead
                                    class="font-size-16px"
                                >
                                    <tr>
                                        <th 
                                            class="text-start"
                                        >
                                            Comments
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr
                                        v-for="item in listComments"
                                        :key="item.ic_id"
                                    >
                                        <td>
                                            <div
                                                class="pa-3"
                                            >
                                                <div
                                                    class="d-flex flex-row flex-wrap"
                                                >
                                                    <v-icon
                                                        class="me-2 mt-1"
                                                        size="x-small"
                                                        icon="mdi-account"
                                                    >
                                                    </v-icon>
                                                    <p
                                                        class="font-weight-medium font-size-14px"
                                                    >
                                                        {{ item.ic_createdByUsername }}
                                                    </p>
                                                </div>                                                
                                                <div
                                                    class="mt-2"
                                                    v-html="item.ic_description"
                                                >
                                                </div>
                                                <div 
                                                    class="mt-8 "
                                                >
                                                    <v-divider>                                                        
                                                    </v-divider>
                                                    <div class="font-italic mt-2">
                                                        {{ moment(item.ic_updatedAt).format('LLL') }}
                                                    </div>                                                    
                                                </div>
                                                <div class="mt-2">
                                                    <v-btn
                                                        class="me-2"
                                                        icon="mdi-pencil"
                                                        size="x-small"
                                                        @click="editComment(item)"
                                                    >
                                                    </v-btn>   
                                                    <v-btn
                                                        class="me-2 bg-red"
                                                        icon="mdi-trash-can"
                                                        size="x-small"
                                                        @click="removeComment(item)"
                                                    >
                                                    </v-btn>                                                    
                                                </div>
                                            </div>
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
                    class="font-weight-bold me-2"
                    color="grey-darken-4"
                    variant="outlined"
                    @click="showInternalCommentDialog = false"
                >
                    Close
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog
        v-model="showDeleteConfirmationCommentDialog"
        width="75%"
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
                    Delete Confirmation
                </div>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
                <v-container>
                    <v-row>
                        <v-col
                            cols="12"
                        >
                            <div class="text-center">
                                Are you sure you want to remove comment? once it's done it cannot be undone
                            </div>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    class="font-weight-bold me-2"
                    color="grey-darken-4"
                    variant="outlined"
                    @click="showDeleteConfirmationCommentDialog = false"
                >
                    Close
                </v-btn>
                <v-btn
                    class="font-weight-bold bg-blue-lighten-1"
                    variant="elevated"
                    :loading="isButtonLoading"
                    @click="deleteComment()"
                >
                    Confirm
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
</style>