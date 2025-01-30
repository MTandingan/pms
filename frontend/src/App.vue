<script setup>
  import { onMounted } from 'vue';
  import { RouterView, useRouter } from 'vue-router'
  import AppLayout from './layouts/AppLayout.vue';
  import SnackBar from '@/components/SnackBar.vue';
  import Dialog from '@/components/Dialog.vue';
  import PhotoDialog from '@/components/PhotoDialog.vue';
  import { useUserStore } from '@/stores/user';
  import { storeToRefs } from 'pinia';
  import { watch } from 'vue';
  import { decryptData } from '../src/helpers/encryptUtil';
  import Constants from "@/globals";
  import { provideLogger } from '@/helpers/logger'
  import { loggerConfig } from '@/config/logger.config'
  //Local Constants
  
  //Variables
  const router = useRouter()
  const userStore = useUserStore();
  const { user } = storeToRefs(userStore);

  //Model Values

  //Built-in Functions
  onMounted(() => {
    const logger = provideLogger(loggerConfig);
    logger.info('Application started', { version: 'version 1.0.1' });
    logger.info('Environment', { environment: process.env.NODE_ENV });
  
    if(decryptData(user.value, Constants.USER_SECRET_KEY) === null){
      router.push(`/login`);
    }
  })

  watch(() => user.value, (user_newValue, user_oldValue) => {
    if(decryptData(user_newValue, Constants.USER_SECRET_KEY) === null){
      router.push(`/login`);
    }
  })

  //User-defined Functions
</script>

<template>
  <SnackBar />
  <Dialog />
  <PhotoDialog />

  <div v-if="user === null">    <!--  If login or out from the Main app's views -->
    <RouterView />
  </div>
  <div v-else>
    <AppLayout>
      <RouterView v-slot="{ Component, route }">
        <Transition name="route" mode="out-in">
          <div :key="route.name">
            <component :is="Component"></component>
          </div>
        </Transition>
      </RouterView>
    </AppLayout>
  </div>
</template>