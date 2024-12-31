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
    description: '',
    sizes: [],
    bestseller: false,
    images: [],
  });

  const [categories, setCategories] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imageURLs, setImageURLs] = useState([]);
  const [cropIndex, setCropIndex] = useState(null);
  const cropperRef = useRef(null);
  const [sizes, setSizes] = useState([{ size: '', stock: 0 }]);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/admin/products/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
        });
        const data = response.data.product;
        setProduct({
          ...data,
          sizes: data.sizes || [{ size: '', stock: 0 }],
          images: data.images || [],
        });

        setValue('name', data.name);
        setValue('price', data.price);
        setValue('stock', data.stock);
        setValue('category', data.category);
        setValue('description', data.description);
        setSizes(data.sizes || [{ size: '', stock: 0 }]);
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
          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
        });

        if (response.data && Array.isArray(response.data.data)) {
          setCategories(response.data.data);
        } else {
          throw new Error('Invalid category data format');
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setCategories([]);
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
    if (cropperRef.current) {
      cropperRef.current.destroy();
    }

    setCropIndex(index);

    const cropperImageContainer = document.querySelectorAll('.uploaded-images img')[index];
    if (!cropperImageContainer) {
      console.error('Unable to find the image element for cropping.');
      return;
    }

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

        const updatedURLs = [...imageURLs];
        updatedURLs[cropIndex] = URL.createObjectURL(croppedFile);
        setImageURLs(updatedURLs);

        cropperRef.current.destroy();
        cropperRef.current = null;
        setCropIndex(null);
      });
    }
  };

  const handleRemoveImage = (index) => {
    const imageToRemove = product.images[index];

    if (imageToRemove?.public_id) {
      axios
        .post(
          'http://localhost:4000/admin/products/delete-image',
          { public_id: imageToRemove.public_id },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
          }
        )
        .then(() => {
          toast.success('Image removed successfully');
          const updatedImageFiles = [...imageFiles];
          const updatedImageURLs = [...imageURLs];
          const updatedCropperRefs = [...cropperRefs.current];
          updatedImageFiles.splice(index, 1);
          updatedImageURLs.splice(index, 1);
          updatedCropperRefs.splice(index, 1);
          setImageFiles(updatedImageFiles);
          setImageURLs(updatedImageURLs);
          cropperRefs.current = updatedCropperRefs;
        })
        .catch((err) => {
          console.error('Error removing image:', err);
          toast.error('Failed to remove image');
        });
    } else {
      const updatedFiles = imageFiles.filter((_, i) => i !== index);
      const updatedURLs = imageURLs.filter((_, i) => i !== index);
      setImageFiles(updatedFiles);
      setImageURLs(updatedURLs);
      toast.success('Image removed');
    }
  };

  const handleSizeChange = (index, field, value) => {
    const updatedSizes = [...sizes];
    updatedSizes[index][field] = value;
    setSizes(updatedSizes);
  };

  const addSizeField = () => {
    setSizes([...sizes, { size: '', stock: 0 }]);
  };

  const removeSizeField = (index) => {
    setSizes(sizes.filter((_, i) => i !== index));
  };
  const cropperRefs = useRef([]); 

 // Initialize cropper for images
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


  const onSubmit = async (data) => {
    const formData = new FormData();

    Object.keys(data).forEach((key) => {
      formData.append(key, Array.isArray(data[key]) ? JSON.stringify(data[key]) : data[key]);
    });
    formData.append('sizes', JSON.stringify(sizes));
    imageFiles.forEach((file) => formData.append('images', file));
    product.images.forEach((img) => formData.append('existingImages', img.public_id));

    try {
      const response = await axios.put(`http://localhost:4000/admin/products/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
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
          <input type="text" className="form-control" {...register('name', { required: 'Name is required' })} />
          {errors.name && <p className="text-danger">{errors.name.message}</p>}
        </div>

        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea className="form-control" {...register('description', { required: 'Description is required' })} />
          {errors.description && <p className="text-danger">{errors.description.message}</p>}
        </div>

        <div className="mb-3">
          <label className="form-label">Price</label>
          <input type="number" className="form-control" {...register('price', { required: 'Price is required' })} />
          {errors.price && <p className="text-danger">{errors.price.message}</p>}
        </div>

        <div>
          <h3>Sizes and Stock</h3>
          {sizes.map((size, index) => (
            <div key={index} className="d-flex gap-3 mb-3">
              <input
                type="text"
                placeholder="Size"
                value={size.size}
                onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
                required
                className="form-control"
              />
              <input
                type="number"
                placeholder="Stock"
                value={size.stock}
                onChange={(e) => handleSizeChange(index, 'stock', parseInt(e.target.value, 10))}
                required
                className="form-control"
              />
              <button type="button" className="btn btn-danger" onClick={() => removeSizeField(index)}>
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="col-md-6">
          <label>Category</label>
          <select className="form-select" {...register('category', { required: 'Category is required' })}>
            <option value="">Select Category</option>
            {Array.isArray(categories) && categories.map((category) => (
              <option key={category._id} value={category._id}>{category.name}</option>
            ))}
          </select>
          {errors.category && <small className="text-danger">{errors.category.message}</small>}
        </div>

        <div className="mb-3 form-check">
          <input type="checkbox" className="form-check-input" {...register('bestseller')} />
          <label className="form-check-label">BestSeller</label>
        </div>

        {/* Existing Images */}
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

        {/* Submit Button */}
        <div className="text-center mt-4">
          <button type="submit" className="btn btn-primary">Save Changes</button>
        </div>

      </form>
    </div>
  );
};

export default EditProduct;
