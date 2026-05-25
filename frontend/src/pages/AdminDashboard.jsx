import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiEdit2, FiTrash2, FiUploadCloud, FiX } from 'react-icons/fi';

const AdminDashboard = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);

    // Forms state
    const [productForm, setProductForm] = useState({ name: '', price: '', description: '', image: '', category: '' });
    const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
    const [editCategoryForm, setEditCategoryForm] = useState({ id: '', name: '', description: '' });
    const [isDragging, setIsDragging] = useState(false);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProductForm(prev => ({ ...prev, image: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProductForm(prev => ({ ...prev, image: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setProductForm(prev => ({ ...prev, image: '' }));
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        const res = await axios.get('http://localhost:5000/api/products');
        setProducts(res.data);
    };

    const fetchCategories = async () => {
        const res = await axios.get('http://localhost:5000/api/categories');
        setCategories(res.data);
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/products', productForm);
            setIsProductModalOpen(false);
            setProductForm({ name: '', price: '', description: '', image: '', category: '' });
            fetchProducts();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || err.message || 'Failed to add product');
        }
    };

    const handleDeleteProduct = async (id) => {
        if (window.confirm('Are you sure?')) {
            try {
                await axios.delete(`http://localhost:5000/api/products/${id}`);
                fetchProducts();
            } catch (err) {
                console.error(err);
                alert(err.response?.data?.message || err.message || 'Failed to delete product');
            }
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/categories', categoryForm);
            setIsCategoryModalOpen(false);
            setCategoryForm({ name: '', description: '' });
            fetchCategories();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || err.message || 'Failed to add category');
        }
    };

    const handleDeleteCategory = async (id) => {
        if (window.confirm('Are you sure?')) {
            try {
                await axios.delete(`http://localhost:5000/api/categories/${id}`);
                fetchCategories();
            } catch (err) {
                console.error(err);
                alert(err.response?.data?.message || err.message || 'Failed to delete category');
            }
        }
    };

    const handleEditCategoryClick = (category) => {
        setEditCategoryForm({ id: category._id, name: category.name, description: category.description || '' });
        setIsEditCategoryModalOpen(true);
    };

    const handleUpdateCategory = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:5000/api/categories/${editCategoryForm.id}`, {
                name: editCategoryForm.name,
                description: editCategoryForm.description
            });
            setIsEditCategoryModalOpen(false);
            fetchCategories();
            fetchProducts();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || err.message || 'Failed to update category');
        }
    };

    return (
        <div className="animate-fade-in max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {/* Products Management */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-800">Products</h2>
                        <button
                            onClick={() => setIsProductModalOpen(true)}
                            className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-emerald-200 transition"
                        >
                            <FiPlus /> Add Product
                        </button>
                    </div>

                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {products.map(p => (
                            <div key={p._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                                <div>
                                    <p className="font-bold text-gray-800">{p.name}</p>
                                    <p className="text-sm text-gray-500">${p.price} - {p.category?.name}</p>
                                </div>
                                <button
                                    onClick={() => handleDeleteProduct(p._id)}
                                    className="p-2 text-rose-500 hover:bg-rose-100 rounded-lg transition"
                                >
                                    <FiTrash2 />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Categories Management */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-800">Categories</h2>
                        <button
                            onClick={() => setIsCategoryModalOpen(true)}
                            className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-200 transition"
                        >
                            <FiPlus /> Add Category
                        </button>
                    </div>

                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {categories.map(c => (
                            <div key={c._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                                <div>
                                    <p className="font-bold text-gray-800">{c.name}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEditCategoryClick(c)}
                                        className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition"
                                    >
                                        <FiEdit2 />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCategory(c._id)}
                                        className="p-2 text-rose-500 hover:bg-rose-100 rounded-lg transition"
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modals - Simplified for now */}
            {isProductModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-8 rounded-2xl w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-6">Add New Product</h2>
                        <form onSubmit={handleAddProduct} className="space-y-4">
                            <input type="text" placeholder="Product Name" required className="w-full p-3 border rounded-xl" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} />
                            <input type="number" placeholder="Price" required className="w-full p-3 border rounded-xl" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} />
                            <select required className="w-full p-3 border rounded-xl" value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })}>
                                <option value="">Select Category</option>
                                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>
                            {/* Drag-and-drop Image Upload */}
                            <div className="w-full">
                                {productForm.image ? (
                                    <div className="relative rounded-xl overflow-hidden border border-gray-200 aspect-video group">
                                        <img src={productForm.image} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="absolute top-2 right-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-2 transition shadow-md duration-200 hover:scale-110"
                                            title="Remove Image"
                                        >
                                            <FiX className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        onClick={() => document.getElementById('product-image-file').click()}
                                        className={`w-full p-6 border-2 border-dashed rounded-xl text-center cursor-pointer transition duration-200 flex flex-col items-center justify-center gap-2 ${
                                            isDragging 
                                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                                                : 'border-gray-300 hover:border-emerald-500 hover:bg-gray-50 text-gray-500'
                                        }`}
                                    >
                                        <FiUploadCloud className={`w-8 h-8 transition-colors ${isDragging ? 'text-emerald-600' : 'text-gray-400'}`} />
                                        <div>
                                            <p className="font-bold text-sm">Drag & drop image here</p>
                                            <p className="text-xs text-gray-400 mt-1">or click to browse from device</p>
                                        </div>
                                        <p className="text-[10px] text-gray-400">Supports PNG, JPG, JPEG (Max 10MB)</p>
                                        <input
                                            type="file"
                                            id="product-image-file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageChange}
                                        />
                                    </div>
                                )}
                            </div>
                            <textarea placeholder="Description" className="w-full p-3 border rounded-xl" value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })}></textarea>

                            <div className="flex justify-end gap-4 mt-6">
                                <button type="button" onClick={() => setIsProductModalOpen(false)} className="px-5 py-2 text-gray-500 hover:bg-gray-100 rounded-xl font-medium">Cancel</button>
                                <button type="submit" className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700">Save Product</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isCategoryModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-8 rounded-2xl w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-6">Add New Category</h2>
                        <form onSubmit={handleAddCategory} className="space-y-4">
                            <input type="text" placeholder="Category Name" required className="w-full p-3 border rounded-xl" value={categoryForm.name} onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })} />
                            <textarea placeholder="Description" className="w-full p-3 border rounded-xl" value={categoryForm.description} onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })}></textarea>

                            <div className="flex justify-end gap-4 mt-6">
                                <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="px-5 py-2 text-gray-500 hover:bg-gray-100 rounded-xl font-medium">Cancel</button>
                                <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700">Save Category</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isEditCategoryModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-8 rounded-2xl w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-6">Edit Category</h2>
                        <form onSubmit={handleUpdateCategory} className="space-y-4">
                            <input type="text" placeholder="Category Name" required className="w-full p-3 border rounded-xl" value={editCategoryForm.name} onChange={e => setEditCategoryForm({ ...editCategoryForm, name: e.target.value })} />
                            <textarea placeholder="Description" className="w-full p-3 border rounded-xl" value={editCategoryForm.description} onChange={e => setEditCategoryForm({ ...editCategoryForm, description: e.target.value })}></textarea>

                            <div className="flex justify-end gap-4 mt-6">
                                <button type="button" onClick={() => setIsEditCategoryModalOpen(false)} className="px-5 py-2 text-gray-500 hover:bg-gray-100 rounded-xl font-medium">Cancel</button>
                                <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700">Update Category</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
