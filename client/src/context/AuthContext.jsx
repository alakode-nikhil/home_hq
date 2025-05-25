import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // To decode JWT on client side

// Install jwt-decode: npm install jwt-decode
// Note: For Vite, you might need to handle polyfills if using older versions or specific environments.
// For modern browsers, it usually works fine.

const AuthContext = createContext(null);

// Custom hook for easy access to auth context
export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Stores user info (e.g., id, username, email, role)
    const [token, setToken] = useState(localStorage.getItem('token') || null); // Stores JWT
    const [loading, setLoading] = useState(true); // Loading state for initial auth check

    // Set up a default base URL for Axios
    axios.defaults.baseURL = 'http://localhost:5000/api';

    // Effect to run on initial load to check for existing token
    useEffect(() => {
        const initializeAuth = async () => {
            if (token) {
                try {
                    // Optionally, verify token with backend for freshness/validity
                    // Or just decode on client-side and trust it until an API call fails
                    const decoded = jwtDecode(token);
                    if (decoded.exp * 1000 < Date.now()) { // Check if token is expired
                        console.log('Token expired, logging out.');
                        logout();
                    } else {
                        // For simplicity, we'll just set user from decoded token
                        // In a real app, you might make a /api/auth/me request to get fresh user data
                        setUser({
                            _id: decoded.id,
                            role: decoded.role,
                            // Add other user details if present in token payload or from /me endpoint
                        });
                        // Set Axios default header
                        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    }
                } catch (error) {
                    console.error('Failed to decode or verify token:', error);
                    logout(); // Invalid token, log out
                }
            }
            setLoading(false);
        };
        initializeAuth();
    }, []); // Run only once on mount

    const login = (jwtToken, userData) => {
        localStorage.setItem('token', jwtToken);
        setToken(jwtToken);
        setUser(userData); // userData should come from backend login/register response
        axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`; // Set default for all requests
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization']; // Remove default header
    };

    // This function will be called from LoginPage/RegisterPage
    const registerAndLogin = async (username, email, password) => {
        const { data } = await axios.post('/auth/register', { username, email, password });
        login(data.token, { _id: data._id, username: data.username, email: data.email, role: data.role });
        return data;
    };

    const userLogin = async (email, password) => {
        const { data } = await axios.post('/auth/login', { email, password });
        login(data.token, { _id: data._id, username: data.username, email: data.email, role: data.role });
        return data;
    };


    const authContextValue = {
        user,
        token,
        isAuthenticated: !!user, // Boolean flag if user is logged in
        loading,
        login: userLogin, // Map our internal login to the exposed function name
        logout,
        register: registerAndLogin, // Expose register function
    };

    if (loading) {
        return <div>Loading authentication...</div>; // Or a spinner
    }

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};