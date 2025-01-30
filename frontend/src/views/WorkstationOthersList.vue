<script setup>
    import { ref, reactive, watch, onMounted } from 'vue';
    import moment from 'moment/moment'
    import { useRouter } from 'vue-router';
    import { useUserStore } from '@/stores/user';
    import { useUtilStore } from '@/stores/util';
    import { storeToRefs } from 'pinia';
    import Observer from '../components/Observer.vue';
    import Constants from '../globals';
    import { decryptData } from '../helpers/encryptUtil'
    import * as Util from '../helpers/helper';
    import axios from 'axios';

    //Local Constants

    //Variables
    const router = useRouter();
    const userStore = useUserStore();
    const utilStore = useUtilStore();
    const { user } = storeToRefs(userStore);
    const listWorkstation = ref([]);
    var fetchNextSet_pComputerName = '';
    var fetchNextSet_pSchedYear = '';
    var fetchNextSet_pDeptName = '';
    var fetchNextSet_pBatch = '';
    var fetchNextSet_pUsername = '';
    var fetchNextSet_pStatus = '';

    //Model Values
    const currentItemToView = ref(null);
    const lastCurrentIndex = ref(0);
    const hasReachEnd = ref(false);
    const searchWorkstation = reactive({
                                            ws_computerName: null,
                                            sched_year: null,
                                            location_name: null,
                                            pdept_batch: null,
                                            ws_userName: null,
                                            wsq_status: null
                                        });
    const showViewDetailsDialog = ref(false);
    const userData = ref(null);


    //Built-in Functions
    onMounted(async () => {
        userData.value = decryptData(user.value, Constants.USER_SECRET_KEY);

        if(userData.value === null){
            await userStore.logout();
        } else {
            await fetchDataFirst(); 
        }
        
        utilStore.setPageLoading({pIsPageLoading: false});  
    });

    watch(listWorkstation, (list_newValue, list_oldValue) => {
        resetScrollPosition();
    });

    //User-defined Functions
    const fetchDataFirst = async(ws_computerName = '', sched_year = 0, location_name = '', pdept_batch = 0, ws_userName = '', wsq_status = 0) => {
        lastCurrentIndex.value = 0;
        hasReachEnd.value = false;

        var data = {
            ws_userId: userData.value.id,
            access_right: userData.value.access_right,
            from: lastCurrentIndex.value,
            to: lastCurrentIndex.value + 12,
            ws_computerName: (ws_computerName == null) ? "" : ws_computerName,
            sched_year: (sched_year == null) ? 0 : sched_year,
            location_name: (location_name == null) ? "" : location_name,
            pdept_batch: (pdept_batch == null) ? 0 : pdept_batch,
            ws_userName: (ws_userName == null) ? "" : ws_userName,
            wsq_status: (wsq_status == null) ? 0 : wsq_status
        };

        const params = new URLSearchParams(data);

        let result = await axios.get(`/getListOfUserOthersWorkstationWithRange?${params}`);

        if(result.data.status == Constants.STATUS_CODE_SUCCESS){
            listWorkstation.value = result.data.data;
            lastCurrentIndex.value += 12;
        } else if(result.data.status == Constants.STATUS_CODE_INVALID_TOKEN){
            userStore.logout();
        } else {
            logger.error("Error in Fetching the first batch of the other workstation list", logger.createErrorContext("fetch-first-other-workstation-list", result.data.message));
            utilStore.setSnackBar({
                showModal: true,
                modalDescription: result.data.message
            });
        }
    }

    const fetchNextSet = async() => {
        if(!hasReachEnd.value){
            let data = {
                ws_userId: userData.value.id,
                access_right: userData.value.access_right,
                from: lastCurrentIndex.value,
                to: 5,
                ws_computerName: fetchNextSet_pComputerName,
                sched_year: fetchNextSet_pSchedYear,
                location_name: fetchNextSet_pDeptName,
                pdept_batch: fetchNextSet_pBatch,
                ws_userName: fetchNextSet_pUsername,
                wsq_status: fetchNextSet_pStatus
            };
            
            const params = new URLSearchParams(data);

            let result = await axios.get(`/getListOfUserOthersWorkstationWithRange?${params}`);

            if(result.data.status == Constants.STATUS_CODE_SUCCESS){
                listWorkstation.value = [
                    ...listWorkstation.value,
                    ...result.data.data
                ];

                lastCurrentIndex.value += 5;

                if(!result.data.data.length){
                    hasReachEnd.value = true;
                }
            } else if(result.data.status == Constants.STATUS_CODE_INVALID_TOKEN){
                userStore.logout();
            } else {
                logger.error("Error in Fetching the other workstation list", logger.createErrorContext("fetch-other-workstation-list", result.data.message));
                utilStore.setSnackBar({
                    showModal: true,
                    modalDescription: result.data.message
                });
            }
        } 
    }

    const search = async() => {
        await fetchDataFirst(searchWorkstation.ws_computerName, searchWorkstation.sched_year, searchWorkstation.location_name, searchWorkstation.pdept_batch, searchWorkstation.ws_userName, searchWorkstation.wsq_status);

        fetchNextSet_pComputerName = (searchWorkstation.ws_computerName == null) ? "" : searchWorkstation.ws_computerName;
        fetchNextSet_pSchedYear = (searchWorkstation.sched_year == null) ? 0 : searchWorkstation.sched_year;
        fetchNextSet_pDeptName = (searchWorkstation.location_name == null) ? "" : searchWorkstation.location_name;
        fetchNextSet_pBatch = (searchWorkstation.pdept_batch == null) ? 0 : searchWorkstation.pdept_batch;
        fetchNextSet_pUsername = (searchWorkstation.ws_userName == null) ? "" : searchWorkstation.ws_userName;
        fetchNextSet_pStatus = (searchWorkstation.wsq_status == null) ? 0 : searchWorkstation.wsq_status;
    }

    const clear = async() => {
        await fetchDataFirst();
        
        fetchNextSet_pComputerName = '';
        fetchNextSet_pSchedYear = '';
        fetchNextSet_pDeptName = '';
        fetchNextSet_pBatch = '';
        fetchNextSet_pUsername = '';
        fetchNextSet_pStatus = '';

        searchWorkstation.ws_computerName = '';
        searchWorkstation.sched_year = '';
        searchWorkstation.location_name = '';
        searchWorkstation.pdept_batch = '';
        searchWorkstation.ws_userName = '';
        searchWorkstation.wsq_status = '';
    }

    const openViewDetailsDialog = async(workstation) => {
        currentItemToView.value = workstation;

        //This is processing the termination date
        if(currentItemToView.value.ws_isActive == Constants.ACTIVE_TRUE){
            currentItemToView.value.terminationDate = Constants.N_A;
        } else {
            currentItemToView.value.terminationDate = (currentItemToView.value.wsq_acknowledgedAt == null) ? Constants.N_A : moment(currentItemToView.value.wsq_acknowledgedAt).format('LLL');
        }

        showViewDetailsDialog.value = true;
    }

    const goToWorkstationDetails = (wsq_id) => {
        router.push(`/WorkstationDetails/${wsq_id}`);
    }

    const resetScrollPosition = () => {
      const tableBody = document.querySelector('.v-data-table__wrapper > table > tbody');

      if (tableBody) {
        tableBody.scrollTo(0, 0);
      }
    };
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
                    icon="mdi-desktop-tower-monitor"
                >
                </v-icon>
                Other Workstations
            </div>
        </v-col>
        <v-col
            cols="12"
        >
            <v-sheet
                class="search-container"
            >
                <v-row
                    class="pa-5"
                >
                    <v-col
                        cols="12"
                        xl="6"
                        lg="6"
                        md="6"
                        sm="12"
                        xs="12"
                    >
                        <v-text-field
                            clearable
                            variant="underlined"
                            placeholder="Enter Computer Name"
                            density="comfortable"
                            label="Computer Name"
                            maxlength="255"
                            v-model.trim = searchWorkstation.ws_computerName
                        >
                        </v-text-field>
                        <v-text-field
                            clearable
                            variant="underlined"
                            placeholder="Enter Department"
                            density="comfortable"
                            label="Department"
                            maxlength="255"
                            v-model.trim = searchWorkstation.location_name
                        >
                        </v-text-field>
                        <v-text-field
                            clearable
                            variant="underlined"
                            placeholder="Enter Owner Name"
                            density="comfortable"
                            label="Owner Name"
                            maxlength="255"
                            v-model.trim = searchWorkstation.ws_userName
                        >
                        </v-text-field>
                    </v-col>
                    <v-col
                        cols="12"
                        xl="6"
                        lg="6"
                        md="6"
                        sm="12"
                        xs="12"
                    >
                        <v-autocomplete
                            clearable
                            variant="underlined"
                            density="comfortable"
                            label="Year"
                            item-title="name"
                            item-value="id"
                            v-model = searchWorkstation.sched_year
                            :items="Util.generateYearDropDown()"
                        >
                        </v-autocomplete>
                        <v-autocomplete
                            clearable
                            variant="underlined"
                            density="comfortable"
                            label="Monthly Batch"
                            item-title="name"
                            item-value="id"
                            v-model = searchWorkstation.pdept_batch
                            :items="Constants.arrOfMonthlyBatch"
                        >
                        </v-autocomplete>
                        <v-autocomplete
                            clearable
                            variant="underlined"
                            density="comfortable"
                            label="Status"
                            item-title="name"
                            item-value="id"
                            v-model = searchWorkstation.wsq_status
                            :items="Constants.arrOfWorkstationStatus"
                        >
                        </v-autocomplete>
                        <div class="d-flex flex-row-reverse flex-wrap">
                            <v-btn 
                                class="font-weight-bold bg-blue-lighten-1"
                                prepend-icon="mdi-database-search-outline"
                                variant="elevated"
                                @click="search()"
                            >
                                Search
                            </v-btn>
                            <v-btn 
                                class="font-weight-bold me-2"
                                prepend-icon="mdi-close-thick"
                                color="grey-darken-4"
                                variant="outlined"
                                @click="clear()"
                            >
                                Clear
                            </v-btn>
                        </div>
                    </v-col>
                </v-row>
            </v-sheet>
        </v-col>
        <v-col
            cols="12"
        >
            <v-table
                class="table-striped"
                fixed-header
                height="550px"
                density="comfortable"
            >
                <thead
                    class="font-size-14px"
                >
                    <tr>
                        <th 
                            class="text-left text-black font-weight-bold" 
                        >
                            Id
                        </th>
                        <th 
                            class="text-left text-black font-weight-bold"
                            width="20%"
                        >
                            Owner Name
                        </th>
                        <th 
                            class="text-left text-black font-weight-bold"
                            width="20%"
                        >
                            Department Name
                        </th>
                        <th 
                            class="text-left text-black font-weight-bold"
                            width="20%"
                        >
                            Computer Name
                        </th>
                        <th 
                            class="text-left text-black font-weight-bold"
                        >
                            Status
                        </th>
                        <th 
                            class="text-left text-black font-weight-bold"
                        >
                            Year
                        </th>
                        <th 
                            class="text-left text-black font-weight-bold"
                        >
                            Month
                        </th>
                        <th class="text-left text-black font-weight-bold">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="item in listWorkstation"
                        :key="item.wsq_id"
                        class="font-size-14px"
                    >
                        <td>{{ item.wsq_id }}</td>
                        <td>{{ item.ws_userName }}</td>
                        <td>{{ item.location_name }}</td>
                        <td>{{ item.ws_computerName }}</td>
                        <td>{{ Util.getWsqStatusTextByStatusId(item.wsq_status) }}</td>
                        <td>{{ item.sched_year }}</td>
                        <td>{{ Util.getFullMonthNameByMonthPosition(item.quarter_monthlyQuarter) }}</td>
                        <td>
                            <v-btn 
                                class="font-weight-bold bg-blue-lighten-1 me-2"
                                density="comfortable"
                                prepend-icon="mdi-eye"
                                variant="elevated"
                                @click="goToWorkstationDetails(item.wsq_id)"
                            >
                                View
                            </v-btn>
                            <v-btn 
                                class="font-weight-bold bg-blue-lighten-1 me-2"
                                density="comfortable"
                                prepend-icon="mdi-eye"
                                variant="elevated"
                                @click="openViewDetailsDialog(item)"
                            >
                                More
                            </v-btn>
                        </td>
                    </tr>
                    <Observer 
                        v-if="listWorkstation.length" 
                        @intersect="fetchNextSet" 
                    />
                </tbody>
            </v-table>
        </v-col>
    </v-row>

    <v-dialog
        v-model="showViewDetailsDialog"
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
                    class="d-inline me-2" 
                    icon="mdi-monitor-account"
                >
                </v-icon>
                <div 
                    class="d-inline"
                >
                    Workstation ID: {{ currentItemToView.wsq_wsId }}
                </div>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
                <v-container>
                    <v-row>
                        <v-col
                            cols="12"
                        >
                            <div class="font-size-24px mb-2">
                                <span class="font-weight-medium">More Details</span>
                            </div>
                            <div class="font-size-16px">
                                <span class="">Workstation Termination Date:</span> {{ currentItemToView.terminationDate }}
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
                    @click="showViewDetailsDialog = false"
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
</style>