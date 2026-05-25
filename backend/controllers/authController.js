const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse
} = require('@simplewebauthn/server');

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

exports.getAuthConfig = (req, res) => {
    res.json({
        googleClientId: process.env.GOOGLE_CLIENT_ID || '',
        facebookAppId: process.env.FACEBOOK_APP_ID || ''
    });
};

// Google login
exports.googleLogin = async (req, res) => {
    try {
        const { credential, isMock } = req.body;
        
        let email, name;
        const hasRealGoogleConfig = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id';
        if (!hasRealGoogleConfig || isMock) {
            email = 'google.user@example.com';
            name = 'Google User';
        } else {
            const googleRes = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${credential}`);
            if (!googleRes.ok) {
                return res.status(401).json({ message: 'Invalid Google token' });
            }
            const profile = await googleRes.json();
            email = profile.email;
            name = profile.name;
        }

        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({
                name,
                email,
                role: 'user'
            });
        }

        const token = generateToken(user._id, user.role);
        res.cookie('token', token, cookieOptions);
        res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Facebook login
exports.facebookLogin = async (req, res) => {
    try {
        const { accessToken, isMock } = req.body;

        let email, name;
        if (isMock || !process.env.FACEBOOK_APP_ID || process.env.FACEBOOK_APP_ID === 'your_facebook_app_id') {
            email = 'facebook.user@example.com';
            name = 'Facebook User';
        } else {
            const response = await fetch(`https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`);
            if (!response.ok) {
                throw new Error('Failed to verify Facebook token');
            }
            const data = await response.json();
            email = data.email || `${data.id}@facebook.com`;
            name = data.name;
        }

        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({
                name,
                email,
                role: 'user'
            });
        }

        const token = generateToken(user._id, user.role);
        res.cookie('token', token, cookieOptions);
        res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Passkey registration - Step 1: Options
exports.passkeyRegisterOptions = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const rpID = 'localhost';
        const options = await generateRegistrationOptions({
            rpName: 'Smart Shopping Cart',
            rpID,
            userID: Buffer.from(user._id.toString()),
            userName: user.email,
            userDisplayName: user.name,
            attestationType: 'none',
            authenticatorSelection: {
                residentKey: 'preferred',
                userVerification: 'preferred',
            },
        });

        user.currentChallenge = options.challenge;
        await user.save();

        res.json(options);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Passkey registration - Step 2: Verification
exports.passkeyRegisterVerify = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const rpID = 'localhost';
        const origin = 'http://localhost:4001';

        const verification = await verifyRegistrationResponse({
            response: req.body,
            expectedChallenge: user.currentChallenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
        });

        if (verification.verified) {
            const { credentialID, credentialPublicKey, counter } = verification.registrationInfo;
            
            // Check if credential ID already exists to avoid duplicates
            const credentialIDBase64 = Buffer.from(credentialID).toString('base64url');
            const exists = user.passkeys.some(p => p.credentialID === credentialIDBase64);
            
            if (!exists) {
                user.passkeys.push({
                    credentialID: credentialIDBase64,
                    publicKey: Buffer.from(credentialPublicKey).toString('base64url'),
                    counter,
                });
            }
            
            user.currentChallenge = undefined;
            await user.save();
            res.json({ verified: true });
        } else {
            res.status(400).json({ message: 'Passkey verification failed' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Passkey login - Step 1: Options
exports.passkeyLoginOptions = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User with this email not found' });

        if (!user.passkeys || user.passkeys.length === 0) {
            return res.status(400).json({ message: 'No passkeys registered for this user' });
        }

        const rpID = 'localhost';
        const options = await generateAuthenticationOptions({
            rpID,
            allowCredentials: user.passkeys.map(p => ({
                id: Buffer.from(p.credentialID, 'base64url'),
                type: 'public-key',
            })),
            userVerification: 'preferred',
        });

        user.currentChallenge = options.challenge;
        await user.save();

        res.json(options);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Passkey login - Step 2: Verification
exports.passkeyLoginVerify = async (req, res) => {
    try {
        const credentialIDBase64 = req.body.id;
        const user = await User.findOne({ 'passkeys.credentialID': credentialIDBase64 });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const passkey = user.passkeys.find(p => p.credentialID === credentialIDBase64);
        const rpID = 'localhost';
        const origin = 'http://localhost:4001';

        const verification = await verifyAuthenticationResponse({
            response: req.body,
            expectedChallenge: user.currentChallenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
            authenticator: {
                credentialID: Buffer.from(passkey.credentialID, 'base64url'),
                credentialPublicKey: Buffer.from(passkey.publicKey, 'base64url'),
                counter: passkey.counter,
            },
        });

        if (verification.verified) {
            passkey.counter = verification.authenticationInfo.newCounter;
            user.currentChallenge = undefined;
            await user.save();

            const token = generateToken(user._id, user.role);
            res.cookie('token', token, cookieOptions);
            res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, token });
        } else {
            res.status(400).json({ message: 'Passkey authentication failed' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
