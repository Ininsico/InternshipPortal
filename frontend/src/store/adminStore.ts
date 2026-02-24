import { create } from 'zustand';

export type AdminTab = 'overview' | 'students' | 'reports' | 'faculty' | 'companies' | 'approvals' | 'agreements' | 'settings';

interface AdminState {
    activeTab: AdminTab;
    setActiveTab: (tab: AdminTab) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    viewAdminStudents: any | null;
    setViewAdminStudents: (admin: any | null) => void;
    students: any[];
    setStudents: (update: any[] | ((prev: any[]) => any[])) => void;
    faculty: any[];
    setFaculty: (update: any[] | ((prev: any[]) => any[])) => void;
    reports: any[];
    setReports: (update: any[] | ((prev: any[]) => any[])) => void;
    agreements: any[];
    setAgreements: (update: any[] | ((prev: any[]) => any[])) => void;
    partneredCompanies: any[];
    setPartneredCompanies: (update: any[] | ((prev: any[]) => any[])) => void;
    refreshTrigger: number;
    triggerRefresh: () => void;
}

export const useAdminStore = create<AdminState>((set) => ({
    activeTab: 'overview',
    setActiveTab: (tab) => set({ activeTab: tab }),
    searchQuery: '',
    setSearchQuery: (query) => set({ searchQuery: query }),
    viewAdminStudents: null,
    setViewAdminStudents: (admin) => set({ viewAdminStudents: admin }),
    students: [],
    setStudents: (update) => set((state) => ({
        students: typeof update === 'function' ? update(state.students) : update
    })),
    faculty: [],
    setFaculty: (update) => set((state) => ({
        faculty: typeof update === 'function' ? update(state.faculty) : update
    })),
    reports: [],
    setReports: (update) => set((state) => ({
        reports: typeof update === 'function' ? update(state.reports) : update
    })),
    agreements: [],
    setAgreements: (update) => set((state) => ({
        agreements: typeof update === 'function' ? update(state.agreements) : update
    })),
    partneredCompanies: [],
    setPartneredCompanies: (update) => set((state) => ({
        partneredCompanies: typeof update === 'function' ? update(state.partneredCompanies) : update
    })),
    refreshTrigger: 0,
    triggerRefresh: () => set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),
}));
