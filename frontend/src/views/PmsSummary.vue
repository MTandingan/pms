<script setup>
    import { ref, reactive, onMounted, watch  } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import moment from 'moment/moment'
    import { useUserStore } from '@/stores/user';
    import { useUtilStore } from '@/stores/util';
    import { storeToRefs } from 'pinia';
    import Constants from '../globals';
    import { decryptData } from '../helpers/encryptUtil'
    import * as Util from '../helpers/helper';
    import axios from 'axios';
    
    //Variables
    const route = useRoute();
    const router = useRouter();
    const userStore = useUserStore();
    const utilStore = useUtilStore();
    const { user } = storeToRefs(userStore);
    var quarter_id = ref(route.params.id); 

    //Local Constants
    
    //Model Values
    const currentItemToDelete = ref(null);
    const errorAddExistingWsValidationParams = reactive({
        isError: false,
        errorMessage: ""
    });
    const errorIpAddressValidationParams = reactive({
        isError: false,
        errorMessage: ""
    });
    const quarter = ref(null);
    const departmentQuarterlyDetails = ref(null);
    const hasComputerIncompleteWorkstationStatus = ref(false);
    const hasExistedOnOtherDepts = ref(false);
    const hasIncompleteWorkstationStatus = ref(false);
    const isButtonLoading = ref(false);
    const isEmpty = ref(false);
    const isNotAllowedToDelete = ref(false);
    const isCurrentMonthAndYear = ref(false);
    const listOfAddedExistingWorkstation = ref([]);
    const listOfComputer = ref([]);
    const listOfEmployees = ref([]);
    const listOfExistingWsFromOtherDepts = ref([]);
    const listOfIncompleteWs = ref([]);
    const listOfQuarterlyWorkstations = ref([]);
    const listOfWorkstations = ref([]);
    const listOfMonthlyQuarters = ref([]);
    const listOfMonthlyOrderGroupWorkstations = ref([]);
    const messageForNoDeletion = ref('');
    const month = ref(moment().month() + 1);
    const isDeleteShown = ref(false);
    const isIpAddressUiLock = ref(false);

    const newWorkStationData = reactive({
                                        ws_userId: null,
                                        ws_location: '',
                                        ws_computerName: '',
                                        ws_ipAddress: '',
                                        ws_compId: null,
                                        quarter_id: 0,
                                        ws_isActive: true,
                                        ws_ipType: 1
                                    });
    const showAddWorkstationDialog = ref(false);
    const showExistingWorkStationDialog = ref(false);
    const showRemoveDialog = ref(false);
    const workStationCreateForm = ref(null);
    const workstationToBeAdded = ref(null);

    //Built-in Functions
    onMounted( async() => {
        if(decryptData(user.value, Constants.USER_SECRET_KEY) === null){
            await userStore.logout();
        } else {
            fetchData();
        }

       utilStore.setPageLoading({pIsPageLoading: false});
    });

    watch(() => showAddWorkstationDialog.value, (newValue, oldValue) => {
        if(newValue == false){
            clear();
        }
    });

    watch(() => showExistingWorkStationDialog.value, (newValue, oldValue) => {
        if(newValue == false){
            clearExistingWorkstationVariables();
        }
    });

    watch(() => quarter_id.value, (newValue, oldValue) => {
        if(newValue != oldValue){
            fetchData();
        }
    });

    watch(() => showRemoveDialog.value, (newValue, oldValue) => {
        if(newValue != oldValue){
            isNotAllowedToDelete.value = false;
            messageForNoDeletion.value = '';
        }
    });

    watch(() => newWorkStationData.ws_ipType, (newValue, oldValue) => {
        if(newValue == Constants.IP_TYPE_STATIC){
            isIpAddressUiLock.value = false;
        } else {
            isIpAddressUiLock.value = true;
            newWorkStationData.ws_ipAddress = "";
            errorIpAddressValidationParams.isError = false;
            errorIpAddressValidationParams.errorMessage = "";
        }
    });
    

    //User-defined Functions
    const fetchData = async() => {
        await getDepartmentAndQuarterlyDetailsById();
        await getListOfQuarterlyWorkstationById();           
        await getListOfComputer();
        await getListOfEmployees();
        await getListOfWorkstations();
        getListOfMonthlyQuarters();
        setUiValues();
        setValues();
    }

    //User-defined Functions
    const setUiValues = () => {
        let currentMonth = moment().month() + 1;
        let currentYear = moment().year();
        isCurrentMonthAndYear.value = false;

        if(departmentQuarterlyDetails.value.sched_year == currentYear){
            let monthlyOrderGroup = Util.generateOrderGroupMonthByMonthPosition(currentMonth);
            let month = monthlyOrderGroup.find(item => item.id == departmentQuarterlyDetails.value.quarter_monthlyQuarter);

            if(month != undefined){
                isCurrentMonthAndYear.value = (currentMonth <= month.id) ? true : false;
            }
        }

        /* UNCOMMENT THESE CODES IF YOU WANT TO TEST */
        // isCurrentMonthAndYear.value = true
    }

    const openAddExistingWorkstationDialog = () => {
        showAddWorkstationDialog.value = false;
        showExistingWorkStationDialog.value = true;
    };

    const addWorkStationToBeAdded = async() => {
        if(await checkAddExistingWorkstation() == true){
            listOfAddedExistingWorkstation.value.push(workstationToBeAdded.value);
        }
    };

    const checkAddExistingWorkstation = async() => {
        var hasPassed = true;

        //Check if workstation to be added is empty
        if(workstationToBeAdded.value == null){
            errorAddExistingWsValidationParams.isError = true;
            errorAddExistingWsValidationParams.errorMessage = "Please select a workstation to add"

            hasPassed = false;
            return;
        } else {
            errorAddExistingWsValidationParams.isError = false;
            errorAddExistingWsValidationParams.errorMessage = "";
        }

        //Check if workstation to be added has already been existed
        if(checkWorkstationAlreadyExists()){
            errorAddExistingWsValidationParams.isError = true;
            errorAddExistingWsValidationParams.errorMessage = "Workstation already exists in the department or is already inside the list to be added"

            hasPassed = false;
            return;
        } else {
            errorAddExistingWsValidationParams.isError = false;
            errorAddExistingWsValidationParams.errorMessage = "";
        }

        return hasPassed;
    }
    
    const checkWorkstationAlreadyExists = () => {
        var hasExist = false;

        hasExist = listOfAddedExistingWorkstation.value.some(item => item.ws_id == workstationToBeAdded.value.ws_id);

        if(hasExist){
            return true;
        }

        hasExist = listOfQuarterlyWorkstations.value.some(item => item.ws_id == workstationToBeAdded.value.ws_id);

        if(hasExist){
            return true;
        }
        
        return false;
    }

    const checkWorkstationAlreadyExistsOnOtherDepts = async() => {
        await getListOfQuarterlyWorkstationBySchedIdAndMonthlyQuarters();
        let result = listOfMonthlyOrderGroupWorkstations.value.some(item => item.wsq_wsId == workstationToBeAdded.value.ws_id);

        return result;
    }

    const getDepartmentAndQuarterlyDetailsById = async () => {
        var data = {
            quarter_id: quarter_id.value
        };

        const params = new URLSearchParams(data);
        var result = await axios.get(`/getDepartmentAndQuarterlyDetailsById?${params}`);
        departmentQuarterlyDetails.value = result.data.data[0];
        isDeleteShown.value = (month.value == departmentQuarterlyDetails.value.quarter_monthlyQuarter);
    }; 

    const getListOfMonthlyQuarters = () => {
        listOfMonthlyQuarters.value = Util.generateQuarterlyMonthsByQuarter(departmentQuarterlyDetails.value.quarter_monthlyQuarter);
    }

    const setValues = () => {
        let quarter_monthlyQuarter = departmentQuarterlyDetails.value.quarter_monthlyQuarter;
        let monthIndex = listOfMonthlyQuarters.value.findIndex(item => item.id == quarter_monthlyQuarter);
        quarter.value = listOfMonthlyQuarters.value[monthIndex].id;
    }

    const getListOfComputer = async () => {
        var data = {
            comp_status: Constants.COMP_STATUS_ACTIVE
        };

        const params = new URLSearchParams(data);

        var result = await axios.get(`/getListOfComputerByStatus?${params}`);
        listOfComputer.value = result.data.data;
    }

    const getListOfWorkstations = async () => {
        var data = {
            ws_isActive: Constants.ACTIVE_TRUE
        };

        const params = new URLSearchParams(data);

        var result = await axios.get(`/getListOfWorkstationsByStatus?${params}`);
        listOfWorkstations.value = result.data.data;
    }

    const getListOfEmployees = async () => {
        var result = await axios.get(`/getAllEmployeesTest`);
        // let result = await axios.get(`/get_employees`,{
        //     baseURL: 'http://172.16.1.39:3010/api',
        //     withCredentials: false
        // });
        
        listOfEmployees.value = result.data;
    }

    const getListOfQuarterlyWorkstationById = async() => {
        var data = {
            quarter_id: quarter_id.value
        };

        const params = new URLSearchParams(data);

        let result = await axios.get(`/getListOfQuarterlyWorkstationById?${params}`);

        listOfQuarterlyWorkstations.value = result.data.data;
    }

    const getListOfWorkstationsByQtrNotStatusAndSchedId = async() => {
        return await axios.get(`/getListOfWorkstationsByQtrNotStatusAndSchedId`, {
            params: {
                sched_id: departmentQuarterlyDetails.value.pdept_schedId,
                wsq_status: Constants.WSQ_STATUS_COMPLETE,
                listOfWorkstations: listOfAddedExistingWorkstation.value
            }
        });
    }

    const getListOfQuarterlyWorkstationBySchedIdAndMonthlyQuarters = async() => {
        var arrOfMonthOrderPositions = Util.generateOrderGroupMonthByMonthPosition(quarter.value);

        var data = {
            sched_id: departmentQuarterlyDetails.value.pdept_schedId,
            listOfMonthOrderPosition1: arrOfMonthOrderPositions[0].id,
            listOfMonthOrderPosition2: arrOfMonthOrderPositions[1].id,
            listOfMonthOrderPosition3: arrOfMonthOrderPositions[2].id
        };

        const params = new URLSearchParams(data);

        let result = await axios.get(`/getListOfQuarterlyWorkstationBySchedIdAndMonthlyQuarters?${params}`);

        listOfMonthlyOrderGroupWorkstations.value = result.data.data;
    }

    const createQuarterlyWorkStation = async(e) => {
        const { valid } = await workStationCreateForm.value.validate();

        if(valid && isValidCreatingQuarterlyWorkstation()){

            if(await isComputerHasExistingOwner({ws_compId: newWorkStationData.ws_compId})){
                hasComputerIncompleteWorkstationStatus.value = true;
                return;
            }

            hasComputerIncompleteWorkstationStatus.value = false;
            isButtonLoading.value = true;
            
            let data = {
                ws_userId: newWorkStationData.ws_userId.id,
                ws_userName: newWorkStationData.ws_userId.name,
                ws_location: newWorkStationData.ws_location,
                ws_computerName: newWorkStationData.ws_computerName,
                ws_ipAddress: newWorkStationData.ws_ipAddress,
                ws_compId: newWorkStationData.ws_compId,
                quarter_id: quarter_id.value,
                ws_isActive: newWorkStationData.ws_isActive,
                ws_ipType: newWorkStationData.ws_ipType,
                compAudit_message: `Assigned to ${newWorkStationData.ws_userId.name} with computer name of ${newWorkStationData.ws_computerName} with workstation ID #`
            };

            let result = await axios.post("/createQuarterlyWorkstationRecordCompAuditTrailWithWsId", data);

            if(result.data.status == Constants.STATUS_CODE_SUCCESS){
                utilStore.setSnackBar({
                    showModal: true,
                    modalDescription: result.data.message
                });

                showAddWorkstationDialog.value = false;
                await getListOfQuarterlyWorkstationById();
                clear();
            } else {
                logger.error("Error in Creating of PMS Summary", logger.createErrorContext("create-pms-summary", result.data.message));
                utilStore.setSnackBar({
                    showModal: true,
                    modalDescription: result.data.message
                });
            }

            isButtonLoading.value = false;
        }
    }

    const isComputerHasExistingOwner = async(body) => {
        var params = {
            ws_compId: body.ws_compId,
            wsq_status: Constants.WSQ_STATUS_COMPLETE 
        };

        let result = await axios.get(`/getListOfQuarterlyWorkstationByCompIdAndNotStatus`, { params: params });

        if(result.data.data.length !== 0){
            return true;
        }

        return false;
    }

    const isValidCreatingQuarterlyWorkstation = () => {
        if(isIpAddressUiLock.value == false && newWorkStationData.ws_ipType == Constants.IP_TYPE_STATIC){
            if(newWorkStationData.ws_ipAddress == null || newWorkStationData.ws_ipAddress == ""){
                errorIpAddressValidationParams.isError = true;
                errorIpAddressValidationParams.errorMessage = "IP Address must not be empty when it is static";
                
                return false;
            } else {
                errorIpAddressValidationParams.isError = false;
                errorIpAddressValidationParams.errorMessage = "";
            }
        }
        
        return true;
    }

    const addMultipleQuarterlyWorkStation = async(e) => {
        if(listOfAddedExistingWorkstation.value.length !== 0){
            //Don't save yet if there's one department that existed already on its associated month
            listOfExistingWsFromOtherDepts.value = await checkWorkstationsAlreadyExistsOnOtherDepts();

            if(listOfExistingWsFromOtherDepts.value.length !== 0){
                hasExistedOnOtherDepts.value = true;
            } else {
                hasExistedOnOtherDepts.value = false;
            }

            //Dont't save if workstation has incomplete status from previous month
            listOfIncompleteWs.value = (await getListOfWorkstationsByQtrNotStatusAndSchedId()).data.data;
            
            if(listOfIncompleteWs.value.length !== 0){
                hasIncompleteWorkstationStatus.value = true;
            } else {
                hasIncompleteWorkstationStatus.value = false;
            }

            if(hasExistedOnOtherDepts.value === false && hasIncompleteWorkstationStatus.value === false){
                let data = {
                    listOfAddedExistingWorkstation: listOfAddedExistingWorkstation.value,
                    quarter_id: quarter_id.value
                };

                isButtonLoading.value = true;

                let result = await axios.post("/addMultipleQuarterlyWorkStation", data);

                if(result.data.status == Constants.STATUS_CODE_SUCCESS){
                    utilStore.setSnackBar({
                        showModal: true,
                        modalDescription: result.data.message
                    });

                    showExistingWorkStationDialog.value = false;
                    await getListOfQuarterlyWorkstationById();
                } else {
                    logger.error("Error in Adding multiple quarterly workstation", logger.createErrorContext("add-multiple-quarterly-workstation", result.data.message));
                    utilStore.setSnackBar({
                        showModal: true,
                        modalDescription: result.data.message
                    });
                }
            }

            isButtonLoading.value = false;
        } else {
            isEmpty.value = true;
        }
    }

    const checkWorkstationsAlreadyExistsOnOtherDepts = async() => {
        await getListOfQuarterlyWorkstationBySchedIdAndMonthlyQuarters();

        var result = listOfMonthlyOrderGroupWorkstations.value.filter(item1 => listOfAddedExistingWorkstation.value.some(item2 => item1.wsq_wsId == item2.ws_id));

        return result;
    }

    const deleteQuarterlyWorkstation = async(e) => {
        isButtonLoading.value = true;

        let result = await axios.delete(`/deleteWorkstationQuarterlyCheckPrevRec/${currentItemToDelete.value.wsq_id}`);

        if(result.data.status == Constants.STATUS_CODE_SUCCESS){
            utilStore.setSnackBar({
                showModal: true,
                modalDescription: result.data.message
            });

            await getListOfQuarterlyWorkstationById();
            showRemoveDialog.value = false;
        } else if(result.data.status == Constants.STATUS_CODE_DELETE_DENY){
            isNotAllowedToDelete.value = true;
            messageForNoDeletion.value = result.data.message;
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

    const clear = async() => {
        newWorkStationData.ws_userId = null;
        newWorkStationData.ws_location = '';
        newWorkStationData.ws_computerName = '';
        newWorkStationData.ws_ipAddress = '';
        newWorkStationData.ws_compId = null;
        newWorkStationData.quarter_id = 0;
        newWorkStationData.ws_isActive = true;
        newWorkStationData.ws_ipType = 1;
        hasComputerIncompleteWorkstationStatus.value = false;
        isIpAddressUiLock.value = false;
        errorIpAddressValidationParams.isError = false;
        errorIpAddressValidationParams.errorMessage = "";
    }

    const clearExistingWorkstationVariables = () => {
        errorAddExistingWsValidationParams.isError = false;
        errorAddExistingWsValidationParams.errorMessage = "";
        workstationToBeAdded.value = null;
        listOfAddedExistingWorkstation.value = [];
        isEmpty.value = false;
        hasExistedOnOtherDepts.value = false;
        hasIncompleteWorkstationStatus.value = false;
    }

    const removeToBeAddedExistingWorkshop = (id) => {
        var index = listOfAddedExistingWorkstation.value.findIndex(item => item.ws_id == id);
        listOfAddedExistingWorkstation.value.splice(index, 1); 
    }

    const searchPmsSummaryByQuarterMonth = async() => {
        var data = {
            pdept_id: departmentQuarterlyDetails.value.pdept_id,
            quarter: quarter.value
        };

        const params = new URLSearchParams(data);

        let result = await axios.get(`/getQuarterByPmsDeptIdAndMonthlyQuarter?${params}`);

        if(result.data.data.length !== 0){
            quarter_id.value = Number(result.data.data[0].quarter_id);
        } else {
            //TODO: Do something...
        }
    }

    const goToWorkstationChecklist = (id) => {
        router.push(`/WorkstationEdit/${id}`);
    }

    const openDeleteDialogBox = (item) => {
        currentItemToDelete.value = {
            wsq_id: item.wsq_id,
            ws_computerName: item.ws_computerName
        };

        showRemoveDialog.value = true;
    }

</script>

<template>
    <v-row>
        <v-col
            cols="6"
        >
            <div class="font-size-32px mb-3">
                <v-icon
                    class="me-1"
                    size="x-small"
                    icon="mdi-laptop"
                >
                </v-icon>
                Preventive Maintenance Summary
            </div>
            <div class="font-size-16px">
                <span class="font-weight-medium">Location:</span> {{ (departmentQuarterlyDetails === "" ||  departmentQuarterlyDetails === null) ? Constants.N_A : departmentQuarterlyDetails.location_name }}
            </div>
            <div class="font-size-16px">
                <span class="font-weight-medium">Department:</span> {{ (departmentQuarterlyDetails === "" ||  departmentQuarterlyDetails === null) ? Constants.N_A : departmentQuarterlyDetails.location_deptName }}
            </div>
            <div class="font-size-16px">
                <span class="font-weight-medium">Month:</span> {{ (departmentQuarterlyDetails === "" || departmentQuarterlyDetails === null) ? Constants.N_A : Util.getFullMonthNameByMonthPosition(departmentQuarterlyDetails.quarter_monthlyQuarter) }}
            </div>
            <div class="font-size-16px">
                <span class="font-weight-medium">Year:</span> {{ (departmentQuarterlyDetails === "" || departmentQuarterlyDetails === null) ? Constants.N_A : departmentQuarterlyDetails.sched_year }}
            </div>
        </v-col>
        <v-col
            cols="6"
        >
            <div class="d-flex flex-wrap flex-row-reverse">
                <v-dialog
                    v-model="showAddWorkstationDialog"
                    width="75%"
                >
                    <template 
                        v-slot:activator="{ props }"
                    >
                        <v-btn 
                            v-if="isCurrentMonthAndYear"
                            class="font-weight-bold bg-blue-lighten-1 mx-1 my-1"
                            prepend-icon="mdi-plus"
                            variant="elevated"
                            v-bind="props"
                        >
                            Add Workstation
                        </v-btn>
                    </template>
                    <v-card 
                        class="pa-5"
                    >
                        <v-form
                            ref="workStationCreateForm"
                            @submit.prevent
                        >
                            <v-card-title
                                class="font-weight-medium d-flex"
                                tag="div"
                            >
                                <div 
                                    class="d-inline"
                                >
                                    Add Workstation
                                </div>
                            </v-card-title>
                            <v-divider></v-divider>
                            <v-card-text>
                                <v-container>
                                    <v-row>
                                        <v-col
                                            cols="12"
                                        >
                                            <v-autocomplete
                                                clearable
                                                return-object
                                                variant="underlined"
                                                density="comfortable"
                                                label="User"
                                                item-title="name"
                                                v-model="newWorkStationData.ws_userId"
                                                :items="listOfEmployees"
                                                :rules="[v => !!v || 'User is required']"
                                            >
                                            </v-autocomplete>
                                            <v-text-field
                                                clearable
                                                variant="underlined"
                                                placeholder="Enter Location"
                                                density="comfortable"
                                                label="Area Resided"
                                                maxlength="255"
                                                v-model.trim="newWorkStationData.ws_location"
                                            >
                                            </v-text-field>
                                            <v-text-field
                                                required
                                                clearable
                                                class="mt-2"
                                                variant="underlined"
                                                placeholder="Enter Computer Name"
                                                density="comfortable"
                                                label="Computer Name"
                                                maxlength="255"
                                                v-model.trim="newWorkStationData.ws_computerName"
                                                :rules="[v => !!v || 'Computer name is required']"
                                            >
                                            </v-text-field>
                                            <v-radio-group 
                                                inline
                                                label="IP Type:"
                                                v-model="newWorkStationData.ws_ipType"
                                                class="ms-n4 mt-2"
                                            >
                                                <v-radio
                                                    name="rdbIpType"
                                                    label="Static"
                                                    color="blue-lighten-1"
                                                    :value=Constants.IP_TYPE_STATIC
                                                    class="me-2"
                                                ></v-radio>
                                                <v-radio
                                                    name="rdbIpType"
                                                    label="Obtained / Dynamic"
                                                    color="blue-lighten-1"
                                                    :value=Constants.IP_TYPE_DYNAMIC
                                                    class="me-2"
                                                ></v-radio>
                                            </v-radio-group>
                                            <v-text-field
                                                clearable
                                                class="mt-2"
                                                variant="underlined"
                                                placeholder="Enter IP Address"
                                                density="comfortable"
                                                label="IP Address"
                                                maxlength="255"
                                                v-model.trim="newWorkStationData.ws_ipAddress"
                                                :disabled="isIpAddressUiLock"
                                                :error="errorIpAddressValidationParams.isError"
                                                :error-messages="errorIpAddressValidationParams.errorMessage"
                                            >
                                            </v-text-field>
                                            <v-autocomplete
                                                clearable
                                                variant="underlined"
                                                density="comfortable"
                                                label="Computer Hardware"
                                                item-title="comp_name"
                                                item-value="comp_id"
                                                :items="listOfComputer"
                                                v-model="newWorkStationData.ws_compId"
                                                :rules="[v => !!v || 'Computer Hardware is required']"
                                            >
                                            </v-autocomplete>
                                            <div
                                                v-if="hasComputerIncompleteWorkstationStatus"
                                                class="font-size-12px mt-1 text-red"
                                            >
                                                The computer hardware still has an owner or its assigned workstation status is still not on COMPLETE status
                                            </div>
                                        </v-col>
                                    </v-row>
                                </v-container>
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <div
                                    class="d-flex flex-row"
                                >
                                    <v-btn
                                        class="font-weight-bold"
                                        color="grey-darken-4"
                                        variant="outlined"
                                        @click="showAddWorkstationDialog = false"
                                    >
                                        Close
                                    </v-btn>
                                    <v-btn
                                        class="font-weight-bold bg-blue-lighten-1"
                                        variant="elevated"
                                        type="submit"
                                        prepend-icon="mdi-plus"
                                        :loading="isButtonLoading"
                                        @click="openAddExistingWorkstationDialog"
                                    >
                                        Add Existing Workstations
                                    </v-btn>
                                    <v-btn
                                        class="font-weight-bold bg-blue-lighten-1"
                                        variant="elevated"
                                        type="submit"
                                        :loading="isButtonLoading"
                                        @click="createQuarterlyWorkStation()"
                                    >
                                        Create Workstation
                                    </v-btn>
                                </div>
                            </v-card-actions>
                        </v-form>
                    </v-card>
                </v-dialog>
                <v-btn 
                    class="font-weight-bold mx-1 my-1"
                    prepend-icon="mdi-arrow-left"
                    color="blue-lighten-1"
                    variant="outlined"
                    @click="router.push(`/`);"
                >
                    Return Dashboard
                </v-btn>
           </div>
        </v-col>
        <v-col
            class="d-flex flex-row"
            cols="12"
            xl="6"
            lg="6"
            md="6"
            sm="12"
            xs="12"
        >
                <v-autocomplete
                    v-model.trim="quarter"
                    clearable
                    variant="underlined"
                    density="comfortable"
                    label="Month"
                    item-title="name"
                    item-value="id"
                    :items="listOfMonthlyQuarters"
                >
                </v-autocomplete>
                <v-btn 
                    class="font-weight-bold bg-blue-lighten-1 ma-1 ms-5"
                    prepend-icon="mdi-database-search-outline"
                    variant="elevated"
                    @click="searchPmsSummaryByQuarterMonth"
                >
                    Search
                </v-btn>
        </v-col>
        <v-col
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
                            Owner
                        </th>
                        <th 
                            class="text-left text-black font-weight-bold"
                        >
                            Computer Name
                        </th>
                        <th 
                            class="text-left text-black font-weight-bold"
                        >
                            PC Health Status
                        </th>
                        <th 
                            class="text-left text-black font-weight-bold"
                        >
                            Resolution
                        </th>
                        <th 
                            class="text-center text-black font-weight-bold"
                        >
                            Maintenance Status
                        </th>
                        <th 
                            class="text-center text-black font-weight-bold"
                        >
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="item in listOfQuarterlyWorkstations"
                        :class="[item.ws_isActive ? '' : 'bg-red-lighten-4','font-size-14px']"
                        :key="item.wsq_id"
                        
                    >
                        <td class="text-center">
                            <v-btn
                                class="btn-user-name"
                                variant="plain"
                                @click="goToWorkstationChecklist(item.wsq_id)"
                            >
                                {{ item.ws_userName }}
                            </v-btn>
                        </td>
                        <td>{{ item.ws_computerName }}</td>
                        <td
                            :class="[item.ws_isActive ? 'text-green-lighten-1' : 'text-red-lighten-1', 'font-weight-bold']"
                        >
                            {{ item.ws_isActive ? "ACTIVE" : "INACTIVE" }}
                        </td>
                        <td>{{ Util.getWsqResolutionTextByResolutionId(item.wsq_resolution) }}</td>
                        <td
                            class="text-center"
                        >
                            <v-chip
                                v-if="item.wsq_acknowledgedBy !== null"
                                class="ma-2"
                                color="blue-darken-1"
                                text-color="white"
                                size="small"
                            >
                                Acknowledged
                            </v-chip>
                            <v-chip
                                v-if="item.wsq_checkedBy !== null"
                                class="ma-2"
                                color="yellow-darken-4"
                                text-color="white"
                                size="small"
                            >
                                Checked
                            </v-chip>
                            <v-chip
                                v-if="item.wsq_status === Constants.WSQ_STATUS_PENDING"
                                class="ma-2"
                                text-color="white"
                                size="small"
                            >
                                Pending
                            </v-chip>
                            <v-chip
                                v-else-if="item.wsq_status === Constants.WSQ_STATUS_DISAPPROVE"
                                class="ma-2"
                                color="red-darken-1"
                                text-color="white"
                                size="small"
                            >
                                Disapprove
                            </v-chip>
                            <v-chip
                                v-else-if="item.wsq_status === Constants.WSQ_STATUS_FOR_APPROVAL"
                                class="ma-2"
                                color="orange-darken-1"
                                text-color="white"
                                size="small"
                            >
                                For Approval
                            </v-chip>
                            <v-chip
                                v-else-if="item.wsq_status === Constants.WSQ_STATUS_COMPLETE"
                                class="ma-2"
                                color="green-lighten-1"
                                text-color="white"
                                size="small"
                            >
                                Complete
                            </v-chip>
                        </td>
                        <td
                            class="text-center"
                        >
                            <v-btn 
                                v-if="isCurrentMonthAndYear"
                                class="font-weight-bold bg-red"
                                density="comfortable"
                                prepend-icon="mdi-file-document-remove"
                                variant="elevated"
                                @click="openDeleteDialogBox(item)"
                            >
                                Remove
                            </v-btn>
                        </td>
                    </tr>
                </tbody>
            </v-table>
        </v-col>
    </v-row>

    <v-dialog
        v-model="showExistingWorkStationDialog"
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
                        Add Existing Workstation
                    </div>
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text>
                    <v-container>
                        <v-row>
                            <v-col
                                cols="12"
                            >
                                <v-autocomplete
                                    clearable
                                    return-object
                                    variant="underlined"
                                    density="comfortable"
                                    label="Workstation"
                                    item-title="ws_computerName"
                                    v-model="workstationToBeAdded"
                                    :items="listOfWorkstations"
                                    :error="errorAddExistingWsValidationParams.isError"
                                    :error-messages="errorAddExistingWsValidationParams.errorMessage"
                                >
                                </v-autocomplete>
                                <div class="d-flex flex-row-reverse">
                                    <v-btn
                                        class="font-weight-bold bg-blue-lighten-1"
                                        variant="elevated"
                                        prepend-icon="mdi-plus"
                                        @click="addWorkStationToBeAdded"
                                    >
                                        Add
                                    </v-btn> 
                                </div>
                            </v-col>
                            <div
                                v-if="hasExistedOnOtherDepts"
                                class="font-size-12px mt-1 text-red"
                            >
                                There are workstations that already existed on other months on the same batch of this month. Please remove the following workstations before submitting:
                                <div
                                    v-for="item in listOfExistingWsFromOtherDepts"
                                    class="font-weight-bold"
                                >
                                    {{ item.ws_computerName }},  
                                </div>
                            </div>
                            <div
                                v-if="hasIncompleteWorkstationStatus"
                                class="font-size-12px mt-1 text-red"
                            >
                                There are workstations that have incomplete status from the past months. Please update the following workstation status to complete before submitting:
                                <div
                                    v-for="item in listOfIncompleteWs"
                                    class="font-weight-bold"
                                >
                                    {{ item.ws_computerName }},  
                                </div>
                            </div>
                            <v-divider
                                class="mt-4"
                            >
                            </v-divider>
                            <v-col
                                cols="12"
                            >
                                <div
                                    class="font-size-16px ms-n2 mt-2"
                                >
                                    Workstation to Add:
                                </div>
                                
                            </v-col>
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
                                            <th 
                                                class="text-left text-black font-weight-bold"
                                                width="50%"
                                            >
                                                Owner Name
                                            </th>
                                            <th 
                                                class="text-left text-black font-weight-bold"
                                                width="50%"
                                            >
                                                Computer
                                            </th>
                                            <th class="text-left text-black font-weight-bold">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <TransitionGroup 
                                            name="workstations"
                                        >
                                            <tr
                                                v-for="item in listOfAddedExistingWorkstation"
                                                class="font-size-14px"
                                                :key="item.ws_id"
                                            >
                                                <td>{{ item.ws_userName }}</td>
                                                <td>{{ item.ws_computerName }}</td>
                                                <td>
                                                    <v-btn 
                                                        class="font-weight-bold bg-red me-2"
                                                        density="comfortable"
                                                        prepend-icon="mdi-file-document-remove"
                                                        variant="elevated"
                                                        @click="removeToBeAddedExistingWorkshop(item.ws_id)"
                                                    >
                                                    Remove
                                                    </v-btn>
                                                </td>
                                            </tr>
                                        </TransitionGroup>
                                    </tbody>
                                </v-table>
                            </v-col>
                            <v-divider
                                class="mt-10"
                            >
                            </v-divider>
                            <div
                                v-if="isEmpty"
                                class="font-size-12px ms-n2 mt-1 text-red"
                            >
                                Please add at least one workstation be added in the list
                            </div>
                        </v-row>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        class="font-weight-bold me-2"
                        color="grey-darken-4"
                        variant="outlined"
                        @click="showExistingWorkStationDialog = false"
                    >
                        Close
                    </v-btn>
                    <v-btn
                        class="font-weight-bold bg-blue-lighten-1"
                        variant="elevated"
                        @click="addMultipleQuarterlyWorkStation"
                    >
                        Add Workstations
                    </v-btn> 
                </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog
        v-model="showRemoveDialog"
        width="75%"
    >
        <v-card 
            class="pa-5"
        >
            <v-card-title
                class="font-weight-medium d-flex"
                tag="div"
            >
                <v-icon 
                    class="d-inline me-1" 
                    icon="mdi-file-document-remove"
                    size="small"
                >
                </v-icon>
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
                                Are you sure you want to delete <span class="font-weight-bold">"{{ currentItemToDelete.ws_computerName }}"</span> permanently? Once it's done it cannot be undone
                            </div>
                            <div
                                v-if="isNotAllowedToDelete"
                                class="text-center font-size-12px text-red"
                            >
                                {{ messageForNoDeletion }}
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
                    @click="showRemoveDialog = false"
                >
                    Close
                </v-btn>
                <v-btn
                    class="font-weight-bold bg-blue-lighten-1"
                    variant="elevated"
                    :loading="isButtonLoading"
                    @click="deleteQuarterlyWorkstation()"
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

    .btn-user-name {
        text-decoration: underline;
        color: blue;
    }

    /* TRANSITION GROUP */
    .workstations-enter-from {
        opacity: 0;
        transform: translateY(-10px);
    }

    .workstations-enter-active {
        transition: all 0.5s ease;
    }

    .workstations-enter-to {
        opacity: 1;
    }

    .workstations-leave-from {
        opacity: 1;
    }

    .workstations-leave-active {
        transition: all 0.5s ease;
        position: absolute;
    }

    .workstations-leave-to {
        opacity: 0;
        transform: translateX(-50px);
    }

    .workstations-move {
        transition: all 0.5s ease;
    }
</style>