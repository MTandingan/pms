<script setup>
    import { ref, watch, onMounted } from 'vue';
    import { useRouter } from 'vue-router';
    import { useUserStore } from '@/stores/user';
    import { storeToRefs } from 'pinia';
    import Constants from "@/globals";
    import { decryptData } from '../helpers/encryptUtil'

    //Local Constants

    //Variables
    const router = useRouter();
    const props = defineProps(["drawer"]);
    const emits = defineEmits(["clickAppBar"]);
    const userStore = useUserStore();
    const { user } = storeToRefs(userStore);
    
    //Model Values
    const drawer = ref(false);
    var userData = ref({});
    
    //Built-in Functions
    onMounted(async() => {
        document.addEventListener('click', handleClickOutside)
        userData.value = decryptData(user.value, Constants.USER_SECRET_KEY);
    })

    watch(() => props.drawer, (props_drawer_newValue, props_drawer_oldValue) => {
        drawer.value = props_drawer_newValue;
        emitClickOutsideSidebar(drawer.value);
    })

    //User-defined Functions
    const logout = async () => {
        await userStore.logout();
        localStorage.clear();
    }

    const handleClickOutside = (event) => {        
        if (event.target.matches('.v-navigation-drawer__scrim')) {
            emitClickOutsideSidebar(false);
        }
    }

    const emitClickOutsideSidebar = (value) => {
        emits("clickAppBar", value);
    }

    const redirectToPage = (value) => {
        emitClickOutsideSidebar(false);
        router.push(`${value}`);
    }
</script>

<template>
    <v-navigation-drawer
        v-model="drawer"
        width="300"
        class="bg-blue-darken-1"
        clipped-left
        temporary
    >
        <v-list>
            <v-list-item
            >
                <template v-slot:prepend>
                    <v-icon
                        icon="mdi-account-circle"
                        size="large"
                    />
                </template>
                <v-list-item-title
                    class="sidebar-title"
                >
                    {{ userData.fname + " " + userData.mname + " " + userData.lname }}
                </v-list-item-title>
                <v-list-item-subtitle class="mt-1 font-weight-bold text-grey-darken-4">{{ userData.acc_name }}</v-list-item-subtitle>
            </v-list-item>
        
        </v-list>
        <v-divider
            class="mb-3"
            :thickness="2"
        ></v-divider>
        <v-list 
            density="compact" 
            nav
        >
            <v-list-item 
                v-if="userData.access_right == Constants.ROLE_IT"
                prepend-icon="mdi-view-dashboard" 
                title="Dashboard" 
                value=""
                :class="($route.path === '/') ? 'bg-active-selected' : ''"
                @click="redirectToPage('/')"
            >
            </v-list-item>
            <v-list-item 
                v-if="userData.access_right == Constants.ROLE_IT"
                prepend-icon="mdi-laptop" 
                title="Preventive Maintenance" 
                value=""
                :class="($route.path === '/PmsCreate') ? 'bg-active-selected' : ''"
                @click="redirectToPage('/PmsCreate')"
            >
            </v-list-item>
            <v-list-item 
                v-if="userData.access_right == Constants.ROLE_IT"
                prepend-icon="mdi-laptop" 
                title="User Devices" 
                :class="($route.path === '/UserDeviceList') ? 'bg-active-selected' : ''"
                @click="redirectToPage('/UserDeviceList')"
            >
            </v-list-item>
            <v-list-item 
                v-if="userData.access_right == Constants.ROLE_IT"
                prepend-icon="mdi-desktop-classic" 
                title="Computers" 
                :class="($route.path === '/ComputerList') ? 'bg-active-selected' : ''"
                @click="redirectToPage('/ComputerList')"
            >
            </v-list-item>
            <v-list-item 
                v-if="userData.access_right == Constants.ROLE_IT"
                prepend-icon="mdi-desktop-classic" 
                title="Hardware" 
                :class="($route.path === '/HardwareList') ? 'bg-active-selected' : ''"
                @click="redirectToPage('/HardwareList')"
            >
            </v-list-item>
            <v-list-item 
                v-if="userData.access_right == Constants.ROLE_IT"
                prepend-icon="mdi-desktop-classic" 
                title="Software" 
                :class="($route.path === '/SoftwareList') ? 'bg-active-selected' : ''"
                @click="redirectToPage('/SoftwareList')"
            >
            </v-list-item>
            <v-list-item 
                v-if="userData.access_right == Constants.ROLE_IT"
                prepend-icon="mdi-checkbox-marked-outline" 
                title="Checklist Items" 
                :class="($route.path === '/Checklist') ? 'bg-active-selected' : ''"
                @click="redirectToPage('/Checklist')"
            >
            </v-list-item>
            <v-list-item 
                v-if="userData.access_right == Constants.ROLE_IT"
                prepend-icon="mdi-desktop-classic" 
                title="Brand" 
                :class="($route.path === '/BrandList') ? 'bg-active-selected' : ''"
                @click="redirectToPage('/BrandList')"
            >
            </v-list-item>
            <v-list-item 
                v-if="userData.access_right == Constants.ROLE_IT"
                prepend-icon="mdi-office-building" 
                title="Location" 
                :class="($route.path === '/LocationList') ? 'bg-active-selected' : ''"
                @click="redirectToPage('/LocationList')"
            >
            </v-list-item>
            <v-list-item 
                prepend-icon="mdi-watermark" 
                title="Workstation List" 
                :class="($route.path === '/WorkstationList') ? 'bg-active-selected' : ''"
                @click="redirectToPage('/WorkstationList')"
            >
            </v-list-item>
            <v-list-item 
                v-if="userData.access_right == Constants.ROLE_COMMON_USER"
                prepend-icon="mdi-watermark" 
                title="Other's Workstation List" 
                :class="($route.path === '/WorkstationOthersList') ? 'bg-active-selected' : ''"
                @click="redirectToPage('/WorkstationOthersList')"
            >
            </v-list-item>
            <v-list-item 
                v-if="userData.access_right == Constants.ROLE_IT"
                prepend-icon="mdi-cogs" 
                title="Settings" 
                :class="($route.path === '/Settings') ? 'bg-active-selected' : ''"
                @click="redirectToPage('/Settings')"
            >
            </v-list-item>
            <v-list-item 
                v-if="userData.access_right == Constants.ROLE_IT"
                prepend-icon="mdi-chart-bar" 
                title="Reports" 
                :class="($route.path === '/Reports') ? 'bg-active-selected' : ''"
                @click="redirectToPage('/Reports')"
            >
            </v-list-item>
        </v-list>
        <template v-slot:append>
          <div>
            <v-list 
                density="compact" 
                nav
            >
                <v-list-item 
                    class="bg-grey-lighten-3"
                    prepend-icon="mdi-logout" 
                    title="Log out" 
                    value=""
                    @click="logout"
                >
                </v-list-item>
            </v-list>
          </div>
        </template>
    </v-navigation-drawer>
</template>

<style scoped>
    .bg-active-selected {
        background-color: #1976D2;
        color: white;
    }

    .sidebar-title {
        font-size: 14px;
    }
</style>