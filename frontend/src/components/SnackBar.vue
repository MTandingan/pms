<script setup>
    import { useUtilStore } from '@/stores/util';
    import { storeToRefs } from 'pinia';
    //Local Constants

    //Variables
    const utilStore = useUtilStore();
    const { snackBar } = storeToRefs(utilStore);

    //Model Values

    //Built-in Functions
    
    //User-defined Functions
</script>

<template>
    <v-snackbar
            color="blue-darken-3"
            elevation="24"
            v-model="snackBar.showModal"
        >
            {{ snackBar.modalDescription }}
    </v-snackbar>
</template>

<style scoped>
</style>