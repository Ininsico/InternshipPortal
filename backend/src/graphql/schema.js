const { gql } = require('apollo-server-express');

const typeDefs = gql`
    type Admin {
        _id: ID!
        name: String!
        email: String!
        role: String!
        company: String
        companyId: ID
    }

    type Student {
        _id: ID!
        rollNumber: String!
        name: String!
        email: String!
        degree: String!
        internshipStatus: String!
        assignedCompany: String
        assignedCompanyId: ID
        assignedPosition: String
    }

    type Query {
        getStudentsByAdmin(adminId: ID!): [Student]
        getAllAdmins: [Admin]
        getAdmin(id: ID!): Admin
    }
`;

module.exports = typeDefs;
