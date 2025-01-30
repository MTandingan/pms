<script setup>
    import { ref, reactive, watch, onMounted } from 'vue';
    import { useRouter } from 'vue-router';
    import moment from 'moment/moment'
    import { useUserStore } from '@/stores/user';
    import { useUtilStore } from '@/stores/util';
    import { storeToRefs } from 'pinia';
    import Constants from "@/globals";
    import * as Util from '../helpers/helper';
    import { decryptData } from '../helpers/encryptUtil'
    import axios from 'axios';
    import UserWorkstationRightsForm from '../components/UserWorkstationRightsForm.vue';
   
    //Variables
    const router = useRouter();
    const userStore = useUserStore();
    const utilStore = useUtilStore();
    const { user } = storeToRefs(userStore);

    //Local Constants
    
    //Model Values
    const errorYearValidationParams = reactive({
        isError: false,
        errorMessage: ""
    });
    const errorDepartmentValidationParams = reactive({
        isError: false,
        errorMessage: ""
    });
    const errorDepartmentToBeRemovedLocationValidationParams = reactive({
        isError: false,
        errorMessage: ""
    });
    const errorYearToBeRemovedLocationValidationParams = reactive({
        isError: false,
        errorMessage: ""
    });
    const errorMonthlyBatchValidationParams = reactive({
        isError: false,
        errorMessage: ""
    });
    const errorDepartmentToBeAddedUsersValidationParams = reactive({
        isError: false,
        errorMessage: ""
    });
    const errorYearToBeAddedUsersValidationParams = reactive({
        isError: false,
        errorMessage: ""
    });
    const errorMonthToBeAddedUsersValidationParams = reactive({
        isError: false,
        errorMessage: ""
    });
    const errorWorkstationToBeAddedUsersValidationParams = reactive({
        isError: false,
        errorMessage: ""
    });
    const isAllowTranferOfPrev4thQtyWsq = ref(false);
    const listLocations = ref([]);
    const listLocationsWithQuarterlyMonths = ref([]);
    const listQuarterlyMonthsForWorkstationUserRights = ref([]);
    const listWorkstationsForWorkstationUserRights = ref([]);
    const listOfEmployees = ref([]);
    const listOfYear = ref([]);
    const listUserWorkstationRights = ref([]);
    const isButtonLoading = ref(false);
    const location = ref(null);
    const location_toBeRemovedLoc = ref(null);
    const sched_id = ref(null);
    const sched_id_toBeRemovedLoc = ref(null);
    const batch = ref(null);
    const year = moment().year();
    const location_toAddUsers = ref(null);
    const sched_id_toAddUsers = ref(null);
    const month_toAddUsers = ref(null);
    const workstation_toAddUser = ref(null);
    const hasNoWorkstationsForUserRights = ref(false);
    const isDisableLocationToAddUsersDropDown = ref(true);
    const isDisableMonthToAddUsersDropDown = ref(true);
    const isDisableGetWorkstationDataForRights = ref(true);
    const userWorkstationRightsDialogData = reactive({
        isShowDialog: false
    });
    const wsqDetailsForWorkstationUserRights = ref(null);

    /* UNCOMMENT THESE CODES IF DOING TESTING */
    // const year = 2024; 

    //Built-in Functions
    onMounted(async () => {
        if(decryptData(user.value, Constants.USER_SECRET_KEY) !== null){
            await fetchData();
        } else {
            await userStore.logout();
        }

        utilStore.setPageLoading({pIsPageLoading: false});
    });

    watch(() => sched_id_toAddUsers.value, (newValue, oldValue) => {
        getListOfLocationsForWorkstationUserRights();
    });

    watch(() => location_toAddUsers.value, (newValue, oldValue) => {
        getQuarterlyMonthsOfLocationForWorkstationUserRights();
    });

    //User-defined Functions
    const fetchData = async() => {
        await getListOfLocations();
        await getListOfYear();
        await getListOfEmployees();
    }

    const openWorkstationRightsFormDialog = async (_isShowDialog) => {
        userWorkstationRightsDialogData.isShowDialog = _isShowDialog;
    }

    const getListOfLocations = async () => {
        var result = await axios.get(`/getAllListOfLocation`);
        listLocations.value = result.data.data;
    }; 

    const getListOfYear = async () => {
        var data = {
            sched_year: year
        };

        const params = new URLSearchParams(data);

        let result = await axios.get(`/getPmsScheduleByYear?${params}`);

        if(result.data.status == Constants.STATUS_CODE_SUCCESS){
            listOfYear.value.push(result.data.data[0]);
        } else if(result.data.status == Constants.STATUS_CODE_INVALID_TOKEN){
            userStore.logout();
        }  else {
            logger.error("Error in Fetching PMS Schedule Years", logger.createErrorContext("fetch-settings-pms-year", result.data.message));
            utilStore.setSnackBar({
                showModal: true,
                modalDescription: result.data.message
            });
        }
    }

    const getListOfEmployees = async () => {
        var result = await axios.get(`/getAllEmployeesTest`);
        // let result = await axios.get(`/get_employees`,{
        //     baseURL: 'http://172.16.1.39:3010/api',
        //     withCredentials: false
        // });
        
        listOfEmployees.value = result.data;
    }

    const getListOfUserWorkstationRightsByWsqId = async(wsq_id) => {
        var params = {
            wsqRights_wsqId: wsq_id
        };
    
        var result = await axios.get(`/getListOfUserWorkstationRightsByWsqId`, {params: params});
        listUserWorkstationRights.value = result.data.data;
    }

    const getListOfLocationsForWorkstationUserRights = async () => {
        isButtonLoading.value = true;
        isDisableLocationToAddUsersDropDown.value = true;
        isDisableMonthToAddUsersDropDown.value = true;
        listLocationsWithQuarterlyMonths.value = [];
        listQuarterlyMonthsForWorkstationUserRights.value = [];
        location_toAddUsers.value = null;
        month_toAddUsers.value = null;

        if(checkErrorForSchedIdOfAddingUserRights() != true){
            var data = {
                sched_id: sched_id_toAddUsers.value
            };

            const params = new URLSearchParams(data);

            var result = await axios.get(`/getAllListOfLocationWithMonthlyBatchBySchedId?${params}`);
            let list = result.data.data;
            
            if(list !== null || list.length !== 0){
                listLocationsWithQuarterlyMonths.value = list.map(item => item[1]);
                isDisableLocationToAddUsersDropDown.value = false;
            }
        }
        
        isButtonLoading.value = false;
    };

    const getWorkstationsForWorkstationUserRights = async() => {
        let params = {
            pdept_schedId: sched_id_toAddUsers.value,
            pdept_locationId: location_toAddUsers.value.location_id,
            quarter_monthlyQuarter: month_toAddUsers.value .id
        };
        
        let result = await axios.get(`/getQuarterlyWorkstationByDeptDetailsAndMonth`, { params });
        let data = result.data.data;

        return data;
    }

    const getQuarterlyMonthsOfLocationForWorkstationUserRights = () => {
        isDisableMonthToAddUsersDropDown.value = true;
        listQuarterlyMonthsForWorkstationUserRights.value = [];
        month_toAddUsers.value = null;

        if(checkErrorForLocationOfAddingUserRights() != true){
            let data = location_toAddUsers.value.quarter_monthlyQuarters;

            let new_data = data.map(month => {
                return Constants.arrOfFullNameMonths.find(obj => obj.id === month);
            });

            listQuarterlyMonthsForWorkstationUserRights.value = new_data;

            isDisableMonthToAddUsersDropDown.value = false;
        }
    }

    const getDepartmentWorkstationQuarterlyDetailsByWsqId = async (wsq_id) => {
        var data = {
            wsq_id: wsq_id
        };

        const params = new URLSearchParams(data);
        var result = await axios.get(`/getDepartmentWorkstationQuarterlyDetailsByWsqId`, { params });

        wsqDetailsForWorkstationUserRights.value = result.data.data[0];
    }; 

    const addDepartment = async() => {
        isButtonLoading.value = true;

        if(await checkError() != true){
            var data = {
                sched_id: sched_id.value,
                pdept_locationId: location.value.location_id,
                pdept_batch: batch.value,
                isAllowTranferOfPrev4thQtyWsq: isAllowTranferOfPrev4thQtyWsq.value
            };

            let result = await axios.put("/addDepartmentBySchedId", data);

            if(data.isAllowTranferOfPrev4thQtyWsq){
                let result = await axios.post("/addQuarterlyWorkstationLastPrevRecord", data);

                if(result.data.status == Constants.STATUS_CODE_SUCCESS){
                    utilStore.setCustomDialog({
                        showDialog: true,
                        modalTitle: "Success",
                        modalDescription: "Successfully added the location on the PMS Schedule"
                    });
                } else {
                    logger.error("Error in Adding location with the 4th quarter data for a PMS Schedule", logger.createErrorContext("create-department-fourth-quarter", result.data.message));
                    utilStore.setSnackBar({
                        showModal: true,
                        modalDescription: result.data.message
                    });
                }
            } else {
                if(result.data.status == Constants.STATUS_CODE_SUCCESS){
                    utilStore.setCustomDialog({
                        showDialog: true,
                        modalTitle: "Success",
                        modalDescription: "Successfully added the location on the PMS Schedule"
                    });
                } else {
                    logger.error("Error in Adding location for a PMS Schedule", logger.createErrorContext("create-department", result.data.message));
                    utilStore.setSnackBar({
                        showModal: true,
                        modalDescription: result.data.message
                    });
                }
            }            
        }

        isButtonLoading.value = false;
    }

    const deleteLocationOfPmsSchedule = async() => {
        isButtonLoading.value = true;

        if(await checkErrorOfRemovingLocation() != true){
            var data = {
                sched_id: sched_id_toBeRemovedLoc.value,
                location_id: location_toBeRemovedLoc.value.location_id
            };

            let result = await axios.delete(`/deleteLocationOfPmsSchedule/${data.sched_id}/${data.location_id}`);

            if(result.data.status == Constants.STATUS_CODE_SUCCESS){
                utilStore.setCustomDialog({
                    showDialog: true,
                    modalTitle: "Success",
                    modalDescription: "Successfully removed the location on the PMS Schedule"
                });
            } else {
                utilStore.setSnackBar({
                    showModal: true,
                    modalDescription: result.data.message
                });
            }
        }

        isButtonLoading.value = false;
    }

    const checkError = async() => {
        var hasError = false;

        if(sched_id.value == null){
            errorYearValidationParams.isError = true;
            errorYearValidationParams.errorMessage = "Year must not be empty"
            hasError = true;
        } else {
            errorYearValidationParams.isError = false;
            errorYearValidationParams.errorMessage = ""
        }

        if(location.value == null){
            errorDepartmentValidationParams.isError = true;
            errorDepartmentValidationParams.errorMessage = "Location must not be empty"
            hasError = true;
        } else {
            errorDepartmentValidationParams.isError = false;
            errorDepartmentValidationParams.errorMessage = ""
        }

        if(batch.value == null){
            errorMonthlyBatchValidationParams.isError = true;
            errorMonthlyBatchValidationParams.errorMessage = "Monthly Batch must not be empty"
            hasError = true;
        } else {
            errorMonthlyBatchValidationParams.isError = false;
            errorMonthlyBatchValidationParams.errorMessage = ""
        }

        if(hasError == true){
            return true;
        }

        var schedHasError = await checkSchedIdIsCurrentYear(sched_id.value);
        if(schedHasError == true){
            utilStore.setSnackBar({
                showModal: true,
                modalDescription: "Year should be the current year only. Please change the year and try again"
            });

            return true;
        }

        var departmentHasError = await checkDeptAlreadyExistsInPmsYear();
        if(departmentHasError == true){
            utilStore.setSnackBar({
                showModal: true,
                modalDescription: "Location already exists in the PMS schedule within the chosen year. Please choose other location and try again"
            });

            return true;
        }

        return false;
    }

    const checkErrorForSchedIdOfAddingUserRights = () => {
        var hasError = false;

        if(sched_id_toAddUsers.value == null){
            errorYearToBeAddedUsersValidationParams.isError = true;
            errorYearToBeAddedUsersValidationParams.errorMessage = "Year must not be empty"
            hasError = true;
        } else {
            errorYearToBeAddedUsersValidationParams.isError = false;
            errorYearToBeAddedUsersValidationParams.errorMessage = ""
        }

        if(hasError == true){
            return true;
        }

        return false;
    }

    const checkErrorForLocationOfAddingUserRights = () => {
        var hasError = false;

        if(location_toAddUsers.value == null){
            errorDepartmentToBeAddedUsersValidationParams.isError = true;
            errorDepartmentToBeAddedUsersValidationParams.errorMessage = "Location must not be empty"
            hasError = true;
        } else {
            errorDepartmentToBeAddedUsersValidationParams.isError = false;
            errorDepartmentToBeAddedUsersValidationParams.errorMessage = ""
        }

        if(hasError == true){
            return true;
        }

        return false;
    }

    const checkErrorForMonthOfAddingUserRights = () => {
        var hasError = false;

        if(month_toAddUsers.value == null){
            errorMonthToBeAddedUsersValidationParams.isError = true;
            errorMonthToBeAddedUsersValidationParams.errorMessage = "Location must not be empty"
            hasError = true;
        } else {
            errorMonthToBeAddedUsersValidationParams.isError = false;
            errorMonthToBeAddedUsersValidationParams.errorMessage = ""
        }

        if(hasError == true){
            return true;
        }

        return false;
    }

    const checkErrorForSearchingWorkstationOfAddingUserRights = () => {
        var hasError = false;

        if(workstation_toAddUser.value == null){
            errorWorkstationToBeAddedUsersValidationParams.isError = true;
            errorWorkstationToBeAddedUsersValidationParams.errorMessage = "Workstation must not be empty"
            hasError = true;
        } else {
            errorWorkstationToBeAddedUsersValidationParams.isError = false;
            errorWorkstationToBeAddedUsersValidationParams.errorMessage = ""
        }

        if(hasError == true){
            return true;
        }

        return false;
    }

    const checkErrorOfRemovingLocation = async() => {
        var hasError = false;

        if(sched_id_toBeRemovedLoc.value == null){
            errorYearToBeRemovedLocationValidationParams.isError = true;
            errorYearToBeRemovedLocationValidationParams.errorMessage = "Year must not be empty"
            hasError = true;
        } else {
            errorYearToBeRemovedLocationValidationParams.isError = false;
            errorYearToBeRemovedLocationValidationParams.errorMessage = ""
        }

        if(location_toBeRemovedLoc.value == null){
            errorDepartmentToBeRemovedLocationValidationParams.isError = true;
            errorDepartmentToBeRemovedLocationValidationParams.errorMessage = "Location must not be empty"
            hasError = true;
        } else {
            errorDepartmentToBeRemovedLocationValidationParams.isError = false;
            errorDepartmentToBeRemovedLocationValidationParams.errorMessage = ""
        }

        if(hasError == true){
            return true;
        }

        var schedHasError = await checkSchedIdIsCurrentYear(sched_id_toBeRemovedLoc.value);
        if(schedHasError == true){
            utilStore.setSnackBar({
                showModal: true,
                modalDescription: "Year should be the current year only. Please change the year and try again"
            });

            return true;
        }

        return false;
    }

    const checkSchedIdIsCurrentYear = async(_sched_id) => {
        var data = {
            sched_id: _sched_id
        };

        const params = new URLSearchParams(data);

        let result = await axios.get(`/getPmsScheduleById?${params}`);

        if(result.data.status == Constants.STATUS_CODE_SUCCESS){
            let resultData = result.data.data[0];
            
            if(resultData.sched_year == year){
                return false;
            } else {
                return true;
            }
        } else if(result.data.status == Constants.STATUS_CODE_INVALID_TOKEN){
            userStore.logout();
        }  else {
            logger.error("Error in Checking if schedule id is current year", logger.createErrorContext("check-schedule-current-year", result.data.message));
            utilStore.setSnackBar({
                showModal: true,
                modalDescription: result.data.message
            });

            return true;
        }
    }

    const checkDeptAlreadyExistsInPmsYear = async() => {
        var data = {
            pdept_schedId: sched_id.value,
            pdept_locationId: location.value.location_id
        };

        const params = new URLSearchParams(data);

        let result = await axios.get(`/getDepartmentBySchedId?${params}`);

        if(result.data.status == Constants.STATUS_CODE_SUCCESS){
            if(result.data.data.length != 0){
                return true;
            } else {
                return false;
            }
        } else if(result.data.status == Constants.STATUS_CODE_INVALID_TOKEN){
            userStore.logout();
        }  else {
            logger.error("Error in Checking if department already exists in PMS year", logger.createErrorContext("check-department-exist-pms-year", result.data.message));
            utilStore.setSnackBar({
                showModal: true,
                modalDescription: result.data.message
            });

            return true;
        }
    }

    const searchWorkstationForWorkstationUserRights = async () => {
        workstation_toAddUser.value = null;
        listWorkstationsForWorkstationUserRights.value = [];

        if(checkErrorForMonthOfAddingUserRights() !== true){
            const result = await getWorkstationsForWorkstationUserRights();
            
            if(result.length !== 0){
                let newResult = result.map(item => ({id: item.wsq_id, name: `${item.ws_userName} (${item.ws_computerName})`}));

                listWorkstationsForWorkstationUserRights.value = newResult;

                isDisableGetWorkstationDataForRights.value = false;
                hasNoWorkstationsForUserRights.value = false;
            } else {
                isDisableGetWorkstationDataForRights.value = true;
                hasNoWorkstationsForUserRights.value = true;
            }
        }        
    }

    const viewWorkstationRightsFormOfWorkstation = async () => {
        if(checkErrorForSearchingWorkstationOfAddingUserRights() !== true){
            await getListOfUserWorkstationRightsByWsqId(workstation_toAddUser.value);
            await getDepartmentWorkstationQuarterlyDetailsByWsqId(workstation_toAddUser.value);
            openWorkstationRightsFormDialog(true);
        }
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
                    icon="mdi-cogs"
                >
                </v-icon>
                <span>Settings</span>
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
            <div class="font-size-20px">
                <v-icon
                    class="me-1"
                    size="x-small"
                    icon="mdi-pencil-plus-outline"
                >
                </v-icon>
                <span class="font-weight-medium">Additional Location</span>
            </div>
            <div class="font-size-16px mb-1">
                Add an additional location for the current year. If there's no PMS schedule created for this year yet, create one on the Preventive Maintenance page and add it there instead.
            </div>
            <div>
                <v-autocomplete
                    clearable
                    variant="underlined"
                    density="comfortable"
                    label="Year"
                    v-model="sched_id"
                    item-title="sched_year"
                    item-value="sched_id"
                    :items="listOfYear"
                    :error="errorYearValidationParams.isError"
                    :error-messages="errorYearValidationParams.errorMessage"
                >
                </v-autocomplete>
                <v-autocomplete
                    clearable
                    return-object
                    variant="underlined"
                    density="comfortable"
                    label="Location"
                    v-model="location"
                    item-title="location_name"
                    item-value="location_id"
                    :items="listLocations"
                    :error="errorDepartmentValidationParams.isError"
                    :error-messages="errorDepartmentValidationParams.errorMessage"
                >
                </v-autocomplete>
                <v-autocomplete
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
                <v-switch
                    v-model="isAllowTranferOfPrev4thQtyWsq"
                    color="info"
                    label="Transfer last year data to the chosen year"               
                ></v-switch>
            </div>
            <div class="d-flex flex-row-reverse">
                <v-btn
                    class="font-weight-bold bg-blue-lighten-1"
                    variant="elevated"
                    :loading="isButtonLoading"
                    @click="addDepartment"
                >
                    Add Location
                </v-btn>
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
            <div class="font-size-20px">
                <v-icon
                    class="me-1"
                    size="x-small"
                    icon="mdi-pencil-plus-outline"
                >
                </v-icon>
                <span class="font-weight-medium">Remove Scheduled Location</span>
            </div>
            <div class="font-size-16px mb-1">
                Remove an existing location from the scheduled preventinve maintenance. But if the location has a single workstation, it will not be removed. Once it is done, it cannot be undone.
            </div>
            <div>
                <v-autocomplete
                    clearable
                    variant="underlined"
                    density="comfortable"
                    label="Year"
                    v-model="sched_id_toBeRemovedLoc"
                    item-title="sched_year"
                    item-value="sched_id"
                    :items="listOfYear"
                    :error="errorYearToBeRemovedLocationValidationParams.isError"
                    :error-messages="errorYearToBeRemovedLocationValidationParams.errorMessage"
                >
                </v-autocomplete>
                <v-autocomplete
                    clearable
                    return-object
                    variant="underlined"
                    density="comfortable"
                    label="Location"
                    v-model="location_toBeRemovedLoc"
                    item-title="location_name"
                    item-value="location_id"
                    :items="listLocations"
                    :error="errorDepartmentToBeRemovedLocationValidationParams.isError"
                    :error-messages="errorDepartmentToBeRemovedLocationValidationParams.errorMessage"
                >
                </v-autocomplete>
            </div>
            <div class="d-flex flex-row-reverse">
                <v-btn
                    class="font-weight-bold bg-blue-lighten-1"
                    variant="elevated"
                    :loading="isButtonLoading"
                    @click="deleteLocationOfPmsSchedule"
                >
                    Remove Location
                </v-btn>
            </div>
        </v-col>
    </v-row>
    <v-row>
        <v-col
            cols="12"
            xl="6"
            lg="6"
            md="6"
            sm="12"
            xs="12"
        >
            <div class="font-size-20px">
                <v-icon
                    class="me-1"
                    size="x-small"
                    icon="mdi-pencil-plus-outline"
                >
                </v-icon>
                <span class="font-weight-medium">Workstation User Rights</span>
            </div>
            <div class="font-size-16px mb-1">
                Manage users to permit the approval of its allowed workstations. 
            </div>
            <div>
                <v-autocomplete
                    clearable
                    variant="underlined"
                    density="comfortable"
                    label="Year"
                    v-model="sched_id_toAddUsers"
                    item-title="sched_year"
                    item-value="sched_id"
                    :items="listOfYear"
                    :error="errorYearToBeAddedUsersValidationParams.isError"
                    :error-messages="errorYearToBeAddedUsersValidationParams.errorMessage"
                >
                </v-autocomplete>                
                <v-autocomplete
                    clearable
                    return-object
                    variant="underlined"
                    density="comfortable"
                    label="Location"
                    v-model="location_toAddUsers"
                    item-title="location_name"
                    item-value="location_id"
                    :items="listLocationsWithQuarterlyMonths"
                    :disabled="isDisableLocationToAddUsersDropDown"
                    :error="errorDepartmentToBeAddedUsersValidationParams.isError"
                    :error-messages="errorDepartmentToBeAddedUsersValidationParams.errorMessage"
                >
                </v-autocomplete>
                <v-autocomplete
                    clearable
                    return-object
                    variant="underlined"
                    density="comfortable"
                    label="Month"
                    v-model="month_toAddUsers"
                    item-title="name"
                    item-value="id"
                    :items="listQuarterlyMonthsForWorkstationUserRights"
                    :disabled="isDisableMonthToAddUsersDropDown"
                    :error="errorMonthToBeAddedUsersValidationParams.isError"
                    :error-messages="errorMonthToBeAddedUsersValidationParams.errorMessage"
                >
                </v-autocomplete>
                <div class="d-flex flex-row-reverse">
                    <v-btn
                        class="font-weight-bold bg-blue-lighten-1"
                        variant="elevated"
                        :loading="isButtonLoading"
                        @click="searchWorkstationForWorkstationUserRights()"
                    >
                        Search Workstation
                    </v-btn>
                </div>
                <div
                    v-if="hasNoWorkstationsForUserRights"
                    class="d-flex flex-row-reverse font-size-12px mt-3 text-red"
                >
                    There are no workstations found
                </div>
            </div>
            <v-divider
                class="mt-5"
            ></v-divider>
            <div class="d-flex mt-5">
                <v-autocomplete
                    clearable
                    class="pe-5"
                    variant="underlined"
                    density="comfortable"
                    label="Workstations"
                    v-model="workstation_toAddUser"
                    item-title="name"
                    item-value="id"
                    :items="listWorkstationsForWorkstationUserRights"
                    :disabled="isDisableGetWorkstationDataForRights"
                    :error="errorWorkstationToBeAddedUsersValidationParams.isError"
                    :error-messages="errorWorkstationToBeAddedUsersValidationParams.errorMessage"
                >
                </v-autocomplete>
                <v-btn
                    class="font-weight-bold bg-blue-lighten-1"
                    variant="elevated"
                    :loading="isButtonLoading"
                    :disabled="isDisableGetWorkstationDataForRights"
                    @click="viewWorkstationRightsFormOfWorkstation"
                >
                    Update Workstation
                </v-btn>
            </div>
        </v-col>
    </v-row>

    <UserWorkstationRightsForm 
        :is-show-dialog="userWorkstationRightsDialogData.isShowDialog"
        :list-employees="listOfEmployees"
        :list-user-workstation-rights="listUserWorkstationRights"
        :wsq-id="workstation_toAddUser"
        :wsq-user-id="wsqDetailsForWorkstationUserRights?.ws_userId"
        @click-close-dialog="openWorkstationRightsFormDialog(false)"
        @fetch-latest-workstation-rights-list="getListOfUserWorkstationRightsByWsqId(workstation_toAddUser)"
    />
</template>

<style scoped>
    .search-container {
        border: solid 2px rgb(236, 232, 232);
        border-radius: 5px;
    }
</style>