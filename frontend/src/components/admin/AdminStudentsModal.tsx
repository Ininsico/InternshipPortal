import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Briefcase, GraduationCap, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface AdminStudentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    admin: any;
    token: string;
}

import { request, gql } from 'graphql-request';

const GET_ADMIN_STUDENTS = gql`
    query GetStudentsByAdmin($adminId: ID!) {
        students: getStudentsByAdmin(adminId: $adminId) {
            _id
            name
            rollNumber
            email
            assignedCompany
            internshipStatus
        }
    }
`;

const AdminStudentsModal = ({ isOpen, onClose, admin }: AdminStudentsModalProps) => {
    const { data: studentsData, isLoading, error } = useQuery({
        queryKey: ['admin-students', admin?._id],
        queryFn: async () => {
            const endpoint = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/graphql` : 'http://localhost:5000/graphql';
            const { students } = await request(endpoint, GET_ADMIN_STUDENTS, { adminId: admin._id });
            return students || [];
        },
        enabled: !!admin && isOpen,
    });

    if (!admin) return null;

    const assignedStudents = studentsData || [];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="px-8 py-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                                    {admin.role === 'company_admin' ? <Briefcase className="h-7 w-7" /> : <User className="h-7 w-7" />}
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight italic">
                                        Assigned Students
                                    </h2>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mt-1">
                                        {admin.name} · {admin.role === 'company_admin' ? admin.company : 'Faculty Supervisor'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="h-12 w-12 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all flex items-center justify-center shadow-sm"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8">
                            {isLoading ? (
                                <div className="h-64 flex flex-col items-center justify-center gap-4">
                                    <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Synchronizing Intern Data...</p>
                                </div>
                            ) : error ? (
                                <div className="h-64 flex flex-col items-center justify-center text-center p-8 bg-red-50 rounded-[2rem] border border-red-100">
                                    <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
                                    <h4 className="text-sm font-black text-red-900 uppercase tracking-tight">Sync Failure</h4>
                                    <p className="text-[10px] font-bold text-red-600 mt-1 uppercase tracking-widest leading-relaxed italic">Failed to retrieve assigned students. Please verify your connection.</p>
                                </div>
                            ) : assignedStudents.length === 0 ? (
                                <div className="h-64 flex flex-col items-center justify-center text-center">
                                    <div className="h-16 w-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300 mb-4">
                                        <AlertCircle className="h-8 w-8" />
                                    </div>
                                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No students assigned yet</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {assignedStudents.map((s: any) => (
                                        <div key={s._id} className="group p-6 rounded-[2rem] border border-slate-100 bg-white hover:border-blue-100 hover:shadow-xl hover:shadow-blue-500/5 transition-all">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="h-12 w-12 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-all duration-500">
                                                    <GraduationCap className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-black text-slate-900">{s.name}</h4>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.rollNumber}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                    <Briefcase className="h-3 w-3 text-blue-500" />
                                                    {s.assignedCompany || 'Unassigned Company'}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                    <Mail className="h-3 w-3 text-blue-500" />
                                                    {s.email}
                                                </div>
                                                {s.internshipStatus === 'internship_assigned' && (
                                                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">Active Intern</span>
                                                        <span className="text-slate-300 text-[9px] font-bold italic">Status: active</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/30 flex justify-between items-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Total: {assignedStudents.length} Students
                            </p>
                            <button
                                onClick={onClose}
                                className="h-12 px-8 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200"
                            >
                                Close View
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AdminStudentsModal;
