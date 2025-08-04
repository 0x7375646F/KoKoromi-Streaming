const jwt = require('jsonwebtoken');
const UserAccount = require('../db/model/userModel');

const adminAuthMiddleware = async (req, res, next) => {
    try {
        // Check for token in Authorization header or cookies
        let token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            token = req.cookies?.token;
        }
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Access token required' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const admin = await UserAccount.findByPk(decoded.id);
        
        if (!admin || admin.role !== 'root' || admin.banned) {
            return res.status(401).json({ 
                success: false, 
                message: 'Admin access required' 
            });
        }

        // Check if token version matches (for logout functionality)
        if (decoded.tokenVersion !== admin.tokenVersion) {
            return res.status(401).json({ 
                success: false, 
                message: 'Token expired. Please login again' 
            });
        }

        req.admin = admin;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token' 
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Token expired' 
            });
        }
        console.error('Admin auth middleware error:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

const requirePermission = (permission) => {
    return (req, res, next) => {
        if (!req.admin) {
            return res.status(401).json({ 
                success: false, 
                message: 'Admin authentication required' 
            });
        }
        if (req.admin.role !== 'root') {
            return res.status(403).json({ 
                success: false, 
                message: `Permission denied: ${permission} required` 
            });
        }

        next();
    };
};

const requireSuperAdmin = (req, res, next) => {
    if (!req.admin) {
        return res.status(401).json({ 
            success: false, 
            message: 'Admin authentication required' 
        });
    }
    if (req.admin.role !== 'root') {
        return res.status(403).json({ 
            success: false, 
            message: 'Super admin access required' 
        });
    }

    next();
};

module.exports = {
    adminAuthMiddleware,
    requirePermission,
    requireSuperAdmin
}; 