import React, { useState } from 'react';
import { assets } from '../assets/assets.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import { backendUrl } from '../App.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';

const Add = () => {
    const [image1, setImage1] = useState(null)
    const [image2, setImage2] = useState(null)
    const [image3, setImage3] = useState(null)

    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [price, setPrice] = useState("")
    const [category, setCategory] = useState("Boys")
    const [subCategory, setSubCategory] = useState("Sets")
    const [stock, setStock] = useState("")
    const [bestseller, setBestseller] = useState(false)
    const [sizes, setSizes] = useState([])
    console.log(`${backendUrl}`);
    const onSubmitHandler = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData()
            formData.append("name", name)
            formData.append("description", description)
            formData.append("price", price)
            formData.append("stock", stock)
            formData.append("category", category)
            formData.append("subCategory", subCategory)
            formData.append("bestseller", bestseller)
            formData.append("sizes", JSON.stringify(sizes))

            if (image1) formData.append("image1", image1);
            if (image2) formData.append("image2", image2);
            if (image3) formData.append("image3", image3);
            console.log(`${backendUrl}`);
            const response = await axios.post(`${backendUrl}/admin/products`, formData,{ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
           if(response.data.success){
            toast.success(response.data.messsage);
            setName('')
            setDescription('')
            setImage1 (null)
            setImage2 (null)
            setImage3 (null)
            setPrice('')

           }else{
            toast.error(response.data.message)

           }

        } catch (error) {
            console.log(error)
            toast.error(error.message)

        }
    }

    return (
        <div className="container-fluid">
            <div className="card shadow-sm mx-auto" style={{ maxWidth: '600px' }}>
                <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">Add Product</h5>
                </div>
                <div className="card-body">
                    <form onSubmit={onSubmitHandler}>
                        {/* Image Upload Section */}
                        <div className="mb-4">
                            <label className="form-label fw-bold">Upload Images</label>
                            <div className="d-flex gap-3">
                                {[1, 2, 3].map((num) => (
                                    <div key={num} className="d-inline-block">
                                        <label htmlFor={`image${num}`} className="d-inline-block" tabIndex="0">
                                            <img
                                                className="img-thumbnail"
                                                style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                                                src={
                                                    num === 1 && image1
                                                        ? URL.createObjectURL(image1)
                                                        : num === 2 && image2
                                                            ? URL.createObjectURL(image2)
                                                            : num === 3 && image3
                                                                ? URL.createObjectURL(image3)
                                                                : assets.upload_area
                                                }
                                                alt="Upload preview"
                                            />
                                        </label>
                                        <input
                                            type="file"
                                            id={`image${num}`}
                                            hidden
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {  // Check if a file is selected
                                                    if (num === 1) setImage1(file);
                                                    if (num === 2) setImage2(file);
                                                    if (num === 3) setImage3(file);
                                                }
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>


                        {/* Product Name */}
                        <div className="mb-3">
                            <label htmlFor="productName" className="form-label fw-bold">
                                Product Name
                            </label>
                            <input onChange={(e) => setName(e.target.value)} value={name}
                                type="text"
                                className="form-control"
                                id="productName"
                                placeholder="Enter product name"
                                required
                            />
                        </div>

                        {/* Product Description */}
                        <div className="mb-3">
                            <label htmlFor="productDescription" className="form-label fw-bold">
                                Product Description
                            </label>
                            <textarea onChange={(e) => setDescription(e.target.value)} value={description}
                                className="form-control"
                                id="productDescription"
                                rows="3"
                                placeholder="Enter product description"
                                required
                            ></textarea>
                        </div>

                        {/* Product Details */}
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label htmlFor="productCategory" className="form-label fw-bold">
                                    Product Category
                                </label>
                                <select onChange={(e) => setCategory(e.target.value)} value={category} className="form-select" id="productCategory">
                                    <option value="Boys">Boys</option>
                                    <option value="Girls">Girls</option>
                                </select>
                            </div>
                            <div className="col-md-6 mb-3">
                                <label htmlFor="subCategory" className="form-label fw-bold">
                                    Sub Category
                                </label>
                                <select onChange={(e) => setSubCategory(e.target.value)} value={subCategory} className="form-select" id="subCategory">
                                    <option value="Sets">Sets</option>
                                    <option value="Partywear">Partywear</option>
                                </select>
                            </div>
                            <div className="col-md-6 mb-3">
                                <label htmlFor="price" className="form-label fw-bold">
                                    Product Price
                                </label>
                                <input onChange={(e) => setPrice(e.target.value)} value={price}
                                    type="number"
                                    className="form-control"
                                    id="price"
                                    placeholder="Enter price"
                                />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label htmlFor="stock" className="form-label fw-bold">
                                    Stock
                                </label>
                                <input onChange={(e) => setStock(e.target.value)} value={stock}
                                    type="number"
                                    className="form-control"
                                    id="stock"
                                    placeholder="Enter stock quantity"
                                />
                            </div>
                        </div>

                        {/* Product Sizes */}
                        <div className="mb-4">
                            <label className="form-label fw-bold">Product Sizes</label>
                            <div className="d-flex flex-wrap gap-2">
                                {['1-2 Y', '2-3 Y', '3-4 Y', '4-5 Y'].map((size) => (
                                    <span
                                        key={size}
                                        className={`badge p-2 text-uppercase ${sizes.includes(size) ? 'bg-primary text-white' : 'bg-secondary'}`}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() =>
                                            setSizes((prev) =>
                                                prev.includes(size) ? prev.filter((item) => item !== size) : [...prev, size]
                                            )
                                        }>
                                        {size}
                                    </span>
                                ))}
                            </div>
                        </div>



                        {/* Bestseller Checkbox */}
                        <div className="form-check mb-4">
                            <input onChange={() => setBestseller(prev => !prev)} checked={bestseller}
                                type="checkbox"
                                className="form-check-input"
                                id="bestseller"
                            />
                            <label className="form-check-label fw-bold" htmlFor="bestseller">
                                Add to Bestseller
                            </label>
                        </div>

                        {/* Submit Button */}
                        <div className="text-end">
                            <button type="submit" className="btn btn-primary px-4">
                                Add Product
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Add;
