require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/auth.routes');
const adminRoutes = require('./src/routes/admin.routes');
const studentRoutes = require('./src/routes/student.routes');
const companyRoutes = require('./src/routes/company.routes');
const facultyRoutes = require('./src/routes/faculty.routes');

const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./src/graphql/schema');
const resolvers = require('./src/graphql/resolvers');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swagger');

const app = express();

// 1. UNIVERSAL CORS HAMMER
app.use(cors({
    origin: (origin, callback) => {
        const allowed = [
            'https://internship-portal-sigma.vercel.app',
            'http://localhost:5173',
            'http://localhost:3000'
        ];
        if (!origin || allowed.includes(origin) || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            callback(null, true);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const path = require('path');
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Swagger Documentation Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Internship Portal API is running', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/faculty', facultyRoutes);

async function startApp() {
    try {
        connectDB();

        const server = new ApolloServer({
            typeDefs,
            resolvers,
            context: ({ req }) => {
                // Minimal context, auth handled by express if needed or within resolvers
                return { req };
            }
        });
        await server.start();
        server.applyMiddleware({ app, path: '/graphql' });
        console.log(`Apollo GraphQL path: ${server.graphqlPath}`);

        // 404 Handler - MUST BE AFTER ALL ROUTES
        app.use((req, res) => {
            res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found.` });
        });

        // Error Handler
        app.use((err, req, res, next) => {
            console.error('Unhandled error:', err);
            res.status(500).json({ success: false, message: 'Internal server error.' });
        });

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
    }
}

startApp();

module.exports = app;

