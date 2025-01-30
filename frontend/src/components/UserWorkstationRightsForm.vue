<script setup>
    import { ref, watch } from 'vue';
    import Constants from "@/globals";
    import { useUtilStore } from '@/stores/util';
    import { storeToRefs } from 'pinia';

    //Local Constants

    //Variables
    const utilStore = useUtilStore();
    const props = defineProps(['isShowDialog', 'listEmployees', 'wsqId', 'listUserWorkstationRights', 'wsqUserId']);
    const emits = defineEmits(['clickCloseDialog', 'fetchLatestWorkstationRightsList']);

    //Model Values
    const listToBeAddedUsers = ref([]);
    const listUserWorkstationRights = ref([]);
    const isButtonLoading = ref(false);
    const isEmpty = ref(false);
    const isIncludedInTheList = ref(false);
    const isOwner = ref(false);
    const isShowDialog = ref(false);
    const user = ref(null);

    //Built-in Functions
    watch(() => props.isShowDialog, (newValue, oldValue) => {
        isShowDialog.value = newValue;
    });

    watch(() => props.listUserWorkstationRights, (newValue, oldValue) => {
        listUserWorkstationRights.value = newValue;
    });

    watch(() => isShowDialog.value, (newValue, oldValue) => {
        if(newValue == false){
            clear();
            emitCloseDialog();
        }
    });

    //User-defined Functions
    const emitFetchLatestUserWorkstationRightsList = () => {
        emits("fetchLatestWorkstationRightsList");
    }

    const emitCloseDialog = () => {
        emits("clickCloseDialog", isShowDialog.value);
    }

    const addUser = () => {
        if(isErrorInCheckBeforeAddingUser() === false){
            listToBeAddedUsers.value.push(user.value);
        }
    }

    const isErrorInCheckBeforeAddingUser = () => {
        clearToBeAddedErrorVariables();

        //Check if picked data is null
        if(user.value === null){
            isEmpty.value = true;
            return true;
        }

        //Check if user picked is the owner of the request or not
        if(user.value.id == props.wsqUserId){
            isOwner.value = true;
            return true;
        }

        //Check if user has already been added under the "To be added" list.
        isIncludedInTheList.value = listToBeAddedUsers.value.some(item => item.id == user.value.id);
        if(isIncludedInTheList.value){
            return true;
        }

        return false;
    }

    const removeUserFromToBeAddedList = (id) => {
        var index = listToBeAddedUsers.value.findIndex(item => item.id == id);
        listToBeAddedUsers.value.splice(index, 1);
    }

    const removeUserWorkstationRightsByWsqId = async(id) => {
        isButtonLoading.value = true;

        let result = await axios.delete(`/deleteUserWorkstationRightsById/${id}`);

        if(result.data.status == Constants.STATUS_CODE_SUCCESS){
            emitFetchLatestUserWorkstationRightsList();

            utilStore.setSnackBar({
                showModal: true,
                modalDescription: result.data.message
            });
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

    const saveUsers = async() => {
        if(listToBeAddedUsers.value.length == 0){
            return;
        }

        isButtonLoading.value = true;
        
        let _accessRights = {
            can_approve_request: true
        };

        var data = {
            wsq_id: props.wsqId,
            listOfEmployees: listToBeAddedUsers.value,
            accessRights: _accessRights
        };

        let result = await axios.post("/createMultipleUserWorkstationRights", data);

        if(result.data.status == Constants.STATUS_CODE_SUCCESS){
            clear();
            emitFetchLatestUserWorkstationRightsList();
            
            utilStore.setSnackBar({
                showModal: true,
                modalDescription: "Successfully added the users"
            });
        } else {
            utilStore.setSnackBar({
                showModal: true,
                modalDescription: result.data.message
            });
        }

        isButtonLoading.value = false;
    }

    const clearToBeAddedErrorVariables = () => {
        isIncludedInTheList.value = false;
        isEmpty.value = false;
        isOwner.value = false;
    }

    const clear = () => {
        clearToBeAddedErrorVariables();
        listToBeAddedUsers.value = [];
        user.value = null;
        isButtonLoading.value = false;
    }
</script>

<template>
    <v-dialog
        v-model="isShowDialog"
        width="75%"
        :persistent="isButtonLoading"
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
                    Manage User Rights
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
                                clearable
                                return-object
                                variant="underlined"
                                density="comfortable"
                                label="User"
                                item-title="name"
                                v-model="user"
                                :items="props.listEmployees"
                            >
                            </v-autocomplete>
                            <div class="d-flex flex-row-reverse">
                                <v-btn
                                    :loading="isButtonLoading"
                                    class="font-weight-bold bg-blue-lighten-1"
                                    variant="elevated"
                                    prepend-icon="mdi-plus"
                                    @click="addUser()"
                                >
                                    Add
                                </v-btn> 
                            </div>
                            <div
                                v-if="isIncludedInTheList"
                                class="font-size-12px ms-n2 mt-1 text-red"
                            >
                                The user cannot be added anymore either because it has been already added in the list
                            </div>
                            <div
                                v-if="isEmpty"
                                class="font-size-12px ms-n2 mt-1 text-red"
                            >
                                Please choose a user to add in the list
                            </div>
                            <div
                                v-if="isOwner"
                                class="font-size-12px ms-n2 mt-1 text-red"
                            >
                                You cannot choose the user who is the owner of the request
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
                                To be Added Users:
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
                                            width="80%"
                                        >
                                            Name
                                        </th>
                                        <th class="text-left text-black font-weight-bold">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <TransitionGroup 
                                        name="addedUsers"
                                    >
                                        <tr
                                            v-for="item in listToBeAddedUsers"
                                            class="font-size-14px"
                                            :key="item.id"
                                        >
                                            <td>{{ item.name }}</td>
                                            <td>
                                                <v-btn 
                                                    :loading="isButtonLoading"
                                                    class="font-weight-bold bg-red me-2"
                                                    density="comfortable"
                                                    prepend-icon="mdi-file-document-remove"
                                                    variant="elevated"
                                                    @click="removeUserFromToBeAddedList(item.id)"
                                                >
                                                Remove
                                                </v-btn>
                                            </td>
                                        </tr>
                                    </TransitionGroup>
                                </tbody>
                            </v-table>
                        </v-col>
                        <v-col
                            cols="12"
                        >
                            <v-spacer></v-spacer>
                            <div class="d-flex flex-row-reverse">
                                <v-btn
                                    :loading="isButtonLoading"
                                    class="font-weight-bold bg-blue-lighten-1"
                                    variant="elevated"
                                    prepend-icon="mdi-content-save-check"
                                    @click="saveUsers()"
                                >
                                    Save
                                </v-btn> 
                            </div>
                        </v-col>
                        <v-divider
                            class="mt-10"
                        >
                        </v-divider>
                        <v-col
                            cols="12"
                        >
                            <div
                                class="font-size-16px ms-n2 mt-2"
                            >
                                Remove Users with Access Rights:
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
                                            width="80%"
                                        >
                                            Name
                                        </th>
                                        <th class="text-left text-black font-weight-bold">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <TransitionGroup 
                                        name="existUsers"
                                    >
                                        <tr
                                            v-for="item in listUserWorkstationRights"
                                            class="font-size-14px"
                                            :key="item.wsqRights_id"
                                        >
                                            <td>{{ item.wsqRights_userName }}</td>
                                            <td>
                                                <v-btn 
                                                    :loading="isButtonLoading"
                                                    class="font-weight-bold bg-red me-2"
                                                    density="comfortable"
                                                    prepend-icon="mdi-file-document-remove"
                                                    variant="elevated"
                                                    @click="removeUserWorkstationRightsByWsqId(item.wsqRights_id)"
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
                    :loading="isButtonLoading"
                    class="font-weight-bold me-8"
                    color="grey-darken-4"
                    variant="outlined"
                    @click="isShowDialog = false"
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
    
    /* TRANSITION GROUP */
    .addedUsers-enter-from, .existUsers-enter-from {
        opacity: 0;
        transform: translateY(-10px);
    }

    .addedUsers-enter-active, .existUsers-enter-active {
        transition: all 0.5s ease;
    }

    .addedUsers-enter-to, .existUsers-enter-to {
        opacity: 1;
    }

    .addedUsers-leave-from, .existUsers-leave-from {
        opacity: 1;
    }

    .addedUsers-leave-active, .existUsers-leave-active {
        transition: all 0.5s ease;
        position: absolute;
    }

    .addedUsers-leave-to, .existUsers-leave-to {
        opacity: 0;
        transform: translateX(-50px);
    }

    .addedUsers-move, .existUsers-move {
        transition: all 0.5s ease;
    }
</style>