<script setup>
    import { useUtilStore } from '@/stores/util';
    import { storeToRefs } from 'pinia';
    //Local Constants

    //Variables
    const utilStore = useUtilStore();
    const { photoDialog } = storeToRefs(utilStore);

    //Model Values

    //Built-in Functions
    
    //User-defined Functions
</script>

<template>
    <v-dialog
        v-model="photoDialog.showDialog"
        scrollable
    >
        <v-card>
            <v-img :src="`${photoDialog.modalSrc}`" />
        </v-card>
    </v-dialog>
</template>

<style scoped>
</style>