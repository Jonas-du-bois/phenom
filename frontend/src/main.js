import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuth } from './composables/useAuth'
import 'leaflet/dist/leaflet.css'
import './style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize auth from localStorage
const { init } = useAuth()
init()

app.mount('#app')
