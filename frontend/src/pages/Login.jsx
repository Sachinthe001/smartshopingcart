import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FaGoogle, FaFacebook } from 'react-icons/fa';
import { FiKey } from 'react-icons/fi';
import axios from 'axios';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loadingProvider, setLoadingProvider] = useState(null);
    const [authConfig, setAuthConfig] = useState({ googleClientId: '', facebookAppId: '' });
    const { login, loginWithGoogle, loginWithFacebook, loginWithPasskey } = useContext(AuthContext);
    const navigate = useNavigate();

    // Load Google and Facebook auth config from backend
    useEffect(() => {
        axios.get('http://localhost:5000/api/auth/config')
            .then(res => setAuthConfig(res.data))
            .catch(() => {});
    }, []);

    // Load Google Identity Services SDK when clientId is available
    useEffect(() => {
        if (!authConfig.googleClientId || authConfig.googleClientId === 'your_google_client_id') return;
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
        return () => { document.head.removeChild(script); };
    }, [authConfig.googleClientId]);

    // Load Facebook SDK when appId is available
    useEffect(() => {
        if (!authConfig.facebookAppId || authConfig.facebookAppId === 'your_facebook_app_id') return;
        if (document.getElementById('facebook-jssdk')) return;
        window.fbAsyncInit = () => {
            window.FB.init({
                appId: authConfig.facebookAppId,
                cookie: true,
                xfbml: true,
                version: 'v19.0'
            });
        };
        const script = document.createElement('script');
        script.id = 'facebook-jssdk';
        script.src = 'https://connect.facebook.net/en_US/sdk.js';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
    }, [authConfig.facebookAppId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        setLoadingProvider('google');
        const hasRealConfig = authConfig.googleClientId && authConfig.googleClientId !== 'your_google_client_id';

        if (!hasRealConfig) {
            // No credentials yet — use mock
            try {
                await loginWithGoogle('mock', true);
                navigate('/');
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'Google login failed');
            } finally {
                setLoadingProvider(null);
            }
            return;
        }

        // Real Google OAuth flow using Google Identity Services
        try {
            await new Promise((resolve, reject) => {
                const client = window.google.accounts.oauth2.initTokenClient({
                    client_id: authConfig.googleClientId,
                    scope: 'openid email profile',
                    callback: async (tokenResponse) => {
                        if (tokenResponse.error) {
                            reject(new Error(tokenResponse.error));
                            return;
                        }
                        try {
                            await loginWithGoogle(tokenResponse.access_token, false);
                            resolve();
                        } catch (err) {
                            reject(err);
                        }
                    },
                });
                client.requestAccessToken({ prompt: 'select_account' });
            });
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Google login failed');
        } finally {
            setLoadingProvider(null);
        }
    };

    const handleFacebookLogin = async () => {
        setError('');
        setLoadingProvider('facebook');
        const hasRealConfig = authConfig.facebookAppId && authConfig.facebookAppId !== 'your_facebook_app_id';

        if (!hasRealConfig) {
            // No credentials yet — use mock
            try {
                await loginWithFacebook('mock', true);
                navigate('/');
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'Facebook login failed');
            } finally {
                setLoadingProvider(null);
            }
            return;
        }

        // Real Facebook OAuth flow
        try {
            await new Promise((resolve, reject) => {
                window.FB.login((response) => {
                    if (response.authResponse) {
                        loginWithFacebook(response.authResponse.accessToken, false)
                            .then(resolve)
                            .catch(reject);
                    } else {
                        reject(new Error('Facebook login was cancelled or failed'));
                    }
                }, { scope: 'public_profile,email' });
            });
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Facebook login failed');
        } finally {
            setLoadingProvider(null);
        }
    };

    const handlePasskeyLogin = async () => {
        setError('');
        let targetEmail = email;
        if (!targetEmail) {
            targetEmail = prompt('Enter your email registered with Passkey to sign in:');
            if (!targetEmail) return;
        }
        setLoadingProvider('passkey');
        try {
            await loginWithPasskey(targetEmail);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Passkey login failed');
        } finally {
            setLoadingProvider(null);
        }
    };

    const googleConfigured = authConfig.googleClientId && authConfig.googleClientId !== 'your_google_client_id';
    const facebookConfigured = authConfig.facebookAppId && authConfig.facebookAppId !== 'your_facebook_app_id';

    return (
        <div className="max-w-md mx-auto mt-10 bg-white p-8 border border-gray-100 rounded-2xl shadow-xl">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
                <p className="text-gray-500 mt-2">Sign in to your account</p>
            </div>

            {error && <div className="bg-rose-50 text-rose-500 p-3 rounded-lg mb-6 text-sm">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                        placeholder="john@example.com"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                        placeholder="••••••••"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-emerald-600 text-white p-3 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                    Sign In
                </button>
            </form>

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
            <div className="grid grid-cols-3 gap-3">
                {/* Google Button */}
                <button
                    onClick={handleGoogleLogin}
                    disabled={loadingProvider !== null}
                    className="flex justify-center items-center gap-2 p-3 border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-red-300 transition font-medium text-gray-700 disabled:opacity-60"
                    title="Sign in with Google"
                >
                    {loadingProvider === 'google' ? (
                        <span className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <FaGoogle className="text-red-500 w-5 h-5" />
                    )}
                    <span className="text-sm hidden sm:inline">
                        Google
                    </span>
                </button>

                {/* Facebook Button */}
                <button
                    onClick={handleFacebookLogin}
                    disabled={loadingProvider !== null}
                    className="flex justify-center items-center gap-2 p-3 border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-blue-300 transition font-medium text-gray-700 disabled:opacity-60"
                    title="Sign in with Facebook"
                >
                    {loadingProvider === 'facebook' ? (
                        <span className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <FaFacebook className="text-blue-600 w-5 h-5" />
                    )}
                    <span className="text-sm hidden sm:inline">
                        Facebook
                    </span>
                </button>

                {/* Passkey Button */}
                <button
                    onClick={handlePasskeyLogin}
                    disabled={loadingProvider !== null}
                    className="flex justify-center items-center gap-2 p-3 border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-amber-300 transition font-medium text-gray-700 disabled:opacity-60"
                    title="Sign in with Passkey"
                >
                    {loadingProvider === 'passkey' ? (
                        <span className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <FiKey className="text-amber-500 w-5 h-5" />
                    )}
                    <span className="text-sm hidden sm:inline">Passkey</span>
                </button>
            </div>

            <p className="mt-6 text-center text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="text-emerald-600 font-semibold hover:underline">Sign up</Link>
            </p>
        </div>
    );
};

export default Login;
