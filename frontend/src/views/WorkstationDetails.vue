<script setup>
    import { ref, reactive, watch, onMounted, computed } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import { useUserStore } from '@/stores/user';
    import { useUtilStore } from '@/stores/util';
    import { storeToRefs } from 'pinia';
    import moment from 'moment/moment'
    import Constants from '../globals';
    import * as Util from '../helpers/helper';
    import { decryptData } from '../helpers/encryptUtil'
    import axios from 'axios';
    import UserWorkstationRightsForm from '../components/UserWorkstationRightsForm.vue';
    import { QuillEditor } from '@vueup/vue-quill'
    import '@vueup/vue-quill/dist/vue-quill.snow.css';

    //Variables
    const route = useRoute();
    const router = useRouter();
    const wsq_id = route.params.id;
    const userStore = useUserStore();
    const utilStore = useUtilStore();
    const { customDialog } = storeToRefs(utilStore);
    const { user } = storeToRefs(userStore);

    //Local Constants
    
    //Model Values
    const errorApproveValidationParams = reactive({
        isError: false,
        errorMessage: ""
    });
    const errorCommentEditorValidationParams = reactive({
        isError: false,
        errorMessage: ""
    });
    const errorDisapproveValidationParams = reactive({
        isError: false,
        errorMessage: ""
    });
    const errorRevertValidationParams = reactive({
        isError: false,
        errorMessage: ""
    });
    const comment = ref(null);
    const currentItemToUpdate = ref(null);
    const currentItemToDelete = ref(null);
    const isCommentEdit = ref(false);
    const isButtonLoading = ref(false);
    const isUiLock = ref(false);
    const listChecklistItems = ref([]);
    const listOfEmployees = ref([]);
    const listComments = ref([]);
    const listHardware = ref([]);
    const listSoftware = ref([]);
    const listFaca = ref([]);
    const listUserWorkstationRights = ref([]);
    const quillEditor = ref(null);
    const showApproveDialog = ref(false);
    const showDisapproveDialog = ref(false);
    const showRevertDialog = ref(false);
    const showActionButtons = ref(true);
    const showDeleteConfirmationCommentDialog = ref(false);
    const showInternalCommentDialog = ref(false);
    const userData = ref({});
    const workstationQuarterlyAuditTrail = ref(null);
    const wsqDetails = ref(null);
    const wsq_remarks = ref(null);
    const userWorkstationRightsDialogData = reactive({
        isShowDialog: false
    });
    
    //Built-in Functions
    onMounted( async() => {
        userData.value = decryptData(user.value, Constants.USER_SECRET_KEY);

        if(userData.value === null){
            await userStore.logout();
        } else {
            await getDepartmentWorkstationQuarterlyDetailsByWsqId();
            await getListOfHardware();
            await getListOfSoftware();
            await getListOfFacaByWsqId();
            await getListOfComment();
            await getListOfChecklistItemsByWsqId();
            await getWorkstationQuarterlyAuditTrail();
            await getListOfEmployees();
            await getListOfUserWorkstationRightsByWsqId();
            setUiValues();
        }
        
        utilStore.setPageLoading({pIsPageLoading: false});
    });

    const quillEditorInstance = computed(() => {
        return quillEditor.value ? quillEditor.value : null
    });

    watch(() => customDialog.value.showDialog, async(newValue, oldValue) => {
        if(newValue == false){
            customDialog.value.showDialog = false;
            await getDepartmentWorkstationQuarterlyDetailsByWsqId();
            await getListOfHardware();
            await getListOfSoftware();
            await getWorkstationQuarterlyAuditTrail();
        }
    });

    watch(() => showApproveDialog.value, async(newValue, oldValue) => {
        if(newValue == false){
            wsq_remarks.value = null;
            updateErrorMessagesToAllRemarks(false);
        }
    });

    watch(() => showDisapproveDialog.value, async(newValue, oldValue) => {
        if(newValue == false){
            wsq_remarks.value = null;
            updateErrorMessagesToAllRemarks(false);
        }
    });

    watch(() => showRevertDialog.value, async(newValue, oldValue) => {
        if(newValue == false){
            wsq_remarks.value = null;
            updateErrorMessagesToAllRemarks(false);
        }
    });

    watch(() => showInternalCommentDialog.value, (newValue, oldValue) => {
        if(newValue == false){
            clearAllCommentDialogData();
        }
    });

    //User-defined Functions
    const setUiValues = () => {
        let currentMonth = moment().month() + 1;
        let currentYear = moment().year();

        //Can't edit if the scheduled month is not the current month of the year scheduled
        if(currentYear == wsqDetails.value.sched_year){
            if(currentMonth == wsqDetails.value.quarter_monthlyQuarter){
                isUiLock.value = false;
            } else {
                isUiLock.value = true;
            }
        } else {
            isUiLock.value = true;
        }

        /* UNCOMMENT THESE CODES IF YOU WANT TO TEST */
        // isUiLock.value = false;
    }

    const getListOfEmployees = async () => {
        var result = await axios.get(`/getAllEmployeesTest`);
        // let result = await axios.get(`/get_employees`,{
        //     baseURL: 'http://172.16.1.39:3010/api',
        //     withCredentials: false
        // });
        
        listOfEmployees.value = result.data;
    }
    
    const getDepartmentWorkstationQuarterlyDetailsByWsqId = async () => {
        var data = {
            wsq_id: wsq_id
        };

        const params = new URLSearchParams(data);
        var result = await axios.get(`/getDepartmentWorkstationQuarterlyDetailsByWsqId?${params}`);

        wsqDetails.value = result.data.data[0];

        if(typeof wsqDetails.value == "undefined"){
            router.push(`/`);
        }

        openActionButtons();
    }; 

    const openActionButtons = () => {
        showActionButtons.value = true;
        var hasPassedConditions = checUiCanEditWithWsqTime();

        if(hasPassedConditions == true){ //<-- UNCOMMENT THESE CODES IF TESTING IS DONE
        // if(true){
            if(typeof wsqDetails.value != "undefined"){
                if(wsqDetails.value.wsq_status != Constants.WSQ_STATUS_FOR_APPROVAL){
                    showActionButtons.value = false;
                }
            }
        } else {
            showActionButtons.value = false;
        }
    }

    const checUiCanEditWithWsqTime = () => {
        let currentMonth = moment().month() + 1;
        let currentYear = moment().year();

        //Can't edit if the scheduled month is not the current month or previous month of the year scheduled
        if(currentYear == wsqDetails.value.sched_year){
            if(currentMonth < wsqDetails.value.quarter_monthlyQuarter){
                return false;
            } else {
                return true;
            }
        } else {
            return false;
        }
    }

    const getListOfHardware = async () => {
        var data = {
            qtyhard_wsqId: wsq_id
        };

        const params = new URLSearchParams(data)
        var result = await axios.get(`/getListOfWsHardwareDetailsByWsqId?${params}`);

        listHardware.value = result.data.data;
    }; 

    const getListOfSoftware = async () => {
        var data = {
            qtysoft_wsqId: wsq_id
        };
        
        const params = new URLSearchParams(data)
        var result = await axios.get(`/getListOfWsSoftwareDetailsByWsqId?${params}`);

        listSoftware.value = result.data.data;
    };

    const getListOfFacaByWsqId = async () => {
        var data = {
            faca_wsqId: wsq_id
        };
        
        const params = new URLSearchParams(data)
        var result = await axios.get(`/getListOfFacaByWsqId?${params}`);

        listFaca.value = result.data.data;
    };

    const getListOfComment = async () => {
        var data = {
            ic_wsqId: wsq_id
        };
        
        const params = new URLSearchParams(data)

        var result = await axios.get(`/getListOfCommentsByWsqId?${params}`);
        listComments.value = result.data.data;
    }; 

    const getListOfChecklistItemsByWsqId = async () => {
        var data = {
            qtychk_wsqId: wsq_id
        };
        
        const params = new URLSearchParams(data)
        var result = await axios.get(`/getWorkstationQuarterlyChecklistItemsByWsqId?${params}`);

        listChecklistItems.value = result.data.data;
    };

    const getWorkstationQuarterlyAuditTrail = async () => {
        var data = {
            audit_wsqId: wsq_id
        };
        
        const params = new URLSearchParams(data)
        var result = await axios.get(`/getWorkstationQuarterlyAuditTrail?${params}`);

        workstationQuarterlyAuditTrail.value = result.data.data;
    };

    const getListOfUserWorkstationRightsByWsqId = async() => {
        var params = {
            wsqRights_wsqId: wsq_id
        };
    
        var result = await axios.get(`/getListOfUserWorkstationRightsByWsqId`, {params: params});
        listUserWorkstationRights.value = result.data.data;
    }

    const isValuesComplete = () => {
        if(wsq_remarks.value == null || wsq_remarks.value == null){
            updateErrorMessagesToAllRemarks(true);
            return false;
        } else {
            updateErrorMessagesToAllRemarks(false);
            return true;
        }
    }

    const updateErrorMessagesToAllRemarks = (value) => {
        if(value){
            errorApproveValidationParams.errorMessage = "Please provide remarks before submitting"
            errorApproveValidationParams.isError = true;
            errorDisapproveValidationParams.errorMessage = "Please provide remarks before submitting"
            errorDisapproveValidationParams.isError = true;
            errorRevertValidationParams.errorMessage = "Please provide remarks before submitting"
            errorRevertValidationParams.isError = true;
        } else {
            errorApproveValidationParams.errorMessage = ""
            errorApproveValidationParams.isError = false;
            errorDisapproveValidationParams.errorMessage = ""
            errorDisapproveValidationParams.isError = false;
            errorRevertValidationParams.errorMessage = ""
            errorRevertValidationParams.isError = false;
        }
    }

    const approveQuarterlyWorkstation = async () => {
        if(isValuesComplete()){
            isButtonLoading.value = true;

            var data = {
                quarter_id: wsqDetails.value.quarter_id,
                wsq_remarks: wsq_remarks.value,
                wsq_resolution: wsqDetails.value.wsq_resolution,
                wsq_wsId: wsqDetails.value.wsq_wsId,
                wsq_id: wsqDetails.value.wsq_id,
                ws_userId: wsqDetails.value.ws_userId
            };

            let result = await axios.put("/approveQuarterlyWorkstation", data);

            logger.info("Approve Button Clicked", logger.createUserInteractionContext("btn-approve-qty-workstation", "/WorkstationDetails", navigator.userAgent, `${window.innerWidth}x${window.innerHeight}`))

            if(result.data.status == Constants.STATUS_CODE_SUCCESS){
                utilStore.setCustomDialog({
                    showDialog: true,
                    modalTitle: "Update Success",
                    modalDescription: result.data.message
                });

                showApproveDialog.value = false;
            } else {
                logger.error("Error in Approving a quarterly workstation", logger.createErrorContext("workstation-details-approve", result.data.message));
                utilStore.setSnackBar({
                    showModal: true,
                    modalDescription: result.data.message
                });
            }

            isButtonLoading.value = false;
        }
    }

    const disapproveQuarterlyWorkstation = async () => {
        if(isValuesComplete()){
            isButtonLoading.value = true;

            var data = {
                wsq_remarks: wsq_remarks.value,
                wsq_id: wsqDetails.value.wsq_id,
                ws_userId: wsqDetails.value.ws_userId
            };

            let result = await axios.put("/disapproveQuarterlyWorkstation", data);

            if(result.data.status == Constants.STATUS_CODE_SUCCESS){
                utilStore.setCustomDialog({
                    showDialog: true,
                    modalTitle: "Update Success",
                    modalDescription: result.data.message
                });

                showDisapproveDialog.value = false;
            } else {
                logger.error("Error in Disapproving a quarterly workstation", logger.createErrorContext("workstation-details-disapprove", result.data.message));
                utilStore.setSnackBar({
                    showModal: true,
                    modalDescription: result.data.message
                });
            }

            isButtonLoading.value = false;
        }
    }

    const revertQuarterlyWorkstation = async () => {
        if(isValuesComplete()){
            isButtonLoading.value = true;

            var data = {
                wsq_remarks: wsq_remarks.value,
                wsq_id: wsqDetails.value.wsq_id
            };

            let result = await axios.put("/revertQuarterlyWorkstation", data);

            if(result.data.status == Constants.STATUS_CODE_SUCCESS){
                utilStore.setCustomDialog({
                    showDialog: true,
                    modalTitle: "Update Success",
                    modalDescription: result.data.message
                });

                showRevertDialog.value = false;
            } else {
                logger.error("Error in Reverting a quarterly workstation", logger.createErrorContext("workstation-details-revert", result.data.message));
                utilStore.setSnackBar({
                    showModal: true,
                    modalDescription: result.data.message
                });
            }

            isButtonLoading.value = false;
        }
    }

    const openWorkstationRightsFormDialog = async (_isShowDialog) => {
        userWorkstationRightsDialogData.isShowDialog = _isShowDialog;
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
                logger.error("Error in Adding a comment", logger.createErrorContext("add-comment", result.data.message));
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
                logger.error("Error in Updating a comment", logger.createErrorContext("update-comment", result.data.message));
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
</script>

<template>
    <v-row>
        <v-col
            class="d-flex"
            cols="12"
        >
            <div class="font-size-32px me-auto">
                <v-icon
                    class="me-1"
                    size="x-small"
                    icon="mdi-desktop-tower-monitor"
                >
                </v-icon>
                Workstation
            </div>
            <div class="ms-3">
                <v-btn
                    v-if="userData?.access_right == Constants.ROLE_IT"
                    class="font-weight-bold mt-3 me-2"
                    variant="elevated"
                    color="blue-lighten-1"            
                    prepend-icon="mdi-eye-outline"
                    @click="showInternalCommentDialog = true"
                >
                    Internal Comment
                </v-btn>
                <v-btn
                    v-if="userData?.access_right == Constants.ROLE_IT"
                    class="font-weight-bold mt-3 me-2"
                    variant="elevated"      
                    color="blue-lighten-1"  
                    prepend-icon="mdi-account-multiple-plus-outline"
                    @click="openWorkstationRightsFormDialog(true)"
                >
                    Manage User Rights
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
                <span class="font-weight-medium">Owner Name:</span> {{ (wsqDetails == null) ? Constants.N_A : wsqDetails.ws_userName }}
            </div>
            <div class="font-size-16px">
                <span class="font-weight-medium">Computer Name:</span> {{ (wsqDetails == null) ? Constants.N_A : wsqDetails.ws_computerName }}
            </div>
            <div class="font-size-16px">
                <span class="font-weight-medium">PC Hardware Name:</span> {{ (wsqDetails == null) ? Constants.N_A : wsqDetails.comp_name }}
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
                <span class="font-weight-medium">Year:</span> {{ (wsqDetails == null) ? Constants.N_A : wsqDetails.sched_year }}
            </div>
            <div class="font-size-16px">
                <span class="font-weight-medium">Quarter:</span> {{ (wsqDetails == null) ? Constants.N_A : Util.getQuarterTextByMonthPosition(wsqDetails.quarter_monthlyQuarter) }}
            </div>
            <div class="font-size-16px">
                <span class="font-weight-medium">Month:</span> {{ (wsqDetails == null) ? Constants.N_A : Util.getFullMonthNameByMonthPosition(wsqDetails.quarter_monthlyQuarter) }}
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
                <span class="font-weight-medium">Location:</span> {{ (wsqDetails == null) ? Constants.N_A : wsqDetails.location_name }}
            </div>
            <div class="font-size-16px">
                <span class="font-weight-medium">Area Resided:</span> {{ (wsqDetails == null) ? Constants.N_A : ((wsqDetails.ws_location === "" || wsqDetails.ws_location === null) ? Constants.N_A : wsqDetails.ws_location) }}
            </div>
            <div class="font-size-16px">
                <span class="font-weight-medium">Status:</span> {{ (wsqDetails == null) ? Constants.N_A : Util.getWsqStatusTextByStatusId(wsqDetails.wsq_status) }}
            </div>
            <div class="font-size-16px">
                <span class="font-weight-medium">Resolution:</span> {{ (wsqDetails == null) ? Constants.N_A : Util.getWsqResolutionTextByResolutionId(wsqDetails.wsq_resolution) }}
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
                <span class="font-weight-medium">Checked By:</span> {{ (wsqDetails == null) ? Constants.N_A : (wsqDetails.wsq_checkedByUserName === null || wsqDetails.wsq_checkedByUserName === "") ? Constants.N_A : wsqDetails.wsq_checkedByUserName }}
            </div>
            <div class="font-size-16px">
                <span class="font-weight-medium">Last Date Checked:</span> {{ (wsqDetails == null) ? Constants.N_A : (wsqDetails.wsq_checkedAt === null) ? Constants.N_A : moment(wsqDetails.wsq_checkedAt).format("LLL") }} 
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
                <span class="font-weight-medium">Acknowledged By:</span> {{ (wsqDetails == null) ? Constants.N_A : (wsqDetails.wsq_acknowledgedByUserName === null || wsqDetails.wsq_acknowledgedByUserName === "") ? Constants.N_A : wsqDetails.wsq_acknowledgedByUserName }}
            </div>
            <div class="font-size-16px">
                <span class="font-weight-medium">Last Date Acknowledged:</span> {{ (wsqDetails == null) ? Constants.N_A : (wsqDetails.wsq_acknowledgedAt === null) ? Constants.N_A : moment(wsqDetails.wsq_acknowledgedAt).format("LLL") }}
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
                    "{{ (wsqDetails == null) ? Constants.N_A : wsqDetails.wsq_remarks }}"
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
    <v-row
        class="mt-5"
    >
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
                HARDWARE
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
                            class="text-left text-black font-weight-bold"
                        >
                            Details
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="item in listHardware"
                        :key="item.qtyhard_id"
                        class="text-center"
                        width="50%"
                    >
                        <td
                            class="text-center"
                        >
                            <p
                                class="font-size-20px font-weight-bold text-blue-darken-3"
                            >
                                {{ item.hw_name }}
                            </p>
                        </td>
                        <td
                            class="text-left pa-4"
                            width="50%"
                        >
                            <p>
                                Status: <span>{{ Util.getEquipmentStatusTextByStatusId(item.qtyhard_status) }}</span>
                            </p>
                            <p 
                                class="mt-1"
                            >
                                Brand Type: <span>{{ item.brand_description !== null ? item.brand_description : Constants.N_A }}</span>
                            </p>
                            <p
                                class="mt-1"
                            >
                                Remarks: <span>{{ item.qtyhard_remarks !== null ? item.qtyhard_remarks : Constants.N_A }}</span>
                            </p>
                        </td>
                    </tr>
                </tbody>
            </v-table> 
        </v-col>
    </v-row>
    <v-row 
        class="mt-5"
    >
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
                SOFTWARE
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
                            class="text-left text-black font-weight-bold"
                        >
                            Details
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="item in listSoftware"
                        :key="item.qtysoft_id"
                        class="text-center"
                        width="50%"
                    >
                        <td
                            class="text-center"
                        >
                            <p
                                class="font-size-20px font-weight-bold text-blue-darken-3"
                            >
                                {{ item.sw_name }}
                            </p>
                        </td>
                        <td
                            class="text-left pa-4"
                            width="50%"
                        >
                            <p>
                                Status: <span>{{ Util.getEquipmentStatusTextByStatusId(item.qtysoft_status) }}</span>
                            </p>
                            <p
                                class="mt-1"
                            >
                                Brand Type: <span>{{ item.brand_description !== null ? item.brand_description : Constants.N_A }}</span>
                            </p>
                            <p
                                class="mt-1"
                            >
                                Remarks: <span>{{ item.qtysoft_remarks !== null ? item.qtysoft_remarks : Constants.N_A }}</span>
                            </p>
                        </td>
                    </tr>
                </tbody>
            </v-table> 
        </v-col>
    </v-row>
    <v-row 
        class="mt-5"
    >
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
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="item in listFaca"
                        :key="item.faca_id"
                        class="font-size-16px"
                    >
                        <td>{{ moment(item.faca_date).format("LLL") }}</td>
                        <td>{{ item.faca_findings }}</td>
                        <td>{{ item.faca_recommendation }}</td>
                        <td>{{ item.faca_ticketNum }}</td>
                    </tr>
                </tbody>
            </v-table>
        </v-col>
    </v-row>
    <v-row 
        class="mt-5"
    >
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
                            Status
                        </th>                    
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="item in listChecklistItems"
                        :key="item.qtychk_id"
                        class="font-size-16px"
                    >
                        <td>{{ item.chk_description }}</td>
                        <td 
                            class="text-center"
                        >
                            <v-icon
                                v-if="item.qtychk_status == 1"
                                class="me-1"
                                size="large"
                                icon="mdi-check-bold"
                                color="blue-lighten-1"
                            >
                            </v-icon>
                            <v-icon
                                v-else
                                class="me-1"
                                size="large"
                                icon="mdi-close-thick"
                                color="red"
                            >
                            </v-icon>
                        </td>
                    </tr>
                </tbody>
            </v-table>
        </v-col>
    </v-row>
    <v-row
        v-if="showActionButtons"  
    >
        <v-col
            cols="12"
        >
            <v-divider></v-divider>
        </v-col>
        <v-col>
            <div
                class="d-flex flex-row-reverse mb-5 me-5" 
            >
                <v-btn 
                    class="font-weight-bold bg-blue-lighten-1 ms-2"
                    variant="elevated"
                    @click="showApproveDialog = true"
                >
                    Approve
                </v-btn>
                <v-btn 
                    class="font-weight-bold bg-red ms-2"
                    variant="elevated"
                    @click="showDisapproveDialog = true"
                >
                    Disapprove
                </v-btn>
            </div>
        </v-col>
    </v-row>
    <v-row
        v-else-if="wsqDetails.wsq_status == Constants.WSQ_STATUS_COMPLETE && isUiLock != true && userData.access_right == Constants.ROLE_IT"
    >
        <v-col
            cols="12"
        >
            <v-divider></v-divider>
        </v-col>
        <v-col>
            <div
                class="d-flex flex-row-reverse mb-5 me-5" 
            >
                <v-btn 
                    class="font-weight-bold bg-red ms-2"
                    variant="elevated"
                    @click="showRevertDialog = true"
                >
                    Revert Request
                </v-btn>
            </div>
        </v-col>
    </v-row>
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
        v-model="showApproveDialog"
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
                    Approval Confirmation
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
                                Are you sure you want to approve? Once it's done it cannot be undone.
                            </div>
                        </v-col>
                        <v-col
                            cols="12"
                        >
                        <v-textarea
                            v-model.trim="wsq_remarks"
                            counter
                            placeholder="Enter comments / remarks"
                            variant="outlined"
                            :maxlength="255"
                            :error="errorApproveValidationParams.isError"
                            :error-messages="errorApproveValidationParams.errorMessage"
                        >
                        </v-textarea>
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
                    @click="showApproveDialog = false"
                >
                    Close
                </v-btn>
                <v-btn
                    id="btn-approve-qty-workstation"
                    class="font-weight-bold bg-blue-lighten-1"
                    variant="elevated"
                    :loading="isButtonLoading"
                    @click="approveQuarterlyWorkstation"
                >
                    Confirm
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog
        v-model="showDisapproveDialog"
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
                    Disapproval Confirmation
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
                                Are you sure you want to disapprove? Once it's done it will go back to the IT for another review.
                            </div>
                        </v-col>
                        <v-col
                            cols="12"
                        >
                        <v-textarea
                            v-model.trim="wsq_remarks"
                            counter
                            placeholder="Enter comments / remarks"
                            variant="outlined"
                            :maxlength="255"
                            :error="errorDisapproveValidationParams.isError"
                            :error-messages="errorDisapproveValidationParams.errorMessage"
                        >
                        </v-textarea>
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
                    @click="showDisapproveDialog = false"
                >
                    Close
                </v-btn>
                <v-btn
                    class="font-weight-bold bg-blue-lighten-1"
                    variant="elevated"
                    :loading="isButtonLoading"
                    @click="disapproveQuarterlyWorkstation"
                >
                    Confirm
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog
        v-model="showRevertDialog"
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
                    Revert Confirmation
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
                                Are you sure you want to revert? Once it's done it will revert the resolution and wait for IT to submit it back to you for another approval
                            </div>
                        </v-col>
                        <v-col
                            cols="12"
                        >
                        <v-textarea
                            v-model.trim="wsq_remarks"
                            counter
                            placeholder="Enter comments / remarks"
                            variant="outlined"
                            :maxlength="255"
                            :error="errorRevertValidationParams.isError"
                            :error-messages="errorRevertValidationParams.errorMessage"
                        >
                        </v-textarea>
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
                    @click="showRevertDialog = false"
                >
                    Close
                </v-btn>
                <v-btn
                    class="font-weight-bold bg-blue-lighten-1"
                    variant="elevated"
                    :loading="isButtonLoading"
                    @click="revertQuarterlyWorkstation"
                >
                    Confirm
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

    <UserWorkstationRightsForm 
        :is-show-dialog="userWorkstationRightsDialogData.isShowDialog"
        :list-employees="listOfEmployees"
        :list-user-workstation-rights="listUserWorkstationRights"
        :wsq-id="wsq_id"
        :wsq-user-id="wsqDetails?.ws_userId"
        @click-close-dialog="openWorkstationRightsFormDialog(false)"
        @fetch-latest-workstation-rights-list="getListOfUserWorkstationRightsByWsqId()"
    />
</template>

<style scoped>
    .search-container {
        border: solid 2px rgb(236, 232, 232);
        border-radius: 5px;
    }
</style>