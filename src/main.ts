import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import mitt from 'mitt'
import { createI18n } from 'vue-i18n'
import 'materialize-css'
import 'materialize-css/dist/css/materialize.min.css'
import 'materialize-css/dist/js/materialize.min.js'
import messages from '@/assets/i18n/i18n.js'

const emitter = mitt();


//i18n
import Store from 'electron-store';
const database: any = new Store();
let config = database.get('STMusicConfig');
config = config ? JSON.parse(config) : { lang: 'es' };
let lang = 'es';

if(config.lang) lang = config.lang;

const i18n = createI18n({
    locale: lang, // set locale
    fallbackLocale: 'es', // set fallback locale
    messages, // set locale messages
    // If you need to specify other options, you can set other options
    // ...
})

createApp(App).provide('emitter', emitter).use(router).use(i18n).mount('#app')
