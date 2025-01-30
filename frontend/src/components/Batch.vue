<script setup>
    import { ref, watch } from 'vue';

    //Local Constants
    
    //Variables
    const props = defineProps(['batchDescription','listLocation','batchNum', 'listAllBatchDepartments']);
    const emits = defineEmits(['clickAddBatchDepts'])

    //Model Values
    const location_id = ref(null);
    const isIncludedInTheList = ref(false);
    const isEmpty = ref(false);
    const listToBeAddedLocations = ref([]);
    const listLocation = ref([]);
    const showAddLocationDialog = ref(false);
   
    //Built-in Functions
    watch(() => showAddLocationDialog.value, (newValue, oldValue) => {
        if(newValue == false){
            clear();
        }
    })

    //User-defined Functions
    const addLocationToBeAdded = () => {
        if(isErrorInCheckBeforeAddingDepts() === false){
            var location = props.listLocation.find(item => item.location_id == location_id.value);

            if(location == undefined){
                isEmpty.value = true;
                return;
            }

            location.batch = props.batchNum;
            listToBeAddedLocations.value.push(location);
        }
    }

    const isErrorInCheckBeforeAddingDepts = () => {
        //Check if picked data is null
        if(location_id.value === null){
            isEmpty.value = true;
            return true;
        } else {
            isIncludedInTheList.value = false;
            isEmpty.value = false;
        }

        //Check if location_id has already been added under the "To be added" list.
        isIncludedInTheList.value = listToBeAddedLocations.value.some(item => item.location_id == location_id.value);
        if(isIncludedInTheList.value){
            return true;
        }

        //Check if location has already been added in the current and other batches department list.
        isIncludedInTheList.value = props.listAllBatchDepartments.some(item => item.location_id == location_id.value);
        if(isIncludedInTheList.value){
            return true;
        }

        return false;
    }

    const isErrorInCheckBeforeAddingInBatch = () => {
        for (const key in listToBeAddedLocations.value) {
            let isIncludedInAllTheList = props.listAllBatchDepartments.some(item => item.location_id == listToBeAddedLocations.value[key].location_id);

            if(isIncludedInAllTheList){
                isIncludedInTheList.value = true;

                return true;
            }
        }

        return false;
    }

    const clear = () => {
        listToBeAddedLocations.value = [];
        location_id.value = null;
        isIncludedInTheList.value = false;
        isEmpty.value = false;
    }

    const changeAddLocationDialogStatus = (status) => {
        showAddLocationDialog.value = status;
    }

    const removeLocation = (id) => {
        var index = listToBeAddedLocations.value.findIndex(item => item.location_id == id);
        listToBeAddedLocations.value.splice(index, 1);
    }

    const removeAddedLocation = (id) => {
        var index = listLocation.value.findIndex(item => item.location_id == id);
        listLocation.value.splice(index, 1); 

        emits("clickAddBatchDepts", listLocation.value, props.batchNum);
    }

    const emitAddLocationOfBatch = () => {
        if(isErrorInCheckBeforeAddingInBatch() == false){
                listLocation.value = [
                ...listToBeAddedLocations.value,
                ...listLocation.value
            ];

            emits("clickAddBatchDepts", listLocation.value, props.batchNum);

            clear();
            changeAddLocationDialogStatus(false);
        } else {
            isIncludedInTheList.value = true;
        }
    }
</script>

<template>
    <div
        class="d-flex flex-row"
    >
        <p 
            class="font-size-20px font-weight-medium me-auto"
        >
            {{ props.batchDescription }}
        </p>
        <v-btn 
            class="font-weight-bold bg-blue-lighten-1 ma-1 ms-5"
            prepend-icon="mdi-plus"
            variant="elevated"
            @click="changeAddLocationDialogStatus(true)"
        >
            Add Locations
        </v-btn>
    </div>
    <v-table
        class="table-striped"
        fixed-header
        height="300px"
        density="comfortable"
    >
        <thead
            class="font-size-14px"
        >
            <tr>
                <th 
                    class="text-left text-black font-weight-bold" 
                    width="20%"
                >
                    Location Id
                </th>
                <th 
                    class="text-left text-black font-weight-bold"
                    width="70%"
                >
                    Location Name
                </th>
                <th class="text-left text-black font-weight-bold">
                    Actions
                </th>
            </tr>
        </thead>
        <tbody>
            <tr
                v-for="item in listLocation"
                class="font-size-14px"
                :key="item.location_id"
            >
                <td>{{ item.location_id }}</td>
                <td>{{ item.location_name }}</td>
                <td>
                    <v-btn 
                        class="font-weight-bold bg-red"
                        density="comfortable"
                        variant="elevated"
                        @click="removeAddedLocation(item.location_id)"
                    >
                        Remove
                    </v-btn>
                </td>
            </tr>
        </tbody>
    </v-table>

    <v-dialog
        v-model="showAddLocationDialog"
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
                                <v-autocomplete
                                    v-model="location_id"
                                    clearable
                                    variant="underlined"
                                    density="comfortable"
                                    label="Location"
                                    item-title="location_name"
                                    item-value="location_id"
                                    :items="props.listLocation"
                                >
                                </v-autocomplete>
                                <div class="d-flex flex-row-reverse">
                                    <v-btn
                                        class="font-weight-bold bg-blue-lighten-1"
                                        variant="elevated"
                                        prepend-icon="mdi-plus"
                                        @click="addLocationToBeAdded()"
                                    >
                                        Add
                                    </v-btn> 
                                </div>
                                <div
                                    v-if="isIncludedInTheList"
                                    class="font-size-12px ms-n2 mt-1 text-red"
                                >
                                    The location cannot be added anymore either because it has been already added in the list or in other batch list.
                                </div>
                                <div
                                    v-if="isEmpty"
                                    class="font-size-12px ms-n2 mt-1 text-red"
                                >
                                    Please choose a location to add in the list
                                </div>
                            </v-col>
                            <v-divider
                                class="mt-4"
                            >
                            </v-divider>
                            <v-col
                                cols="12"
                            >
                                <div
                                    class="font-size-16px ms-n2 mt-2"
                                >
                                    Locations to Add:
                                </div>
                            </v-col>
                            <v-col
                                cols="12"
                                class="search-container"
                            >
                                <v-table
                                    class="table-striped"
                                    fixed-header
                                    height="250px"
                                    density="comfortable"
                                >
                                    <thead
                                        class="font-size-14px"
                                    >
                                        <tr>
                                            <th 
                                                class="text-left text-black font-weight-bold" 
                                                width="20%"
                                            >
                                                Location Id
                                            </th>
                                            <th 
                                                class="text-left text-black font-weight-bold"
                                                width="80%"
                                            >
                                                Location Name
                                            </th>
                                            <th class="text-left text-black font-weight-bold">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <TransitionGroup 
                                            name="locations"
                                        >
                                            <tr
                                                v-for="item in listToBeAddedLocations"
                                                class="font-size-14px"
                                                :key="item.location_id"
                                            >
                                                <td>{{ item.location_id }}</td>
                                                <td>{{ item.location_name }}</td>
                                                <td>
                                                    <v-btn 
                                                        class="font-weight-bold bg-red me-2"
                                                        density="comfortable"
                                                        prepend-icon="mdi-file-document-remove"
                                                        variant="elevated"
                                                        @click="removeLocation(item.location_id)"
                                                    >
                                                    Remove
                                                    </v-btn>
                                                </td>
                                            </tr>
                                        </TransitionGroup>
                                    </tbody>
                                </v-table>
                            </v-col>
                            <v-divider
                                class="mt-10"
                            >
                            </v-divider>
                        </v-row>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        class="font-weight-bold me-2"
                        color="grey-darken-4"
                        variant="outlined"
                        @click="changeAddLocationDialogStatus(false)"
                    >
                        Close
                    </v-btn>
                    <v-btn
                        class="font-weight-bold bg-blue-lighten-1 me-5"
                        variant="elevated"
                        @click="emitAddLocationOfBatch"
                    >
                        Add Locations
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

    /* TRANSITION GROUP */
    .locations-enter-from {
        opacity: 0;
        transform: translateY(-10px);
    }

    .locations-enter-active {
        transition: all 0.5s ease;
    }

    .locations-enter-to {
        opacity: 1;
    }

    .locations-leave-from {
        opacity: 1;
    }

    .locations-leave-active {
        transition: all 0.5s ease;
        position: absolute;
    }

    .locations-leave-to {
        opacity: 0;
        transform: translateX(-50px);
    }

    .locations-move {
        transition: all 0.5s ease;
    }
</style>