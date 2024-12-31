import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl } from '../../App';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { Pagination } from 'react-bootstrap';

const MySwal = withReactContent(Swal);

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState({ name: '', description: '' });
    const [editingCategory, setEditingCategory] = useState(null);
    const [editedCategoryData, setEditedCategoryData] = useState({ name: '', description: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const [categoriesPerPage] = useState(10);

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${backendUrl}/admin/category`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
            });
            if (response.data.success) {
                setCategories(response.data.data);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error('Failed to fetch categories');
        }
    };

      // Add new category
      const handleAddCategory = async () => {
        if (categories.some((c) => c.name.toLowerCase() === newCategory.name.toLowerCase())) {
            toast.error('Category with this name already exists');
            return;
        }
        try {
       
const response = await axios.post(
    `${backendUrl}/admin/category`,  
    newCategory,
    { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } }
);

            if (response.data.success) {
                toast.success(response.data.message);
                fetchCategories();
                setNewCategory({ name: '', description: '' });
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error('Failed to add category');
        }
    };

    // Soft Delete category
    const handleDeleteCategory = async (id) => {
        const result = await MySwal.fire({
            title: 'Are you sure?',
            text: 'This will mark the category as deleted!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
        });

        if (result.isConfirmed) {
            try {
                const response = await axios.put(
                    `${backendUrl}/admin/category/${id}/delete`,
                    { isDeleted: true },
                    { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')} `} }
                );

                if (response.data.success) {
                    toast.success('Category marked as deleted');
                    fetchCategories();
                } else {
                    toast.error(response.data.message);
                }
            } catch (error) {
                toast.error('Failed to delete category');
            }
        }
    };

    // Restore category
    const handleRestoreCategory = async (id) => {
        const result = await MySwal.fire({
            title: 'Are you sure?',
            text: 'This will restore the deleted category!',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, restore it!',
            cancelButtonText: 'Cancel',
        });

        if (result.isConfirmed) {
            try {
                const response = await axios.put(
                    `${backendUrl}/admin/category/${id}/restore`,
                    { isDeleted: false },
                    { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')} `} }
                );
                if (response.data.success) {
                    toast.success('Category restored successfully');
                    fetchCategories();
                } else {
                    toast.error(response.data.message);
                }
            } catch (error) {
                toast.error('Failed to restore category');
            }
        }
    };

    // Edit category
    const handleEditCategory = async (id) => {
        try {
            const response = await axios.put(
                `${backendUrl}/admin/category/${id}`,
                editedCategoryData,
                { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')} `} }
            );
            if (response.data.success) {
                toast.success(response.data.message);
                fetchCategories();
                setEditingCategory(null);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error('Failed to update category');
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Pagination logic
    const indexOfLastCategory = currentPage * categoriesPerPage;
    const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
    const currentCategories = categories.slice(indexOfFirstCategory, indexOfLastCategory);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="container">
            <h3 className="my-4 text-center">Category Management</h3>

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
            <h4 className="mb-3">Categories</h4>
            <table className="table table-bordered table-striped">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentCategories.map((category, index) => (
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
                            <td>{category.isDeleted ? 'Deleted' : 'Active'}</td>
                            <td>
                                {editingCategory === category._id ? (
                                    <>
                                        <button className="btn btn-success me-2" onClick={() => handleEditCategory(category._id)}>
                                            Save
                                        </button>
                                        <button className="btn btn-secondary" onClick={() => setEditingCategory(null)}>
                                            Cancel
                                        </button>
                                    </>
                                ) : category.isDeleted ? (
                                    <button
                                        className="btn btn-info"
                                        onClick={() => handleRestoreCategory(category._id)}
                                    >
                                        Restore
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            className="btn btn-warning me-2"
                                            onClick={() => setEditingCategory(category._id)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn btn-danger"
                                            onClick={() => handleDeleteCategory(category._id)}
                                        >
                                            Delete
                                        </button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Pagination Controls */}
            <Pagination>
                {[...Array(Math.ceil(categories.length / categoriesPerPage))].map((_, index) => (
                    <Pagination.Item key={index + 1} active={index + 1 === currentPage} onClick={() => paginate(index + 1)}>
                        {index + 1}
                    </Pagination.Item>
                ))}
            </Pagination>
        </div>
    );
};

export default CategoryManagement;
