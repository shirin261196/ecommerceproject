import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState({ name: '', description: '' });
    const [editingCategory, setEditingCategory] = useState(null);
    const [editedCategoryData, setEditedCategoryData] = useState({ name: '', description: '' });

    // Fetch categories from the backend
    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${backendUrl}/admin/category`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            if (response.data.success) {
                setCategories(response.data.data);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error("Failed to fetch categories");
        }
    };

    // Add new category
    const handleAddCategory = async () => {
        try {
            const response = await axios.post(
                `${backendUrl}/admin/category`,
                newCategory,
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            if (response.data.success) {
                toast.success(response.data.message);
                fetchCategories(); // Refresh category list
                setNewCategory({ name: '', description: '' });
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error("Failed to add category");
        }
    };

    // Edit category
    const handleEditCategory = async () => {
        try {
            const response = await axios.put(
                `${backendUrl}admin/category/${editingCategory}`,
                editedCategoryData,
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            if (response.data.success) {
                toast.success(response.data.message);
                fetchCategories(); // Refresh category list
                setEditingCategory(null); // Exit editing mode
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error("Failed to update category");
        }
    };

    // Delete category
    const handleDeleteCategory = async (id) => {
        if (window.confirm("Are you sure you want to delete this category?")) {
            try {
                const response = await axios.delete(
                    `${backendUrl}/admin/category/${id}`,
                    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                );
                if (response.data.success) {
                    toast.success(response.data.message);
                    fetchCategories(); // Refresh category list
                } else {
                    toast.error(response.data.message);
                }
            } catch (error) {
                toast.error("Failed to delete category");
            }
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    return (
        <div className="container">
            <h3 className="my-4">Category Management</h3>

            {/* Add Category Form */}
            <div className="mb-4">
                <h4>Add Category</h4>
                <div className="row">
                    <div className="col-md-6">
                        <input
                            type="text"
                            className="form-control mb-2"
                            placeholder="Category Name"
                            value={newCategory.name}
                            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                        />
                    </div>
                    <div className="col-md-6">
                        <input
                            type="text"
                            className="form-control mb-2"
                            placeholder="Category Description"
                            value={newCategory.description}
                            onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                        />
                    </div>
                </div>
                <button className="btn btn-primary" onClick={handleAddCategory}>
                    Add Category
                </button>
            </div>

            {/* Categories List */}
            <table className="table table-bordered table-striped">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.map((category, index) => (
                        <tr key={category._id}>
                            <td>{index + 1}</td>
                            <td>
                                {editingCategory === category._id ? (
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={editedCategoryData.name}
                                        onChange={(e) =>
                                            setEditedCategoryData({ ...editedCategoryData, name: e.target.value })
                                        }
                                    />
                                ) : (
                                    category.name
                                )}
                            </td>
                            <td>
                                {editingCategory === category._id ? (
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={editedCategoryData.description}
                                        onChange={(e) =>
                                            setEditedCategoryData({
                                                ...editedCategoryData,
                                                description: e.target.value,
                                            })
                                        }
                                    />
                                ) : (
                                    category.description
                                )}
                            </td>
                            <td>
                                {editingCategory === category._id ? (
                                    <>
                                        <button className="btn btn-success me-2" onClick={handleEditCategory}>
                                            Save
                                        </button>
                                        <button className="btn btn-secondary" onClick={() => setEditingCategory(null)}>
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button className="btn btn-warning me-2" onClick={() => setEditingCategory(category._id)}>
                                            Edit
                                        </button>
                                        <button className="btn btn-danger" onClick={() => handleDeleteCategory(category._id)}>
                                            Delete
                                        </button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CategoryManagement;
