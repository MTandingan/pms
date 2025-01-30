<script setup>
    import { ref, reactive, watch } from 'vue';

    //Local Constants
    
    //Variables
    const props = defineProps(['labelTitle','itemId', 'brandList', 'status', 'brandId', 'remarks', 'isOthers', 'index', 'isUiLock']);
    const emits = defineEmits(['changeFormData', 'removeData', 'removeExistData']);

    //Model Values
    const formData = reactive({
        id: props.itemId,
        status: props.status !== null ? props.status.toString() : props.status,
        brand: props.brandId,
        remarks: props.remarks
    });

    //Built-in Functions
    watch(formData, (newValue, oldValue) => {
        emitUpdateFormData();
    });

    //User-defined Functions
    const emitUpdateFormData = () => {
        emits("changeFormData", formData);
    }

    const emitRemoveData = () => {
        emits("removeData", props.index);
    }

    const emitRemoveExistData = () => {
        emits("removeExistData", props.index);
    }
</script>

<template>
    <tr
        class="font-size-16px"
    >
        <td
            class="text-center"
            width="33%"
        >       
            <p
                class="font-size-20px font-weight-bold text-blue-darken-3"
            >
                {{ props.labelTitle }}
            </p>
        </td>
        <td
            width="33%"
        >
            <div
                class="d-flex flex-wrap justify-space-between mt-5"
            >
                <div>
                    <v-radio-group 
                        inline
                        label="Status:"
                        v-model="formData.status"
                        class="ms-n4"
                        :disabled="props.isUiLock"
                    >
                        <v-radio
                            name="rdb_inventoryStatus"
                            label="Ok"
                            color="blue-lighten-1"
                            value="1"
                            class="me-2"
                        ></v-radio>
                        <v-radio
                            name="rdb_inventoryStatus"
                            label="Defective"
                            color="indigo-blue"
                            value="2"
                            class="me-2"
                        ></v-radio>
                        <v-radio
                            name="rdb_inventoryStatus"
                            label="N/A"
                            color="indigo-blue"
                            value="3"
                            class="me-2"
                        ></v-radio>
                    </v-radio-group>
                </div>
                <div
                    v-if="props.isOthers" 
                    class="mt-3 ms-2"
                >
                    <v-btn
                        class="font-weight-bold"
                        variant="outlined"          
                        color="red"
                        prepend-icon="mdi-file-document-remove" 
                        @click="emitRemoveData"
                        :disabled="props.isUiLock"
                    >
                        Remove
                    </v-btn>
                </div>
                <div
                    v-else
                    class="mt-3 ms-2"
                >
                    <v-btn
                        class="font-weight-bold"
                        variant="outlined"          
                        color="red"
                        prepend-icon="mdi-file-document-remove" 
                        @click="emitRemoveExistData"
                        :disabled="props.isUiLock"
                    >
                        Remove
                    </v-btn>
                </div>
            </div>
            <div>
                <v-autocomplete
                    clearable
                    v-model="formData.brand"
                    variant="underlined"
                    density="comfortable"
                    label="Brand"
                    item-value="brand_id"
                    item-title="brand_name"
                    :items="props.brandList"
                    :disabled="props.isUiLock"
                >
                </v-autocomplete>
            </div>
        </td>
        <td
            width="33%"
        >
            <div>
                <v-textarea
                    counter
                    placeholder="Enter comments / remarks"
                    variant="outlined"
                    maxlength="150"
                    v-model.trim="formData.remarks"
                    :disabled="props.isUiLock"
                >
                </v-textarea>
            </div>
        </td>
    </tr>
</template>

<style scoped>
</style>