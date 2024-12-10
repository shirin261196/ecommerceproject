import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    name: '',
    price: '',
    stock: '',
    category: '',
    subcategory: '',
    description: '',
    sizes: [],
    date: '',
    bestseller: false,
    images: [],
  });

  const [categories, setCategories] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imageURLs, setImageURLs] = useState([]);
  const [cropIndex, setCropIndex] = useState(null); // Index of the image being cropped
  const cropperRef = useRef(null); // Reference for the Cropper instance

  // Initialize React Hook Form
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    // Fetch Product Details
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/admin/products/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
        });
        const data = response.data.product;
        setProduct({
          ...data,
          sizes: data.sizes || [],
          images: data.images || [],
        });

        // Set default values for the form
        setValue('name', data.name);
        setValue('price', data.price);
        setValue('stock', data.stock);
        setValue('category', data.category);
        setValue('subcategory', data.subcategory);
        setValue('description', data.description);
        setValue('sizes', data.sizes || []);
        setValue('date', data.date);
        setValue('bestseller', data.bestseller || false);
      } catch (error) {
        toast.error('Failed to load product details');
      }
    };
    fetchProduct();
  }, [id, setValue]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:4000/admin/category', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`, // Use appropriate storage for the token
          },
        });
        
        if (response.data && Array.isArray(response.data.data)) {
          setCategories(response.data.data);
        } else {
          throw new Error('Invalid category data format');
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setCategories([]); // Fallback to an empty array
        toast.error('Failed to fetch categories.');
      }
    };

    fetchCategories();
  }, []);


  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const fileURLs = files.map((file) => URL.createObjectURL(file));

    setImageFiles((prev) => [...prev, ...files]);
    setImageURLs((prev) => [...prev, ...fileURLs]);
  };
  const openCropper = (index) => {
    // Destroy any existing cropper instance before initializing a new one
    if (cropperRef.current) {
      cropperRef.current.destroy();
    }
  
    setCropIndex(index); // Set the index for the image to crop
  
    const cropperImageContainer = document.querySelectorAll('.uploaded-images img')[index];
    if (!cropperImageContainer) {
      console.error("Unable to find the image element for cropping.");
      return;
    }
  
    // Initialize a new Cropper instance
    cropperRef.current = new Cropper(cropperImageContainer, {
      aspectRatio: 1,
      viewMode: 2,
      autoCropArea: 0.8,
    });
  };
  

  const handleCrop = () => {
    if (cropperRef.current) {
      const croppedCanvas = cropperRef.current.getCroppedCanvas();
      croppedCanvas.toBlob((blob) => {
        const croppedFile = new File([blob], `cropped_${imageFiles[cropIndex].name}`, {
          type: imageFiles[cropIndex].type,
        });
        const updatedFiles = [...imageFiles];
        updatedFiles[cropIndex] = croppedFile;
        setImageFiles(updatedFiles);
  
        // Update the URL for preview
        const updatedURLs = [...imageURLs];
        updatedURLs[cropIndex] = URL.createObjectURL(croppedFile);
        setImageURLs(updatedURLs);
  
        // Destroy cropper instance and reset cropIndex
        cropperRef.current.destroy();
        cropperRef.current = null; // Reset the ref
        setCropIndex(null);
      });
    }
  };

  const handleRemoveImage = (index) => {
    const imageToRemove = product.images[index];
    console.log('Removing image:', imageToRemove);

    // Only attempt to delete cloud images
    if (imageToRemove?.public_id) {
      console.log('Cloud image found. Attempting deletion...');
      axios
        .post(
          'http://localhost:4000/admin/products/delete-image',
          { public_id: imageToRemove.public_id },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }
        )
        .then(() => {
          toast.success('Image removed successfully');
          const updatedFiles = imageFiles.filter((_, i) => i !== index);
          const updatedURLs = imageURLs.filter((_, i) => i !== index);
          setImageFiles(updatedFiles);
          setImageURLs(updatedURLs);
        })
        .catch((err) => {
          console.error('Error removing image:', err);
          toast.error('Failed to remove image');
        });
    } else {
      // Handle local image removal

      const updatedFiles = imageFiles.filter((_, i) => i !== index);
      const updatedURLs = imageURLs.filter((_, i) => i !== index);
      setImageFiles(updatedFiles);
      setImageURLs(updatedURLs);
      toast.success('Image removed');
    }
  };

  const onSubmit = async (data) => {
    const formData = new FormData();

    // Add form fields
    Object.keys(data).forEach((key) => {
      formData.append(key, Array.isArray(data[key]) ? JSON.stringify(data[key]) : data[key]);
    });

    // Add new cropped images
    imageFiles.forEach((file) => formData.append('images', file));

    // Add existing images
    product.images.forEach((img) => formData.append('existingImages', img.public_id));

    try {
      const response = await axios.put(`http://localhost:4000/admin/products/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.data.success) {
        toast.success('Product updated successfully.');
        navigate('/admin/products/list');
      } else {
        toast.error(response.data.message);
      }
    } catch {
      toast.error('Failed to update product.');
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Edit Product</h2>
      <form onSubmit={handleSubmit(onSubmit)}>

        <div className="mb-3">
          <label className="form-label">Name</label>
          <input
            type="text"
            className="form-control"
            {...register('name', { required: 'Name is required' })}
          />
          {errors.name && <p className="text-danger">{errors.name.message}</p>}
        </div>

        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            {...register('description', { required: 'Description is required' })}
          />
          {errors.description && <p className="text-danger">{errors.description.message}</p>}
        </div>

        <div className="mb-3">
          <label className="form-label">Price</label>
          <input
            type="number"
            className="form-control"
            {...register('price', { required: 'Price is required' })}
          />
          {errors.price && <p className="text-danger">{errors.price.message}</p>}
        </div>

        <div className="mb-3">
          <label className="form-label">Stock</label>
          <input
            type="number"
            className="form-control"
            {...register('stock', { required: 'Stock is required' })}
          />
          {errors.stock && <p className="text-danger">{errors.stock.message}</p>}
        </div>

        <div className="col-md-6">
            <label>Category</label>
            <select
  className="form-select"
  {...register('category', { required: 'Category is required' })}
>
  <option value="">Select Category</option>
  {Array.isArray(categories) &&
    categories.map((category) => (
      <option key={category._id} value={category.name}>
        {category.name}
      </option>
    ))}
</select>

            {errors.category && <small className="text-danger">{errors.category.message}</small>}
          </div>
        <div className="mb-3">
          <label className="form-label">Sizes</label>
          <input
            type="text"
            className="form-control"
            {...register('sizes')}
            placeholder="Comma-separated sizes"
          />
        </div>

        <div className="mb-3 form-check">
          <input
            type="checkbox"
            className="form-check-input"
            {...register('bestseller')}
          />
          <label className="form-check-label">BestSeller</label>
        </div>

        <div className="mb-3">
          <label className="form-label">Date</label>
          <input
            type="date"
            className="form-control"
            {...register('date')}
          />
        </div>
 {/* Display Existing Images */}
 <div className="mb-4">
          <h4>Existing Images</h4>
          <div className="d-flex flex-wrap">
            {product.images.map((img, index) => (
              <div key={index} className="position-relative">
                <img
                  src={img.url}
                  alt={`Existing Image ${index + 1}`}
                  className="img-thumbnail"
                  style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                />
                <button
                  type="button"
                  className="btn btn-danger btn-sm position-absolute top-0 end-0"
                  onClick={() => handleRemoveImage(index)}
                >
                  X
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Upload New Images */}
        <div className="mb-3">
          <input
            type="file"
            className="form-control"
            multiple
            onChange={handleImageChange}
          />
        </div>

       {/* Crop Options after Uploading New Images */}
       <div className="mt-3 uploaded-images">
  {imageURLs.map((url, index) => (
    <div key={index} className="position-relative">
      <img
        src={url}
        alt={`Uploaded Image ${index + 1}`}
        className="img-thumbnail"
        style={{ width: '150px', height: '150px', objectFit: 'cover' }}
        onClick={() => openCropper(index)}
      />
      <button
        type="button"
        className="btn btn-danger btn-sm position-absolute top-0 end-0"
        onClick={() => handleRemoveImage(index)}
      >
        X
      </button>
    </div>
  ))}
</div>


        {cropIndex !== null && (
          <div className="text-center mt-3">
            <button type="button" className="btn btn-success" onClick={handleCrop}>
              Crop Image
            </button>
          </div>
        )}

        {/* Submit Button */}
        <div className="text-center mt-4">
          <button type="submit" className="btn btn-primary">Save Changes</button>
        </div>

      </form>
    </div>
  );
};
export default EditProduct;
