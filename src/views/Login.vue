<template>
  <div class="login-container">
    <div class="login-card">
      <h1>Smart Drainage Monitoring System</h1>
      <p class="subtitle">Login to your account</p>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email Address</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="Enter your email"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Enter your password"
            required
          />
        </div>

        <button type="submit" class="login-button" :disabled="loading">
          {{ loading ? "Logging in..." : "Login" }}
        </button>
      </form>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <p class="signup-text">
        Don't have an account? <a href="#" @click="toggleSignUp">Sign up here</a>
      </p>

      <!-- Sign Up Form -->
      <div v-if="showSignUp" class="signup-form">
        <h2>Create an Account</h2>
        <form @submit.prevent="handleSignUp">
          <div class="form-group">
            <label for="signup-email">Email Address</label>
            <input
              id="signup-email"
              v-model="signupEmail"
              type="email"
              placeholder="Enter your email"
              required
            />
          </div>

          <div class="form-group">
            <label for="signup-password">Password</label>
            <input
              id="signup-password"
              v-model="signupPassword"
              type="password"
              placeholder="Enter your password (min 6 characters)"
              required
            />
          </div>

          <button type="submit" class="signup-button" :disabled="loading">
            {{ loading ? "Creating account..." : "Sign Up" }}
          </button>
        </form>

        <button class="cancel-button" @click="toggleSignUp">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { authService, ADMIN_EMAIL, ADMIN_PASSWORD } from "../services/authService.js";

export default {
  name: "Login",
  setup() {
    const router = useRouter();
    const email = ref("");
    const password = ref("");
    const signupEmail = ref("");
    const signupPassword = ref("");
    const loading = ref(false);
    const errorMessage = ref("");
    const showSignUp = ref(false);

    const handleLogin = async () => {
      errorMessage.value = "";
      loading.value = true;

      try {
        const user = await authService.localLogin(email.value, password.value);
        router.push("/");
      } catch (error) {
        errorMessage.value =
          error.message || "Login failed. Please check your credentials.";
        console.error("Login error:", error);
      } finally {
        loading.value = false;
      }
    };

    const handleSignUp = async () => {
      errorMessage.value = "";
      loading.value = true;

      if (signupPassword.value.length < 6) {
        errorMessage.value = "Password must be at least 6 characters long.";
        loading.value = false;
        return;
      }

      try {
        await authService.localSignUp(signupEmail.value, signupPassword.value);
        errorMessage.value = "Account created! You are now logged in.";
        setTimeout(() => {
          router.push("/");
        }, 1000);
      } catch (error) {
        errorMessage.value =
          error.message || "Sign up failed. Please try again.";
        console.error("Sign up error:", error);
      } finally {
        loading.value = false;
      }
    };

    const toggleSignUp = (e) => {
      e.preventDefault();
      showSignUp.value = !showSignUp.value;
      errorMessage.value = "";
    };

    return {
      email,
      password,
      signupEmail,
      signupPassword,
      loading,
      errorMessage,
      showSignUp,
      handleLogin,
      handleSignUp,
      toggleSignUp,
      ADMIN_EMAIL,
      ADMIN_PASSWORD,
    };
  },
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.login-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  padding: 40px;
  width: 100%;
  max-width: 400px;
}

.login-card h1 {
  color: #333;
  margin: 0 0 10px 0;
  font-size: 28px;
  text-align: center;
}

.subtitle {
  color: #666;
  text-align: center;
  margin-bottom: 30px;
  font-size: 14px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 600;
  font-size: 14px;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.login-button,
.signup-button {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.login-button:hover:not(:disabled),
.signup-button:hover:not(:disabled) {
  transform: translateY(-2px);
}

.login-button:disabled,
.signup-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: #e74c3c;
  margin-top: 15px;
  padding: 10px;
  background-color: #f8d7da;
  border-radius: 6px;
  font-size: 14px;
}

.signup-text {
  text-align: center;
  margin-top: 20px;
  color: #666;
  font-size: 14px;
}

.signup-text a {
  color: #667eea;
  text-decoration: none;
  cursor: pointer;
  font-weight: 600;
}

.signup-text a:hover {
  text-decoration: underline;
}

.signup-form {
  margin-top: 30px;
  padding-top: 30px;
  border-top: 2px solid #e0e0e0;
}

.signup-form h2 {
  color: #333;
  font-size: 20px;
  text-align: center;
  margin-bottom: 20px;
}

.cancel-button {
  width: 100%;
  padding: 10px;
  background-color: #e0e0e0;
  color: #333;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  margin-top: 10px;
}

.cancel-button:hover {
  background-color: #d0d0d0;
}

.admin-hint {
  background-color: #e8f4f8;
  border-left: 4px solid #667eea;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 12px;
  color: #333;
}

.admin-hint p {
  margin: 4px 0;
  font-family: "Courier New", monospace;
}

.admin-hint strong {
  color: #667eea;
}
</style>
