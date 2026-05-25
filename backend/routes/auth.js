const express = require('express');
const router = express.Router();
const { 
    register, 
    login, 
    logout, 
    getProfile,
    getAuthConfig,
    googleLogin,
    facebookLogin,
    passkeyRegisterOptions,
    passkeyRegisterVerify,
    passkeyLoginOptions,
    passkeyLoginVerify
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/profile', protect, getProfile);
router.get('/config', getAuthConfig);

router.post('/google', googleLogin);
router.post('/facebook', facebookLogin);
router.post('/passkey/register-options', protect, passkeyRegisterOptions);
router.post('/passkey/register-verify', protect, passkeyRegisterVerify);
router.post('/passkey/login-options', passkeyLoginOptions);
router.post('/passkey/login-verify', passkeyLoginVerify);

module.exports = router;
