import React, { useState } from 'react';
import { useQuery } from 'react-query';
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
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Tooltip,
  Divider
} from '@mui/material';
import {
  People,
  Category,
  Assignment,
  TrendingUp,
  Edit,
  Delete,
  Visibility,
  Add,
  AdminPanelSettings,
  Support,
  Person
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { ticketService } from '../services/ticketService';
import { categoryService } from '../services/categoryService';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Fetch data
  const { data: userStats, isLoading: userStatsLoading } = useQuery(
    'userStats',
    authService.getUserStats
  );

  const { data: ticketStats, isLoading: ticketStatsLoading } = useQuery(
    'ticketStats',
    ticketService.getTicketStats
  );

  const { data: users, isLoading: usersLoading } = useQuery(
    'users',
    authService.getAllUsers
  );

  const { data: categories, isLoading: categoriesLoading } = useQuery(
    'categories',
    categoryService.getCategories
  );

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setUserDialogOpen(true);
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setCategoryDialogOpen(true);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'agent': return 'warning';
      case 'user': return 'success';
      default: return 'default';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'agent': return 'Support Agent';
      case 'user': return 'End User';
      default: return role;
    }
  };

  if (userStatsLoading || ticketStatsLoading || usersLoading || categoriesLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Admin Dashboard
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <People sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Users
                  </Typography>
                  <Typography variant="h4">
                    {userStats?.totalUsers || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Assignment sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Tickets
                  </Typography>
                  <Typography variant="h4">
                    {ticketStats?.total || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Category sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Categories
                  </Typography>
                  <Typography variant="h4">
                    {categories?.length || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUp sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Open Tickets
                  </Typography>
                  <Typography variant="h4">
                    {ticketStats?.open || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* User Management Section */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5">
              User Management
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                setSelectedUser(null);
                setUserDialogOpen(true);
              }}
            >
              Add User
            </Button>
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users?.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar src={user.avatar} sx={{ mr: 2 }}>
                          {user.name?.charAt(0)}
                        </Avatar>
                        <Typography variant="subtitle2">
                          {user.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {user.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getRoleLabel(user.role)}
                        color={getRoleColor(user.role)}
                        size="small"
                        icon={
                          user.role === 'admin' ? <AdminPanelSettings /> :
                          user.role === 'agent' ? <Support /> : <Person />
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label="Active"
                        color="success"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="Edit User">
                          <IconButton
                            size="small"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/admin/users/${user.id}`)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Category Management Section */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5">
              Category Management
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                setSelectedCategory(null);
                setCategoryDialogOpen(true);
              }}
            >
              Add Category
            </Button>
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Category Name</TableCell>
                  <TableCell>Color</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Ticket Count</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories?.map((category) => (
                  <TableRow key={category.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {category.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          backgroundColor: category.color,
                          borderRadius: 1,
                          border: '1px solid #ddd'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {category.description || 'No description'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {/* This would be calculated from tickets */}
                        0
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
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate('/admin/users')}
                  startIcon={<People />}
                >
                  Manage Users
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate('/admin/categories')}
                  startIcon={<Category />}
                >
                  Manage Categories
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate('/dashboard')}
                  startIcon={<Assignment />}
                >
                  View All Tickets
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Statistics
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Total Users:</Typography>
                  <Typography variant="subtitle2">{userStats?.totalUsers || 0}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Support Agents:</Typography>
                  <Typography variant="subtitle2">{userStats?.agentCount || 0}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Administrators:</Typography>
                  <Typography variant="subtitle2">{userStats?.adminCount || 0}</Typography>
                </Box>
                <Divider />
                <Box display="flex" justifyContent="space-between">
                  <Typography>Open Tickets:</Typography>
                  <Typography variant="subtitle2" color="warning.main">{ticketStats?.open || 0}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography>In Progress:</Typography>
                  <Typography variant="subtitle2" color="info.main">{ticketStats?.inProgress || 0}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Resolved:</Typography>
                  <Typography variant="subtitle2" color="success.main">{ticketStats?.resolved || 0}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* User Edit Dialog */}
      <Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedUser ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {selectedUser ? 'Update user information and permissions.' : 'Create a new user account.'}
          </Typography>
          {/* User form would go here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained">
            {selectedUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Category Edit Dialog */}
      <Dialog open={categoryDialogOpen} onClose={() => setCategoryDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedCategory ? 'Edit Category' : 'Add New Category'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {selectedCategory ? 'Update category information.' : 'Create a new ticket category.'}
          </Typography>
          {/* Category form would go here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCategoryDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained">
            {selectedCategory ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard; 