import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { backendUrl, currency } from '../../App';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';



const List = () => {
  const [list, setList] = useState([]);
  const navigate = useNavigate();

  // Fetch the list of products
  const fetchList = async () => {
    try {
      const response = await axios.get(`${backendUrl}/admin/products/list`, {
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
  const removeProduct = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('You are not logged in. Please log in again.');
      return;
    }
    const result = await Swal.fire({
      title: 'Are you sure want to delete it?',
      text: "You won't be able to undo this action!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    });
    if (result.isConfirmed){
    try {
      const response = await axios.delete(`${backendUrl}/admin/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.data.success) {
        toast.success(response.data.message);
        fetchList(); // Refresh the list
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || 'Failed to delete product'
      );
    }
  }
  };
  

  const restoreProduct = async (id) => {

    const result = await Swal.fire({
      title: 'Are you sure want to restore it?',
      text: "You won't be able to undo this action!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, restore it!',
    });
    if (result.isConfirmed){
    try {
      const response = await axios.put(
        `${backendUrl}/admin/products/restore/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);

        fetchList(); // Refresh the list
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || 'Failed to restore product'
      );
    }}
  };


  // Handle editing a product
  // Correct navigation in List.jsx
  const handleEdit = (id) => {
    if (id) {
      navigate(`/admin/products/edit/${id}`); // Add product ID in the URL
    } else {
      toast.error('Product ID is missing');
    }
  };







  // Fetch products on component mount
  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className="container my-4">
      <h2 className="text-center mb-4">Product List</h2>

      <div className="table-responsive">
        {list.length > 0 ? (
          <table className="table table-bordered table-hover">
            <thead className="thead-dark">
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((item, index) => (
                <tr key={index}>
                  <td>
                    <img
                      src={item.images?.[0]?.url || '/path/to/default-image.jpg'}
                      alt={item.name}
                      className="img-thumbnail"
                      style={{
                        width: '80px',
                        height: '80px',
                        objectFit: 'cover',
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
      {item.deleted ? (
        <button
          onClick={() => restoreProduct(item._id)}
          className="btn btn-success btn-sm mx-1"
        >
          🔄 Restore
        </button>
      ) : (
        <>
          <button
            onClick={() => handleEdit(item._id)}
            className="btn btn-warning btn-sm mx-1"
          >
            ✏️
          </button>
          <button
            onClick={() => removeProduct(item._id)}
            className="btn btn-danger btn-sm mx-1"
          >
            ❌
          </button>
        </>
      )}
    </td>

                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-muted">
            No products available. Please add some products.
          </p>
        )}
      </div>
    </div>
  );
};

export default List;
