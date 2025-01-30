<script setup>
    import { ref, reactive, watch, onMounted} from 'vue';
    import moment from 'moment/moment'
    import { useUserStore } from '@/stores/user';
    import { useUtilStore } from '@/stores/util';
    import Observer from '../components/Observer.vue';
    import Constants from '../globals';
    import axios from 'axios';

    //Local Constants
    const standardRule = [
                            v => !!v || 'Please enter the required item'
                        ];

    //Variables
    const userStore = useUserStore();
    const utilStore = useUtilStore();
    const listOfHardware = ref([]);
    var fetchNextSet_pHwName = '';
    var fetchNextSet_pHwDescription = '';
    var fetchNextSet_pHwIsActive = '';
    var fetchNextSet_pHwIsOthers = false;

    //Model Values
    const hardwareCreateForm = ref(null);
    const hardwareUpdateForm = ref(null);
    const currentItemToUpdate = ref(null);
    const currentItemToDelete = ref(null);
    const showCreateDialog = ref(false);
    const showUpdateDialog = ref(false);
    const showRemoveDialog = ref(false);
    const isButtonLoading = ref(false);
    const lastCurrentIndex = ref(0);
    const hasReachEnd = ref(false);
    const newHardwareData = reactive({
                                        hw_name: '',
                                        hw_description: '',
                                        hw_isActive: null,
                                        hw_isOthers: null
                                    });
    const searchHardwareData = reactive({
                                            hw_name: '',
                                            hw_description: '',
                                            hw_isActive: null,
                                            hw_isOthers: 0  //False
                                        });

    //Built-in Functions
    onMounted(async () => {
        await fetchDataFirst();    
        utilStore.setPageLoading({pIsPageLoading: false});  
    });

    watch(listOfHardware, (list_newValue, list_oldValue) => {
        resetScrollPosition();
    });

    //User-defined Functions
    const fetchDataFirst = async(hw_name = '', hw_description = '', hw_isActive = null, hw_isOthers = false) => {
        lastCurrentIndex.value = 0;
        hasReachEnd.value = false;

        var data = {
            from: lastCurrentIndex.value,
            to: lastCurrentIndex.value + 12,
            hw_name: (hw_name === null) ? "" : hw_name,
            hw_description: (hw_description === null) ? "" : hw_description,
            hw_isActive: (hw_isActive === null) ? "" : hw_isActive,
            hw_isOthers: (hw_isOthers === null) ? "" : hw_isOthers
        };

        let result = await axios.get(`/getlistOfHardwareWithRange`, {
            params: data
        });

        if(result.data.status == Constants.STATUS_CODE_SUCCESS){
            listOfHardware.value = result.data.data;
            lastCurrentIndex.value += 12;
        } else if(result.data.status == Constants.STATUS_CODE_INVALID_TOKEN){
            userStore.logout();
        }  else {
            logger.error("Error in Fetching First batch list of Hardware", logger.createErrorContext("fetch-first-hardware-list", result.data.message));
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
                hw_name: fetchNextSet_pHwName,
                hw_description: fetchNextSet_pHwDescription,
                hw_isActive: fetchNextSet_pHwIsActive,
                hw_isOthers: fetchNextSet_pHwIsOthers
            };

            let result = await axios.get(`/getlistOfHardwareWithRange`, {
                params: data
            });

            if(result.data.status == Constants.STATUS_CODE_SUCCESS){
                listOfHardware.value = [
                    ...listOfHardware.value,
                    ...result.data.data
                ];

                lastCurrentIndex.value += 5;

                if(!result.data.data.length){
                    hasReachEnd.value = true;
                }
            } else if(result.data.status == Constants.STATUS_CODE_INVALID_TOKEN){
                userStore.logout();
            } else {
                logger.error("Error in Fetching list of Hardware", logger.createErrorContext("fetch-hardware-list", result.data.message));
                utilStore.setSnackBar({
                    showModal: true,
                    modalDescription: result.data.message
                });
            }
        } 
    }

    const createHardware = async(e) => {
        
        const { valid } = await hardwareCreateForm.value.validate();

        if(valid){
            isButtonLoading.value = true;
            
            let data = {
                hw_name: newHardwareData.hw_name,
                hw_description: newHardwareData.hw_description,
                hw_isActive: true,
                hw_isOthers: false
            };

            let result = await axios.post("/createHardware", data);

            if(result.data.status == Constants.STATUS_CODE_SUCCESS){
                showCreateDialog.value = false;

                utilStore.setSnackBar({
                    showModal: true,
                    modalDescription: result.data.message
                });

                clear();
            } else {
                logger.error("Error in Creating of Hardware", logger.createErrorContext("create-hardware", result.data.message));
                utilStore.setSnackBar({
                    showModal: true,
                    modalDescription: result.data.message
                });
            }

            isButtonLoading.value = false;
        }
    }

    const updateHardware = async(e) => {

        const { valid } = await hardwareUpdateForm.value.validate();
        
        if(valid){
            isButtonLoading.value = true;

            let data = {
                hw_id: currentItemToUpdate.value.hw_id,
                hw_name: currentItemToUpdate.value.hw_name,
                hw_description: currentItemToUpdate.value.hw_description,
                hw_isActive: currentItemToUpdate.value.hw_isActive,
                hw_isOthers: currentItemToUpdate.value.hw_isOthers
            };

            let result = await axios.put("/updateHardware", data);

            if(result.data.status == Constants.STATUS_CODE_SUCCESS){
                showUpdateDialog.value = false;

                utilStore.setSnackBar({
                    showModal: true,
                    modalDescription: result.data.message
                });

                clear();
            } else if(result.data.status == Constants.STATUS_CODE_INVALID_TOKEN){
                userStore.logout();
            } else {
                utilStore.setSnackBar({
                    showModal: true,
                    modalDescription: result.data.message
                });
            }

            isButtonLoading.value = false
        }
    }

    const deleteHardware = async(e) => {
        isButtonLoading.value = true;

        let result = await axios.delete(`/deleteHardware/${currentItemToDelete.value.hw_id}`);

        if(result.data.status == Constants.STATUS_CODE_SUCCESS){
            showRemoveDialog.value = false;

            utilStore.setSnackBar({
                showModal: true,
                modalDescription: result.data.message
            });

            clear(); 
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

    const getHardwareTextStatusByStatusCode = (status) => {
        switch(status){
            case Constants.ACTIVE_TRUE: {
                return "ACTIVE";
            }break;
            case Constants.ACTIVE_FALSE: {
                return "INACTIVE";
            }break;
            default: { return Constants.N_A; }
        }
    };

    const getTdStyleByHardwareStatusCode = (status) => {
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

    const openUpdateDialogBox = (item) => {
        currentItemToUpdate.value = {
            hw_id: item.hw_id,
            hw_name: item.hw_name,
            hw_description: item.hw_description,
            hw_isActive: item.hw_isActive === Constants.ACTIVE_TRUE ? true : false,
            hw_isOthers: false
        };

        showUpdateDialog.value = true;
    }

    const openDeleteDialogBox = (item) => {
        currentItemToDelete.value = {
            hw_id: item.hw_id,
            hw_name: item.hw_name
        };

        showRemoveDialog.value = true;
    }

    const search = async() => {
        fetchDataFirst(searchHardwareData.hw_name, searchHardwareData.hw_description, searchHardwareData.hw_isActive, searchHardwareData.hw_isOthers);

        fetchNextSet_pHwName = searchHardwareData.hw_name;
        fetchNextSet_pHwDescription = searchHardwareData.hw_description;
        fetchNextSet_pHwIsActive = searchHardwareData.hw_isActive;
        fetchNextSet_pHwIsOthers = searchHardwareData.hw_isOthers;
    }

    const clear = async() => {
        fetchDataFirst();
        
        fetchNextSet_pHwName = '';
        fetchNextSet_pHwDescription = '';
        fetchNextSet_pHwIsActive = '';
        fetchNextSet_pHwIsOthers = false;

        searchHardwareData.hw_name = '';
        searchHardwareData.hw_description = '';
        searchHardwareData.hw_isActive = null;
        searchHardwareData.hw_isOthers = false;
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
                    icon="mdi-monitor"
                >
                </v-icon>
                Hardware Equipment List
            </div>
        </v-col>
        <v-col
            class="text-end"
            cols="12"
        >
            <v-dialog
                v-model="showCreateDialog"
                width="75%"
            >
                <template 
                    v-slot:activator="{ props }"
                >
                    <v-btn 
                        class="font-weight-bold bg-blue-lighten-1"
                        prepend-icon="mdi-plus"
                        variant="elevated"
                        v-bind="props"
                    >
                        Add
                    </v-btn>
                </template>
                <v-card 
                    class="pa-5"
                >
                    <v-form
                        ref="hardwareCreateForm"
                        @submit.prevent
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
                                            required
                                            clearable
                                            variant="underlined"
                                            placeholder="Enter Hardware Name"
                                            density="comfortable"
                                            label="Hardware Name"
                                            maxlength="255"
                                            v-model.trim="newHardwareData.hw_name"
                                            :rules="standardRule"
                                        >
                                        </v-text-field>
                                        <v-text-field
                                            required
                                            clearable
                                            class="mt-2"
                                            variant="underlined"
                                            placeholder="Enter Hardware Description"
                                            density="comfortable"
                                            label="Hardware Description"
                                            maxlength="255"
                                            v-model.trim="newHardwareData.hw_description"
                                            :rules="standardRule"
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
                                @click="showCreateDialog = false"
                            >
                                Close
                            </v-btn>
                            <v-btn
                                class="font-weight-bold bg-blue-lighten-1"
                                variant="elevated"
                                type="submit"
                                :loading="isButtonLoading"
                                @click="createHardware"
                            >
                                Create
                            </v-btn>
                        </v-card-actions>
                    </v-form>
                </v-card>
            </v-dialog>
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
                            placeholder="Enter Hardware Name..."
                            density="comfortable"
                            label="Hardware Name"
                            maxlength="255"
                            v-model.trim="searchHardwareData.hw_name"
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
                        <v-text-field
                            clearable
                            variant="underlined"
                            placeholder="Enter Hardware Description..."
                            density="comfortable"
                            label="Hardware Description"
                            maxlength="255"
                            v-model.trim="searchHardwareData.hw_description"
                        >
                        </v-text-field>
                        <v-autocomplete
                            clearable
                            variant="underlined"
                            density="comfortable"
                            label="Hardware Status"
                            item-title="name"
                            item-value="id"
                            :items="Constants.arrOfStatus"
                            v-model="searchHardwareData.hw_isActive"
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
                            width="30%"
                        >
                            Hardware Name
                        </th>
                        <th 
                            class="text-left text-black font-weight-bold"
                            width="30%"
                        >
                            Description
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
                        v-for="item in listOfHardware"
                        class="font-size-14px"
                        :key="item.hw_id"
                    >
                        <td>{{ item.hw_id }}</td>
                        <td>{{ item.hw_name }}</td>
                        <td>{{ item.hw_description }}</td>
                        <td
                            :class="getTdStyleByHardwareStatusCode(item.hw_isActive)"
                        >
                            {{ getHardwareTextStatusByStatusCode(item.hw_isActive) }}</td>
                        <td>
                            <v-btn 
                                class="font-weight-bold bg-blue-lighten-1 me-2"
                                density="comfortable"
                                prepend-icon="mdi-file-edit"
                                variant="elevated"
                                @click="openUpdateDialogBox(item)"
                            >
                                Update
                            </v-btn>
                            <v-btn 
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
                    <Observer 
                        v-if="listOfHardware.length" 
                        @intersect="fetchNextSet" 
                    />
                </tbody>
            </v-table>
        </v-col>
    </v-row>

    <v-dialog
        v-model="showUpdateDialog"
        width="75%"
    >
        <v-card 
            class="pa-5"
        >
            <v-form
                ref="hardwareUpdateForm"
                @submit.prevent
            >
                <v-card-title
                    class="font-weight-medium d-flex"
                    tag="div"
                >
                    <v-icon 
                        class="d-inline me-1" 
                        icon="mdi-file-edit"
                        size="small"
                    >
                    </v-icon>
                    <div 
                        class="d-inline"
                    >
                        ID: {{ currentItemToUpdate.hw_id }}
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
                                    required
                                    clearable
                                    variant="underlined"
                                    placeholder="Enter Hardware Name"
                                    density="comfortable"
                                    label="Hardware Name"
                                    maxlength="255"
                                    v-model.trim="currentItemToUpdate.hw_name"
                                    :rules="standardRule"
                                >
                                </v-text-field>
                                <v-text-field
                                    required
                                    clearable
                                    class="mt-2"
                                    variant="underlined"
                                    placeholder="Enter Hardware Description"
                                    density="comfortable"
                                    label="Hardware Description"
                                    maxlength="255"
                                    v-model.trim="currentItemToUpdate.hw_description"
                                    :rules="standardRule"
                                >
                                </v-text-field>
                                <v-checkbox
                                    class="ms-n2 mt-2"
                                    label="Active"
                                    color="blue-lighten-1"
                                    density="compact"
                                    v-model="currentItemToUpdate.hw_isActive"
                                ></v-checkbox>
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
                        @click="showUpdateDialog = false;"
                    >
                        Close
                    </v-btn>
                    <v-btn
                        class="font-weight-bold bg-blue-lighten-1"
                        variant="elevated"
                        type="submit"
                        :loading="isButtonLoading"
                        @click="updateHardware()"
                    >
                        Update
                    </v-btn>
                </v-card-actions>
            </v-form>
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
                                Are you sure you want to delete <span class="font-weight-bold">"{{ currentItemToDelete.hw_name }}"</span> permanently? Once it's done it cannot be undone
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
                    @click="deleteHardware()"
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