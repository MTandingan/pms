<script setup>
    import { useUtilStore } from '@/stores/util';
    import { storeToRefs } from 'pinia';
    //Local Constants

    //Variables
    const utilStore = useUtilStore();
    const { customDialog } = storeToRefs(utilStore);

    //Model Values

    //Built-in Functions
    
    //User-defined Functions
    const closeDialog = () => {
        customDialog.value.showDialog = false;
    }
</script>

<template>
    <v-dialog
        v-model="customDialog.showDialog"
        width="50%"
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
                    {{ customDialog.modalTitle }}
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
                                {{ customDialog.modalDescription }}
                            </div>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    class="font-weight-bold me-2 btn-close"
                    color="grey-darken-4"
                    variant="outlined"
                    @click="closeDialog"
                >
                    Close
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<style scoped>
</style>