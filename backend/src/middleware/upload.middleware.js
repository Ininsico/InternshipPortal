const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');

// In serverless environments like Vercel, we must write to /tmp
const isVercel = process.env.VERCEL || process.env.NODE_ENV === 'production';
const UPLOAD_BASE = isVercel ? os.tmpdir() : process.cwd();

// Function to ensure directory exists
const ensureDir = (dir) => {
    const fullPath = path.isAbsolute(dir) ? dir : path.join(UPLOAD_BASE, dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }
    return fullPath;
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let dir = 'uploads/submissions';
        if (file.fieldname === 'profilePicture') {
            dir = 'uploads/profile';
        }
        try {
            const finalDir = ensureDir(dir);
            cb(null, finalDir);
        } catch (err) {
            cb(err);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|zip/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Invalid file type! Only images, PDFs, Word docs, and ZIP files are allowed.'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 4 * 1024 * 1024 }, // 4MB limit (Vercel max is 4.5MB)
    fileFilter: fileFilter
});

module.exports = upload;
