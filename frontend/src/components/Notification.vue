<script setup>
    import moment from 'moment/moment'

    //Variables

    //Local Constants

    //Model Values
    
    //Built-in Functions
    const props = defineProps(["notif_data"]);
</script>

<template>
    <v-sheet
        style="background-color: rgba(0,0,0,.03); margin: 11px; padding: 10px;"
        class="font-size-14px"
        border="2"
    >
        <div class="font-weight-medium">{{ props.notif_data.notif_message }}</div>
        <div class="mt-3"></div>
        <div class="font-size-12px text-grey-darken-1">{{ moment(props.notif_data.notif_createdAt).format('LLL') }}</div>
    </v-sheet>
</template>

<style scoped>
</style>