import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import mitt from 'mitt'
import 'materialize-css';
import 'materialize-css/dist/css/materialize.min.css';
import 'materialize-css/dist/js/materialize.min.js';

const emitter = mitt();

createApp(App).provide('emitter', emitter).use(router).mount('#app')
