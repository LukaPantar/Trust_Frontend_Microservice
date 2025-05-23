import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Provider from '../views/Provider.vue';
import Users from '../views/Users.vue';

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/provider' },
  { path: '/provider', name: 'Provider', component: Provider },
  { path: '/users', name: 'Users', component: Users },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;