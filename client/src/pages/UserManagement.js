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
  Switch,
  FormControlLabel,
  Divider,
  Badge
} from '@mui/material';
import {
  People,
  Edit,
  Delete,
  Visibility,
  Add,
  AdminPanelSettings,
  Support,
  Person,
  Block,
  CheckCircle,
  Search,
  FilterList
} from '@mui/icons-material';
import { authService } from '../services/authService';

const UserManagement = () => {
  const queryClient = useQueryClient();
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Form state for user editing
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: 'user',
    permissions: {
      canCreateTickets: true,
      canAssignTickets: false,
      canManageUsers: false,
      canManageCategories: false,
      canViewAllTickets: false
    }
  });

  // Fetch users
  const { data: users, isLoading } = useQuery(
    'users',
    authService.getAllUsers
  );

  // Update user mutation
  const updateUserMutation = useMutation(
    (data) => authService.updateUser(data.id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        setUserDialogOpen(false);
        setSelectedUser(null);
        resetForm();
      },
    }
  );

  // Delete user mutation
  const deleteUserMutation = useMutation(
    (userId) => authService.deleteUser(userId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
      },
    }
  );

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions || {
        canCreateTickets: true,
        canAssignTickets: false,
        canManageUsers: false,
        canManageCategories: false,
        canViewAllTickets: false
      }
    });
    setUserDialogOpen(true);
  };

  const handleSaveUser = () => {
    const userData = {
      id: selectedUser?.id,
      ...userForm
    };
    updateUserMutation.mutate(userData);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUserMutation.mutate(userId);
    }
  };

  const resetForm = () => {
    setUserForm({
      name: '',
      email: '',
      role: 'user',
      permissions: {
        canCreateTickets: true,
        canAssignTickets: false,
        canManageUsers: false,
        canManageCategories: false,
        canViewAllTickets: false
      }
    });
  };

  const handlePermissionChange = (permission) => {
    setUserForm(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: !prev.permissions[permission]
      }
    }));
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

  const getRolePermissions = (role) => {
    switch (role) {
      case 'admin':
        return {
          canCreateTickets: true,
          canAssignTickets: true,
          canManageUsers: true,
          canManageCategories: true,
          canViewAllTickets: true
        };
      case 'agent':
        return {
          canCreateTickets: true,
          canAssignTickets: true,
          canManageUsers: false,
          canManageCategories: false,
          canViewAllTickets: true
        };
      case 'user':
        return {
          canCreateTickets: true,
          canAssignTickets: false,
          canManageUsers: false,
          canManageCategories: false,
          canViewAllTickets: false
        };
      default:
        return {
          canCreateTickets: true,
          canAssignTickets: false,
          canManageUsers: false,
          canManageCategories: false,
          canViewAllTickets: false
        };
    }
  };

  const handleRoleChange = (newRole) => {
    setUserForm(prev => ({
      ...prev,
      role: newRole,
      permissions: getRolePermissions(newRole)
    }));
  };

  // Filter users
  const filteredUsers = users?.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus = !statusFilter || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

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
        User Management
      </Typography>

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={roleFilter}
                  label="Role"
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <MenuItem value="">All Roles</MenuItem>
                  <MenuItem value="admin">Administrator</MenuItem>
                  <MenuItem value="agent">Support Agent</MenuItem>
                  <MenuItem value="user">End User</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                startIcon={<Add />}
                fullWidth
                onClick={() => {
                  setSelectedUser(null);
                  resetForm();
                  setUserDialogOpen(true);
                }}
              >
                Add User
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Permissions</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers?.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar src={user.avatar} sx={{ mr: 2 }}>
                          {user.name?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {user.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {user.id}
                          </Typography>
                        </Box>
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
                      <Box display="flex" gap={0.5} flexWrap="wrap">
                        {user.permissions?.canCreateTickets && (
                          <Chip label="Create" size="small" color="primary" />
                        )}
                        {user.permissions?.canAssignTickets && (
                          <Chip label="Assign" size="small" color="secondary" />
                        )}
                        {user.permissions?.canManageUsers && (
                          <Chip label="Users" size="small" color="error" />
                        )}
                        {user.permissions?.canManageCategories && (
                          <Chip label="Categories" size="small" color="warning" />
                        )}
                        {user.permissions?.canViewAllTickets && (
                          <Chip label="View All" size="small" color="info" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label="Active"
                        color="success"
                        size="small"
                        icon={<CheckCircle />}
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
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete User">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteUser(user.id)}
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

      {/* User Edit Dialog */}
      <Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedUser ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={userForm.name}
                onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={userForm.role}
                  label="Role"
                  onChange={(e) => handleRoleChange(e.target.value)}
                >
                  <MenuItem value="user">End User</MenuItem>
                  <MenuItem value="agent">Support Agent</MenuItem>
                  <MenuItem value="admin">Administrator</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Permissions
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={userForm.permissions.canCreateTickets}
                    onChange={() => handlePermissionChange('canCreateTickets')}
                  />
                }
                label="Can Create Tickets"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={userForm.permissions.canAssignTickets}
                    onChange={() => handlePermissionChange('canAssignTickets')}
                  />
                }
                label="Can Assign Tickets"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={userForm.permissions.canViewAllTickets}
                    onChange={() => handlePermissionChange('canViewAllTickets')}
                  />
                }
                label="Can View All Tickets"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={userForm.permissions.canManageUsers}
                    onChange={() => handlePermissionChange('canManageUsers')}
                  />
                }
                label="Can Manage Users"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={userForm.permissions.canManageCategories}
                    onChange={() => handlePermissionChange('canManageCategories')}
                  />
                }
                label="Can Manage Categories"
              />
            </Grid>
          </Grid>

          {updateUserMutation.isError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {updateUserMutation.error?.response?.data?.message || 'Failed to update user'}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveUser}
            disabled={updateUserMutation.isLoading}
          >
            {selectedUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement; 