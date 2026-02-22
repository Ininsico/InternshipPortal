const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin.model');

const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Unauthorized. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        return res.status(401).json({ success: false, message: 'Unauthorized. Invalid or expired token.' });
    }
};

const requireRole = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
        return res.status(403).json({ success: false, message: 'Forbidden. Insufficient permissions.' });
    }
    next();
};

// Loads full Admin document into req.admin (for company/faculty portals that need fields beyond JWT)
const loadAdmin = async (req, res, next) => {
    try {
        const admin = await Admin.findById(req.user.id || req.user._id).select('-passwordHash');
        if (!admin) return res.status(401).json({ success: false, message: 'Admin account not found.' });
        req.admin = admin;
        next();
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { protect, requireRole, loadAdmin };

