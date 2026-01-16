// Hardcoded admin credentials
export const ADMIN_EMAIL = "admin@gmail.com";
export const ADMIN_PASSWORD = "123456";

// Local user storage (in-memory database for demo)
const users = [
  {
    id: "admin-001",
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  },
];

export const authService = {
  // Local login
  async localLogin(email, password) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
          const userData = {
            uid: user.id,
            email: user.email,
            displayName: user.email.split("@")[0],
          };
          localStorage.setItem("authUser", JSON.stringify(userData));
          resolve(userData);
        } else {
          reject(new Error("Invalid email or password"));
        }
      }, 500);
    });
  },

  // Local signup (without Firebase)
  async localSignUp(email, password) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Check if user already exists
        if (users.find(u => u.email === email)) {
          reject(new Error("Email already in use"));
          return;
        }

        // Create new user
        const newUser = {
          id: `user-${Date.now()}`,
          email,
          password,
        };
        users.push(newUser);

        const userData = {
          uid: newUser.id,
          email: newUser.email,
          displayName: newUser.email.split("@")[0],
        };
        localStorage.setItem("authUser", JSON.stringify(userData));
        resolve(userData);
      }, 500);
    });
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem("authUser");
  },

  // Get current user
  getCurrentUser() {
    const user = localStorage.getItem("authUser");
    return user ? JSON.parse(user) : null;
  },

  // Check if user is admin
  isAdmin() {
    const user = this.getCurrentUser();
    return user && user.email === ADMIN_EMAIL;
  },

  // Monitor auth state changes
  onAuthStateChange(callback) {
    // Check initial state
    const user = this.getCurrentUser();
    callback(user);

    // Listen to storage changes (for multi-tab sync)
    const handleStorageChange = () => {
      const updatedUser = this.getCurrentUser();
      callback(updatedUser);
    };

    window.addEventListener("storage", handleStorageChange);

    // Return unsubscribe function
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  },

  // Logout user
  async logout() {
    try {
      localStorage.removeItem("authUser");
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      return false;
    }
  },
};
