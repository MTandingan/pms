<script setup>
    import { ref, reactive, watch, onMounted} from 'vue';
    import moment from 'moment/moment'
    import { useUserStore } from '@/stores/user';
    import { useUtilStore } from '@/stores/util';
    import Observer from '../components/Observer.vue';
    import Constants from '../globals';
    import axios from 'axios';
    import { useLogger } from '@/helpers/logger';

    //Local Constants
    const standardRule = [
                            v => !!v || 'Please enter the required item'
                        ];

    //Variables
    const userStore = useUserStore();
    const utilStore = useUtilStore();
    const logger = useLogger();
    const listOfBrand = ref([]);
    var fetchNextSet_pBrandName = '';
    var fetchNextSet_pBrandDescription = '';
    var fetchNextSet_pBrandIsActive = '';
    var fetchNextSet_pBrandSerial = '';

    //Model Values
    const brandCreateForm = ref(null);
    const brandUpdateForm = ref(null);
    const currentItemToUpdate = ref(null);
    const currentItemToDelete = ref(null);
    const showCreateDialog = ref(false);
    const showUpdateDialog = ref(false);
    const showRemoveDialog = ref(false);
    const isButtonLoading = ref(false);
    const lastCurrentIndex = ref(0);
    const hasReachEnd = ref(false);
    const newBrandData = reactive({
                                        brand_name: '',
                                        brand_description: '',
                                        brand_isActive: null,
                                        brand_serial: ''
                                    });
    const searchBrandData = reactive({
                                            brand_name: '',
                                            brand_description: '',
                                            brand_isActive: null,
                                            brand_serial: ''
                                        });

    //Built-in Functions
    onMounted(async () => {
        await fetchDataFirst();    
        utilStore.setPageLoading({pIsPageLoading: false});  
    });

    watch(listOfBrand, (list_newValue, list_oldValue) => {
        resetScrollPosition();
    });

    //User-defined Functions
    const fetchDataFirst = async(brand_name = '', brand_description = '', brand_isActive = null, brand_serial = '') => {
        lastCurrentIndex.value = 0;
        hasReachEnd.value = false;

        var data = {
            from: lastCurrentIndex.value,
            to: lastCurrentIndex.value + 12,
            brand_name: (brand_name === null) ? "" : brand_name,
            brand_description: (brand_description === null) ? "" : brand_description,
            brand_isActive: (brand_isActive === null) ? "" : brand_isActive,
            brand_serial: (brand_serial === null) ? "" : brand_serial
        };

        let result = await axios.get(`/getlistOfBrandWithRange`, {
            params: data
        });

        if(result.data.status == Constants.STATUS_CODE_SUCCESS){
            listOfBrand.value = result.data.data;
            lastCurrentIndex.value += 12;
        } else if(result.data.status == Constants.STATUS_CODE_INVALID_TOKEN){
            userStore.logout();
        } else {
            logger.error("Error in Fetching First batch list of Brand", logger.createErrorContext("fetch-first-brand-list", result.data.message));
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
                brand_name: fetchNextSet_pBrandName,
                brand_description: fetchNextSet_pBrandDescription,
                brand_isActive: fetchNextSet_pBrandIsActive,
                brand_serial: fetchNextSet_pBrandSerial
            };

            let result = await axios.get(`/getlistOfBrandWithRange`, {
                params: data
            });

            if(result.data.status == Constants.STATUS_CODE_SUCCESS){
                listOfBrand.value = [
                    ...listOfBrand.value,
                    ...result.data.data
                ];

                lastCurrentIndex.value += 5;

                if(!result.data.data.length){
                    hasReachEnd.value = true;
                }
            } else if(result.data.status == Constants.STATUS_CODE_INVALID_TOKEN){
                userStore.logout();
            } else {
                logger.error("Error in Fetching Brands", logger.createErrorContext("fetch-brand-list", result.data.message));
                utilStore.setSnackBar({
                    showModal: true,
                    modalDescription: result.data.message
                });
            }
        } 
    }

    const createBrand = async(e) => {
        
        const { valid } = await brandCreateForm.value.validate();

        if(valid){
            isButtonLoading.value = true;
            
            let data = {
                brand_name: newBrandData.brand_name,
                brand_description: newBrandData.brand_description,
                brand_serial: newBrandData.brand_serial,
                brand_isActive: true
            };

            let result = await axios.post("/createBrand", data);

            if(result.data.status == Constants.STATUS_CODE_SUCCESS){
                showCreateDialog.value = false;

                utilStore.setSnackBar({
                    showModal: true,
                    modalDescription: result.data.message
                });

                clear();
            } else {
                logger.error("Error in Creating New Brand", logger.createErrorContext("create-brand", result.data.message));
                utilStore.setSnackBar({
                    showModal: true,
                    modalDescription: result.data.message
                });
            }

            isButtonLoading.value = false;
        }
    }

    const updateBrand = async(e) => {

        const { valid } = await brandUpdateForm.value.validate();
        
        if(valid){
            isButtonLoading.value = true;

            let data = {
                brand_id: currentItemToUpdate.value.brand_id,
                brand_name: currentItemToUpdate.value.brand_name,
                brand_description: currentItemToUpdate.value.brand_description,
                brand_isActive: currentItemToUpdate.value.brand_isActive,
                brand_serial: currentItemToUpdate.value.brand_serial
            };

            let result = await axios.put("/updateBrand", data);

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

    const deleteBrand = async(e) => {
        isButtonLoading.value = true;

        let result = await axios.delete(`/deleteBrand/${currentItemToDelete.value.brand_id}`);

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

    const getBrandTextStatusByStatusCode = (status) => {
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

    const getTdStyleByBrandStatusCode = (status) => {
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
            brand_id: item.brand_id,
            brand_name: item.brand_name,
            brand_description: item.brand_description,
            brand_isActive: item.brand_isActive === Constants.ACTIVE_TRUE ? true : false,
            brand_serial: item.brand_serial
        };

        showUpdateDialog.value = true;
    }

    const openDeleteDialogBox = (item) => {
        currentItemToDelete.value = {
            brand_id: item.brand_id,
            brand_name: item.brand_name
        };

        showRemoveDialog.value = true;
    }

    const search = async() => {
        fetchDataFirst(searchBrandData.brand_name, searchBrandData.brand_description, searchBrandData.brand_isActive, searchBrandData.brand_serial);

        fetchNextSet_pBrandName = searchBrandData.brand_name;
        fetchNextSet_pBrandDescription = searchBrandData.brand_description;
        fetchNextSet_pBrandIsActive = searchBrandData.brand_isActive;
        fetchNextSet_pBrandSerial = searchBrandData.brand_serial;
    }

    const clear = async() => {
        fetchDataFirst();
        
        fetchNextSet_pBrandName = '';
        fetchNextSet_pBrandDescription = '';
        fetchNextSet_pBrandIsActive = null;
        fetchNextSet_pBrandSerial = '';

        searchBrandData.brand_name = '';
        searchBrandData.brand_description = '';
        searchBrandData.brand_isActive = null;
        searchBrandData.brand_serial = '';
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
                Brand List
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
                        ref="brandCreateForm"
                        @submit.prevent
                    >
                        <v-card-title
                            class="font-weight-medium d-flex"
                            tag="div"
                        >
                            <div 
                                class="d-inline"
                            >
                                Add Brand
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
                                            placeholder="Enter Brand Name"
                                            density="comfortable"
                                            label="Brand Name"
                                            maxlength="255"
                                            v-model.trim="newBrandData.brand_name"
                                            :rules="standardRule"
                                        >
                                        </v-text-field>
                                        <v-text-field
                                            required
                                            clearable
                                            class="mt-2"
                                            variant="underlined"
                                            placeholder="Enter Brand Description"
                                            density="comfortable"
                                            label="Brand Description"
                                            maxlength="255"
                                            v-model.trim="newBrandData.brand_description"
                                            :rules="standardRule"
                                        >
                                        </v-text-field>
                                        <v-text-field
                                            required
                                            clearable
                                            class="mt-2"
                                            variant="underlined"
                                            placeholder="Enter Brand Serial"
                                            density="comfortable"
                                            label="Brand Serial"
                                            maxlength="255"
                                            v-model.trim="newBrandData.brand_serial"
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
                                @click="createBrand"
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
                            placeholder="Enter Brand Name..."
                            density="comfortable"
                            label="Brand Name"
                            maxlength="255"
                            v-model.trim="searchBrandData.brand_name"
                        >
                        </v-text-field>
                        <v-text-field
                            clearable
                            variant="underlined"
                            placeholder="Enter Brand Serial..."
                            density="comfortable"
                            label="Brand Serial"
                            maxlength="255"
                            v-model.trim="searchBrandData.brand_serial"
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
                            placeholder="Enter Brand Description..."
                            density="comfortable"
                            label="Brand Description"
                            maxlength="255"
                            v-model.trim="searchBrandData.brand_description"
                        >
                        </v-text-field>
                        <v-autocomplete
                            clearable
                            variant="underlined"
                            density="comfortable"
                            label="Brand Status"
                            item-title="name"
                            item-value="id"
                            :items="Constants.arrOfStatus"
                            v-model="searchBrandData.brand_isActive"
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
                            Brand Name
                        </th>
                        <th 
                            class="text-left text-black font-weight-bold"
                            width="25%"
                        >
                            Description
                        </th>
                        <th 
                            class="text-left text-black font-weight-bold"
                            width="15%"
                        >
                            Serial
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
                        v-for="item in listOfBrand"
                        class="font-size-14px"
                        :key="item.brand_id"
                    >
                        <td>{{ item.brand_id }}</td>
                        <td>{{ item.brand_name }}</td>
                        <td>{{ item.brand_description }}</td>
                        <td>{{ item.brand_serial }}</td>
                        <td
                            :class="getTdStyleByBrandStatusCode(item.brand_isActive)"
                        >
                            {{ getBrandTextStatusByStatusCode(item.brand_isActive) }}</td>
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
                        v-if="listOfBrand.length" 
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
                ref="brandUpdateForm"
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
                        ID: {{ currentItemToUpdate.brand_id }}
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
                                    placeholder="Enter Brand Name"
                                    density="comfortable"
                                    label="Brand Name"
                                    maxlength="255"
                                    v-model.trim="currentItemToUpdate.brand_name"
                                    :rules="standardRule"
                                >
                                </v-text-field>
                                <v-text-field
                                    required
                                    clearable
                                    class="mt-2"
                                    variant="underlined"
                                    placeholder="Enter Brand Description"
                                    density="comfortable"
                                    label="Brand Description"
                                    maxlength="255"
                                    v-model.trim="currentItemToUpdate.brand_description"
                                    :rules="standardRule"
                                >
                                </v-text-field>
                                <v-text-field
                                    required
                                    clearable
                                    class="mt-2"
                                    variant="underlined"
                                    placeholder="Enter Brand Serial"
                                    density="comfortable"
                                    label="Brand Serial"
                                    maxlength="255"
                                    v-model.trim="currentItemToUpdate.brand_serial"
                                    :rules="standardRule"
                                >
                                </v-text-field>
                                <v-checkbox
                                    class="ms-n2 mt-2"
                                    label="Active"
                                    color="blue-lighten-1"
                                    density="compact"
                                    v-model="currentItemToUpdate.brand_isActive"
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
                        @click="updateBrand()"
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
                                Are you sure you want to delete <span class="font-weight-bold">"{{ currentItemToDelete.brand_name }}"</span> permanently? Once it's done it cannot be undone
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
                    @click="deleteBrand()"
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