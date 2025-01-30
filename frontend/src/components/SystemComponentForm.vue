<script setup>
    import { ref, watch } from 'vue';

    //Local Constants

    //Variables
    const props = defineProps(['listSystemComponents','type']);
    const emits = defineEmits(['updateListData']);

    //Model Values
    const listForm = ref([]);

    //Built-in Functions
    watch(listForm, (newValue, oldValue) => {
        emitUpdateListData();
    });

    //User-defined Functions
    const emitUpdateListData = () => {
        let params = {
            listForm: listForm.value,
            type: props.type
        };

        emits("updateListData", params);
    }
</script>

<template>
    <v-container>
        <v-row>
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
                                width="70%"
                            >
                                Title
                            </th>
                            <th 
                                class="text-center text-black font-weight-bold"
                            >
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="item in props.listSystemComponents"
                            class="font-size-14px"
                            :key="item.id"
                        >
                            <td>{{ item.name }}</td>
                            <td class="">
                                <v-checkbox
                                    v-model="listForm"
                                    class="ms-n2 mt-2 d-flex justify-center"
                                    color="blue-lighten-1"
                                    density="compact"
                                    :value="item.id"
                                ></v-checkbox>
                            </td>
                        </tr>
                    </tbody>
                </v-table>
            </v-col>
            <v-divider
                class="mt-10"
            >
            </v-divider>
        </v-row>
    </v-container>
</template>

<style scoped>
    .search-container {
        border: solid 2px rgb(236, 232, 232);
        border-radius: 5px;
    }
</style>