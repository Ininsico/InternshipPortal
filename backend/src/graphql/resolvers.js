const Admin = require('../models/Admin.model');
const Student = require('../models/Student.model');

const resolvers = {
    Query: {
        getStudentsByAdmin: async (_, { adminId }) => {
            const admin = await Admin.findById(adminId);
            if (!admin) throw new Error('Admin not found');

            let query = {};
            if (admin.role === 'company_admin') {
                if (admin.companyId) {
                    query.assignedCompanyId = admin.companyId;
                } else if (admin.company) {
                    query.assignedCompany = { $regex: new RegExp(`^${admin.company.trim()}$`, 'i') };
                } else {
                    return [];
                }
            } else {
                query.supervisorId = adminId;
            }

            return await Student.find(query);
        },
        getAllAdmins: async () => {
            return await Admin.find().select('-passwordHash');
        },
        getAdmin: async (_, { id }) => {
            return await Admin.findById(id).select('-passwordHash');
        }
    }
};

module.exports = resolvers;
