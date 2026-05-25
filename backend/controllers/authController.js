const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Cookie options — sameSite:'none' is required for cross-port requests (frontend 4001 → backend 5000)
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'none'
};

exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'user'
        });

        if (user) {
            const token = generateToken(user._id, user.role);
            res.cookie('token', token, cookieOptions);
            res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role, token });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            const token = generateToken(user._id, user.role);
            res.cookie('token', token, cookieOptions);
            res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, token });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.logout = (req, res) => {
    res.cookie('token', '', { ...cookieOptions, expires: new Date(0) });
    res.json({ message: 'Logged out successfully' });
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (user) {
            // Generate a fresh token so the frontend can store it for Authorization header fallback
            const token = generateToken(user._id, user.role);
            res.json({ ...user.toObject(), token });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
