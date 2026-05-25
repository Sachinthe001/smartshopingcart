import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { FiShoppingCart, FiUser, FiLogOut, FiSettings, FiKey } from 'react-icons/fi';
import axios from 'axios';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { cart } = useContext(CartContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleRegisterPasskey = async () => {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/passkey/register-options');
            const options = res.data;

            const { startRegistration } = await import('@simplewebauthn/browser');
            const regResponse = await startRegistration({ optionsJSON: options });

            const verifyRes = await axios.post('http://localhost:5000/api/auth/passkey/register-verify', regResponse);
            if (verifyRes.data?.verified) {
                alert('Passkey registered successfully! You can now log in using this Passkey.');
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || err.message || 'Failed to register passkey');
        }
    };

    const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="text-2xl font-bold text-emerald-600 tracking-wider">
                        FreshCart
                    </Link>
                    
                    <div className="flex items-center space-x-6">
                        {user ? (
                            <>
                                {user.role === 'admin' && (
                                    <Link to="/admin" className="text-gray-600 hover:text-emerald-600 transition flex items-center gap-1">
                                        <FiSettings /> Admin
                                    </Link>
                                )}
                                
                                <Link to="/cart" className="relative text-gray-600 hover:text-emerald-600 transition">
                                    <FiShoppingCart className="w-6 h-6" />
                                    {cartItemCount > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                            {cartItemCount}
                                        </span>
                                    )}
                                </Link>

                                <div className="flex items-center gap-3 border-l pl-4 ml-2 border-gray-200">
                                    <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                        <FiUser /> {user.name}
                                    </span>
                                    <button 
                                        onClick={handleRegisterPasskey}
                                        className="text-gray-500 hover:text-emerald-600 transition flex items-center gap-1 text-sm"
                                        title="Register Passkey"
                                    >
                                        <FiKey className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={handleLogout}
                                        className="text-gray-500 hover:text-rose-600 transition flex items-center gap-1 text-sm"
                                        title="Logout"
                                    >
                                        <FiLogOut className="w-4 h-4" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex space-x-4">
                                <Link to="/login" className="text-gray-600 hover:text-emerald-600 font-medium transition">
                                    Login
                                </Link>
                                <Link to="/register" className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition shadow-sm hover:shadow">
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
