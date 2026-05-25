const User = require('../models/User');

exports.getCart = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('cart.product');
        res.json(user.cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const user = await User.findById(req.user.id);

        const itemIndex = user.cart.findIndex(p => p.product && p.product.toString() === productId);

        if (itemIndex > -1) {
            user.cart[itemIndex].quantity += quantity || 1;
        } else {
            user.cart.push({ product: productId, quantity: quantity || 1 });
        }

        await user.save();
        const updatedUser = await User.findById(req.user.id).populate('cart.product');
        res.json(updatedUser.cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateCartItem = async (req, res) => {
    try {
        const { quantity } = req.body;
        const user = await User.findById(req.user.id);

        const itemIndex = user.cart.findIndex(p => p.product && p.product.toString() === req.params.productId);

        if (itemIndex > -1) {
            user.cart[itemIndex].quantity = quantity;
            await user.save();
            const updatedUser = await User.findById(req.user.id).populate('cart.product');
            res.json(updatedUser.cart);
        } else {
            res.status(404).json({ message: 'Item not in cart' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.removeFromCart = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        user.cart = user.cart.filter(p => p.product && p.product.toString() !== req.params.productId);

        await user.save();
        const updatedUser = await User.findById(req.user.id).populate('cart.product');
        res.json(updatedUser.cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.clearCart = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.cart = [];
        await user.save();
        res.json([]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
