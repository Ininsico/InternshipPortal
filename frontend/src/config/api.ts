const BASE = (import.meta.env.VITE_API_URL as string || '').replace(/\/$/, '');

export const API = {
    BASE: BASE,
    AUTH: `${BASE}/api/auth`,
    STUDENT: `${BASE}/api/student`,
    ADMIN: `${BASE}/api/admin`,
    FACULTY: `${BASE}/api/faculty`,
    COMPANY: `${BASE}/api/company`,
};

export default API;
