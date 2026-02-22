import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import axios from 'axios';
import API from '../config/api';

const API_BASE = API.AUTH;

interface User {
    id: string;
    name: string;
    role: string;
    rollNumber?: string;
    email?: string;
    session?: string;
    degree?: string;
    internshipStatus?: 'none' | 'submitted' | 'approved' | 'rejected' | 'agreement_submitted' | 'verified' | 'internship_assigned';
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    loading: true,
    login: () => { },
    logout: () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    const clearAuth = useCallback(() => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        axios.defaults.headers.common['Authorization'] = '';
    }, []);

    const logout = useCallback(async () => {
        try {
            if (token) {
                await axios.post(`${API_BASE}/logout`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
        } catch (err) {
            console.error('Frontend logout error:', err);
        } finally {
            clearAuth();
        }
    }, [token, clearAuth]);

    const login = useCallback((newToken: string, newUser: User) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(newUser);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    }, []);

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }

        const fetchUser = async () => {
            try {
                const { data } = await axios.get(`${API_BASE}/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (data.success) {
                    setUser(data.user);
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                } else {
                    clearAuth();
                }
            } catch {
                clearAuth();
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [token, clearAuth]);

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
