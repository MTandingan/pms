<script setup>
    import { ref, reactive, watch, onMounted} from 'vue';
    import moment from 'moment/moment'
    import { useUserStore } from '@/stores/user';
    import { useUtilStore } from '@/stores/util';
    import Observer from '../components/Observer.vue';
    import Constants from '../globals';
    import * as Util from '../helpers/helper';
    import axios from 'axios';

    //Local Constants

    //Variables
    const userStore = useUserStore();
    const utilStore = useUtilStore();
    const listOfDevices = ref([]);
    const listOfEmployees = ref([]);
    var fetchNextSet_pUserId = null;
    var fetchNextSet_pWorkstationStatus = null;
    

    //Model Values
    const currentItemToView = ref(null);
    const showViewDetailsDialog = ref(false);
    const isButtonLoading = ref(false);
    const lastCurrentIndex = ref(0);
    const hasReachEnd = ref(false);
    const searchWorkstationData = reactive({
                                            ws_userId: null,
                                            ws_isActive: null
                                        });

    //Built-in Functions
    onMounted(async () => { 
        await getListOfEmployees();
        utilStore.setPageLoading({pIsPageLoading: false});  
    });

    watch(listOfDevices, (list_newValue, list_oldValue) => {
        resetScrollPosition();
    });

    //User-defined Functions
    const fetchDataFirst = async(ws_userId = null, ws_isActive = null) => {
        lastCurrentIndex.value = 0;
        hasReachEnd.value = false;

        var data = {
            from: lastCurrentIndex.value,
            to: lastCurrentIndex.value + 12,
            ws_userId: (ws_userId === null) ? "" : ws_userId,
            ws_isActive: (ws_isActive === null) ? "" : ws_isActive
        };

        const params = new URLSearchParams(data);

        let result = await axios.get(`/getListOfUserWorkstationDeviceWithRange?${params}`);
        
        if(result.data.status == Constants.STATUS_CODE_SUCCESS){
            listOfDevices.value = result.data.data;
            lastCurrentIndex.value += 12;
        } else if(result.data.status == Constants.STATUS_CODE_INVALID_TOKEN){
            userStore.logout();
        }  else {
            logger.error("Error in Fetching First batch list of User Device", logger.createErrorContext("fetch-first-user-device-list", result.data.message));
            utilStore.setSnackBar({
                showModal: true,
                modalDescription: result.data.message
            });
        }
    }

    const fetchNextSet = async() => {
        if(!hasReachEnd.value){
            let data = {
                from: lastCurrentIndex.value,
                to: 5,
                ws_userId: fetchNextSet_pUserId,
                ws_isActive: fetchNextSet_pWorkstationStatus
            };
            const params = new URLSearchParams(data);

            let result = await axios.get(`/getListOfUserWorkstationDeviceWithRange?${params}`);

            if(result.data.status == Constants.STATUS_CODE_SUCCESS){
                listOfDevices.value = [
                    ...listOfDevices.value,
                    ...result.data.data
                ];

                lastCurrentIndex.value += 5;

                if(!result.data.data.length){
                    hasReachEnd.value = true;
                }
            } else if(result.data.status == Constants.STATUS_CODE_INVALID_TOKEN){
                userStore.logout();
            } else {
                logger.error("Error in Fetching list of User Device", logger.createErrorContext("fetch-user-device-list", result.data.message));
                utilStore.setSnackBar({
                    showModal: true,
                    modalDescription: result.data.message
                });
            }
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

    const getCompTextStatusByStatusCode = (status) => {
        switch(status){
            case Constants.ACTIVE_TRUE: {
                return Constants.COMP_STATUS_ACTIVE_TEXT;
            }break;
            case Constants.ACTIVE_FALSE: {
                return Constants.COMP_STATUS_INACTIVE_TEXT;
            }break;
            default: { return Constants.N_A; }
        }
    };

    const getTdStyleByCompStatusCode = (status) => {
        switch(status){
            case Constants.ACTIVE_TRUE: {
                return "text-green font-weight-medium";
            }break;
            case Constants.ACTIVE_FALSE: {
                return "text-red font-weight-medium";
            }break;
            default: { return ""; }
        }
    };

    const search = async() => {
        await fetchDataFirst(searchWorkstationData.ws_userId, searchWorkstationData.ws_isActive);

        fetchNextSet_pUserId = (searchWorkstationData.ws_userId === null) ? "" : searchWorkstationData.ws_userId;
        fetchNextSet_pWorkstationStatus = (searchWorkstationData.ws_isActive === null) ? "" : searchWorkstationData.ws_isActive;
    }

    const clear = async() => {
        fetchDataFirst();
        
        fetchNextSet_pUserId = '';
        fetchNextSet_pWorkstationStatus = '';

        searchWorkstationData.ws_userId = null;
        searchWorkstationData.ws_isActive = null;
    }

    const openViewDetailsDialog = async(workstation) => {
        currentItemToView.value = workstation;
        showViewDetailsDialog.value = true;
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
                    icon="mdi-laptop"
                >
                </v-icon>
                User Devices
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
                        <v-autocomplete
                            clearable
                            variant="underlined"
                            density="comfortable"
                            label="User"
                            item-title="name"
                            item-value="id"
                            v-model="searchWorkstationData.ws_userId"
                            :items="listOfEmployees"
                        >
                        </v-autocomplete>
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
                            label="Status"
                            item-title="name"
                            item-value="id"
                            v-model="searchWorkstationData.ws_isActive"
                            :items="Constants.arrOfStatus"
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
                            Computer Name
                        </th>
                        <th 
                            class="text-left text-black font-weight-bold"
                        >
                            Location
                        </th>
                        <th 
                            class="text-left text-black font-weight-bold"
                        >
                            Status
                        </th>
                        <th class="text-left text-black font-weight-bold">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="item in listOfDevices"
                        class="font-size-14px"
                        :key="item.ws_id"
                    >
                        <td>{{ item.ws_id }}</td>
                        <td>
                            {{ item.ws_userName }}
                        </td>
                        <td>{{ item.ws_computerName }}</td>
                        <td>{{ item.ws_location }}</td>
                        <td
                            :class="getTdStyleByCompStatusCode(item.ws_isActive)"
                        >
                            {{ getCompTextStatusByStatusCode(item.ws_isActive) }}
                        </td>
                        <td>
                            <v-btn 
                                class="font-weight-bold bg-blue-lighten-1 me-2"
                                density="comfortable"
                                prepend-icon="mdi-eye"
                                variant="elevated"
                                @click="openViewDetailsDialog(item)"
                            >
                                Details
                            </v-btn>
                        </td>
                    </tr>
                    <Observer 
                        v-if="listOfDevices.length" 
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
                    {{ currentItemToView.ws_userName }} - {{ currentItemToView.ws_computerName }}
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
                                <span class="">Computer Name:</span> {{ currentItemToView.comp_name }}
                            </div>
                            <div class="font-size-16px">
                                <span class="">Computer Description:</span> {{ currentItemToView.comp_description }}
                            </div>
                            <div class="font-size-16px">
                                <span class="">Bar Code:</span> {{ currentItemToView.comp_barCode }}
                            </div>
                            <div class="font-size-16px">
                                <span class="">Inventory Code:</span> {{ currentItemToView.comp_inventoryId }}
                            </div>
                            <div class="font-size-16px">
                                <span class="">Serial No:</span> {{ currentItemToView.comp_serial }}
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