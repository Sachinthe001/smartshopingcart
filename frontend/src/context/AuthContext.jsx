import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    axios.defaults.withCredentials = true;

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

        const checkUser = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/auth/profile');
                setUser(res.data);
                // Always store the token from profile response so Authorization header works
                if (res.data?.token) {
                    localStorage.setItem('token', res.data.token);
                    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
                }
            } catch (err) {
                setUser(null);
                localStorage.removeItem('token');
                delete axios.defaults.headers.common['Authorization'];
            } finally {
                setLoading(false);
            }
        };
        checkUser();
    }, []);

    const login = async (email, password) => {
        const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
        setUser(res.data);
        if (res.data?.token) {
            localStorage.setItem('token', res.data.token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        }
    };

    const register = async (name, email, password) => {
        const res = await axios.post('http://localhost:5000/api/auth/register', { name, email, password });
        setUser(res.data);
        if (res.data?.token) {
            localStorage.setItem('token', res.data.token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        }
    };

    const logout = async () => {
        try {
            await axios.post('http://localhost:5000/api/auth/logout');
        } catch (err) {
            console.error('Logout error on server:', err);
        } finally {
            setUser(null);
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
