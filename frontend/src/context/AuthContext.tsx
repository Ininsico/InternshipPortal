import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
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
    internshipCategory?: 'university_assigned' | 'self_found' | 'freelancer' | null;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    loading: true,
    login: () => { },
    logout: () => { },
    refreshUser: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const clearAuth = useCallback(() => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        axios.defaults.headers.common['Authorization'] = '';
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }
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

    const fetchUser = useCallback(async (currentToken: string, isInitial = false) => {
        try {
            const { data } = await axios.get(`${API_BASE}/me`, {
                headers: { Authorization: `Bearer ${currentToken}` },
            });
            if (data.success) {
                setUser(data.user);
                axios.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;
            } else {
                clearAuth();
            }
        } catch {
            clearAuth();
        } finally {
            if (isInitial) setLoading(false);
        }
    }, [clearAuth]);

    const refreshUser = useCallback(async () => {
        const currentToken = localStorage.getItem('token');
        if (currentToken) await fetchUser(currentToken);
    }, [fetchUser]);

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }

        // Initial fetch
        fetchUser(token, true);

        // Poll every 10s if user is a student (to catch admin approval status changes immediately)
        if (pollingRef.current) clearInterval(pollingRef.current);
        pollingRef.current = setInterval(async () => {
            const currentToken = localStorage.getItem('token');
            if (!currentToken) return;
            try {
                const { data } = await axios.get(`${API_BASE}/me`, {
                    headers: { Authorization: `Bearer ${currentToken}` },
                });
                if (data.success && data.user?.role === 'student') {
                    setUser(prev => {
                        // Only update if something changed to avoid unnecessary re-renders
                        if (prev?.internshipStatus !== data.user.internshipStatus) {
                            return data.user;
                        }
                        return prev;
                    });
                }
            } catch {
                // Silently ignore polling errors
            }
        }, 10000);

        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
                pollingRef.current = null;
            }
        };
    }, [token, fetchUser]);

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};
