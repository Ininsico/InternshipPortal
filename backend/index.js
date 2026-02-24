require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const os = require('os');
const fs = require('fs');
const authRoutes = require('./src/routes/auth.routes');
const adminRoutes = require('./src/routes/admin.routes');
const studentRoutes = require('./src/routes/student.routes');
const companyRoutes = require('./src/routes/company.routes');
const facultyRoutes = require('./src/routes/faculty.routes');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swagger');

const app = express();

const corsOptions = {
    origin: '*',
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    optionsSuccessStatus: 200
};

app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const path = require('path');
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.get('/uploads/submissions/:file', (req, res) => {
    const filePath = path.join(process.cwd(), 'uploads', 'submissions', req.params.file);
    if (fs.existsSync(filePath)) return res.sendFile(filePath);
    if (process.env.VERCEL) {
        const tmpPath = path.join(os.tmpdir(), 'uploads', 'submissions', req.params.file);
        if (fs.existsSync(tmpPath)) return res.sendFile(tmpPath);
    }
    res.status(404).json({ success: false, message: 'File not found' });
});

// In Vercel, also serve from /tmp so uploaded files can be read back (temporarily)
if (process.env.VERCEL) {
    const tmpUploads = path.join(os.tmpdir(), 'uploads');
    if (!fs.existsSync(tmpUploads)) {
        fs.mkdirSync(tmpUploads, { recursive: true });
    }
    app.use('/uploads', express.static(tmpUploads));
}

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Internship Portal API is running', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/faculty', facultyRoutes);
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found.` });
});

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ success: false, message: err.message || 'Internal server error.' });
});

async function startApp() {
    try {
        connectDB();
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
