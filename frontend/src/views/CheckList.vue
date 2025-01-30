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
    const listOfChecklistItem = ref([]);
    var fetchNextSet_pChecklistTitle = '';
    var fetchNextSet_pChecklistDescription = '';
    var fetchNextSet_pChecklistIsActive = '';

    //Model Values
    const checklistItemCreateForm = ref(null);
    const checklistItemUpdateForm = ref(null);
    const currentItemToUpdate = ref(null);
    const currentItemToDelete = ref(null);
    const showCreateDialog = ref(false);
    const showUpdateDialog = ref(false);
    const showRemoveDialog = ref(false);
    const isButtonLoading = ref(false);
    const lastCurrentIndex = ref(0);
    const hasReachEnd = ref(false);
    const newChecklistItemData = reactive({
                                        chk_title: '',
                                        chk_description: '',
                                        chk_isActive: null
                                    });
    const searchChecklistItemData = reactive({
                                            chk_title: '',
                                            chk_description: '',
                                            chk_isActive: null
                                        });

    //Built-in Functions
    onMounted(async () => {
        await fetchDataFirst();    
        utilStore.setPageLoading({pIsPageLoading: false});  
    });

    watch(listOfChecklistItem, (list_newValue, list_oldValue) => {
        resetScrollPosition();
    });

    //User-defined Functions
    const fetchDataFirst = async(chk_title = '', chk_description = '', chk_isActive = null) => {
        lastCurrentIndex.value = 0;
        hasReachEnd.value = false;

        var data = {
            from: lastCurrentIndex.value,
            to: lastCurrentIndex.value + 12,
            chk_title: (chk_title === null) ? "" : chk_title,
            chk_description: (chk_description === null) ? "" : chk_description,
            chk_isActive: (chk_isActive === null) ? "" : chk_isActive
        };

        let result = await axios.get(`/getlistOfChecklistItemWithRange`, {
            params: data
        });

        if(result.data.status == Constants.STATUS_CODE_SUCCESS){
            listOfChecklistItem.value = result.data.data;
            lastCurrentIndex.value += 12;
        } else if(result.data.status == Constants.STATUS_CODE_INVALID_TOKEN){
            userStore.logout();
        }  else {
            logger.error("Error in Fetching First batch list of Checklist", logger.createErrorContext("fetch-first-checklist-list", result.data.message));
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
                chk_title: fetchNextSet_pChecklistTitle,
                chk_description: fetchNextSet_pChecklistDescription,
                chk_isActive: fetchNextSet_pChecklistIsActive
            };

            let result = await axios.get(`/getlistOfChecklistItemWithRange`, {
                params: data
            });

            if(result.data.status == Constants.STATUS_CODE_SUCCESS){
                listOfChecklistItem.value = [
                    ...listOfChecklistItem.value,
                    ...result.data.data
                ];

                lastCurrentIndex.value += 5;

                if(!result.data.data.length){
                    hasReachEnd.value = true;
                }
            } else if(result.data.status == Constants.STATUS_CODE_INVALID_TOKEN){
                userStore.logout();
            } else {
                logger.error("Error in Fetching list of Checklist", logger.createErrorContext("fetch-checklist-list", result.data.message));
                utilStore.setSnackBar({
                    showModal: true,
                    modalDescription: result.data.message
                });
            }
        } 
    }

    const createChecklistItem = async(e) => {
        
        const { valid } = await checklistItemCreateForm.value.validate();

        if(valid){
            isButtonLoading.value = true;
            
            let data = {
                chk_title: newChecklistItemData.chk_title,
                chk_description: newChecklistItemData.chk_description,
                chk_isActive: true
            };

            let result = await axios.post("/createChecklistItem", data);

            if(result.data.status == Constants.STATUS_CODE_SUCCESS){
                showCreateDialog.value = false;

                utilStore.setSnackBar({
                    showModal: true,
                    modalDescription: result.data.message
                });

                clear();
            } else {
                logger.error("Error in Creating Checklist", logger.createErrorContext("create-checklist", result.data.message));
                utilStore.setSnackBar({
                    showModal: true,
                    modalDescription: result.data.message
                });
            }

            isButtonLoading.value = false;
        }
    }

    const updateChecklistItem = async(e) => {

        const { valid } = await checklistItemUpdateForm.value.validate();
        
        if(valid){
            isButtonLoading.value = true;

            let data = {
                chk_id: currentItemToUpdate.value.chk_id,
                chk_title: currentItemToUpdate.value.chk_title,
                chk_description: currentItemToUpdate.value.chk_description,
                chk_isActive: currentItemToUpdate.value.chk_isActive
            };

            let result = await axios.put("/updateChecklistItem", data);

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

    const deleteChecklistItem = async(e) => {
        isButtonLoading.value = true;

        let result = await axios.delete(`/deleteChecklistItem/${currentItemToDelete.value.chk_id}`);

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

    const getChecklistItemTextStatusByStatusCode = (status) => {
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

    const getTdStyleByChecklistItemStatusCode = (status) => {
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
            chk_id: item.chk_id,
            chk_title: item.chk_title,
            chk_description: item.chk_description,
            chk_isActive: item.chk_isActive === Constants.ACTIVE_TRUE ? true : false
        };

        showUpdateDialog.value = true;
    }

    const openDeleteDialogBox = (item) => {
        currentItemToDelete.value = {
            chk_id: item.chk_id,
            chk_title: item.chk_title
        };

        showRemoveDialog.value = true;
    }

    const search = async() => {
        fetchDataFirst(searchChecklistItemData.chk_title, searchChecklistItemData.chk_description, searchChecklistItemData.chk_isActive);

        fetchNextSet_pChecklistTitle = searchChecklistItemData.chk_title;
        fetchNextSet_pChecklistDescription = searchChecklistItemData.chk_description;
        fetchNextSet_pChecklistIsActive = searchChecklistItemData.chk_isActive;
    }

    const clear = async() => {
        fetchDataFirst();
        
        fetchNextSet_pChecklistTitle = '';
        fetchNextSet_pChecklistDescription = '';
        fetchNextSet_pChecklistIsActive = null;

        searchChecklistItemData.chk_title = '';
        searchChecklistItemData.chk_description = '';
        searchChecklistItemData.chk_isActive = null;
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
                CheckList Items
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
                        ref="checklistItemCreateForm"
                        @submit.prevent
                    >
                        <v-card-title
                            class="font-weight-medium d-flex"
                            tag="div"
                        >
                            <div 
                                class="d-inline"
                            >
                                Add Checklist Item
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
                                            placeholder="Enter Checklist Item Name"
                                            density="comfortable"
                                            label="Checklist Item Name"
                                            maxlength="255"
                                            v-model.trim="newChecklistItemData.chk_title"
                                            :rules="standardRule"
                                        >
                                        </v-text-field>
                                        <v-text-field
                                            required
                                            clearable
                                            class="mt-2"
                                            variant="underlined"
                                            placeholder="Enter Checklist Item Description"
                                            density="comfortable"
                                            label="Checklist Item Description"
                                            maxlength="255"
                                            v-model.trim="newChecklistItemData.chk_description"
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
                                @click="createChecklistItem"
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
                            placeholder="Enter Checklist Item Name..."
                            density="comfortable"
                            label="Checklist Item Name"
                            maxlength="255"
                            v-model.trim="searchChecklistItemData.chk_title"
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
                            placeholder="Enter Checklist Item Description..."
                            density="comfortable"
                            label="Checklist Item Description"
                            maxlength="255"
                            v-model.trim="searchChecklistItemData.chk_description"
                        >
                        </v-text-field>
                        <v-autocomplete
                            clearable
                            variant="underlined"
                            density="comfortable"
                            label="Checklist Item Status"
                            item-title="name"
                            item-value="id"
                            :items="Constants.arrOfStatus"
                            v-model="searchChecklistItemData.chk_isActive"
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
                            Checklist Item Name
                        </th>
                        <th 
                            class="text-left text-black font-weight-bold"
                            width="25%"
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
                        v-for="item in listOfChecklistItem"
                        class="font-size-14px"
                        :key="item.chk_id"
                    >
                        <td>{{ item.chk_id }}</td>
                        <td>{{ item.chk_title }}</td>
                        <td>{{ item.chk_description }}</td>
                        <td
                            :class="getTdStyleByChecklistItemStatusCode(item.chk_isActive)"
                        >
                            {{ getChecklistItemTextStatusByStatusCode(item.chk_isActive) }}</td>
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
                        v-if="listOfChecklistItem.length" 
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
                ref="checklistItemUpdateForm"
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
                        ID: {{ currentItemToUpdate.chk_id }}
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
                                    placeholder="Enter Checklist Item Name"
                                    density="comfortable"
                                    label="Checklist Item Name"
                                    maxlength="255"
                                    v-model.trim="currentItemToUpdate.chk_title"
                                    :rules="standardRule"
                                >
                                </v-text-field>
                                <v-text-field
                                    required
                                    clearable
                                    class="mt-2"
                                    variant="underlined"
                                    placeholder="Enter Checklist Item Description"
                                    density="comfortable"
                                    label="Checklist Item Description"
                                    maxlength="255"
                                    v-model.trim="currentItemToUpdate.chk_description"
                                    :rules="standardRule"
                                >
                                </v-text-field>                                
                                <v-checkbox
                                    class="ms-n2 mt-2"
                                    label="Active"
                                    color="blue-lighten-1"
                                    density="compact"
                                    v-model="currentItemToUpdate.chk_isActive"
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
                        @click="updateChecklistItem()"
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
                                Are you sure you want to delete <span class="font-weight-bold">"{{ currentItemToDelete.chk_title }}"</span> permanently? Once it's done it cannot be undone
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
                    @click="deleteChecklistItem()"
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