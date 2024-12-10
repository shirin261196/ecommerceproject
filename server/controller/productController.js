import productModel from '../models/productModel.js';
import pkg from 'cloudinary';

const { v2: cloudinary } = pkg;

// Add Product
export const addProduct = async (req, res,next) => {
  try {
    const { name, description, category, subcategory, price, stock, bestseller, sizes } = req.body;
    const date = req.body.date || Date.now();
    const parsedSizes = Array.isArray(sizes) ? sizes : JSON.parse(sizes);

    const files = [
      req.files?.image1?.[0],
      req.files?.image2?.[0],
      req.files?.image3?.[0],
    ].filter(Boolean);

    if (files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const imageUploads = await Promise.all(
      files.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path);
        return { url: result.secure_url, public_id: result.public_id };
      })
    );

    const product = new productModel({
      name,
      description,
      category,
      subcategory,
      price,
      stock,
      date,
      sizes: parsedSizes,
      bestseller: bestseller === 'true',
      isDeleted: false,
      images: imageUploads,
    });

    await product.save();
    res.status(201).json({ message: 'Product added successfully', product });
  } catch (error) {
    next(error);
  }
};

// List Products
export const listProducts = async (req, res,next) => {
  try {
    const products = await productModel.find();
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
};

// Get Single Product
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await productModel.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// Remove Product
export const deleteProduct = async (req, res,next) => {
  try {
    const { id } = req.params;
    const product = await productModel.findByIdAndUpdate(
      id,
      { deleted: true },
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// restore products
export const restoreProduct = async(req,res,next) =>{
  try {
    const product = await productModel.findByIdAndUpdate(
      req.params.id,
      { deleted: false },
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, message: 'Product restored successfully' });
  } catch (err) {
    next(error);
  }
}
// Update Product
export const updateProduct = async (req, res,next) => {
  try {
    const { id } = req.params;
    const { name, price, stock, category } = req.body;

    const updateFields = { name, price, stock, category };

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      const imageUploads = await Promise.all(
        req.files.map(async (file) => {
          const result = await cloudinary.uploader.upload(file.path);
          return { url: result.secure_url, public_id: result.public_id };
        })
      );
      updateFields.images = imageUploads;
    }

    const product = await productModel.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error('Error updating product:', {
      message: error.message,
      stack: error.stack,
      body: req.body,
      files: req.files,
    });
    next(error);
  }
};

export const deleteImage = async (req, res,next) => {
  try {
    const { public_id } = req.body;

    if (!public_id) {
      return res.status(400).json({ message: 'Public ID is required' });
    }

    // Delete image from Cloudinary
    const cloudinaryResponse = await cloudinary.uploader.destroy(public_id);
    cloudinary.uploader.destroy('lturnbaomuwlndkfrgm3', (error, result) => {
      if (error) {
        console.error('Cloudinary error:', error);
      } else {
        console.log('Cloudinary result:', result);
      }
    });
    if (cloudinaryResponse.result !== 'ok') {
      return res.status(500).json({ message: 'Error removing image from Cloudinary' });
    }

    // Optionally remove image reference from product document in MongoDB
    await productModel.updateOne(
      { 'images.public_id': public_id },
      { $pull: { images: { public_id } } }
    );

    res.status(200).json({ message: 'Image removed successfully' });
  } catch (error) {
    next(error);
  }
};
