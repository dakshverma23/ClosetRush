const Category = require('../models/Category');
const ApiError = require('../utils/apiError');

/**
 * Get all categories
 * GET /api/categories
 */
const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: categories.length,
      categories
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single category
 * GET /api/categories/:id
 */
const getCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      throw ApiError.notFound('Category not found');
    }
    
    res.json({
      success: true,
      category
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new category
 * POST /api/categories
 */
const createCategory = async (req, res, next) => {
  try {
    const { name, description, image, price, depositAmount, minimumDuration } = req.body;
    
    if (!price || price < 0) {
      throw ApiError.badRequest('Valid price is required');
    }

    if (depositAmount === undefined || depositAmount < 0) {
      throw ApiError.badRequest('Valid deposit amount is required');
    }

    if (!minimumDuration || ![1, 3, 6, 12].includes(minimumDuration)) {
      throw ApiError.badRequest('Minimum duration must be 1, 3, 6, or 12 months');
    }
    
    // Check if category already exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });
    
    if (existingCategory) {
      throw ApiError.badRequest('Category with this name already exists');
    }
    
    const category = await Category.create({
      name,
      description,
      image,
      price,
      depositAmount,
      minimumDuration
    });
    
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update category
 * PUT /api/categories/:id
 */
const updateCategory = async (req, res, next) => {
  try {
    const { name, description, image, price, depositAmount, minimumDuration } = req.body;
    
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      throw ApiError.notFound('Category not found');
    }
    
    // Check if new name conflicts with existing category
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      
      if (existingCategory) {
        throw ApiError.badRequest('Category with this name already exists');
      }
    }
    
    if (price !== undefined && price < 0) {
      throw ApiError.badRequest('Price must be a positive number');
    }

    if (depositAmount !== undefined && depositAmount < 0) {
      throw ApiError.badRequest('Deposit amount must be a positive number');
    }

    if (minimumDuration !== undefined && ![1, 3, 6, 12].includes(minimumDuration)) {
      throw ApiError.badRequest('Minimum duration must be 1, 3, 6, or 12 months');
    }
    
    category.name = name || category.name;
    category.description = description !== undefined ? description : category.description;
    category.image = image !== undefined ? image : category.image;
    category.price = price !== undefined ? price : category.price;
    category.depositAmount = depositAmount !== undefined ? depositAmount : category.depositAmount;
    category.minimumDuration = minimumDuration !== undefined ? minimumDuration : category.minimumDuration;
    
    await category.save();
    
    res.json({
      success: true,
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete category
 * DELETE /api/categories/:id
 */
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    
    if (!category) {
      throw ApiError.notFound('Category not found');
    }
    
    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle category status
 * PATCH /api/categories/:id/toggle-status
 */
const toggleCategoryStatus = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      throw ApiError.notFound('Category not found');
    }
    
    category.active = !category.active;
    await category.save();
    
    res.json({
      success: true,
      message: `Category ${category.active ? 'activated' : 'deactivated'} successfully`,
      category
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus
};
