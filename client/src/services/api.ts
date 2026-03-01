import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL + "/api",
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    (config) => {
        // Log final request URL for validation
        if (config.baseURL && config.url) {
            const finalUrl = config.url.startsWith("http") ? config.url : `${config.baseURL.replace(/\/$/, "")}/${config.url.replace(/^\//, "")}`;
            console.log(`[API Request]: ${finalUrl}`);
        }

        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// Auth API calls
interface RegisterData {
    name: string;
    email: string;
    password?: string;
}

interface LoginData {
    email: string;
    password?: string;
}

export const register = async (userData: RegisterData) => {
    const response = await api.post("/auth/register", userData);
    if (response.data) {
        localStorage.setItem("token", response.data.token);

        // Safety check for user object structure
        if (response.data.user) {
            localStorage.setItem("role", response.data.user.role);
            localStorage.setItem("user", JSON.stringify(response.data.user));
        } else if (response.data.role) {
            // Fallback for flat structure (though backend is fixed, this prevents crashes)
            const user = {
                _id: response.data._id,
                name: response.data.name,
                email: response.data.email,
                role: response.data.role,
            };
            localStorage.setItem("role", response.data.role);
            localStorage.setItem("user", JSON.stringify(user));
        }
    }
    return response.data;
};

export const registerAdmin = async (userData: RegisterData) => {
    const response = await api.post("/auth/admin/register", userData);
    if (response.data) {
        localStorage.setItem("token", response.data.token);

        // Safety check for user object structure
        if (response.data.user) {
            localStorage.setItem("role", response.data.user.role);
            localStorage.setItem("user", JSON.stringify(response.data.user));
        } else if (response.data.role) {
            // Fallback for flat structure
            const user = {
                _id: response.data._id,
                name: response.data.name,
                email: response.data.email,
                role: response.data.role,
            };
            localStorage.setItem("role", response.data.role);
            localStorage.setItem("user", JSON.stringify(user));
        }
    }
    return response.data;
};

export const login = async (userData: LoginData) => {
    const response = await api.post("/auth/login", userData);
    if (response.data) {
        localStorage.setItem("token", response.data.token);

        // Safety check for user object structure
        if (response.data.user) {
            localStorage.setItem("role", response.data.user.role);
            localStorage.setItem("user", JSON.stringify(response.data.user));
        } else if (response.data.role) {
            // Fallback for flat structure
            const user = {
                _id: response.data._id,
                name: response.data.name,
                email: response.data.email,
                role: response.data.role,
            };
            localStorage.setItem("role", response.data.role);
            localStorage.setItem("user", JSON.stringify(user));
        }
    }
    return response.data;
};

export const getCurrentUser = async () => {
    const response = await api.get("/auth/me");
    return response.data;
};

export const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
};

// Admin create client
export const createClient = async (userData: { name: string; email: string; password?: string }) => {
    const response = await api.post("/admin/clients", userData);
    return response.data;
};

// Change password
export const changePassword = async (passwords: { currentPassword: string; newPassword: string }) => {
    const response = await api.put("/auth/change-password", passwords);
    // Update local storage user if needed, or rely on next fetch
    // But importantly, mustChangePassword should be updated.
    // The response returns the updated user.
    if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
};

// Forgot password
export const forgotPassword = async (email: string) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
};

// Reset password with token
export const resetPassword = async (token: string, password: string) => {
    const response = await api.post("/auth/reset-password", { token, password });
    if (response.data) {
        localStorage.setItem("token", response.data.token);
        if (response.data.user) {
            localStorage.setItem("role", response.data.user.role);
            localStorage.setItem("user", JSON.stringify(response.data.user));
        }
    }
    return response.data;
};

export default api;
