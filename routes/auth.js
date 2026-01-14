const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../config/database').getDB();
const { logLoginAttempt } = require('../middleware/auth');

const router = express.Router();

// Register new user
router.post('/register', [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('firstName').trim().isLength({ min: 2 }),
    body('lastName').trim().isLength({ min: 2 }),
    body('phone').optional().isMobilePhone('en-US')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email, password, firstName, lastName, phone, dateOfBirth, address, city, state, zip } = req.body;

        // Check if user already exists
        const existingUser = await new Promise((resolve, reject) => {
            db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate profile pic initials
        const profilePic = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();

        // Insert new user
        const insert = `
            INSERT INTO users (email, password, first_name, last_name, phone, date_of_birth, address, city, state, zip, profile_pic)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await new Promise((resolve, reject) => {
            db.run(insert, [email, hashedPassword, firstName, lastName, phone, dateOfBirth, address, city, state, zip, profilePic], function (err) {
                if (err) reject(err);
                else resolve(this.lastID);
            });
        });

        // Log successful registration
        logLoginAttempt(this.lastID, true, 'registration', req.ip, req.get('user-agent'), 'Unknown');

        res.status(201).json({
            success: true,
            message: 'Registration successful'
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Login with password
router.post('/login', [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // Find user
        const user = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!user) {
            logLoginAttempt(null, false, 'password', req.ip, req.get('user-agent'), 'Unknown', 'User not found');
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        if (!user.is_active) {
            return res.status(401).json({
                success: false,
                message: 'Account is inactive'
            });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            logLoginAttempt(user.id, false, 'password', req.ip, req.get('user-agent'), 'Unknown', 'Invalid password');
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Log successful login
        logLoginAttempt(user.id, true, 'password', req.ip, req.get('user-agent'), 'Unknown');

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        // Return user data (without password)
        const userData = {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            profilePic: user.profile_pic,
            securityScore: user.securityScore,
            twoFactorEnabled: user.two_factor_enabled === 1,
            biometricEnabled: user.biometric_enabled === 1,
            isVerified: user.is_verified === 1
        };

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: userData
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Biometric login (simplified - in production would verify actual biometric data)
router.post('/biometric', [
    body('email').isEmail().normalizeEmail(),
    body('biometricType').isIn(['face', 'fingerprint', 'windows'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email, biometricType } = req.body;

        // Find user
        const user = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!user.is_active) {
            return res.status(401).json({
                success: false,
                message: 'Account is inactive'
            });
        }

        if (!user.biometric_enabled) {
            return res.status(401).json({
                success: false,
                message: 'Biometric login not enabled for this account'
            });
        }

        // In production, this would verify actual biometric data
        // For demo purposes, we'll accept any biometric login
        logLoginAttempt(user.id, true, biometricType, req.ip, req.get('user-agent'), 'Unknown');

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        const userData = {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            profilePic: user.profile_pic,
            securityScore: user.securityScore,
            twoFactorEnabled: user.two_factor_enabled === 1,
            biometricEnabled: user.biometric_enabled === 1,
            isVerified: user.is_verified === 1
        };

        res.json({
            success: true,
            message: 'Biometric login successful',
            token,
            user: userData
        });
    } catch (error) {
        console.error('Biometric login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Verify token endpoint
router.get('/verify', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'No token provided'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', async (err, decoded) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }

        // Get fresh user data
        const user = await new Promise((resolve, reject) => {
            db.get('SELECT id, email, first_name, last_name, profile_pic, security_score, two_factor_enabled, biometric_enabled, is_verified FROM users WHERE id = ?', [decoded.userId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            valid: true,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                profilePic: user.profile_pic,
                securityScore: user.security_score,
                twoFactorEnabled: user.two_factor_enabled === 1,
                biometricEnabled: user.biometric_enabled === 1,
                isVerified: user.is_verified === 1
            }
        });
    });
});

// Logout (client-side token invalidation)
router.post('/logout', (req, res) => {
    res.json({
        success: true,
        message: 'Logout successful'
    });
});

module.exports = router;
