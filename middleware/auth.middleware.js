// // middleware/auth.middleware.js
// const jwt = require('jsonwebtoken');
// const User = require('../models/User.model'); // Adjust path if your models folder is elsewhere
// require('dotenv').config(); // Ensure .env is loaded for JWT_SECRET

// const JWT_SECRET = process.env.JWT_SECRET;

// // Middleware to protect routes - checks for valid token and attaches user
// // middleware/auth.middleware.js
// const checkAuth = async (req, res, next) => {
//     console.log('[BACKEND checkAuth] Middleware started for:', req.method, req.originalUrl);
//     const authHeader = req.header('Authorization');
//     console.log('[BACKEND checkAuth] Authorization Header:', authHeader);

//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//         console.log('[BACKEND checkAuth] Denied: No token or invalid format.');
//         return res.status(401).json({ message: 'Authorization denied, no token or invalid format.' });
//     }

//     const token = authHeader.substring(7);
//     console.log('[BACKEND checkAuth] Extracted Token:', token ? "Exists" : "MISSING AftER SPLIT?!");

//     if (!token) {
//         console.log('[BACKEND checkAuth] Denied: Token missing after split (should not happen if Bearer was present).');
//         return res.status(401).json({ message: 'Authorization denied, token missing.' });
//     }

//     try {
//         if (!JWT_SECRET) { /* ... existing error ... */ }

//         console.log('[BACKEND checkAuth] Attempting to verify token...');
//         const decoded = jwt.verify(token, JWT_SECRET);
//         console.log('[BACKEND checkAuth] Token decoded successfully. Payload:', decoded);

//         // if (!decoded.id) {
//         //     console.error('[BACKEND checkAuth] Denied: JWT_PAYLOAD_ISSUE: Decoded token does not contain id. Payload:', decoded);
//         //     return res.status(401).json({ message: 'Token is not valid (payload missing user ID).' });
//         // }
//         if (!decoded.user || !decoded.user.id) { // Check for nested user object and its id
//             console.error('[BACKEND checkAuth] Denied: JWT_PAYLOAD_ISSUE: Decoded token does not contain user.id. Payload:', decoded);
//             return res.status(401).json({ message: 'Token is not valid (payload missing user ID).' });
//         }

//         console.log(`[BACKEND checkAuth] Attempting to find user by decoded ID: ${decoded.user.id}`);
//         const userFromDb = await User.findById(decoded.user.id).select('-password'); 

//         // console.log(`[BACKEND checkAuth] Attempting to find user by decoded ID: ${decoded.id}`);
//         // const userFromDb = await User.findById(decoded.id).select('-password');
//         // if (!userFromDb) {
//         //     console.log(`[BACKEND checkAuth] Denied: User with ID ${decoded.id} not found in DB.`);
//         //     return res.status(401).json({ message: 'Authorization denied, user associated with token not found.' });
//         // }

//         // console.log(`[BACKEND checkAuth] User found: ${userFromDb.email}. Attaching to req.loggedInUser.`);
//         // req.loggedInUser = userFromDb;
//         // next();
//          if (!userFromDb) {
//             console.log(`[BACKEND checkAuth] Denied: User with ID ${decoded.user.id} not found in DB.`);
//             return res.status(401).json({ message: 'Authorization denied, user associated with token not found.' });
//         }

//         console.log(`[BACKEND checkAuth] User found: ${userFromDb.email}. Attaching to req.loggedInUser.`);
//         req.loggedInUser = userFromDb;
//         next();

//     } catch (err) {
//         console.error('[BACKEND checkAuth] Token verification EXCEPTION:', err.name, err.message);
//         if (err.name === 'JsonWebTokenError') {
//             return res.status(401).json({ message: 'Token is not valid (malformed or wrong signature).' });
//         }
//         if (err.name === 'TokenExpiredError') {
//             return res.status(401).json({ message: 'Token has expired.' });
//         }
//         return res.status(500).json({ message: 'Server error during token verification.' });
//     }
// };

// // Middleware to require admin role
// const requireAdmin = (req, res, next) => {
//     // checkAuth should have run before this and set req.loggedInUser
//     if (req.loggedInUser && req.loggedInUser.role === 'admin') {
//         next(); // User is admin, proceed
//     } else {
//         const userEmailForLog = req.loggedInUser ? req.loggedInUser.email : 'User not identified or not logged in';
//         const userRoleForLog = req.loggedInUser ? req.loggedInUser.role : 'Role not identified';
//         console.warn(`ADMIN_ACCESS_DENIED: User ${userEmailForLog} (Role: ${userRoleForLog}) attempted admin-only route: ${req.method} ${req.originalUrl}`);
//         res.status(403).json({ message: 'Forbidden: Admin access required for this resource.' });
//     }
// };

// module.exports = {
//     checkAuth,
//     requireAdmin
// };


// backend/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

const checkAuth = async (req, res, next) => {
    console.log(`[MW checkAuth] Path: ${req.originalUrl} - Method: ${req.method}`);
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('[MW checkAuth] Denied: No/Invalid Auth Header.');
        return res.status(401).json({ message: 'Authorization denied, token required.' });
    }
    const token = authHeader.substring(7);
    if (!token) { /* ... return 401 ... */ }

    try {
        if (!JWT_SECRET) {
            console.error("[MW checkAuth] CRITICAL: JWT_SECRET is not defined.");
            return res.status(500).json({ message: "Server configuration error." });
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('[MW checkAuth] Decoded JWT Payload:', decoded);

        // --- EXPECTING NESTED PAYLOAD ---
        if (!decoded.user || !decoded.user.id) { // <<< THIS IS THE KEY CHECK
            console.error('[MW checkAuth] Denied: PAYLOAD ISSUE - decoded.user or decoded.user.id missing. Payload:', decoded);
            return res.status(401).json({ message: 'Token is not valid (payload structure error).' });
        }

        const userFromDb = await User.findById(decoded.user.id).select('-password');
        if (!userFromDb) {
            console.log(`[MW checkAuth] Denied: User ID ${decoded.user.id} from token not found in DB.`);
            return res.status(401).json({ message: 'Authorization denied, user not found.' });
        }
        req.loggedInUser = userFromDb;
        console.log(`[MW checkAuth] User ${userFromDb.email} authenticated. Role: ${userFromDb.role}. Proceeding.`);
        next();
    } catch (err) {
        console.error('[BACKEND checkAuth] Token verification EXCEPTION:', err.name, err.message);
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Token is not valid (malformed or wrong signature).' });
        }
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token has expired.' });
        }
        return res.status(500).json({ message: 'Server error during token verification.' });
    }
};

const requireAdmin = (req, res, next) => {
    if (req.loggedInUser && req.loggedInUser.role === 'admin') {
        console.log(`[MW requireAdmin] User ${req.loggedInUser.email} IS admin. Proceeding for ${req.originalUrl}`);
        next();
    } else {
        const reason = req.loggedInUser ? `User ${req.loggedInUser.email} (Role: ${req.loggedInUser.role}) is not admin.` : 'No loggedInUser found.';
        console.warn(`[MW requireAdmin] FORBIDDEN: ${reason} Path: ${req.originalUrl}`);
        return res.status(403).json({ message: 'Forbidden: Admin access required.' });
    }
};

// Export both checkAuth and requireAdmin for named import compatibility
module.exports = { checkAuth, requireAdmin };
// For routes that expect a default export (e.g., const auth = require(...)),
// you must use: module.exports = checkAuth; instead.