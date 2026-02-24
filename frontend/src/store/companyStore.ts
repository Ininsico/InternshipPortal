import { create } from 'zustand';

export type CompanyTab = 'overview' | 'students' | 'tasks' | 'submissions';

interface CompanyState {
    activeTab: CompanyTab;
    setActiveTab: (tab: CompanyTab) => void;
    students: any[];
    setStudents: (update: any[] | ((prev: any[]) => any[])) => void;
    tasks: any[];
    setTasks: (update: any[] | ((prev: any[]) => any[])) => void;
    submissions: any[];
    setSubmissions: (update: any[] | ((prev: any[]) => any[])) => void;
    refreshTrigger: number;
    triggerRefresh: () => void;
}

export const useCompanyStore = create<CompanyState>((set) => ({
    activeTab: 'overview',
    setActiveTab: (tab) => set({ activeTab: tab }),
    students: [],
    setStudents: (update) => set((state) => ({
        students: typeof update === 'function' ? update(state.students) : update
    })),
    tasks: [],
    setTasks: (update) => set((state) => ({
        tasks: typeof update === 'function' ? update(state.tasks) : update
    })),
    submissions: [],
    setSubmissions: (update) => set((state) => ({
        submissions: typeof update === 'function' ? update(state.submissions) : update
    })),
    refreshTrigger: 0,
    triggerRefresh: () => set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),
}));
