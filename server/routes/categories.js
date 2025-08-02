const express = require('express');
const { body, validationResult } = require('express-validator');
const { categories, createCategory, updateCategory, deleteCategory } = require('../data/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all categories
router.get('/', authenticateToken, (req, res) => {
  try {
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error getting categories' });
  }
});

// Get single category
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const category = categories.find(c => c.id === req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json({ category });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ message: 'Server error getting category' });
  }
});

// Create new category (admin only)
router.post('/', authenticateToken, requireAdmin, [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('description').optional().trim().isLength({ max: 200 }).withMessage('Description must be less than 200 characters'),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Color must be a valid hex color')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { name, description = '', color = '#1976d2' } = req.body;

    // Check if category name already exists
    const existingCategory = categories.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (existingCategory) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }

    const newCategory = createCategory({
      name,
      description,
      color
    });

    res.status(201).json({
      message: 'Category created successfully',
      category: newCategory
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Server error creating category' });
  }
});

// Update category (admin only)
router.put('/:id', authenticateToken, requireAdmin, [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('description').optional().trim().isLength({ max: 200 }).withMessage('Description must be less than 200 characters'),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Color must be a valid hex color')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { name, description, color } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (color) updates.color = color;

    // Check if category exists
    const existingCategory = categories.find(c => c.id === req.params.id);
    if (!existingCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if new name conflicts with existing category
    if (name && name !== existingCategory.name) {
      const nameConflict = categories.find(c => 
        c.id !== req.params.id && c.name.toLowerCase() === name.toLowerCase()
      );
      if (nameConflict) {
        return res.status(400).json({ message: 'Category with this name already exists' });
      }
    }

    const updatedCategory = updateCategory(req.params.id, updates);
    if (!updatedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({
      message: 'Category updated successfully',
      category: updatedCategory
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Server error updating category' });
  }
});

// Delete category (admin only)
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    // Check if category exists
    const existingCategory = categories.find(c => c.id === req.params.id);
    if (!existingCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // TODO: Check if category is being used by any tickets
    // For now, we'll allow deletion of any category

    const deleted = deleteCategory(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Server error deleting category' });
  }
});

module.exports = router; 