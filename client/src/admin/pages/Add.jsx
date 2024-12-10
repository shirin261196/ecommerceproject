import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import { toast } from 'react-toastify';
import { useForm, Controller } from 'react-hook-form';
import 'bootstrap/dist/css/bootstrap.min.css';

const AddProduct = () => {
  const [categories, setCategories] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imageURLs, setImageURLs] = useState([]);
  const cropperRefs = useRef([]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      category: '',
      price: '',
      stock: '',
      sizes: [],
      bestseller: false,
      date: '',
    },
  });

    // Fetch categories
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
    const newImageURLs = [...imageURLs, ...files.map((file) => URL.createObjectURL(file))];
    const newImageFiles = [...imageFiles, ...files];

    setImageURLs(newImageURLs);
    setImageFiles(newImageFiles);
  };

  const handleRemoveImage = (index) => {
    const updatedImageFiles = [...imageFiles];
    const updatedImageURLs = [...imageURLs];
    const updatedCropperRefs = [...cropperRefs.current];
  
    // Remove the respective elements
    updatedImageFiles.splice(index, 1);
    updatedImageURLs.splice(index, 1);
    updatedCropperRefs.splice(index, 1);
  
    setImageFiles(updatedImageFiles);
    setImageURLs(updatedImageURLs);
    cropperRefs.current = updatedCropperRefs; // Update cropperRefs to stay in sync
  };
  

  useEffect(() => {
    imageURLs.forEach((url, index) => {
      const imageElement = cropperRefs.current[index];
      if (imageElement && !imageElement.cropper) {
        cropperRefs.current[index] = new Cropper(imageElement, {
          aspectRatio: 1,
          viewMode: 1,
          autoCropArea: 0.8,
        });
      }
    });

    return () => {
      cropperRefs.current.forEach((cropper) => {
        if (cropper instanceof Cropper) {
          cropper.destroy();
        }
      });
    };
  }, [imageURLs]);

  const handleCrop = (index) => {
    const cropper = cropperRefs.current[index];
    if (cropper instanceof Cropper) {
      cropper.getCroppedCanvas().toBlob((blob) => {
        const croppedFile = new File([blob], `cropped_${imageFiles[index].name}`, {
          type: imageFiles[index].type,
        });
        const updatedFiles = [...imageFiles];
        updatedFiles[index] = croppedFile;
        setImageFiles(updatedFiles);
      });
    }
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (key === 'sizes') {
        formData.append(key, JSON.stringify(data[key]));
      } else {
        formData.append(key, data[key]);
      }
    });

    imageFiles.forEach((file, index) => {
      formData.append(`image${index + 1}`, file);
    });

    try {
      const response = await axios.post('http://localhost:4000/admin/products/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.message === 'Product added successfully') {
        toast.success(response.data.message);
        reset(); // Reset the form
        setImageFiles([]);
        setImageURLs([]);
      } else {
        toast.error('Failed to add product.');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while adding the product.');
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center">Add Product</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row g-3">
          <div className="col-md-6">
            <label>Product Name</label>
            <input
              type="text"
              className="form-control"
              {...register('name', { required: 'Product name is required' })}
            />
            {errors.name && <small className="text-danger">{errors.name.message}</small>}
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
          <div className="col-md-12">
            <label>Description</label>
            <textarea
              className="form-control"
              {...register('description', { required: 'Description is required' })}
            />
            {errors.description && (
              <small className="text-danger">{errors.description.message}</small>
            )}
          </div>
    
          <div className="col-md-6">
            <label>Price</label>
            <input
              type="number"
              className="form-control"
              {...register('price', {
                required: 'Price is required',
                valueAsNumber: true,
                min: { value: 1, message: 'Price must be greater than 0' },
              })}
            />
            {errors.price && <small className="text-danger">{errors.price.message}</small>}
          </div>
          <div className="col-md-6">
            <label>Stock</label>
            <input
              type="number"
              className="form-control"
              {...register('stock', {
                required: 'Stock is required',
                valueAsNumber: true,
                min: { value: 0, message: 'Stock must be greater than 0' },
              })}
            />
            {errors.stock && <small className="text-danger">{errors.stock.message}</small>}
          </div>
          <div className="col-md-6">
            <label>Sizes</label>
            <Controller
              name="sizes"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className="form-select"
                  multiple
                  onChange={(e) =>
                    field.onChange([...e.target.selectedOptions].map((opt) => opt.value))
                  }
                >
                  <option value="1-2Y">1-2Y</option>
                  <option value="2-3Y">2-3Y</option>
                  <option value="3-4Y">3-4Y</option>
                  <option value="4-5Y">4-5Y</option>
                </select>
              )}
            />
          </div>

          <div className="col-md-12 mt-3">
  <div className="form-check">
    <input
      type="checkbox"
      className="form-check-input"
      id="bestseller"
      {...register('bestseller')}
    />
    <label className="form-check-label" htmlFor="bestseller">
      Mark as Bestseller
    </label>
  </div>
</div>

          <div className="col-md-12">
            <label>Upload Images</label>
            <input
              type="file"
              className="form-control"
              accept="image/*"
              multiple
              onChange={handleImageChange}
            />
          </div>
        </div>
        <div className="d-flex flex-wrap gap-3 mt-3">
          {imageURLs.map((imageURL, index) => (
            <div key={index} className="position-relative">
              <img
                ref={(el) => (cropperRefs.current[index] = el)}
                src={imageURL}
                alt={`Preview ${index + 1}`}
                className="img-fluid border"
                style={{ maxWidth: '200px', maxHeight: '200px' }}
              />
              <button
                type="button"
                className="btn btn-primary mt-2"
                onClick={() => handleCrop(index)}
              >
                Crop Image {index + 1}
              </button>
              <button
                type="button"
                className="btn btn-danger mt-2 ms-2"
                onClick={() => handleRemoveImage(index)}
              >
                X
              </button>
            </div>
          ))}
        </div>
        <button type="submit" className="btn btn-success mt-4 w-100">
          Add Product
        </button>
      </form>
    </div>
  );
};

export default AddProduct;