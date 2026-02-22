/**
 * Central API configuration.
 * Reads VITE_API_URL from environment variables.
 *   - In development (.env):        http://localhost:5000
 *   - In production (.env.production): https://your-backend-url.onrender.com
 *
 * All API_BASE constants across the app import from here.
 */
const BASE = import.meta.env.VITE_API_URL as string;

export const API = {
    AUTH: `${BASE}/api/auth`,
    STUDENT: `${BASE}/api/student`,
    ADMIN: `${BASE}/api/admin`,
    FACULTY: `${BASE}/api/faculty`,
    COMPANY: `${BASE}/api/company`,
};

export default API;
