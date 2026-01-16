import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import BarChart from "../views/BarChart.vue";
import LineChart from "../views/LineChart.vue";
import Login from "../views/Login.vue";
import { authService } from "../services/authService.js";

const routes = [
  {
    path: "/login",
    name: "login",
    component: Login,
    meta: { requiresAuth: false },
  },
  {
    path: "/",
    name: "home",
    component: Home,
    meta: { requiresAuth: true },
  },
  {
    path: "/bar-chart",
    name: "barChart",
    component: BarChart,
    meta: { requiresAuth: true },
  },
  {
    path: "/line-chart",
    name: "lineChart",
    component: LineChart,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard to protect routes
router.beforeEach((to, from, next) => {
  const isAuthenticated = authService.isAuthenticated();
  const requiresAuth = to.meta.requiresAuth;

  if (requiresAuth && !isAuthenticated) {
    // Redirect to login if trying to access protected route without auth
    next("/login");
  } else if (to.path === "/login" && isAuthenticated) {
    // Redirect to home if already logged in and trying to access login
    next("/");
  } else {
    next();
  }
});

export default router;
