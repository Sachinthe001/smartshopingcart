import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiSearch } from 'react-icons/fi';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const { addToCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleAddToCart = (productId) => {
        if (!user) {
            navigate('/login');
        } else {
            addToCart(productId);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [selectedCategory]);

    const fetchCategories = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/categories');
            setCategories(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchProducts = async () => {
        try {
            const url = selectedCategory 
                ? `http://localhost:5000/api/products?category=${selectedCategory}` 
                : 'http://localhost:5000/api/products';
            const res = await axios.get(url);
            setProducts(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="animate-fade-in">
            {/* Hero Section */}
            <div className="bg-emerald-600 text-white rounded-3xl p-10 mb-10 shadow-xl overflow-hidden relative">
                <div className="relative z-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Fresh Groceries to Your Door</h1>
                    <p className="text-emerald-100 text-lg mb-8 max-w-xl">Get the freshest vegetables, fruits, cakes, and more delivered straight to your home.</p>
                    
                    <div className="relative max-w-md">
                        <input 
                            type="text" 
                            placeholder="Search products..." 
                            className="w-full py-4 pl-12 pr-4 rounded-full text-gray-800 shadow-lg focus:outline-none focus:ring-4 focus:ring-emerald-300 transition"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <FiSearch className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    </div>
                </div>
                <div className="absolute right-0 top-0 w-1/3 h-full bg-emerald-500 rounded-l-full opacity-50 transform translate-x-1/4 scale-150 blur-3xl"></div>
            </div>

            {/* Categories */}
            <div className="mb-10 flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                <button 
                    onClick={() => setSelectedCategory('')}
                    className={`px-6 py-3 rounded-full font-medium whitespace-nowrap transition-all shadow-sm ${!selectedCategory ? 'bg-emerald-600 text-white shadow-emerald-200' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                    All Products
                </button>
                {categories.map(category => (
                    <button 
                        key={category._id}
                        onClick={() => setSelectedCategory(category._id)}
                        className={`px-6 py-3 rounded-full font-medium whitespace-nowrap transition-all shadow-sm ${selectedCategory === category._id ? 'bg-emerald-600 text-white shadow-emerald-200' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                        {category.name}
                    </button>
                ))}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {filteredProducts.map(product => (
                    <div key={product._id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
                        <div className="h-48 overflow-hidden relative bg-gray-100 flex items-center justify-center">
                            {product.image ? (
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                            ) : (
                                <span className="text-gray-400 font-medium">No Image</span>
                            )}
                        </div>
                        <div className="p-5">
                            <h3 className="text-xl font-bold text-gray-800 mb-1">{product.name}</h3>
                            <p className="text-sm text-emerald-600 font-medium mb-3">{product.category?.name}</p>
                            <div className="flex items-center justify-between mt-4">
                                <span className="text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
                                <button 
                                    onClick={() => handleAddToCart(product._id)}
                                    className="bg-emerald-100 text-emerald-700 p-3 rounded-full hover:bg-emerald-600 hover:text-white transition-colors"
                                >
                                    <FiShoppingCart className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {filteredProducts.length === 0 && (
                    <div className="col-span-full py-20 text-center text-gray-500">
                        <p className="text-xl">No products found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
