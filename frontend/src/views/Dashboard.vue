<script setup>
    import { ref, reactive, watch, onMounted } from 'vue';
    import { useRouter } from 'vue-router';
    import moment from 'moment/moment'
    import { useUserStore } from '@/stores/user';
    import { useUtilStore } from '@/stores/util';
    import { storeToRefs } from 'pinia';
    import Constants from "@/globals";
    import * as Util from '../helpers/helper';
    import { decryptData } from '../helpers/encryptUtil'
    import axios from 'axios';
   

    //Variables
    const router = useRouter();
    const userStore = useUserStore();
    const utilStore = useUtilStore();
    const { user } = storeToRefs(userStore);

    //Local Constants
    
    //Model Values
    const listDepartments = ref(null);
    const displayMonth = ref("");
    const displayYear = ref("");
    const month = ref("");
    const year = ref("");
    const errorMonthValidationParams = reactive({
        isError: false,
        errorMessage: ""
    });
    const errorYearValidationParams = reactive({
        isError: false,
        errorMessage: ""
    });

    //Built-in Functions
    onMounted(async () => {
        if(decryptData(user.value, Constants.USER_SECRET_KEY) !== null){
            year.value = moment().year();
            month.value = moment().month() + 1;

            await getListOfQuarterlyByYearAndMonth();
        } else {
            await userStore.logout();
        }

        utilStore.setPageLoading({pIsPageLoading: false});
    });

    //User-defined Functions
    const getListOfQuarterlyByYearAndMonth = async () => {
        var hasError = checkError();

        if(!hasError){
            let data = {
                sched_year: year.value,
                quarter_monthlyQuarter: month.value
            };

            const params = new URLSearchParams(data);

            let result = await axios.get(`/getListOfQuarterlyByYearAndMonth?${params}`);

            listDepartments.value = result.data.data;

            updateMonthlyTitleDisplay();
        }
    }; 

    const checkError = () => {
        var hasError = false;

        //Check year is empty
        if(year.value == null){
            errorYearValidationParams.isError = true;
            errorYearValidationParams.errorMessage = "Year must not be empty"
            hasError = true;
        } else {
            errorYearValidationParams.isError = false;
            errorYearValidationParams.errorMessage = ""
        }

        //Check month is empty
        if(month.value == null){
            errorMonthValidationParams.isError = true;
            errorMonthValidationParams.errorMessage = "Month must not be empty"
            hasError = true;
        } else {
            errorMonthValidationParams.isError = false;
            errorMonthValidationParams.errorMessage = ""
        }

        return hasError;
    }

    const updateMonthlyTitleDisplay = () => {
        displayYear.value = year.value;
        displayMonth.value = Util.getFullMonthNameByMonthPosition(month.value);
    }

    const goToPmsSummary = (pdept_id) => {
        router.push(`/PmsSummary/${pdept_id}`);
    }

</script>

<template>
    <v-row>
        <v-col
            cols="6"
            md="6"
            sm="12"
        >
            <div class="font-size-32px font-weight-500 mb-3">
                <v-icon
                    class="me-1"
                    size="x-small"
                    icon="mdi-calendar-month"
                >
                </v-icon>
                <span>{{ displayMonth }}</span> <span>{{ displayYear }}</span>
            </div>
        </v-col>
        <v-col
            cols="6"
            md="6"
            sm="12"
        >
            <div class="d-flex">
                <v-autocomplete
                    v-model.trim="year"
                    clearable
                    class="ma-1 ms-5"
                    variant="underlined"
                    density="comfortable"
                    label="Year"
                    item-title="name"
                    item-value="id"
                    :items="Util.generateYearDropDown()"
                    :error="errorYearValidationParams.isError"
                    :error-messages="errorYearValidationParams.errorMessage"
                >
                </v-autocomplete>
                <v-autocomplete
                    v-model.trim="month"
                    clearable
                    class="ma-1 ms-5"
                    variant="underlined"
                    density="comfortable"
                    label="Month"
                    item-title="name"
                    item-value="id"
                    :items="Constants.arrOfMonths"
                    :error="errorMonthValidationParams.isError"
                    :error-messages="errorMonthValidationParams.errorMessage"
                >
                </v-autocomplete>
                <v-btn 
                    class="font-weight-bold bg-blue-lighten-1 ma-1 ms-5"
                    prepend-icon="mdi-database-search-outline"
                    variant="elevated"
                    @click="getListOfQuarterlyByYearAndMonth"
                >
                    Search
                </v-btn>
            </div>
        </v-col>
        <v-col
            cols="12"
        >
            <v-divider></v-divider>
            <v-table
                class="table-striped"
                fixed-header
                height="500px"
                density="comfortable"
            >
                <thead
                    class="font-size-14px"
                >
                    <tr>
                        <th 
                            class="text-left text-black font-weight-bold"
                            width="30%"
                        >
                            Location
                        </th>
                        <th 
                            class="text-left text-black font-weight-bold"
                            width="10%"
                        >
                            Planned
                        </th>
                        <th 
                            class="text-left text-black font-weight-bold"
                            width="10%"
                        >
                            Actual
                        </th>
                        <th 
                            class="text-left text-black font-weight-bold"
                            width="10%"
                        >
                            Deferred
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="item in listDepartments"
                        class="font-size-14px"
                        :key="item.quarter_id"
                    >
                        <td>
                            <v-btn
                                class="btn-dept-link"
                                variant="plain"
                                @click="goToPmsSummary(item.quarter_id)"
                            >
                                {{ item.location_name }}
                            </v-btn>
                        </td>
                        <td
                            class="font-size-20px text-blue-darken-3 font-weight-bold"
                        >
                            {{ item.quarter_numPlanned }}
                        </td>
                        <td
                            class="font-size-20px text-blue-darken-3 font-weight-bold"
                        >
                            {{ item.quarter_numActual }}
                        </td>
                        <td
                            class="font-size-20px text-red font-weight-bold"
                        >
                            {{ item.quarter_numDeferred }}
                        </td>
                    </tr>
                </tbody>
            </v-table>
        </v-col>
    </v-row>
</template>

<style scoped>
    .search-container {
        border: solid 2px rgb(236, 232, 232);
        border-radius: 5px;
    }

    .btn-dept-link {
        text-decoration: underline;
        color: blue;
    }
</style>