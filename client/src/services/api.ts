import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001",
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    (config) => {
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
    const response = await api.post("/api/auth/register", userData);
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
    const response = await api.post("/api/auth/admin/register", userData);
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
    const response = await api.post("/api/auth/login", userData);
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

export const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
};

export default api;
