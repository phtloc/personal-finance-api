const categoryModel = require('../models/category.model');

const getUserCategories = async (userId) => {
    return await categoryModel.getCategories(userId);
};

const createNewCategory = async (userId, data) => {
    const { name, type, icon } = data;

    if (!name || !type) {
        throw new Error('Tên danh mục và loại (INCOME/EXPENSE) là bắt buộc!');
    }
    
    if (type !== 'INCOME' && type !== 'EXPENSE') {
        throw new Error('Loại danh mục chỉ được là INCOME hoặc EXPENSE');
    }

    return await categoryModel.createCategory(userId, name, type, icon);
};

const updateCategoryById = async (categoryId, userId, data) => {
    const { name, type, icon } = data;

    if (!name || !type) {
        throw new Error('Tên danh mục và loại (INCOME/EXPENSE) là bắt buộc!');
    }
    if (type !== 'INCOME' && type !== 'EXPENSE') {
        throw new Error('Loại danh mục chỉ được là INCOME hoặc EXPENSE');
    }

    const updatedCategory = await categoryModel.updateCategory(categoryId, userId, name, type, icon);
    
    if (!updatedCategory) {
        throw new Error('Không tìm thấy danh mục hoặc bạn không có quyền sửa!');
    }
    return updatedCategory;
};

const deleteCategoryById = async (categoryId, userId) => {
    const deletedCategory = await categoryModel.deleteCategory(categoryId, userId);
    
    if (!deletedCategory) {
        throw new Error('Không tìm thấy danh mục hoặc bạn không có quyền xóa!');
    }
    return deletedCategory;
};

module.exports = { getUserCategories, createNewCategory, updateCategoryById, deleteCategoryById };