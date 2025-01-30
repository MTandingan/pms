<script setup>
    import { onMounted } from 'vue';
    import { useRouter } from 'vue-router';
    import { useUserStore } from '@/stores/user';
    import { useUtilStore } from '@/stores/util';
    import { storeToRefs } from 'pinia';
    import { decryptData } from '../helpers/encryptUtil'
    import Constants from "@/globals";

    //Local Constants
    
    //Variables
    const router = useRouter();
    const utilStore = useUtilStore();
    const userStore = useUserStore();
    const { user } = storeToRefs(userStore);

    //Model Values

    //Built-in Functions
    onMounted( async() => {
        utilStore.setPageLoading({pIsPageLoading: false});
    });

    //User-defined Functions

    const goToHome = async() => {
        let userData = decryptData(user.value, Constants.USER_SECRET_KEY);

        if(userData !== null){
            if(userData.access_right == Constants.ROLE_IT){
                await router.push(`/`);
            } else {
                console.log(router);
                await router.push(`/WorkstationList`);               
            }
        }
    }
</script>

<template>
        <div 
            class="d-flex justify-center"
        >
            <v-sheet
                height="578"
            >
                <v-sheet
                    class="d-flex flex-column align-center fill-height"
                >
                    <div 
                        class="font-weight-black main-http-error-title"
                    >
                        404
                    </div>
                    <div 
                        class="text-h4 font-weight-medium"
                    >
                        Page not found
                    </div>
                    <div 
                        class="text-h5 font-weight-medium text-center text-grey mt-5 text-description"
                    >
                        The page you are looking for might have been removed had its name changed or is temporarily unavailable 
                    </div>
                    <div 
                    >
                        <v-btn
                            class="font-weight-bold bg-blue-lighten-1 rounded mt-4"
                            variant="elevated"
                            @click="goToHome()"
                        >
                            GO BACK TO HOMEPAGE
                        </v-btn>
                    </div>
                </v-sheet>
            </v-sheet>
        </div>
</template>

<style scoped>
    .main-http-error-title {
        font-size: 180px
    }

    .text-description {
        width: 70%;
    }
    
</style>