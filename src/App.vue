<template>
  <div class="app-container">
    <!-- Navigation Header -->
    <nav v-if="isAuthenticated" class="navbar">
      <div class="nav-left">
        <h2 class="logo">SDMS</h2>
        <div class="nav-links">
          <router-link to="/" :class="{ active: $route.path === '/' }">
            Dashboard
          </router-link>
          <router-link
            to="/bar-chart"
            :class="{ active: $route.path === '/bar-chart' }"
          >
            Bar Chart
          </router-link>

        </div>
      </div>
      <div class="nav-right">
        <span class="user-email">{{ userEmail }}</span>
        <button class="logout-button" @click="handleLogout">Logout</button>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="main-content" :class="{ full: !isAuthenticated }">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { authService } from "./services/authService.js";

const router = useRouter();
const isAuthenticated = ref(false);
const userEmail = ref("");

const checkAuthState = () => {
  const user = authService.getCurrentUser();
  if (user) {
    isAuthenticated.value = true;
    userEmail.value = user.email;
  } else {
    isAuthenticated.value = false;
    userEmail.value = "";
  }
};

onMounted(() => {
  // Check initial auth state
  checkAuthState();

  // Monitor auth state changes
  authService.onAuthStateChange((user) => {
    checkAuthState();
  });

  // Also watch for route changes to update auth state
  router.afterEach(() => {
    checkAuthState();
  });
});

const handleLogout = async () => {
  const success = await authService.logout();
  if (success) {
    isAuthenticated.value = false;
    userEmail.value = "";
    router.push("/login");
  }
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  background: #f5f5f5;
}

html,
body,
#app {
  height: 100%;
  width: 100%;
}

router-link {
  color: inherit;
  text-decoration: none;
}

.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
}

.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.logo {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
}

.nav-links a {
  color: white;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-links a:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.nav-links a.active {
  background-color: rgba(255, 255, 255, 0.3);
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-email {
  font-size: 14px;
}

.logout-button {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.logout-button:hover {
  background-color: white;
  color: #667eea;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.main-content.full {
  padding: 0;
}

@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    gap: 1rem;
  }

  .nav-left {
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }

  .nav-links {
    flex-direction: column;
    width: 100%;
  }

  .nav-right {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
