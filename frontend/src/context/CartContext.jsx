import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [cart, setCart] = useState([]);

    useEffect(() => {
        if (user) {
            fetchCart();
        } else {
            setCart([]);
        }
    }, [user]);

    const fetchCart = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/cart');
            setCart(res.data);
        } catch (err) {
            console.error('Error fetching cart', err);
        }
    };

    const addToCart = async (productId, quantity = 1) => {
        try {
            const res = await axios.post('http://localhost:5000/api/cart', { productId, quantity });
            setCart(res.data);
        } catch (err) {
            console.error('Error adding to cart', err);
        }
    };

    const updateQuantity = async (productId, quantity) => {
        try {
            const res = await axios.put(`http://localhost:5000/api/cart/${productId}`, { quantity });
            setCart(res.data);
        } catch (err) {
            console.error('Error updating cart', err);
        }
    };

    const removeFromCart = async (productId) => {
        try {
            const res = await axios.delete(`http://localhost:5000/api/cart/${productId}`);
            setCart(res.data);
        } catch (err) {
            console.error('Error removing from cart', err);
        }
    };

    const clearCart = async () => {
        try {
            const res = await axios.delete('http://localhost:5000/api/cart');
            setCart(res.data);
        } catch (err) {
            console.error('Error clearing cart', err);
        }
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => {
            if (item.product) {
                return total + (item.product.price * item.quantity);
            }
            return total;
        }, 0);
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart, getCartTotal }}>
            {children}
        </CartContext.Provider>
    );
};
