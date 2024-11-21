import Category from '../models/categoryModel.js';

// Add category
export const addCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const newCategory = new Category({ name, description });
        await newCategory.save();
        res.json({ success: true, message: 'Category added successfully', data: newCategory });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add category'  });
    }
};

// Get all categories
export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.json({ success: true, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Edit category
export const editCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const category = await Category.findByIdAndUpdate(id, { name, description }, { new: true });
        res.json({ success: true, message: 'Category updated successfully', data: category });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete category
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await Category.findByIdAndDelete(id);
        res.json({ success: true, message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
