
import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('access_token');
            if (token) {
                try {
                    // Ideally, decode the token or fetch user profile
                    // For now, let's just assume valid if token exists and fetch profile if we had an endpoint
                    // Or implement a /me endpoint
                    // Let's decode the JWT simple payload for now or try fetching user details
                    // Assuming we have an endpoint for user details or just use the token payload
                    // Let's decode the token to get basic info
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    setUser({ username: payload.username, role: payload.role });
                } catch (error) {
                    console.error("Auth error", error);
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (username, password) => {
        try {
            const response = await api.post('accounts/auth/login/', { username, password });
            const { access, refresh } = response.data;
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);

            // Extract user info from token
            const payload = JSON.parse(atob(access.split('.')[1]));
            setUser({ username: payload.username, role: payload.role });
            return true;
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
