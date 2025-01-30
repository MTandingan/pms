<script setup>
    import { ref } from 'vue';
    import { useUtilStore } from '@/stores/util';
    import { storeToRefs } from 'pinia';
    import AppSidebar from './AppSidebar.vue';
    import AppBar from './AppBar.vue';
    import AppFooter from './AppFooter.vue';
    import Notificationbar from './Notificationbar.vue';
    import Loader from '@/components/Loader.vue';

    //Local Constants

    //Variables
    const utilStore = useUtilStore();
   
    //Model Values
    const drawer = ref(false);
    const notifDrawer = ref(false);
    const { isPageLoading } = storeToRefs(utilStore);
    
    //Built-in Functions

    //User-defined Functions
    const OnClickAppBar = (p_drawer) => {
        drawer.value = p_drawer;
        
        if(p_drawer == true) {
            notifDrawer.value = false;
        }
    }

    const OnClickNotificationBar = (p_notifDrawer) => {
        notifDrawer.value = p_notifDrawer;

        if(p_notifDrawer == true) {
            drawer.value = false;
        }
    }
</script>

<template>
        <v-layout>
            <v-responsive>

                <!-- App Side Bar (Mobile) -->
                <AppBar 
                    :drawer="drawer"
                    :notifDrawer="notifDrawer"
                    @clickAppBar="OnClickAppBar"
                    @clickNotificationBar="OnClickNotificationBar"
                />

                <!-- Side Bar / Navigation Bar -->
                <AppSidebar 
                    :drawer="drawer"
                    @clickAppBar="OnClickAppBar"
                />

                <!-- Side Bar / Navigation Bar -->
                <Notificationbar 
                    :notifDrawer="notifDrawer"
                    @clickNotificationBar="OnClickNotificationBar"
                />

                <!-- Main Content -->
                <v-main 
                    style="background-color: rgba(0,0,0,.03); min-height: 100vh;"
                >
                    <v-container 
                        fluid
                        class="ma-2"
                    >
                        <Loader 
                            v-if="isPageLoading"
                        />
                        <v-card 
                            class="pa-5"
                            elevation="5"    
                        >
                            <slot>
                            </slot>
                        </v-card>
                    </v-container>
                </v-main>

                <!-- App Footer -->
                <AppFooter 
                    absolute
                />

            </v-responsive>
        </v-layout>
</template>

