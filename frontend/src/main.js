import { createApp } from 'vue'
import { createPinia } from 'pinia'

//Import essentials
import App from './App.vue'
import router from './router'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import "@/axios"

//Import CSS
import './assets/main.css'

//Vuetify
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
    components,
    directives,
})

const app = createApp(App)
const pinia = createPinia();

//Pinia
pinia.use(piniaPluginPersistedstate);

app.config.globalProperties.bts = "Sample BTS";

app.use(pinia)
app.use(router)
app.use(vuetify)

app.mount('#app')
