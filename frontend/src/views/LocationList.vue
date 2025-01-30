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
    const listOfLocation = ref([]);
    const listOfDepartment = ref([]);
    var fetchNextSet_pLocationName = '';
    var fetchNextSet_pLocationDescription = '';
    var fetchNextSet_pLocationDepartmentId = '';
    var fetchNextSet_pLocationIsActive = '';

    //Model Values
    const locationCreateForm = ref(null);
    const locationUpdateForm = ref(null);
    const currentItemToUpdate = ref(null);
    const currentItemToDelete = ref(null);
    const showCreateDialog = ref(false);
    const showUpdateDialog = ref(false);
    const showRemoveDialog = ref(false);
    const isButtonLoading = ref(false);
    const lastCurrentIndex = ref(0);
    const hasReachEnd = ref(false);
    const newLocationData = reactive({
                                        location_name: '',
                                        location_description: '',
                                        location_isActive: null,
                                        location_departmentId: null
                                    });
    const searchLocationData = reactive({
                                            location_name: '',
                                            location_description: '',
                                            location_isActive: null,
                                            location_departmentId: null
                                        });

    //Built-in Functions
    onMounted(async () => {
        await getListOfDepartments();
        await fetchDataFirst();    
        utilStore.setPageLoading({pIsPageLoading: false});  
    });

    watch(listOfLocation, (list_newValue, list_oldValue) => {
        resetScrollPosition();
    });

    //User-defined Functions
    const getListOfDepartments = async () => {
        var { data } = await axios.get(`/getAllDepartmentsTest`);
        // let { data } = await axios.get(`/get_departments`,{
        //     baseURL: 'http://172.16.1.39:3010/api',
        //     withCredentials: false
        // });
        
        listOfDepartment.value = data;
    }; 

    const fetchDataFirst = async(location_name = '', location_description = '', location_isActive = null, location_departmentId = null) => {
        lastCurrentIndex.value = 0;
        hasReachEnd.value = false;

        var data = {
            from: lastCurrentIndex.value,
            to: lastCurrentIndex.value + 12,
            location_name: (location_name === null) ? "" : location_name,
            location_description: (location_description === null) ? "" : location_description,
            location_isActive: (location_isActive === null) ? "" : location_isActive,
            location_departmentId: (location_departmentId === null) ? "" : location_departmentId
        };

        let result = await axios.get(`/getlistOfLocationWithRange`, { 
            params: data 
        });

        if(result.data.status == Constants.STATUS_CODE_SUCCESS){
            listOfLocation.value = result.data.data;
            lastCurrentIndex.value += 12;
        } else if(result.data.status == Constants.STATUS_CODE_INVALID_TOKEN){
            userStore.logout();
        }  else {
            logger.error("Error in Fetching First batch list of Location", logger.createErrorContext("fetch-first-location-list", result.data.message));
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
                location_name: fetchNextSet_pLocationName,
                location_description: fetchNextSet_pLocationDescription,
                location_isActive: fetchNextSet_pLocationIsActive,
                location_departmentId: fetchNextSet_pLocationDepartmentId
            };

            let result = await axios.get(`/getlistOfLocationWithRange`, {
                params: data
            });

            if(result.data.status == Constants.STATUS_CODE_SUCCESS){
                listOfLocation.value = [
                    ...listOfLocation.value,
                    ...result.data.data
                ];

                lastCurrentIndex.value += 5;

                if(!result.data.data.length){
                    hasReachEnd.value = true;
                }
            } else if(result.data.status == Constants.STATUS_CODE_INVALID_TOKEN){
                userStore.logout();
            } else {
                logger.error("Error in Fetching list of Location", logger.createErrorContext("fetch-location-list", result.data.message));
                utilStore.setSnackBar({
                    showModal: true,
                    modalDescription: result.data.message
                });
            }
        } 
    }

    const createLocation = async(e) => {
        
        const { valid } = await locationCreateForm.value.validate();

        if(valid){
            isButtonLoading.value = true;
            
            let data = {
                location_deptId: newLocationData.location_departmentId.id,
                location_name: newLocationData.location_name,
                location_description: newLocationData.location_description,
                location_isActive: true,
                location_deptName: newLocationData.location_departmentId.dept_name
            };

            let result = await axios.post("/createLocation", data);

            if(result.data.status == Constants.STATUS_CODE_SUCCESS){
                showCreateDialog.value = false;

                utilStore.setSnackBar({
                    showModal: true,
                    modalDescription: result.data.message
                });

                clear();
            } else {
                logger.error("Error in Creating of Location", logger.createErrorContext("create-location", result.data.message));
                utilStore.setSnackBar({
                    showModal: true,
                    modalDescription: result.data.message
                });
            }

            isButtonLoading.value = false;
        }
    }

    const updateLocation = async(e) => {
        const { valid } = await locationUpdateForm.value.validate();
        
        if(valid){
            isButtonLoading.value = true;

            let data = {
                location_id: currentItemToUpdate.value.location_id,
                location_name: currentItemToUpdate.value.location_name,
                location_description: currentItemToUpdate.value.location_description,
                location_isActive: currentItemToUpdate.value.location_isActive,
                location_deptId: currentItemToUpdate.value.location_deptId.id,
                location_deptName: currentItemToUpdate.value.location_deptId.dept_name
            };

            let result = await axios.put("/updateLocation", data);

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

    const deleteLocation = async(e) => {
        isButtonLoading.value = true;

        let result = await axios.delete(`/deleteLocation/${currentItemToDelete.value.location_id}`);

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

    const getLocationTextStatusByStatusCode = (status) => {
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

    const getTdStyleByLocationStatusCode = (status) => {
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
        let department = listOfDepartment.value.find(dept => dept.id === item.location_deptId);

        currentItemToUpdate.value = {
            location_id: item.location_id,
            location_name: item.location_name,
            location_description: item.location_description,
            location_isActive: item.location_isActive === Constants.ACTIVE_TRUE ? true : false,
            location_deptId: department,
            location_deptName: ""
        };

        showUpdateDialog.value = true;
    }

    const openDeleteDialogBox = (item) => {
        currentItemToDelete.value = {
            location_id: item.location_id,
            location_name: item.location_name
        };

        showRemoveDialog.value = true;
    }

    const search = async() => {
        fetchDataFirst(searchLocationData.location_name, searchLocationData.location_description, searchLocationData.location_isActive, searchLocationData.location_departmentId);

        fetchNextSet_pLocationName = searchLocationData.location_name;
        fetchNextSet_pLocationDescription = searchLocationData.location_description;
        fetchNextSet_pLocationIsActive = searchLocationData.location_isActive;
        fetchNextSet_pLocationDepartmentId = searchLocationData.location_departmentId;
    }

    const clear = async() => {
        fetchDataFirst();
        
        fetchNextSet_pLocationName = '';
        fetchNextSet_pLocationDescription = '';
        fetchNextSet_pLocationIsActive = null;
        fetchNextSet_pLocationDepartmentId = null;

        searchLocationData.location_name = '';
        searchLocationData.location_description = '';
        searchLocationData.location_isActive = null;
        searchLocationData.location_departmentId = null;
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
                    icon="mdi-office-building"
                >
                </v-icon>
                Location List
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
                        ref="locationCreateForm"
                        @submit.prevent
                    >
                        <v-card-title
                            class="font-weight-medium d-flex"
                            tag="div"
                        >
                            <div 
                                class="d-inline"
                            >
                                Add Location
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
                                            placeholder="Enter Location Name"
                                            density="comfortable"
                                            label="Location Name"
                                            maxlength="255"
                                            v-model.trim="newLocationData.location_name"
                                            :rules="standardRule"
                                        >
                                        </v-text-field>
                                        <v-text-field
                                            required
                                            clearable
                                            class="mt-2"
                                            variant="underlined"
                                            placeholder="Enter Location Description"
                                            density="comfortable"
                                            label="Location Description"
                                            maxlength="255"
                                            v-model.trim="newLocationData.location_description"
                                            :rules="standardRule"
                                        >
                                        </v-text-field>
                                        <v-autocomplete
                                            required
                                            clearable
                                            return-object
                                            variant="underlined"
                                            density="comfortable"
                                            label="Department"
                                            item-title="dept_name"
                                            item-value="id"
                                            :items="listOfDepartment"
                                            :rules="standardRule"
                                            v-model="newLocationData.location_departmentId"
                                        >
                                        </v-autocomplete>
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
                                @click="createLocation"
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
                            placeholder="Enter Location Name..."
                            density="comfortable"
                            label="Location Name"
                            maxlength="255"
                            v-model.trim="searchLocationData.location_name"
                        >
                        </v-text-field>
                        <v-autocomplete
                            clearable
                            variant="underlined"
                            density="comfortable"
                            label="Department"
                            item-title="dept_name"
                            item-value="id"
                            :items="listOfDepartment"
                            v-model="searchLocationData.location_departmentId"
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
                        <v-text-field
                            clearable
                            variant="underlined"
                            placeholder="Enter Location Description..."
                            density="comfortable"
                            label="Location Description"
                            maxlength="255"
                            v-model.trim="searchLocationData.location_description"
                        >
                        </v-text-field>
                        <v-autocomplete
                            clearable
                            variant="underlined"
                            density="comfortable"
                            label="Location Status"
                            item-title="name"
                            item-value="id"
                            :items="Constants.arrOfStatus"
                            v-model="searchLocationData.location_isActive"
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
                            Location Name
                        </th>
                        <th 
                            class="text-left text-black font-weight-bold"
                            width="20%"
                        >
                            Description
                        </th>
                        <th 
                            class="text-left text-black font-weight-bold"
                            width="20%"
                        >
                            Department Name
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
                        v-for="item in listOfLocation"
                        class="font-size-14px"
                        :key="item.location_id"
                    >
                        <td>{{ item.location_id }}</td>
                        <td>{{ item.location_name }}</td>
                        <td>{{ item.location_description }}</td>
                        <td>{{ item.location_deptName }}</td>
                        <td
                            :class="getTdStyleByLocationStatusCode(item.location_isActive)"
                        >
                            {{ getLocationTextStatusByStatusCode(item.location_isActive) }}</td>
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
                        v-if="listOfLocation.length" 
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
                ref="locationUpdateForm"
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
                        ID: {{ currentItemToUpdate.location_id }}
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
                                    placeholder="Enter Location Name"
                                    density="comfortable"
                                    label="Location Name"
                                    maxlength="255"
                                    v-model.trim="currentItemToUpdate.location_name"
                                    :rules="standardRule"
                                >
                                </v-text-field>
                                <v-text-field
                                    required
                                    clearable
                                    class="mt-2"
                                    variant="underlined"
                                    placeholder="Enter Location Description"
                                    density="comfortable"
                                    label="Location Description"
                                    maxlength="255"
                                    v-model.trim="currentItemToUpdate.location_description"
                                    :rules="standardRule"
                                >
                                </v-text-field>
                                <v-autocomplete
                                    required
                                    clearable
                                    return-object
                                    variant="underlined"
                                    density="comfortable"
                                    label="Department"
                                    item-title="dept_name"
                                    item-value="id"
                                    :items="listOfDepartment"
                                    :rules="standardRule"
                                    v-model="currentItemToUpdate.location_deptId"
                                >
                                </v-autocomplete>
                                <v-checkbox
                                    class="ms-n2 mt-2"
                                    label="Active"
                                    color="blue-lighten-1"
                                    density="compact"
                                    v-model="currentItemToUpdate.location_isActive"
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
                        @click="updateLocation()"
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
                                Are you sure you want to delete <span class="font-weight-bold">"{{ currentItemToDelete.location_name }}"</span> permanently? Once it's done it cannot be undone
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
                    @click="deleteLocation()"
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