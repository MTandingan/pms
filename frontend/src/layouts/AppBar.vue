<script setup>
    //Local Constants

    //Variables
    const props = defineProps(["drawer","notifDrawer"]);
    const emits = defineEmits(["clickAppBar","clickNotificationBar"]);

    //Model Values
    
    //Built-in Functions

    //User-defined Functions
    const emitClickAppBar = () => {
        emits("clickAppBar", !props.drawer);
    }

    const emitClickNotificationBar = () => {
        emits("clickNotificationBar", !props.notifDrawer);
    }
</script>

<template>
    <v-app-bar color="blue-lighten-1" density="compact"
    >
        <v-app-bar-nav-icon  variant="text" @click.stop="emitClickAppBar"></v-app-bar-nav-icon>
        <v-spacer></v-spacer>
        <v-btn variant="text" icon="mdi-bell" @click="emitClickNotificationBar"></v-btn>
    </v-app-bar>
</template>