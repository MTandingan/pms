<script setup>
    import { ref, reactive, onMounted, watch } from 'vue';
    import { useRouter } from 'vue-router';
    import { useUserStore } from '@/stores/user';
    import { useUtilStore } from '@/stores/util';
    import { storeToRefs } from 'pinia';
    import Constants from "@/globals";
    import { decryptData } from '../helpers/encryptUtil'
    import * as Util from '../helpers/helper';
    import axios from 'axios';
    import Batch from '../components/Batch.vue';
 
    //Variables
    const router = useRouter();
    const userStore = useUserStore();
    const utilStore = useUtilStore();
    const { user } = storeToRefs(userStore);
    const { customDialog } = storeToRefs(utilStore);
    const isButtonLoading = ref(false);
    const isOneBatchHasNoDepartment = ref(false);
    const isYearNullValidationParams = reactive({
        isError: false,
        errorMessage: ""
    });
    const listAllAddedDepartments = ref([]);
    const showCloneConfirmationDialog = ref(false);
    const showConfirmationDialog = ref(false);
    var listDeptBatch1 = [];
    var listDeptBatch2 = [];
    var listDeptBatch3 = [];

    //Local Constants
    
    //Model Values
    const listLocation = ref(null);
    const listSchedule = ref([]);
    const requestIsSuccess = ref(false);
    const year = ref(null);
    
    //Built-in Functions
    onMounted(async () => {
        if(decryptData(user.value, Constants.USER_SECRET_KEY) === null){
            await userStore.logout();
        } else {
            await getListOfLocations();
            await getListOfSchedule();
        }

        utilStore.setPageLoading({pIsPageLoading: false});
    });

    watch(() => requestIsSuccess.value, (newValue, oldValue) => {
        if(newValue == true){
            showConfirmationDialog.value = false;
            showCloneConfirmationDialog.value = false;
            utilStore.setCustomDialog({
                showDialog: true,
                modalTitle: "Success",
                modalDescription: "Successfully created the pms schedule"
            });
          
        }
    });

    watch(() => customDialog.value.showDialog, (newValue, oldValue) => {
        if(newValue == false){
            customDialog.value.showDialog = false;
            router.push(`/`);
        }
    })

    //User-defined Functions
    const getListOfLocations = async () => {
        var result = await axios.get(`/getAllListOfLocation`);
        listLocation.value = result.data.data;
    }; 

    const getListOfSchedule = async () => {
        var { data } = await axios.get(`/getListOfSchedule`);
        listSchedule.value = data.data;
    }

    const onClickAddBatchDepts = (listToBeAddedDepartments, batchNum) => {
        switch(batchNum){
            case Constants.BATCH_1:{
                listDeptBatch1 = listToBeAddedDepartments;
            }break;
            case Constants.BATCH_2:{
                listDeptBatch2 = listToBeAddedDepartments;
            }break;
            case Constants.BATCH_3:{
                listDeptBatch3 = listToBeAddedDepartments;
            }break;
            default:{}
        }

        addAllBatchDepts();
    }

    const addAllBatchDepts = () => {
        listAllAddedDepartments.value = [
            ...listDeptBatch1,
            ...listDeptBatch2,
            ...listDeptBatch3
        ];
    }

    const isErrorInCheckCreatingPmsSchedule = () => {
        //Check year is null
        if(year.value == null){
            isYearNullValidationParams.isError = true;
            isYearNullValidationParams.errorMessage = "Year must not be empty"
        } else {
            isYearNullValidationParams.isError = false;
            isYearNullValidationParams.errorMessage = ""
        }

        //Check year has a Pms schedule already
        if(isYearNullValidationParams.isError == false){
            let hasPmsScheduleAlready = listSchedule.value.some(item => item.sched_year == year.value);

            if(hasPmsScheduleAlready){
                isYearNullValidationParams.isError = true;
                isYearNullValidationParams.errorMessage = "The year has an existing Pms schedule, please select another year"
            } else {
                isYearNullValidationParams.isError = false;
                isYearNullValidationParams.errorMessage = ""
            }
        }
        
        //Check if all of the batches has at least one department
        if(listDeptBatch1.length === 0 || listDeptBatch2.length === 0 || listDeptBatch3.length === 0){
            isOneBatchHasNoDepartment.value = true;
        } else {
            isOneBatchHasNoDepartment.value = false;
        }
    }

    const openConfirmationDialogBox = (item) => {
        isErrorInCheckCreatingPmsSchedule();

        if(isOneBatchHasNoDepartment.value == false && isYearNullValidationParams.isError == false){
            showConfirmationDialog.value = true;
        }
    }

    const createPmsSchedule = async(isLastPmsToContinue) => {
        isButtonLoading.value = true;

        var data = {
            schedYear: year.value,
            listAllAddedDepartments: listAllAddedDepartments.value
        };

        let result = await axios.post("/createPmsSchedule", data);

        if(result.data.status == Constants.STATUS_CODE_SUCCESS){
            if(isLastPmsToContinue == true){
                await updateCloningOfPrevYearDeptsBySchedId(result.data.data.sched_id);
            } else {
                requestIsSuccess.value = true;
            }
        } else {
            logger.error("Error in Creating of PMS Schedule", logger.createErrorContext("create-pms-schedule", result.data.message));
            utilStore.setSnackBar({
                showModal: true,
                modalDescription: result.data.message
            });
        }

        isButtonLoading.value = false;
    }

    const checkLastYearPmsExistedBySelectedYear = async() => {
        var data = {
            sched_year: year.value - 1
        };

        const params = new URLSearchParams(data);
        var result = await axios.get(`/getPmsScheduleByYear?${params}`);

        if(result.data.data.length !== 0){
            showConfirmationDialog.value = false;
            showCloneConfirmationDialog.value = true;
        } else {
            createPmsSchedule(false);
        }
    }

    const updateCloningOfPrevYearDeptsBySchedId = async(sched_id) => {
        let data = {
            sched_id: sched_id
        };

        let result = await axios.put("/updateCloningOfPrevYearDeptsBySchedId", data);

        if(result.data.status == Constants.STATUS_CODE_SUCCESS){
            requestIsSuccess.value = true;
        } else {
            logger.error("Error in Cloning of new PMS Schedule with previous data", logger.createErrorContext("cloning-pms-schedule", result.data.message));
            utilStore.setSnackBar({
                showModal: true,
                modalDescription: result.data.message
            });
        }

        isButtonLoading.value = false
    }

</script>

<template>
    <v-row>
        <v-col
            cols="12"
        >
            <div class="font-size-32px mb-3">
                <v-icon
                    class="me-1"
                    size="x-small"
                    icon="mdi-laptop"
                >
                </v-icon>
                Preventive Maintenance Schedule
            </div>
        </v-col>
        <v-col
            cols="12"
            xl="6"
            lg="6"
            md="6"
            class="mt-1"
        >
            <div
                class="d-flex flex-row"    
            >
                <v-autocomplete
                    v-model.trim="year"
                    clearable
                    variant="underlined"
                    density="comfortable"
                    label="Year"
                    item-title="name"
                    item-value="id"
                    :items="Util.generateYearDropDown()"
                    :error="isYearNullValidationParams.isError"
                    :error-messages="isYearNullValidationParams.errorMessage"
                >
                </v-autocomplete>
            </div>
        </v-col>
        <v-col
            cols="12"
        >
            <v-divider></v-divider>
        </v-col>
        <v-col
            cols="12"
        >
            <Batch 
                :batch-description="`1st Month (Jan, Apr, July, Oct)`"
                :list-location="listLocation"
                :list-all-batch-departments="listAllAddedDepartments"
                :batch-num="1"
                @click-add-batch-depts="onClickAddBatchDepts"
            />
            <v-divider></v-divider>
        </v-col>
        <v-col
            cols="12"
        >
            <Batch 
                :batch-description="`2nd Month (Feb, May, Aug, Nov)`"
                :list-location="listLocation"
                :list-all-batch-departments="listAllAddedDepartments"
                :batch-num="2"
                @click-add-batch-depts="onClickAddBatchDepts"
            />
            <v-divider></v-divider>
        </v-col>
        <v-col
            cols="12"
        >
            <Batch 
                :batch-description="`3rd Month (Mar, Jun, Sept, Dec)`"
                :list-location="listLocation"
                :list-all-batch-departments="listAllAddedDepartments"
                :batch-num="3"
                @click-add-batch-depts="onClickAddBatchDepts"
            />
            <v-divider></v-divider>
        </v-col>
        <v-col
            cols="12"
            class="d-flex flex-row-reverse"
        >
            <div
                v-if="isOneBatchHasNoDepartment"
                class="font-size-12px ms-n2 mt-1 text-red me-2"
            >
                <v-icon
                    icon="mdi-alert-circle"
                >
                </v-icon>
                Please include at least one department in every monthly batch
            </div>
        </v-col>
    </v-row>
    <v-row
        class="d-flex flex-row-reverse mb-3"   
    >
        <div
            class="me-5"
        >
            <v-btn 
                class="font-weight-bold bg-blue-lighten-1"
                variant="elevated"
                prepend-icon="mdi-pencil-plus"
                @click="openConfirmationDialogBox"
            >
                Create Pms Schedule
            </v-btn>
        </div>
    </v-row>

    <v-dialog
        v-model="showConfirmationDialog"
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
                                Are you sure you want to submit the Pms schedule? Once it's done it cannot be undone
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
                    @click="showConfirmationDialog = false"
                >
                    Close
                </v-btn>
                <v-btn
                    class="font-weight-bold bg-blue-lighten-1"
                    variant="elevated"
                    :loading="isButtonLoading"
                    @click="checkLastYearPmsExistedBySelectedYear"
                >
                    Confirm
                </v-btn>
                <!-- @click="updateCloningOfPrevYearDeptsBySchedId" -->
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog
        v-model="showCloneConfirmationDialog"
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
                    Cloning Confirmation
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
                                Do you want to continue the last year's 4th quarter monthly workstations data to this year's 1st quarter of PMS? 
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
                    variant="text"
                    @click="showCloneConfirmationDialog = false"
                >
                    Close
                </v-btn>
                <v-btn
                    class="font-weight-bold me-2"
                    variant="outlined"
                    :loading="isButtonLoading"
                    @click="createPmsSchedule(false)"
                >
                    No
                </v-btn>
                <v-btn
                    class="font-weight-bold bg-blue-lighten-1"
                    variant="elevated"
                    :loading="isButtonLoading"
                    @click="createPmsSchedule(true)"
                >
                    Yes
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<style scoped>
</style>