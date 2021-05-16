import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import Home from '../views/ScriptedTune.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/configuration',
    name: 'Configuration',
    component: () => import('../views/Configuration.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
