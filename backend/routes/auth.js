import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

/**
 * POST /api/auth/login
 * Admin login endpoint
 */
router.post('/login', (req, res) => {
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({ error: 'Password is required' });
    }

    // Verify password
    if (password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Invalid password' });
    }

    // Generate JWT token
    const token = jwt.sign(
        { role: 'admin', timestamp: Date.now() },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );

    res.json({
        success: true,
        token,
        message: 'Login successful',
    });
});

/**
 * POST /api/auth/verify
 * Verify JWT token
 */
router.post('/verify', (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ error: 'Token is required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({
            success: true,
            valid: true,
            data: decoded,
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            valid: false,
            error: 'Invalid or expired token',
        });
    }
});

/**
 * Middleware to verify admin authentication
 */
export const verifyAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }

    const token = authHeader.substring(7);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }
};

export default router;
