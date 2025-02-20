<script setup>
    import { ref, onMounted } from 'vue';
    import { useRouter } from 'vue-router';
    import { useUserStore } from '@/stores/user';
    import { storeToRefs } from 'pinia';
    import { decryptData } from '../helpers/encryptUtil'
    import Constants from "@/globals";

    //Local Constants

    //Variables
    const router = useRouter();
    const userStore = useUserStore();
    const { user } = storeToRefs(userStore);

    // //Model Values
    const user_name = ref('');
    const user_password = ref('');
    const isLoginFailed = ref(false);
    const isLoginLoading = ref(false);
    const loginForm = ref(null);

    //Built-in Functions
    onMounted(async() => {
        let userData = decryptData(user.value, Constants.USER_SECRET_KEY);

        if(userData !== null){
            if(userData.access_right == Constants.ROLE_IT){
                await router.push(`/`);
            } else {
                await router.push(`/WorkstationList`);               
            }
        }
    })

    //User-defined Functions
    const login = async (e) => {
        const { valid } = await loginForm.value.validate();

        if(valid){
            isLoginLoading.value = true;

            let queryParams = {
                username: user_name.value,
                password: user_password.value,
            };

            await userStore.login(queryParams);

            var userData = decryptData(user.value, Constants.USER_SECRET_KEY);

            if(userData){
                if(userData.access_right == Constants.ROLE_IT){
                    await router.push(`/`);
                } else {
                    await router.push(`/WorkstationList`);               
                }
            } else {
                isLoginFailed.value = true;
            }

            isLoginLoading.value = false;
        }
    }

</script>

<template>
    <v-layout>
        <v-navigation-drawer 
            color="surface"
            elevation="23"    
            width="500"
        >
            <v-img
                height="100%"
                src="/background.jpg"
                cover
            >
                <v-sheet
                    :color="'rgba(60, 176, 226, 0.65)'"
                    height="100%"
                >
                    <div class="d-flex fill-height justify-center align-center">
                        <div class="pa-4 text-center">
                            <p class="font-weight-light text-blue-lighten-5 font-size-48px">IT will always be there to help you out!</p>
                        </div>
                    </div>
                </v-sheet>
            </v-img>
        </v-navigation-drawer>
      
        <v-main
            style="margin-top: 12%"
        >
            <v-container
                class="pa-10"
            >
                <v-row>
                    <v-col
                        cols="12"
                    >
                        <div class="text-grey-darken-1 font-size-24px">
                            Welcome to VSMMC IT Preventive Maintenance Monitoring
                        </div>
                        <div class="font-size-16px">
                            Please login with your E-LDS account
                        </div>
                        <v-divider 
                            class="my-4"
                            :thickness="1">
                        </v-divider>
                    </v-col>
                </v-row>
                <v-form 
                    ref="loginForm"
                    @submit.prevent
                >
                    <v-row>
                        <v-col
                            class="my-n6"
                            cols="12"
                            sm="6"
                        >
                            <div class="d-block my-1">
                                <p class="font-size-14px">Username</p>
                            </div> 
                            <div class="d-block">
                                <v-text-field
                                    required
                                    variant="outlined"
                                    placeholder="Enter your registered username here..."
                                    density="compact"
                                    v-model="user_name"
                                    :rules="[v => !!v || 'Username is required']"
                                    @keyup.enter="login()"
                                >
                                </v-text-field>
                            </div>
                        </v-col>
                        <v-col
                            class="my-n6"
                            cols="12"
                            sm="6"
                        >
                            <div class="mt-password">
                            </div>
                            <div class="d-block my-1">
                                <p class="font-size-14px">Password</p>
                            </div>
                            <div class="d-block">
                                <v-text-field
                                    required
                                    variant="outlined"
                                    placeholder="Enter your password here..."
                                    density="compact"
                                    type="password"
                                    v-model="user_password"
                                    :rules="[v => !!v || 'Password is required']"
                                    @keyup.enter="login()"
                                >
                                </v-text-field>
                            </div>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col
                            class="my-4"
                            cols="12"
                        >
                            <v-divider 
                                    :thickness="1">
                            </v-divider>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col
                            class="my-1"
                            cols="12"
                        >
                            <v-alert
                                    class="mb-5"
                                    color="#B71C1C"
                                    theme="dark"
                                    icon="mdi-alert-circle"
                                    density="compact"
                                    border="start"
                                    v-model="isLoginFailed"
                                    closable
                                >
                                <span class="font-weight-medium">Login Failed</span> - The account does not exist, please login your correct username and password
                            </v-alert>
                            <div class="d-flex flex-row-reverse">
                                <v-btn
                                    color="blue-lighten-1"
                                    min-width="120"
                                    type="submit"
                                    :loading="isLoginLoading"
                                    @click="login()"
                                >
                                    Login
                                </v-btn>
                            </div>
                            <div class="text-grey-lighten-1 font-size-12px d-flex flex-row-reverse mt-2">
                                Version 2.2.1
                            </div>
                        </v-col>
                    </v-row>
                </v-form>
            </v-container>
        </v-main>

    </v-layout>
</template>

<style scoped>
    .carousel-slide-text {
        font-size: 25px; 
        color: #FFEBEE;
    }

    .mt-password {
        margin-top: 0px
    }

    :deep(.my-checkbox .v-label) {
        font-size: 14px;
        color: black !important;
    } 

    @media only screen and (max-width: 600px) {
        .mt-password {
            margin-top: 30px
        }
    }
</style>