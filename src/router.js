
import { createRouter, createWebHistory } from 'vue-router';

import HelloWorld from './views/HelloWorld.vue';
import TriangleGradient from './views/TriangleGradient.vue';

const routes = [
  { path: '/', component: HelloWorld },
  { path: '/triangle-gradient', component: TriangleGradient },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
