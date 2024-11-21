import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';

const List = () => {
    const [list, setList] = useState([]);

    // Fetch the list of products
    const fetchList = async () => {
        try {
            const response = await axios.get(`${backendUrl}/admin/products`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (response.data.success) {
                setList(response.data.products);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(
                error.response?.data?.message || 'Failed to fetch products'
            );
        }
    };

    // Remove a product
    const removeProduct = async (productId) => {
        try {
           
            const response = await axios.post(
                `${backendUrl}/admin/products/${productId}`,
                { productId },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            if (response.data.success) {
                toast.success(response.data.message);
                await fetchList(); // Refresh the list
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(
                error.response?.data?.message || 'Failed to remove product'
            );
        }
    };

    // Fetch products on component mount
    useEffect(() => {
        fetchList();
    }, []);

    return (
        <div className="container-fluid">
            <p className="mb-4 fs-4 text-center">All Product Lists</p>

            {/* Responsive Table */}
            <div className="table-responsive">
                {list.length > 0 ? (
                    <table className="table table-bordered table-hover">
                        <thead className="thead-dark">
                            <tr>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th className="text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {list.map((item, index) => (
                                <tr key={index}>
                                    <td>
                                        <img
                                            src={item.image[0]}
                                            alt={item.name}
                                            className="img-thumbnail"
                                            style={{
                                                width: '80px',
                                                height: '80px',
                                            }}
                                        />
                                    </td>
                                    <td>{item.name}</td>
                                    <td>{item.category}</td>
                                    <td>
                                        {currency}
                                        {item.price}
                                    </td>
                                    <td className="text-center">
                                        <button
                                            onClick={() =>
                                                removeProduct(item._id)
                                            }
                                            className="btn btn-danger btn-sm"
                                        >
                                            X
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-center text-muted">
                        No products available.
                    </p>
                )}
            </div>
        </div>
    );
};

export default List;
