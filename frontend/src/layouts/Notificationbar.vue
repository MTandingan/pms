<script setup>
    import { ref, watch, onMounted } from 'vue';
    // import Notification from '../components/Notification.vue';
    // import { useUserStore } from '@/stores/user';
    import { storeToRefs } from 'pinia';

    //Variables
    // const userStore = useUserStore();
    // const { listOfNotifications } = storeToRefs(userStore);
    const props = defineProps(["notifDrawer"]);
    const emits = defineEmits(["clickNotificationBar"]);

    //Local Constants

    //Model Values
    const notifDrawer = ref(false);

    //Built-in Functions
    // onMounted(async () => {
    //     document.addEventListener('click', handleClickOutside);
    //     await userStore.getListOfNotificationsByUser();
    // })

    watch(() => props.notifDrawer, (props_notifDrawer_newValue, props_notifDrawer_oldValue) => {
        notifDrawer.value = props_notifDrawer_newValue;
        emitClickOutsideSidebar(notifDrawer.value);

    })

    //User-defined Functions
    const handleClickOutside = (event) => {        
        if (event.target.matches('.v-navigation-drawer__scrim')) {
            emitClickOutsideSidebar(false);
        }
    }

    const emitClickOutsideSidebar = (value) => {
        emits("clickNotificationBar", value);
    }
</script>

<template>
    <v-navigation-drawer
        v-model="notifDrawer"
        class="bg-red-lighten-5"
        location="right"
        width="325"
        temporary
    >
        <!-- <Notification
            v-if="listOfNotifications.length !== 0" 
            v-for="item in listOfNotifications"
            :key="item.notif_id"
            :notif_data="item"
        /> -->
        <!-- <v-sheet
            v-else
            style="background-color: rgba(0,0,0,.03); margin: 11px; padding: 10px;"
            border="2"
        >
            <div class="d-flex flex-row text-grey-lighten-1">
                <div class="me-2 font-size-14px"><v-icon icon="mdi-bell-off"></v-icon></div>
                <div class="font-size-16px">No Notifications Yet</div>
                <div class="mt-3"></div>
            </div>
           
        </v-sheet> -->
        <v-sheet
            style="background-color: rgba(0,0,0,.03); margin: 11px; padding: 10px;"
            border="2"
        >
            <div class="d-flex flex-row text-grey-lighten-1">
                <div class="me-2 font-size-14px"><v-icon icon="mdi-bell-off"></v-icon></div>
                <div class="font-size-16px">No Notifications Yet</div>
                <div class="mt-3"></div>
            </div>
           
        </v-sheet>
    </v-navigation-drawer>
</template>

<style scoped>
</style>