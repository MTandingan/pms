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
    var fetchNextSet_pCompName = '';
    var fetchNextSet_pCompBarCode = '';
    var fetchNextSet_pCompInventoryId = '';
    var fetchNextSet_pCompSerial = '';
    var fetchNextSet_pCompStatus = '';

    //Model Values
    const computerCreateForm = ref(null);
    const computerUpdateForm = ref(null);
    const computerAuditTrail = ref([]);
    const currentItemToUpdate = ref(null);
    const currentItemToDelete = ref(null);
    const currentItemToView = ref(null);
    const computerItemStatus = ref(0);
    const listOfComputer = ref([]);
    const listComments = ref([]);
    const showCreateDialog = ref(false);
    const showUpdateDialog = ref(false);
    const showRemoveDialog = ref(false);
    const showViewDetailsDialog = ref(false);
    const showComputerInternalCommentDialog = ref(false);
    const isButtonLoading = ref(false);
    const lastCurrentIndex = ref(0);
    const hasReachEnd = ref(false);
    const newComputerData = reactive({
                                        comp_name: '',
                                        comp_description: '',
                                        comp_inventoryId: '',
                                        comp_serial: '',
                                        comp_status: ''
                                    });
    const searchComputerData = reactive({
                                            comp_name: '',
                                            comp_barCode: '',
                                            comp_inventoryId: '',
                                            comp_serial: '',
                                            comp_status: null
                                        });

    //Built-in Functions
    onMounted(async () => {
        await fetchDataFirst();    
        utilStore.setPageLoading({pIsPageLoading: false});  
    });

    watch(listOfComputer, (list_newValue, list_oldValue) => {
        resetScrollPosition();
    });

    //User-defined Functions
    const fetchDataFirst = async(comp_name = '', comp_barCode = '', comp_inventoryId = '', comp_serial = '', comp_status = null) => {
        lastCurrentIndex.value = 0;
        hasReachEnd.value = false;

        var data = {
            from: lastCurrentIndex.value,
            to: lastCurrentIndex.value + 12,
            comp_name: (comp_name === null) ? "" : comp_name,
            comp_barCode: (comp_barCode === null) ? "" : comp_barCode,
            comp_inventoryId: (comp_inventoryId === null) ? "" : comp_inventoryId,
            comp_serial: (comp_serial === null) ? "" : comp_serial,
            comp_status: (comp_status === null) ? "" : comp_status
        };

        let result = await axios.get(`/getListOfComputerWithRange`, {
            params: data
        });

        if(result.data.status == Constants.STATUS_CODE_SUCCESS){
            listOfComputer.value = result.data.data;
            lastCurrentIndex.value += 12;
        } else if(result.data.status == Constants.STATUS_CODE_INVALID_TOKEN){
            userStore.logout();
        }  else {
            logger.error("Error in Fetching First batch list of Computer", logger.createErrorContext("fetch-first-computer-list", result.data.message));
            utilStore.setSnackBar({
                showModal: true,
                modalDescription: result.data.message
            });
        }
    }

    const getDefectiveWsqDetails = async(comp_id = currentItemToView.value.comp_id) => {
        var data = {
            comp_id: comp_id,
            comp_status: Constants.COMP_STATUS_DEFECTIVE,
            ws_isActive: Constants.ACTIVE_FALSE,
            wsq_status: Constants.WSQ_STATUS_COMPLETE,
            wsq_resolution: Constants.WSQ_RESOLUTION_CONDEMNED
        };

        const params = new URLSearchParams(data);

        let result = await axios.get(`/getWsqDetailsByParams?${params}`);

        if(result.data.status == Constants.STATUS_CODE_SUCCESS){
            currentItemToView.value.defectiveDate =  moment(result.data.data[0].wsq_acknowledgedAt).format('LLL');
        } else if(result.data.status == Constants.STATUS_CODE_INVALID_TOKEN){
            userStore.logout();
        } else {
            logger.error("Error in Fetching workstation quarterly details for defective computers", logger.createErrorContext("fetch-defective-wsq-details", result.data.message));
            utilStore.setSnackBar({
                showModal: true,
                modalDescription: result.data.message
            });
        }
    }

    const getComputerAuditTrailByCompId = async(comp_id) => {
        var data = {
            compAudit_compId: comp_id
        };

        let result = await axios.get(`/getComputerAuditTrailByCompId`, { params: data });

        if(result.data.status == Constants.STATUS_CODE_SUCCESS){
            computerAuditTrail.value = result.data.data;
        } else if(result.data.status == Constants.STATUS_CODE_INVALID_TOKEN){
            userStore.logout();
        } else {
            logger.error("Error in Fetching computer audit trail", logger.createErrorContext("fetch-computer-audittrail-compId", result.data.message));
            utilStore.setSnackBar({
                showModal: true,
                modalDescription: result.data.message
            });
        }
    }

    const getComputerComments = async(ws_compId) => {
        const result = await getListOfCommentsAndWsqByCompId(ws_compId);

        listComments.value = result.data.data;
        console.log(listComments.value);

        showComputerInternalCommentDialog.value = true;
    }

    const getListOfCommentsAndWsqByCompId = async (ws_compId) => {
        var data = {
            ws_compId: ws_compId
        };
        
        const params = new URLSearchParams(data)

        return await axios.get(`/getListOfCommentsAndWsqByCompId?${params}`);
    }; 

    const fetchNextSet = async() => {
        if(!hasReachEnd.value){
            let data = {
                from: lastCurrentIndex.value,
                to: 5,
                comp_name: fetchNextSet_pCompName,
                comp_barCode: fetchNextSet_pCompBarCode,
                comp_inventoryId: fetchNextSet_pCompInventoryId,
                comp_serial: fetchNextSet_pCompSerial,
                comp_status: fetchNextSet_pCompStatus
            };

            let result = await axios.get(`/getListOfComputerWithRange`, {
                params: data
            });

            if(result.data.status == Constants.STATUS_CODE_SUCCESS){
                listOfComputer.value = [
                    ...listOfComputer.value,
                    ...result.data.data
                ];

                lastCurrentIndex.value += 5;

                if(!result.data.data.length){
                    hasReachEnd.value = true;
                }
            } else if(result.data.status == Constants.STATUS_CODE_INVALID_TOKEN){
                userStore.logout();
            } else {
                logger.error("Error in Fetching list of Computers", logger.createErrorContext("fetch-computer-list", result.data.message));
                utilStore.setSnackBar({
                    showModal: true,
                    modalDescription: result.data.message
                });
            }
        } 
    }

    const createComputer = async(e) => {
        
        const { valid } = await computerCreateForm.value.validate();

        if(valid){
            isButtonLoading.value = true;
            
            let data = {
                comp_name: newComputerData.comp_name,
                comp_description: newComputerData.comp_description,
                comp_inventoryId: newComputerData.comp_inventoryId,
                comp_barCode: generateCompBarCode(),                //Concatenation of other code will be on the backend
                comp_serial: newComputerData.comp_serial,
                comp_status: Constants.COMP_STATUS_ACTIVE,
            };

            let result = await axios.post("/createComputer", data);

            if(result.data.status == Constants.STATUS_CODE_SUCCESS){
                showCreateDialog.value = false;

                utilStore.setSnackBar({
                    showModal: true,
                    modalDescription: result.data.message
                });

                clear();
            } else {
                logger.error("Error in Creating of Computer", logger.createErrorContext("create-computer", result.data.message));
                utilStore.setSnackBar({
                    showModal: true,
                    modalDescription: result.data.message
                });
            }

            isButtonLoading.value = false;
        }
    }

    const updateComputer = async(e) => {

        const { valid } = await computerUpdateForm.value.validate();
        
        if(valid){
            isButtonLoading.value = true;

            let data = {
                comp_id: currentItemToUpdate.value.comp_id,
                comp_name: currentItemToUpdate.value.comp_name,
                comp_description: currentItemToUpdate.value.comp_description,
                comp_inventoryId: currentItemToUpdate.value.comp_inventoryId,
                comp_serial: currentItemToUpdate.value.comp_serial,
                comp_status: currentItemToUpdate.value.comp_status
            };

            let result = await axios.put("/updateComputer", data);

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

    const deleteComputer = async(e) => {
        isButtonLoading.value = true;

        let result = await axios.delete(`/deleteComputer/${currentItemToDelete.value.comp_id}`);

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

    const getCompTextStatusByStatusCode = (status) => {
        switch(status){
            case Constants.COMP_STATUS_ACTIVE: {
                return Constants.COMP_STATUS_ACTIVE_TEXT;
            }break;
            case Constants.COMP_STATUS_INACTIVE: {
                return Constants.COMP_STATUS_INACTIVE_TEXT;
            }break;
            case Constants.COMP_STATUS_DEFECTIVE: {
                return Constants.COMP_STATUS_DEFECTIVE_TEXT;
            }break;
            default: { return Constants.N_A; }
        }
    };

    const getTdStyleByCompStatusCode = (status) => {
        switch(status){
            case Constants.COMP_STATUS_ACTIVE: {
                return "text-green font-weight-medium";
            }break;
            case Constants.COMP_STATUS_INACTIVE: {
                return "text-red font-weight-medium";
            }break;
            case Constants.COMP_STATUS_DEFECTIVE: {
                return "text-orange font-weight-medium";
            }break;
            default: { return ""; }
        }
    };

    const openUpdateDialogBox = (item) => {
        currentItemToUpdate.value = {
            comp_id: item.comp_id,
            comp_name: item.comp_name,
            comp_description: item.comp_description,
            comp_inventoryId: item.comp_inventoryId,
            comp_serial: item.comp_serial,
            comp_status: item.comp_status
        };

        computerItemStatus.value = item.comp_status;
        showUpdateDialog.value = true;
    }

    const openDeleteDialogBox = (item) => {
        currentItemToDelete.value = {
            comp_id: item.comp_id,
            comp_name: item.comp_name
        };

        showRemoveDialog.value = true;
    }

    const search = async() => {
        fetchDataFirst(searchComputerData.comp_name, searchComputerData.comp_barCode, searchComputerData.comp_inventoryId, searchComputerData.comp_serial, searchComputerData.comp_status);

        fetchNextSet_pCompName = searchComputerData.comp_name;
        fetchNextSet_pCompBarCode = searchComputerData.comp_barCode;
        fetchNextSet_pCompInventoryId = searchComputerData.comp_inventoryId;
        fetchNextSet_pCompSerial = searchComputerData.comp_serial;
        fetchNextSet_pCompStatus = searchComputerData.comp_status;
    }

    const clear = async() => {
        fetchDataFirst();
        
        fetchNextSet_pCompName = '';
        fetchNextSet_pCompBarCode = '';
        fetchNextSet_pCompInventoryId = '';
        fetchNextSet_pCompSerial = '';
        fetchNextSet_pCompStatus = '',

        searchComputerData.comp_name = '';
        searchComputerData.comp_barCode = '';
        searchComputerData.comp_inventoryId = '';
        searchComputerData.comp_serial = '';
        searchComputerData.comp_status = null;
    }

    //Generate item code
    const generateCompBarCode = () => {
        return Constants.COMP_INITIAL_BARCODE + moment().format('YYYYMMDD');
    }

    const openViewDetailsDialog = async(computer) => {
        currentItemToView.value = computer;
        
        await getComputerAuditTrailByCompId(computer.comp_id);

        if(computer.comp_status == Constants.COMP_STATUS_DEFECTIVE){
            await getDefectiveWsqDetails(computer.comp_id);
        } else {
            currentItemToView.value.defectiveDate = Constants.N_A;
        }

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
                    icon="mdi-monitor"
                >
                </v-icon>
                Computer List
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
                        ref="computerCreateForm"
                        @submit.prevent
                    >
                        <v-card-title
                            class="font-weight-medium d-flex"
                            tag="div"
                        >
                            <div 
                                class="d-inline"
                            >
                                Add Computer Hardware
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
                                            placeholder="Enter Computer Hardware Name"
                                            density="comfortable"
                                            label="Computer Hardware Name"
                                            maxlength="255"
                                            v-model.trim="newComputerData.comp_name"
                                            :rules="standardRule"
                                        >
                                        </v-text-field>
                                        <v-text-field
                                            required
                                            clearable
                                            class="mt-2"
                                            variant="underlined"
                                            placeholder="Enter Computer Hardware Description"
                                            density="comfortable"
                                            label="Computer Hardware Description"
                                            maxlength="255"
                                            v-model.trim="newComputerData.comp_description"
                                            :rules="standardRule"
                                        >
                                        </v-text-field>
                                        <v-text-field
                                            required
                                            clearable
                                            class="mt-2"
                                            variant="underlined"
                                            placeholder="Enter Computer Hardware Inventory Code"
                                            density="comfortable"
                                            label="Computer Hardware Inventory Code"
                                            maxlength="255"
                                            v-model.trim="newComputerData.comp_inventoryId"
                                            :rules="standardRule"
                                        >
                                        </v-text-field>
                                        <v-text-field
                                            required
                                            clearable
                                            class="mt-2"
                                            variant="underlined"
                                            placeholder="Enter Computer Hardware Serial Number"
                                            density="comfortable"
                                            label="Computer Hardware Serial Number"
                                            maxlength="255"
                                            v-model.trim="newComputerData.comp_serial"
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
                                @click="createComputer"
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
                            placeholder="Enter Computer Hardware Name..."
                            density="comfortable"
                            label="Computer Hardware Name"
                            maxlength="255"
                            v-model.trim="searchComputerData.comp_name"
                        >
                        </v-text-field>
                        <v-text-field
                            clearable
                            variant="underlined"
                            placeholder="Enter Computer Hardware Bar Code..."
                            density="comfortable"
                            label="Computer Hardware Bar Code"
                            maxlength="255"
                            v-model.trim="searchComputerData.comp_barCode"
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
                            placeholder="Enter Computer Hardware Inventory Code..."
                            density="comfortable"
                            label="Computer Hardware Inventory Code"
                            maxlength="255"
                            v-model.trim="searchComputerData.comp_inventoryId"
                        >
                        </v-text-field>
                        <v-text-field
                            clearable
                            variant="underlined"
                            placeholder="Enter Computer Hardware Serial Number..."
                            density="comfortable"
                            label="Computer Hardware Serial Number"
                            maxlength="255"
                            v-model.trim="searchComputerData.comp_serial"
                        >
                        </v-text-field>
                        <v-autocomplete
                            clearable
                            variant="underlined"
                            density="comfortable"
                            label="Choose Computer Status"
                            item-title="name"
                            item-value="id"
                            :items="Constants.arrOfComputerStatus"
                            v-model="searchComputerData.comp_status"
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
                            Computer Name
                        </th>
                        <th 
                            class="text-left text-black font-weight-bold"
                            width="20%"
                        >
                            Description
                        </th>
                        <th 
                            class="text-left text-black font-weight-bold"
                        >
                            Bar Code
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
                        v-for="item in listOfComputer"
                        class="font-size-14px"
                        :key="item.comp_id"
                    >
                        <td>{{ item.comp_id }}</td>
                        <td>
                            {{ item.comp_name }}
                        </td>
                        <td>{{ item.comp_description }}</td>
                        <td>{{ item.comp_barCode }}</td>
                        <td
                            :class="getTdStyleByCompStatusCode(item.comp_status)"
                        >
                            {{ getCompTextStatusByStatusCode(item.comp_status) }}</td>
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
                                class="font-weight-bold bg-blue-lighten-1 me-2"
                                density="comfortable"
                                prepend-icon="mdi-eye"
                                variant="elevated"
                                @click="openViewDetailsDialog(item)"
                            >
                                Details
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
                        v-if="listOfComputer.length" 
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
                ref="computerUpdateForm"
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
                        ID: {{ currentItemToUpdate.comp_id }}
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
                                    placeholder="Enter Computer Hardware Name"
                                    density="comfortable"
                                    label="Computer Hardware Name"
                                    maxlength="255"
                                    v-model.trim="currentItemToUpdate.comp_name"
                                    :rules="standardRule"
                                >
                                </v-text-field>
                                <v-text-field
                                    required
                                    clearable
                                    class="mt-2"
                                    variant="underlined"
                                    placeholder="Enter Computer Hardware Description"
                                    density="comfortable"
                                    label="Computer Hardware Description"
                                    maxlength="255"
                                    v-model.trim="currentItemToUpdate.comp_description"
                                    :rules="standardRule"
                                >
                                </v-text-field>
                                <v-text-field
                                    required
                                    clearable
                                    class="mt-2"
                                    variant="underlined"
                                    placeholder="Enter Computer Hardware Inventory Code"
                                    density="comfortable"
                                    label="Computer Hardware Inventory Code"
                                    maxlength="255"
                                    v-model.trim="currentItemToUpdate.comp_inventoryId"
                                    :rules="standardRule"
                                >
                                </v-text-field>
                                <v-text-field
                                    required
                                    clearable
                                    class="mt-2"
                                    variant="underlined"
                                    placeholder="Enter Computer Hardware Serial Number"
                                    density="comfortable"
                                    label="Computer Hardware Serial Number"
                                    maxlength="255"
                                    v-model.trim="currentItemToUpdate.comp_serial"
                                    :rules="standardRule"
                                >
                                </v-text-field>
                                <v-autocomplete
                                    v-if="computerItemStatus != Constants.COMP_STATUS_DEFECTIVE"
                                    clearable
                                    variant="underlined"
                                    density="comfortable"
                                    label="Computer status"
                                    item-title="name"
                                    item-value="id"
                                    :items="Constants.arrOfComputerStatusWoDefective"
                                    v-model="currentItemToUpdate.comp_status"
                                >
                                </v-autocomplete>
                                <div 
                                    class="font-size-14px mb-2"
                                    v-else
                                >
                                    <span class="font-weight-medium">Status: </span> {{ Constants.COMP_STATUS_DEFECTIVE_TEXT }}    
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
                        @click="showUpdateDialog = false;"
                    >
                        Close
                    </v-btn>
                    <v-btn
                        class="font-weight-bold bg-blue-lighten-1"
                        variant="elevated"
                        type="submit"
                        :loading="isButtonLoading"
                        @click="updateComputer()"
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
                                Are you sure you want to delete <span class="font-weight-bold">"{{ currentItemToDelete.comp_name }}"</span> permanently? Once it's done it cannot be undone
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
                    @click="deleteComputer()"
                >
                    Confirm
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

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
                    {{ currentItemToView.comp_name }}
                </div>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
                <v-container>
                    <v-row>
                        <v-col
                            cols="8"
                        >
                            <div class="font-size-24px mb-2">
                                <span class="font-weight-medium">More Details</span>
                            </div>
                            <div class="font-size-16px">
                                <span class="">Inventory Code:</span> {{ currentItemToView.comp_inventoryId }}
                            </div>
                            <div class="font-size-16px">
                                <span class="">Defective Date:</span> {{ currentItemToView.defectiveDate }}
                            </div>
                            <div class="font-size-16px">
                                <span class="">Serial No:</span> {{ currentItemToView.comp_serial }}
                            </div>
                        </v-col>
                        <v-col
                            cols="4"
                        >
                            <div class="d-flex flex-row-reverse">
                                <v-btn
                                    class="font-weight-bold me-2"
                                    color="blue-lighten-1"
                                    variant="elevated"
                                    @click = "getComputerComments(currentItemToView.comp_id)"
                                >
                                    Internal Comments
                                </v-btn>
                            </div>
                           
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col
                            cols="12"
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
                                            v-for="(item, key) in computerAuditTrail"
                                            :key="key"
                                            class="mb-4"
                                            dot-color="#616161"
                                            size="small"
                                        >
                                            <div class="d-flex justify-space-between flex-grow-1">
                                                <div>{{ item.compAudit_message }} <span class="flex-shrink-0 ms-5 font-weight-medium">{{ moment(item.compAudit_date).format('LLL') }}</span></div>
                                            </div>
                                        </v-timeline-item>
                                    </v-timeline>
                                </v-expansion-panel-text>
                            </v-expansion-panel>
                        </v-expansion-panels>
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

    <v-dialog
        v-model="showComputerInternalCommentDialog"
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
                    {{ currentItemToView.comp_name }}
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
                                <span class="font-weight-medium">Internal Comments</span>
                            </div>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col
                            cols="12"
                        >
                        <v-expansion-panels>
                            <v-expansion-panel>
                                <v-expansion-panel-title
                                    color="blue-lighten-1"
                                >
                                    Comments
                                </v-expansion-panel-title>
                                <v-expansion-panel-text>
                                    <div
                                        v-for="(item, key) in listComments"
                                        :key="key"
                                    >
                                        <div
                                            class="my-1 pa-1"
                                        >
                                            <v-row>
                                                <v-col
                                                    cols="6"
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
                                                            {{item.ic_updatedByUsername}}
                                                        </p>                                                 
                                                    </div>
                                                    <div 
                                                        class="d-flex flex-row flex-wrap"
                                                    >
                                                        <v-icon
                                                            class="me-2 mt-1"
                                                            size="x-small"
                                                            icon="mdi-monitor-account"
                                                        >
                                                        </v-icon>
                                                        <p
                                                            class="font-weight-medium font-size-14px"
                                                        >
                                                            Workstation ID #{{item.wsq_id}}
                                                        </p> 
                                                    </div>
                                                </v-col>
                                                <v-col 
                                                    cols="6"
                                                >
                                                    <div class="font-italic d-flex flex-row-reverse">
                                                        {{ moment(item.ic_updatedAt).format('LLL') }}
                                                    </div> 
                                                </v-col>                                             
                                            </v-row>                                              
                                            <div
                                                class="mt-5 mb-4"
                                                v-html="item.ic_description"
                                            >
                                            </div>        
                                            <v-divider>                                                
                                            </v-divider>                                    
                                        </div>
                                    </div>
                                </v-expansion-panel-text>
                            </v-expansion-panel>
                        </v-expansion-panels>
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
                    @click="showComputerInternalCommentDialog = false"
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