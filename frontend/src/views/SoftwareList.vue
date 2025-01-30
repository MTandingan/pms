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
    const listOfSoftware = ref([]);
    var fetchNextSet_pSwName = '';
    var fetchNextSet_pSwDescription = '';
    var fetchNextSet_pSwIsActive = '';
    var fetchNextSet_pSwIsOthers = false;

    //Model Values
    const softwareCreateForm = ref(null);
    const softwareUpdateForm = ref(null);
    const currentItemToUpdate = ref(null);
    const currentItemToDelete = ref(null);
    const showCreateDialog = ref(false);
    const showUpdateDialog = ref(false);
    const showRemoveDialog = ref(false);
    const isButtonLoading = ref(false);
    const lastCurrentIndex = ref(0);
    const hasReachEnd = ref(false);
    const newSoftwareData = reactive({
                                        sw_name: '',
                                        sw_description: '',
                                        sw_isActive: null,
                                        sw_isOthers: null
                                    });
    const searchSoftwareData = reactive({
                                            sw_name: '',
                                            sw_description: '',
                                            sw_isActive: null,
                                            sw_isOthers: 0  //False
                                        });

    //Built-in Functions
    onMounted(async () => {
        await fetchDataFirst();    
        utilStore.setPageLoading({pIsPageLoading: false});  
    });

    watch(listOfSoftware, (list_newValue, list_oldValue) => {
        resetScrollPosition();
    });

    //User-defined Functions
    const fetchDataFirst = async(sw_name = '', sw_description = '', sw_isActive = null, sw_isOthers = false) => {
        lastCurrentIndex.value = 0;
        hasReachEnd.value = false;

        var data = {
            from: lastCurrentIndex.value,
            to: lastCurrentIndex.value + 12,
            sw_name: (sw_name === null) ? "" : sw_name,
            sw_description: (sw_description === null) ? "" : sw_description,
            sw_isActive: (sw_isActive === null) ? "" : sw_isActive,
            sw_isOthers: (sw_isOthers === null) ? "" : sw_isOthers
        };

        let result = await axios.get(`/getlistOfSoftwareWithRange`, {
            params: data
        });
        
        if(result.data.status == Constants.STATUS_CODE_SUCCESS){
            listOfSoftware.value = result.data.data;
            lastCurrentIndex.value += 12;
        } else if(result.data.status == Constants.STATUS_CODE_INVALID_TOKEN){
            userStore.logout();
        }  else {
            logger.error("Error in Fetching First batch list of Software", logger.createErrorContext("fetch-first-software-list", result.data.message));
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
                sw_name: fetchNextSet_pSwName,
                sw_description: fetchNextSet_pSwDescription,
                sw_isActive: fetchNextSet_pSwIsActive,
                sw_isOthers: fetchNextSet_pSwIsOthers
            };

            let result = await axios.get(`/getlistOfSoftwareWithRange`, {
                params: data
            });

            if(result.data.status == Constants.STATUS_CODE_SUCCESS){
                listOfSoftware.value = [
                    ...listOfSoftware.value,
                    ...result.data.data
                ];

                lastCurrentIndex.value += 5;

                if(!result.data.data.length){
                    hasReachEnd.value = true;
                }
            } else if(result.data.status == Constants.STATUS_CODE_INVALID_TOKEN){
                userStore.logout();
            } else {
                logger.error("Error in Fetching list of Software", logger.createErrorContext("fetch-software-list", result.data.message));
                utilStore.setSnackBar({
                    showModal: true,
                    modalDescription: result.data.message
                });
            }
        } 
    }

    const createSoftware = async(e) => {
        
        const { valid } = await softwareCreateForm.value.validate();

        if(valid){
            isButtonLoading.value = true;
            
            let data = {
                sw_name: newSoftwareData.sw_name,
                sw_description: newSoftwareData.sw_description,
                sw_isActive: true,
                sw_isOthers: false
            };

            let result = await axios.post("/createSoftware", data);

            if(result.data.status == Constants.STATUS_CODE_SUCCESS){
                showCreateDialog.value = false;

                utilStore.setSnackBar({
                    showModal: true,
                    modalDescription: result.data.message
                });

                clear();
            } else {
                logger.error("Error in Creating of Software", logger.createErrorContext("create-software", result.data.message));
                utilStore.setSnackBar({
                    showModal: true,
                    modalDescription: result.data.message
                });
            }

            isButtonLoading.value = false;
        }
    }

    const updateSoftware = async(e) => {

        const { valid } = await softwareUpdateForm.value.validate();
        
        if(valid){
            isButtonLoading.value = true;

            let data = {
                sw_id: currentItemToUpdate.value.sw_id,
                sw_name: currentItemToUpdate.value.sw_name,
                sw_description: currentItemToUpdate.value.sw_description,
                sw_isActive: currentItemToUpdate.value.sw_isActive,
                sw_isOthers: currentItemToUpdate.value.sw_isOthers
            };

            let result = await axios.put("/updateSoftware", data);

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

    const deleteSoftware = async(e) => {
        isButtonLoading.value = true;

        let result = await axios.delete(`/deleteSoftware/${currentItemToDelete.value.sw_id}`);

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

    const getSoftwareTextStatusByStatusCode = (status) => {
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

    const getTdStyleBySoftwareStatusCode = (status) => {
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
            sw_id: item.sw_id,
            sw_name: item.sw_name,
            sw_description: item.sw_description,
            sw_isActive: item.sw_isActive === Constants.ACTIVE_TRUE ? true : false,
            sw_isOthers: false
        };

        showUpdateDialog.value = true;
    }

    const openDeleteDialogBox = (item) => {
        currentItemToDelete.value = {
            sw_id: item.sw_id,
            sw_name: item.sw_name
        };

        showRemoveDialog.value = true;
    }

    const search = async() => {
        fetchDataFirst(searchSoftwareData.sw_name, searchSoftwareData.sw_description, searchSoftwareData.sw_isActive, searchSoftwareData.sw_isOthers);

        fetchNextSet_pSwName = searchSoftwareData.sw_name;
        fetchNextSet_pSwDescription = searchSoftwareData.sw_description;
        fetchNextSet_pSwIsActive = searchSoftwareData.sw_isActive;
        fetchNextSet_pSwIsOthers = searchSoftwareData.sw_isOthers;
    }

    const clear = async() => {
        fetchDataFirst();
        
        fetchNextSet_pSwName = '';
        fetchNextSet_pSwDescription = '';
        fetchNextSet_pSwIsActive = '';
        fetchNextSet_pSwIsOthers = false;

        searchSoftwareData.sw_name = '';
        searchSoftwareData.sw_description = '';
        searchSoftwareData.sw_isActive = null;
        searchSoftwareData.sw_isOthers = false;
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
                Software List
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
                        ref="softwareCreateForm"
                        @submit.prevent
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
                                            required
                                            clearable
                                            variant="underlined"
                                            placeholder="Enter Software Name"
                                            density="comfortable"
                                            label="Software Name"
                                            maxlength="255"
                                            v-model.trim="newSoftwareData.sw_name"
                                            :rules="standardRule"
                                        >
                                        </v-text-field>
                                        <v-text-field
                                            required
                                            clearable
                                            class="mt-2"
                                            variant="underlined"
                                            placeholder="Enter Software Description"
                                            density="comfortable"
                                            label="Software Description"
                                            maxlength="255"
                                            v-model.trim="newSoftwareData.sw_description"
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
                                @click="createSoftware"
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
                            placeholder="Enter Software Name..."
                            density="comfortable"
                            label="Software Name"
                            maxlength="255"
                            v-model.trim="searchSoftwareData.sw_name"
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
                            placeholder="Enter Software Description..."
                            density="comfortable"
                            label="Software Description"
                            maxlength="255"
                            v-model.trim="searchSoftwareData.sw_description"
                        >
                        </v-text-field>
                        <v-autocomplete
                            clearable
                            variant="underlined"
                            density="comfortable"
                            label="Software Status"
                            item-title="name"
                            item-value="id"
                            :items="Constants.arrOfStatus"
                            v-model="searchSoftwareData.sw_isActive"
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
                            Software Name
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
                        v-for="item in listOfSoftware"
                        class="font-size-14px"
                        :key="item.sw_id"
                    >
                        <td>{{ item.sw_id }}</td>
                        <td>{{ item.sw_name }}</td>
                        <td>{{ item.sw_description }}</td>
                        <td
                            :class="getTdStyleBySoftwareStatusCode(item.sw_isActive)"
                        >
                            {{ getSoftwareTextStatusByStatusCode(item.sw_isActive) }}</td>
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
                        v-if="listOfSoftware.length" 
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
                ref="softwareUpdateForm"
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
                        ID: {{ currentItemToUpdate.sw_id }}
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
                                    placeholder="Enter Software Name"
                                    density="comfortable"
                                    label="Software Name"
                                    maxlength="255"
                                    v-model.trim="currentItemToUpdate.sw_name"
                                    :rules="standardRule"
                                >
                                </v-text-field>
                                <v-text-field
                                    required
                                    clearable
                                    class="mt-2"
                                    variant="underlined"
                                    placeholder="Enter Software Description"
                                    density="comfortable"
                                    label="Software Description"
                                    maxlength="255"
                                    v-model.trim="currentItemToUpdate.sw_description"
                                    :rules="standardRule"
                                >
                                </v-text-field>
                                <v-checkbox
                                    class="ms-n2 mt-2"
                                    label="Active"
                                    color="blue-lighten-1"
                                    density="compact"
                                    v-model="currentItemToUpdate.sw_isActive"
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
                        @click="updateSoftware()"
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
                                Are you sure you want to delete <span class="font-weight-bold">"{{ currentItemToDelete.sw_name }}"</span> permanently? Once it's done it cannot be undone
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
                    @click="deleteSoftware()"
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