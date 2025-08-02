import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Category,
  Edit,
  Delete,
  Add,
  ColorLens,
  Warning
} from '@mui/icons-material';
import { categoryService } from '../services/categoryService';

const CategoryManagement = () => {
  const queryClient = useQueryClient();
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Form state for category editing
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    color: '#1976d2'
  });

  // Fetch categories
  const { data: categories, isLoading } = useQuery(
    'categories',
    categoryService.getCategories
  );

  // Create category mutation
  const createCategoryMutation = useMutation(
    (data) => categoryService.createCategory(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('categories');
        setCategoryDialogOpen(false);
        resetForm();
      },
    }
  );

  // Update category mutation
  const updateCategoryMutation = useMutation(
    (data) => categoryService.updateCategory(data.id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('categories');
        setCategoryDialogOpen(false);
        setSelectedCategory(null);
        resetForm();
      },
    }
  );

  // Delete category mutation
  const deleteCategoryMutation = useMutation(
    (categoryId) => categoryService.deleteCategory(categoryId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('categories');
        setDeleteDialogOpen(false);
        setCategoryToDelete(null);
      },
    }
  );

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || '',
      color: category.color
    });
    setCategoryDialogOpen(true);
  };

  const handleDeleteCategory = (category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const handleSaveCategory = () => {
    if (selectedCategory) {
      updateCategoryMutation.mutate({
        id: selectedCategory.id,
        ...categoryForm
      });
    } else {
      createCategoryMutation.mutate(categoryForm);
    }
  };

  const resetForm = () => {
    setCategoryForm({
      name: '',
      description: '',
      color: '#1976d2'
    });
  };

  const handleFormChange = (field, value) => {
    setCategoryForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const predefinedColors = [
    '#1976d2', '#dc004e', '#2e7d32', '#ed6c02', '#9c27b0',
    '#d32f2f', '#0288d1', '#388e3c', '#f57c00', '#7b1fa2'
  ];

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Category Management
      </Typography>

      {/* Header with Add Button */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6" gutterBottom>
                Ticket Categories
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage ticket categories to organize and classify support requests
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                setSelectedCategory(null);
                resetForm();
                setCategoryDialogOpen(true);
              }}
            >
              Add Category
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardContent>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Category</TableCell>
                  <TableCell>Color</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Ticket Count</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories?.map((category) => (
                  <TableRow key={category.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            backgroundColor: category.color,
                            borderRadius: '50%',
                            mr: 2,
                            border: '1px solid #ddd'
                          }}
                        />
                        <Typography variant="subtitle2">
                          {category.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            backgroundColor: category.color,
                            borderRadius: 1,
                            border: '1px solid #ddd',
                            mr: 1
                          }}
                        />
                        <Typography variant="body2" fontFamily="monospace">
                          {category.color}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {category.description || 'No description'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label="0 tickets"
                        size="small"
                        color="default"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(category.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="Edit Category">
                          <IconButton
                            size="small"
                            onClick={() => handleEditCategory(category)}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Category">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteCategory(category)}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {categories?.length === 0 && (
            <Box textAlign="center" py={4}>
              <Category sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Categories Found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Create your first category to start organizing tickets
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => {
                  setSelectedCategory(null);
                  resetForm();
                  setCategoryDialogOpen(true);
                }}
              >
                Add Category
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Category Edit Dialog */}
      <Dialog open={categoryDialogOpen} onClose={() => setCategoryDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedCategory ? 'Edit Category' : 'Add New Category'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Category Name"
                value={categoryForm.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                placeholder="e.g., Technical Support, Billing, Feature Request"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={categoryForm.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                placeholder="Describe what types of tickets belong to this category"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Category Color
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                {predefinedColors.map((color) => (
                  <Box
                    key={color}
                    sx={{
                      width: 32,
                      height: 32,
                      backgroundColor: color,
                      borderRadius: 1,
                      border: categoryForm.color === color ? '3px solid #000' : '1px solid #ddd',
                      cursor: 'pointer',
                      '&:hover': {
                        border: '2px solid #666'
                      }
                    }}
                    onClick={() => handleFormChange('color', color)}
                  />
                ))}
              </Box>
              <TextField
                fullWidth
                label="Custom Color (Hex)"
                value={categoryForm.color}
                onChange={(e) => handleFormChange('color', e.target.value)}
                placeholder="#1976d2"
                InputProps={{
                  startAdornment: (
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        backgroundColor: categoryForm.color,
                        borderRadius: '50%',
                        mr: 1,
                        border: '1px solid #ddd'
                      }}
                    />
                  )
                }}
              />
            </Grid>
          </Grid>

          {(createCategoryMutation.isError || updateCategoryMutation.isError) && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {createCategoryMutation.error?.response?.data?.message || 
               updateCategoryMutation.error?.response?.data?.message || 
               'Failed to save category'}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCategoryDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveCategory}
            disabled={!categoryForm.name || createCategoryMutation.isLoading || updateCategoryMutation.isLoading}
          >
            {selectedCategory ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Delete Category
        </DialogTitle>
        <DialogContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Warning sx={{ color: 'warning.main', mr: 1 }} />
            <Typography variant="h6">
              Are you sure you want to delete this category?
            </Typography>
          </Box>
          
          {categoryToDelete && (
            <Box display="flex" alignItems="center" p={2} bgcolor="grey.50" borderRadius={1}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  backgroundColor: categoryToDelete.color,
                  borderRadius: '50%',
                  mr: 2,
                  border: '1px solid #ddd'
                }}
              />
              <Typography variant="subtitle1">
                {categoryToDelete.name}
              </Typography>
            </Box>
          )}
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            This action cannot be undone. Any tickets currently assigned to this category will need to be reassigned.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => deleteCategoryMutation.mutate(categoryToDelete?.id)}
            disabled={deleteCategoryMutation.isLoading}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoryManagement; 