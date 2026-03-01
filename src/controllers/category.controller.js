const categoryService = require('../services/category.service');

const getAllCategories = async (req, res) => {
    try {
        const userId = req.user.id;
        const categories = await categoryService.getUserCategories(userId);
        
        res.status(200).json({ data: categories });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

const createCategory = async (req, res) => {
    try {
        const userId = req.user.id;
        const newCategory = await categoryService.createNewCategory(userId, req.body);
        
        res.status(201).json({ 
            message: 'Tạo danh mục thành công!', 
            data: newCategory 
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateCategory = async (req, res) => {
    try {
        const userId = req.user.id;
        const categoryId = req.params.id;
        
        const updated = await categoryService.updateCategoryById(categoryId, userId, req.body);
        
        res.status(200).json({
            message: 'Cập nhật danh mục thành công!',
            data: updated
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const userId = req.user.id;
        const categoryId = req.params.id;
        
        await categoryService.deleteCategoryById(categoryId, userId);
        
        res.status(200).json({
            message: 'Xóa danh mục thành công!'
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { getAllCategories, createCategory, updateCategory, deleteCategory };