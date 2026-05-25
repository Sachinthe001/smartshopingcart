import { useContext, useState } from 'react';
import { CartContext } from '../context/CartContext';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Cart = () => {
    const { cart, updateQuantity, removeFromCart, clearCart, getCartTotal } = useContext(CartContext);
    const [checkoutSuccess, setCheckoutSuccess] = useState(false);

    const handleCheckout = async () => {
        try {
            await clearCart();
            setCheckoutSuccess(true);
        } catch (err) {
            console.error('Error during checkout:', err);
        }
    };

    if (checkoutSuccess) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
                <div className="bg-emerald-100 p-8 rounded-full mb-6">
                    <svg className="w-16 h-16 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Order Placed Successfully!</h2>
                <p className="text-gray-500 mb-8">Thank you for shopping with FreshCart. Your order will be delivered soon.</p>
                <Link to="/" className="bg-emerald-600 text-white px-8 py-3 rounded-full font-bold hover:bg-emerald-700 transition shadow-lg hover:shadow-xl">
                    Back to Home
                </Link>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
                <div className="bg-gray-100 p-8 rounded-full mb-6">
                    <FiShoppingBag className="w-16 h-16 text-gray-400" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
                <p className="text-gray-500 mb-8">Looks like you haven't added any items yet.</p>
                <Link to="/" className="bg-emerald-600 text-white px-8 py-3 rounded-full font-bold hover:bg-emerald-700 transition shadow-lg hover:shadow-xl">
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Shopping Cart</h1>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 md:p-8">
                    {cart.map(item => item.product && (
                        <div key={item.product._id} className="flex flex-col md:flex-row items-center justify-between py-6 border-b border-gray-100 last:border-0 gap-6">
                            <div className="flex items-center gap-6 w-full md:w-auto">
                                <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                                    {item.product.image ? (
                                        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No img</div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-1">{item.product.name}</h3>
                                    <p className="text-emerald-600 font-semibold">${item.product.price.toFixed(2)}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between w-full md:w-auto gap-8">
                                <div className="flex items-center bg-gray-50 rounded-full border border-gray-200">
                                    <button 
                                        onClick={() => updateQuantity(item.product._id, Math.max(1, item.quantity - 1))}
                                        className="p-2 text-gray-500 hover:text-emerald-600 transition"
                                    >
                                        <FiMinus />
                                    </button>
                                    <span className="w-10 text-center font-semibold text-gray-700">{item.quantity}</span>
                                    <button 
                                        onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                                        className="p-2 text-gray-500 hover:text-emerald-600 transition"
                                    >
                                        <FiPlus />
                                    </button>
                                </div>
                                
                                <div className="text-lg font-bold text-gray-800 w-24 text-right">
                                    ${(item.product.price * item.quantity).toFixed(2)}
                                </div>
                                
                                <button 
                                    onClick={() => removeFromCart(item.product._id)}
                                    className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition"
                                >
                                    <FiTrash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="bg-gray-50 p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-gray-100">
                    <div>
                        <p className="text-gray-500 text-sm mb-1">Total Amount</p>
                        <h2 className="text-3xl font-bold text-gray-900">${getCartTotal().toFixed(2)}</h2>
                    </div>
                    <button 
                        onClick={handleCheckout}
                        className="w-full md:w-auto bg-emerald-600 text-white px-10 py-4 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg hover:shadow-xl"
                    >
                        Proceed to Checkout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cart;
